/**
    The Shell that manages activities.
**/
'use strict';
var $ = require('jquery');
var escapeRegExp = require('./escapeRegExp');

var shell = {

    currentZIndex: 1,
    
    history: [],
    
    baseUrl: '',
    
    activities: {},

    specialRoutes: {
        'go-back': function (route) {
            // go back in history, almost one
            this.goBack();
            
            // go back x times:
            var num = parseInt(route.segments[0], 10);
            if (num > 0) {
                while(num-->1) {
                    this.goBack();
                }
            }
        }
    },

    unexpectedError: function unexpectedError(error) {
        // TODO: enhance with dialog
        var str = typeof(error) === 'string' ? error : JSON.stringify(error);
        console.error('Unexpected error', error);
        window.alert(str);
    },

    loadActivity: function loadActivity(activityName) {
        return new Promise(function(resolve, reject) {
            var $act = this.findActivityElement(activityName);
            if ($act.length) {
                resolve($act);
            }
            else {
                $.ajax({
                    url: this.baseUrl + activityName + '.html',
                    cache: false,
                    // We are loading the program, so any in between interaction
                    // will be problematic.
                    async: false
                }).then(function(html) {
                    // http://stackoverflow.com/a/12848798
                    var body = '<div id="body-mock">' + html.replace(/^[\s\S]*<body.*?>|<\/body>[\s\S]*$/g, '') + '</div>';
                    var $h = $($.parseHTML(body));
                    //var $h = $($.parseHTML(html));
                    $act = this.findActivityElement(activityName, $h);
                    if ($act.length) {
                        $('body').append($act);
                        resolve($act);
                    }
                    else {
                        reject(Error('Activity not found in the source file.'));
                    }
                    
                }.bind(this), reject);
            }
        }.bind(this));
    },
    
    findActivityElement: function findActivityElement(activityName, $root) {
        $root = $root || $(document);
        // TODO: secure name parsing for css selector
        return $root.find('[data-activity="' + activityName + '"]');
    },
    
    showActivity: function showActivity(activityName, options) {
        // Ensure its loaded, and do anything later
        this.loadActivity(activityName).then(function($activity) {
            
            $activity.css('zIndex', ++this.currentZIndex).show();
            var currentActivity = this.history[this.history.length - 1];
            
            if (currentActivity)
                this.unfocus(currentActivity.$activity);
            
            // NOTE:FUTURE: HistoryAPI.pushState(..)
            
            this.history.push({
                name: activityName,
                $activity: $activity,
                options: options
            });
            
            this.activities[activityName]
            .init($activity, this)
            .show(options);
            
            // Avoid going to the same activity
            if (currentActivity &&
                currentActivity.name !== activityName) {
                this.hideActivity(currentActivity.name);
            }

        }.bind(this)).catch(this.unexpectedError);
    },

    hideActivity: function hideActivity(activityName) {

        var $activity = this.findActivityElement(activityName);
        $activity.hide();
    },
    
    goBack: function goBack(options) {

        var currentActivity = this.history.pop();
        var previousActivity = this.history[this.history.length - 1];
        var activityName = previousActivity.name;
        this.currentZIndex--;
        
        // If there are no explicit options, use the currentActivity options
        // to enable the communication between activities:
        options = options || currentActivity.options;
        
        if (currentActivity)
            this.unfocus(currentActivity.$activity);
        
        // Ensure its loaded, and do anything later
        this.loadActivity(activityName).then(function($activity) {
            
            $activity.show();
            
            // NOTE:FUTURE: Going to the previous activity with HistoryAPI
            // must replaceState with new 'options'?
            
            this.activities[activityName]
            .init($activity, this)
            .show(options);

            // Avoid going to the same activity
            if (currentActivity &&
                currentActivity.name !== activityName) {
                this.hideActivity(currentActivity.name);
            }

        }.bind(this)).catch(this.unexpectedError);
    },
    
    unfocus: function unfocus($el) {
        // blur any focused text box to force to close the on-screen keyboard,
        // or any other unwanted interaction (normally used when closing
        // an activity, hiding an element, so it must not be focused).
        if ($el && $el.find)
            $el.find(':focus').blur();
    },
    
    parseActivityLink: function getActivityFromLink(link) {
        
        link = link || '';
        
        // hashbang support: remove the #! and use the rest as the link
        link = link.replace(/^#!/, '');

        // Remove the baseUrl to get the app base.
        var path = link.replace(new RegExp('^' + escapeRegExp(this.baseUrl), 'i'), '');
        //var activityName = path.split('/')[1] || '';
        // Get first segment or page name (anything until a slash or extension beggining)
        var match = /^\/?([^\/\.]+)[^\/]*(\/.*)*$/.exec(path);
        
        var parsed = {
            root: true,
            activity: null,
            segments: null,
            path: null
        };
        
        if (match) {
            parsed.root = false;
            if (match[1]) {
                parsed.activity = match[1];

                if (match[2]) {
                    parsed.path = match[2];
                    parsed.segments = match[2].replace(/^\//, '').split('/');
                }
                else {
                    parsed.path = '/';
                    parsed.segments = [];
                }
            }
        }

        return parsed;
    },
    
    /** Route a link throught activities.
        Returns true if was routed and false if not
    **/
    route: function route(link) {
        
        var parsedLink = this.parseActivityLink(link);
        
        // Check if is not root
        if (parsedLink.activity) {
            //  and the activity is registered
            if (this.activities.hasOwnProperty(parsedLink.activity)) {
            
                // Show the activity passing the route options
                this.showActivity(parsedLink.activity, {
                    route: parsedLink
                });

                return true;
            }
            //  or is a special route
            else if (this.specialRoutes.hasOwnProperty(parsedLink.activity)) {
                
                this.specialRoutes[parsedLink.activity].call(this, parsedLink);
                
                return true;
            }
        }
        return false;
    },

    init: function init() {
        /*
        // Detect activities loaded in the current document
        // and initialize them:
        var $activities = $('[data-activity]').each(function() {
            var $activity = $(this);
            var actName = $activity.data('activity');
            if (this.activities.hasOwnProperty(actName)) {
                this.activities[actName].init($activity, null, this);
            }
        }.bind(this));
        */
        
        // Visualize the activity that matches current URL
        this.route(document.location.pathname);
        
        // Route pressed links
        // TODO Update with HistoryAPI and remove preventDefault
        $(document).on('tap', 'a, [data-href]', function(e) {
            // Get Link
            var link = e.currentTarget.getAttribute('href') || e.currentTarget.getAttribute('data-href');

            // Route it
            if (this.route(link)) {
                // TODO Remove when implemented HistoryAPI and pushState...
                e.preventDefault();
            }
        }.bind(this));
    }
};

module.exports = function Shell() {
    return Object.create(shell);
};