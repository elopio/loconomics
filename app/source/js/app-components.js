/**
    Registration of custom html components used by the App.
    All with 'app-' as prefix.
    
    Some definitions may be included on-line rather than on separated
    files (viewmodels), templates are linked so need to be 
    included in the html file with the same ID that referenced here,
    usually using as DOM ID the same name as the component with sufix '-template'.
**/
'use strict';

var ko = require('knockout'),
    $ = require('jquery'),
    propTools = require('./utils/jsPropertiesTools'),
    getObservable = require('./utils/getObservable');

exports.registerAll = function(app) {
    
    /// navbar-action
    ko.components.register('app-navbar-action', {
        template: { element: 'navbar-action-template' },
        viewModel: function(params) {

            propTools.defineGetter(this, 'action', function() {
                return (
                    params.action && params.navBar() ?
                    params.navBar()[params.action]() :
                    null
                );
            });
        }
    });
    
    /// unlabeled-input
    ko.components.register('app-unlabeled-input', {
        template: { element: 'unlabeled-input-template' },
        viewModel: function(params) {

            this.value = getObservable(params.value);
            this.placeholder = getObservable(params.placeholder);
            this.disable = getObservable(params.disable);
            
            var userAttr = getObservable(params.attr);
            this.attr = ko.pureComputed(function() {
                var attr = userAttr() || {};
                return $.extend({}, attr, {
                    'aria-label': this.placeholder(),
                    placeholder: this.placeholder(),
                    type: this.type()
                });
            }, this);
            
            var type = getObservable(params.type);            
            this.type = ko.computed(function() {
                return type() || 'text';
            }, this);
        }
    });
    
    /// inline-user-menu
    ko.components.register('app-inline-user-menu', {
        template: { element: 'inline-user-menu-template' },
        viewModel: { instance: app.navBarBinding }
    });
    
    
    /// inline-side-menu
    ko.components.register('app-inline-side-menu', {
        template: { element: 'inline-side-menu-template' },
        viewModel: function(params) { //{ instance: app.navBarBinding }
            // create a viewModel that extends from the live instance of navBarBinding
            var vm = this;
            Object.keys(app.navBarBinding).forEach(function(prop) {
                vm[prop] = app.navBarBinding[prop];
            });

            // Additional specific properties
            vm.vocElement = getObservable(params.vocElement || 'general');
            vm.feedbackLink = ko.pureComputed(function() {
                return 'feedbackForm/' + this.vocElement();
            }, vm);
            vm.contactLink = ko.pureComputed(function() {
                return 'contactForm/' + this.vocElement();
            }, vm);
            
            // FAQs
            vm.helpLink = getObservable(params.helpLink || '');
            vm.articles = ko.observableArray();
            ko.computed(function() {
                var link = this.helpLink();
                var list = [];
                if (link) {
                    // TODO Connect to remote load (refactor help activity into appModel, with cache and link format detection?)
                    // End with a list like
                    list = [
                        { link: link, label: 'Index' }
                    ];
                }
                vm.articles(list);
            }, vm);
        }
    });
    
    /// feedback-entry
    ko.components.register('app-feedback-entry', {
        template: { element: 'feedback-entry-template' },
        viewModel: function(params) {

            this.section = getObservable(params.section || '');
            this.url = ko.pureComputed(function() {
                return '/feedbackForm/' + this.section();
            }, this);
        }
    });
    
    /// feedback-entry
    ko.components.register('app-time-slot-tile', {
        template: { element: 'time-slot-tile-template' },
        viewModel: require('./viewmodels/TimeSlot')
    });
    
    /// loading-spinner
    ko.components.register('app-loading-spinner', {
        template: { element: 'loading-spinner-template' },
        viewModel: function(params) {
            var base = 'loadingSpinner';
            this.mod = getObservable(params.mod || '');
            this.cssClass = ko.pureComputed(function() {
                var c = base,
                    mods = (this.mod() || '').split(' ');
                if (mods.length)
                    c += ' ' + base + '--' + mods.join(' ' + base + '--');
                return c;
            }, this);
        }
    });

    /// appointment-card
    ko.components.register('app-appointment-card', {
        template: { element: 'appointment-card-template' },
        viewModel: require('./viewmodels/AppointmentCard')
    });
    
    /// job titles list
    ko.components.register('app-job-titles-list', {
        template: { element: 'job-titles-list-template' },
        viewModel: function(params) {
            this.allJobTitles = getObservable(params.jobTitles || []);
            // Filtered list, without records 'being deleted'
            this.jobTitles = ko.pureComputed(function() {
                return this().filter(function(j) {
                    return !j.isBeingDeleted();
                });
            }, this.allJobTitles);
            this.selectJobTitle = params.selectJobTitle || function() {};
            this.showMarketplaceInfo = getObservable(params.showMarketplaceInfo || false);
        }
    });
    
    /// Stars
    ko.components.register('app-stars-rating', {
        template: { element: 'stars-rating-template' },
        viewModel: function(params) {
            this.rating = getObservable(params.rating || 0);
            this.total = getObservable(params.total || 0);
            this.size = getObservable(params.size || '');
            
            // Example: rating=3.6, starPosition=1 (or 2, 3, 4, 5)
            function computeStarValue(rating, starPosition) {
                var x = (rating / starPosition) |0;
                var z = rating % 1;
                if (x > 0) {
                    return 1;
                }
                else if ((rating |0) === (starPosition - 1) && z !== 0) {
                    if (z >= 0.5)
                        return 0.5;
                    else
                        return 0;
                }
                else {
                    return 0;
                }
            }
            
            this.stars = ko.pureComputed(function() {
                var r = this.rating(),
                    list = [];
                for (var i = 1; i <= 5; i++) {
                    list.push(computeStarValue(r, i));
                }
                return list;
            }, this);

            this.totalText = ko.pureComputed(function() {
                // TODO Conditional formatting for big numbers cases
                return '(' + this.total() + ')';
            }, this);
            
            this.classes = ko.pureComputed(function() {
                if (this.size()) return 'StarsRating--' + this.size();
                return '';
            }, this);
        }
    });
    
    /// ServiceProfessionalInfo
    var PublicUser = require('./models/PublicUser');
    ko.components.register('app-service-professional-info', {
        synchronous: true,
        template: { element: 'service-professional-info-template' },
        viewModel: {
            createViewModel: function(params) {
                var view = new PublicUser();
                if (params && params.api)
                    params.api(view);
                
                return view;
            }
        }
    });
    
    /// DatetimePicker
    var DateTimePickerVM = require('./viewmodels/DatetimePicker');
    ko.components.register('app-datetime-picker', {
        synchronous: true,
        template: { element: 'datetime-picker-template' },
        viewModel: {
            createViewModel: function(params, componentInfo) {
                var view = new DateTimePickerVM(app, componentInfo.element);
                if (params && params.api)
                    params.api(view);

                if (params)
                    Object.keys(params).forEach(function(key) {
                        if (ko.isObservable(view[key])) {
                            view[key](ko.unwrap(params[key]));
                            if (ko.isObservable(params[key]))
                                view[key].subscribe(params[key]);
                        }
                    });
                
                return view;
            }
        }
    });
    
    /// AddressMap
    var googleMapReady = require('./utils/googleMapReady');
    var i18n = require('./utils/i18n');
    ko.components.register('app-address-map', {
        synchronous: true,
        template: '<div></div>',
        viewModel: {
            createViewModel: function(params, componentInfo) {
                var v = {
                    lat: ko.unwrap(params.lat),
                    lng: ko.unwrap(params.lng),
                    zoom: ko.unwrap(params.zoom) || 11,
                    radius: ko.unwrap(params.radius) |0,
                    isServiceLocation: ko.unwrap(params.isServiceLocation) || false,
                    radiusMeters: 0,
                    refreshTs: getObservable(params.refreshTs),
                    map: null,
                    circle: null
                };
                v.circleColor = v.isServiceLocation ? '#5F2393' : '#00989A';
                
                var c = i18n.getCurrentCulture();
                var unit = i18n.distanceUnits[c.country];
                if (v.isServiceLocation || !v.radius) {
                    // Default for service locations (they have not radius)
                    v.radius = 0.5;
                    unit = 'miles';
                }

                // Prepare radius in meters
                v.radiusMeters = i18n.convertMilesKm(v.radius, unit) * 1000;

                googleMapReady(function(google) {
                    // Avoid put the map in the limits (array with top-left lat-lng, bottom-right lat-lng):
                    var mapLimits = [ 70, -168, 14, -63 ]; // USA limits
                    if (v.lat > mapLimits[0]) v.lat = mapLimits[0];
                    else if (v.lat < mapLimits[2]) v.lat = mapLimits[0];
                    if (v.lng < mapLimits[1]) v.lng = mapLimits[1];
                    else if (v.lng > mapLimits[3]) v.lng = mapLimits[3];

                    var myLatlng = new google.maps.LatLng(v.lat, v.lng);

                    // Create map
                    var mapOptions = {
                        zoom: v.zoom,
                        center: myLatlng,
                        mapTypeId: google.maps.MapTypeId.ROADMAP
                    };
                    v.map = new google.maps.Map(componentInfo.element.children[0], mapOptions);
                    v.circle = new google.maps.Circle({
                        center: myLatlng,
                        map: v.map,
                        clickable: false,
                        radius: v.radiusMeters,
                        fillColor: v.circleColor,
                        fillOpacity: 0.3,
                        strokeWeight: 0
                    });

                    // on visibility or size Google Maps requires a refresh to don't get buggy:
                    var refresh = googleMapReady.refreshMap.bind(null, v.map);
                    v.refreshTs.subscribe(refresh);
                    // Next disabled to allow activities to have the responsability
                    // of take care of that only when thay are visible (updating refreshTs),
                    // to don't waste cycles
                    //$(window).on('layoutUpdate', refresh);
                });
                return v;
            }
        }
    });
    
    // Onboarding
    var OnboardingProgressMarkVM = require('./viewmodels/OnboardingProgressMarkVM');
    ko.components.register('app-onboarding-progress-mark', {
        template: { element: 'onboarding-progress-mark-template' },
        viewModel: { createViewModel: function() { return new OnboardingProgressMarkVM(app); } }
    });
    var OnboardingProgressBarVM = require('./viewmodels/OnboardingProgressBarVM');
    ko.components.register('app-onboarding-progress-bar', {
        template: { element: 'onboarding-progress-bar-template' },
        viewModel: { createViewModel: function() { return new OnboardingProgressBarVM(app); } }
    });
};
