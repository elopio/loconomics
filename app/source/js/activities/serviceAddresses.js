/**
    Service Addresses activity
**/
'use strict';

var ko = require('knockout'),
    $ = require('jquery'),
    Activity = require('../components/Activity');

var A = Activity.extend(function ServiceAddressesActivity() {

    Activity.apply(this, arguments);

    this.accessLevel = this.app.UserType.serviceProfessional;
    this.viewModel = new ViewModel(this.app);
    // Defaults settings for navBar.
    this.navBar = Activity.createSubsectionNavBar('Job Title', {
        backLink: '/scheduling', helpLink: '/help/relatedArticles/201965996-setting-your-service-locations-areas'
    });
    // Make navBar available at viewModel, needed for dekstop navigation
    this.viewModel.navBar = this.navBar;
    
    // Save defaults to restore on updateNavBarState when needed:
    this.defaultLeftAction = this.navBar.leftAction().model.toPlainObject(true);

    // On changing jobTitleID:
    // - load addresses
    this.registerHandler({
        target: this.viewModel.jobTitleID,
        handler: function(jobTitleID) {
            if (jobTitleID) {
                // Get data for the Job title ID
                this.app.model.jobTitles.getJobTitle(jobTitleID)
                .then(function(jobTitle) {
                    // Save for use in the view
                    this.viewModel.jobTitle(jobTitle);
                    // Update navbar (may indicate the jobTitle name)
                    this.updateNavBarState();

                    // Fill in job title name
                    this.viewModel.jobTitleName(jobTitle.singularName());
                    
                    // Get addresses
                    return this.app.model.serviceAddresses.getList(jobTitleID);
                }.bind(this))
                .then(function(list) {
                    list = this.app.model.serviceAddresses.asModel(list);
                    this.viewModel.serviceAddresses.sourceAddresses(list);
                    if (this.requestData.selectedAddressID) {
                        this.viewModel.serviceAddresses.presetSelectedAddressID(this.requestData.selectedAddressID);
                    }
                }.bind(this))
                .catch(function (err) {
                    this.app.modals.showError({
                        title: 'There was an error while loading.',
                        error: err
                    });
                }.bind(this));
                
                /// Rewrite URL
                // IMPORTANT: When in isSelectionMode, pushState cannot be use
                // because it conflicts with the selection logic (on new-booking progress)
                // TODO: discarded URL rewrite until the bug with replaceState in HashbangHistory is fixed
                if (this.viewModel.serviceAddresses.isSelectionMode()) return;
                // If the URL didn't included the jobTitleID, or is different,
                // we put it to avoid reload/resume problems
                var found = /serviceAddresses\/(\d+)/i.exec(window.location);
                var urlID = found && found[1] |0;
                if (urlID !== jobTitleID) {
                    var url = '/serviceAddresses/' + jobTitleID;
                    this.app.shell.replaceState(null, null, url);
                }
            }
            else {
                this.viewModel.serviceAddresses.sourceAddresses([]);
                this.viewModel.serviceAddresses.selectedAddress(null);
                this.viewModel.jobTitle(null);
                this.updateNavBarState();
                this.viewModel.jobTitleName('Job Title');
            }
        }.bind(this)
    });
    
    // On changing clientUserID: load its addresses
    this.registerHandler({
        target: this.viewModel.clientUserID,
        handler: function(clientUserID) {
            if (clientUserID) {
                this.app.model.clientAddresses.getList(clientUserID)
                .then(function(list) {
                    list = this.app.model.clientAddresses.asModel(list);
                    this.viewModel.clientAddresses.sourceAddresses(list);
                    if (this.requestData.selectedAddressID) {
                        this.viewModel.clientAddresses.presetSelectedAddressID(this.requestData.selectedAddressID);
                    }
                }.bind(this));
            }
            else {
                this.viewModel.clientAddresses.sourceAddresses([]);
                this.viewModel.clientAddresses.selectedAddress(null);
            }
        }.bind(this)
    });

    // Go back with the selected address when triggered in the form/view
    this.viewModel.returnSelected = function(addressID, jobTitleID) {
        // Pass the selected client in the info
        this.requestData.selectedAddressID = addressID;
        this.requestData.selectedJobTitleID = jobTitleID;
        // And go back
        this.app.shell.goBack(this.requestData);
    }.bind(this);
    this.viewModel.returnAddress = function(addressDetails) {
        this.requestData.address = addressDetails;
        // And go back
        this.app.shell.goBack(this.requestData);
    }.bind(this);

    this.returnRequest = function returnRequest() {
        this.app.shell.goBack(this.requestData);
    }.bind(this);
});

exports.init = A.init;

A.prototype.applyOwnNavbarRules = function() {
    //jshint maxcomplexity:10
    
    var itIs = this.viewModel.serviceAddresses.isSelectionMode();

    if (this.requestData.title) {
        // Replace title by title if required
        this.navBar.title(this.requestData.title);
    }
    else {
        // Title must be empty
        this.navBar.title('');
    }

    if (this.requestData.cancelLink) {
        this.convertToCancelAction(this.navBar.leftAction(), this.requestData.cancelLink, this.requestData);
    }
    else {
        // Reset to defaults, or given title:
        this.navBar.leftAction().model.updateWith(this.defaultLeftAction, true);
        if (this.requestData.navTitle)
            this.navBar.leftAction().text(this.requestData.navTitle);

        var jid = this.viewModel.jobTitleID(),
            jname = this.viewModel.jobTitle() && this.viewModel.jobTitle().singularName() || 'Scheduler',
            url = this.mustReturnTo || (jid && '/jobtitles/' + jid || '/scheduling');

        this.navBar.leftAction().link(url);
        this.navBar.leftAction().text(jname);
    }

    if (itIs && !this.requestData.cancelLink) {
        // Uses a custom handler so it returns keeping the given state:
        this.navBar.leftAction().handler(this.returnRequest);
    }
    else if (!this.requestData.cancelLink) {
        this.navBar.leftAction().handler(null);
    }
};

A.prototype.updateNavBarState = function updateNavBarState() {
    //jshint maxcomplexity:12

    var itIs = this.viewModel.serviceAddresses.isSelectionMode();
    
    this.viewModel.headerText(itIs ? 'Select or add a service location' : 'Locations');

    // Perform updates that apply this request:
    this.app.model.onboarding.updateNavBar(this.navBar) ||
    //this.app.applyNavbarMustReturn(this.requestData) ||
    this.applyOwnNavbarRules();
};

A.prototype.show = function show(options) {
    Activity.prototype.show.call(this, options);
    
    // Remember route to go back, from a request of 'mustReturn' or last requested
    this.mustReturnTo = this.requestData.route.query.mustReturn || this.mustReturnTo;

    // Reset: avoiding errors because persisted data for different ID on loading
    // or outdated info forcing update
    this.viewModel.jobTitleID(0);
    this.viewModel.clientUserID(0);
    this.viewModel.requestData = this.requestData;

    this.viewModel.serviceAddresses.isSelectionMode(options.selectAddress === true);
    this.viewModel.clientUserID(options.clientUserID || null);

    var params = options && options.route && options.route.segments;
    var jobTitleID = params[0] |0;
    
    // Check if it comes from an addressEditor that
    // received the flag 'returnNewAsSelected': we were in selection mode->creating address->must
    // return the just created address to the previous page
    if (options.returnNewAsSelected === true) {
        setTimeout(function() {
            delete options.returnNewAsSelected;
            if (options.address)
                this.viewModel.returnAddress(options.address);
            else if (options.addressID)
                this.viewModel.returnSelected(options.addressID, jobTitleID);
        }.bind(this), 1);
        // quick return
        return;
    }

    this.viewModel.jobTitleID(jobTitleID);

    this.updateNavBarState();
    
    if (jobTitleID === 0) {
        this.viewModel.jobTitles.sync();
    }
};

var UserJobProfile = require('../viewmodels/UserJobProfile'),
    ServiceAddresses = require('../viewmodels/ServiceAddresses');

function ViewModel(app) {

    this.isInOnboarding = app.model.onboarding.inProgress;
    
    this.serviceAddresses = new ServiceAddresses();

    this.headerText = ko.observable('Locations');
    
    this.jobTitleID = ko.observable(0);
    this.jobTitle = ko.observable(null);

    // Optionally, some times a clientUserID can be passed in order to create
    // a location for that client where perform a work.
    this.clientUserID = ko.observable(null);
    this.clientAddresses = new ServiceAddresses();
    // The list of client addresses is used only in selection mode
    this.clientAddresses.isSelectionMode(true);

    this.jobTitleName = ko.observable('Job Title'); 
    this.jobTitles = new UserJobProfile(app);
    this.jobTitles.baseUrl('/serviceAddress');
    this.jobTitles.selectJobTitle = function(jobTitle) {
        
        this.jobTitleID(jobTitle.jobTitleID());
        
        return false;
    }.bind(this);

    this.isSyncing = app.model.serviceAddresses.state.isSyncing();
    this.isLoading = ko.computed(function() {
        var add = app.model.serviceAddresses.state.isLoading();
        var jobs = this.jobTitles.isLoading();
        var cli = app.model.clientAddresses.state.isLoading();
        return add || jobs || cli;
    }, this);
    
    this.goNext = function() {
        if (app.model.onboarding.inProgress()) {
            // Ensure we keep the same jobTitleID in next steps as here:
            app.model.onboarding.selectedJobTitleID(this.jobTitleID());
            app.model.onboarding.goNext();
        }
    }.bind(this);

    // Replace default selectAddress
    this.serviceAddresses.selectAddress = function(selectedAddress, event) {
        if (this.serviceAddresses.isSelectionMode() === true) {
            // Run method injected by the activity to return a 
            // selected address:
            this.returnSelected(
                selectedAddress.addressID(),
                selectedAddress.jobTitleID()
            );
        }
        else {
            app.shell.go('addressEditor/service/' +
                this.jobTitleID() +
                '/' + selectedAddress.addressID()
            );
        }
        
        event.preventDefault();
        event.stopImmediatePropagation();

    }.bind(this);
    
    this.clientAddresses.selectAddress = function(selectedAddress, event) {
        if (this.clientAddresses.isSelectionMode() === true) {
            // Run method injected by the activity to return a
            // selected address:
            this.returnAddress(selectedAddress.model.toPlainObject());
        }

        event.preventDefault();
        event.stopImmediatePropagation();

    }.bind(this);

    this.addServiceLocation = function() {
        var url = '#!addressEditor/service/' + this.jobTitleID() + '/serviceLocation';
        var request = $.extend({}, this.requestData, {
            returnNewAsSelected: this.serviceAddresses.isSelectionMode()
        });
        app.shell.go(url, request);
    }.bind(this);
    
    this.addServiceArea = function() {
        var url = '#!addressEditor/service/' + this.jobTitleID() + '/serviceArea';
        var request = $.extend({}, this.requestData, {
            returnNewAsSelected: this.serviceAddresses.isSelectionMode()
        });
        app.shell.go(url, request);
    }.bind(this);
    
    this.addClientLocation = function() {
        var url = '#!addressEditor/service/' + this.jobTitleID() + '/clientLocation/' + this.clientUserID();
        var request = $.extend({}, this.requestData, {
            returnNewAsSelected: this.serviceAddresses.isSelectionMode()
        });
        app.shell.go(url, request);
    }.bind(this);
    
    this.onboardingNextReady = ko.computed(function() {
        var isin = app.model.onboarding.inProgress(),
            hasItems = this.serviceAddresses.sourceAddresses().length > 0;

        return isin && hasItems;
    }, this);
}
