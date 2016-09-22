/**
    Jobtitles activity
**/
'use strict';

var Activity = require('../components/Activity'),
    ko = require('knockout');

var A = Activity.extend(function JobtitlesActivity() {
    
    Activity.apply(this, arguments);
    
    this.accessLevel = this.app.UserType.loggedUser;
    this.viewModel = new ViewModel(this.app);
    this.navBar = Activity.createSubsectionNavBar('Scheduler', {
        backLink: '/scheduling' , helpLink: '/help/relatedArticles/201967086-managing-your-scheduler'
    });
    
    // On changing jobTitleID:
    // - load addresses
    // - load job title information
    // - load pricing
    this.registerHandler({
        target: this.viewModel.jobTitleID,
        handler: function(jobTitleID) {

            if (jobTitleID) {
                ////////////
                // Addresses
                this.app.model.serviceAddresses.getList(jobTitleID)
                .then(function(list) {

                    list = this.app.model.serviceAddresses.asModel(list);
                    this.viewModel.addresses(list);

                }.bind(this))
                .catch(function (err) {
                    this.app.modals.showError({
                        title: 'There was an error while loading addresses.',
                        error: err
                    });
                }.bind(this));
                
                ////////////
                // Pricing/Services
                this.app.model.serviceProfessionalServices.getList(jobTitleID)
                .then(function(list) {

                    list = this.app.model.serviceProfessionalServices.asModel(list);
                    this.viewModel.pricing(list);

                }.bind(this))
                .catch(function (err) {
                    this.app.modals.showError({
                        title: 'There was an error while loading services.',
                        error: err
                    });
                }.bind(this));
                
                ////////////
                // User Job Title
                // Get data for the Job Title and User Profile
                this.app.model.userJobProfile.getUserJobTitleAndJobTitle(jobTitleID)
                //this.app.model.jobTitles.getJobTitle(jobTitleID)
                .then(function(job) {
                    // Fill the job title record
                    this.viewModel.jobTitle(job.jobTitle);
                    this.viewModel.userJobTitle(job.userJobTitle);
                }.bind(this))
                .catch(function(err) {
                    this.app.modals.showError({
                        title: 'There was an error while loading your job title.',
                        error: err
                    });
                }.bind(this));

                /* NOTE: job title comes in the previous userJobProfile call, so is no need to duplicate the task
                ////////////
                // Job Title
                // Get data for the Job title ID
                this.app.model.jobTitles.getJobTitle(jobTitleID)
                .then(function(jobTitle) {

                    // Fill in job title name
                    this.viewModel.jobTitleName(jobTitle.singularName());
                }.bind(this))
                .catch(function(err) {
                    this.app.modals.showError({
                        title: 'There was an error while loading the job title.',
                        error: err
                    });
                }.bind(this));
                */
            }
            else {
                this.viewModel.addresses([]);
                this.viewModel.pricing([]);
                this.viewModel.jobTitle(null);
                this.viewModel.userJobTitle(null);
                //this.viewModel.jobTitleName('Job Title');
            }
        }.bind(this)
    });
});

exports.init = A.init;

A.prototype.show = function show(state) {
    Activity.prototype.show.call(this, state);

    // Reset: avoiding errors because persisted data for different ID on loading
    // or outdated info forcing update
    this.viewModel.jobTitleID(0);

    // Parameters
    var params = state && state.route && state.route.segments || {};
    
    // Set the job title
    var jobID = params[0] |0;
    this.viewModel.jobTitleID(jobID);
};

function ViewModel(app) {
    
    this.jobTitleID = ko.observable(0);
    this.jobTitle = ko.observable(null);
    this.userJobTitle = ko.observable(null);
    //this.jobTitleName = ko.observable('Job Title');
    this.jobTitleName = ko.pureComputed(function() {
        return this.jobTitle() && this.jobTitle().singularName() || 'Job Title';
    }, this);

    // Retrieves a computed that will link to the given named activity adding the current
    // jobTitleID and a mustReturn URL to point this page so its remember the back route
    this.getJobUrlTo = function(name) {
        // Sample '/serviceProfessionalServices/' + jobTitleID()
        return ko.pureComputed(function() {
            return (
                '/' + name + '/' + this.jobTitleID() + '?mustReturn=jobtitles/' + this.jobTitleID() +
                '&returnText=' + this.jobTitleName() + ' Scheduler'
            );
        }, this);
    };
    
    this.addresses = ko.observable([]);
    this.pricing = ko.observable([]);

    // Computed since it can check several externa loadings
    this.isLoading = ko.pureComputed(function() {
        return (
            app.model.serviceAddresses.state.isLoading() ||
            app.model.serviceProfessionalServices.state.isLoading()
        );
        
    }, this);
    
    this.addressesCount = ko.pureComputed(function() {
        
        // TODO l10n.
        // Use i18next plural localization support rather than this manual.
        var count = this.addresses().length,
            one = '1 location',
            more = ' locations';
        
        if (count === 1)
            return one;
        else
            // Small numbers, no need for formatting
            return count + more;

    }, this);
    
    this.pricingCount = ko.pureComputed(function() {
        
        // TODO l10n.
        // Use i18next plural localization support rather than this manual.
        var count = this.pricing().length,
            one = '1 service',
            more = ' services';
        
        if (count === 1)
            return one;
        else
            // Small numbers, no need for formatting
            return count + more;

    }, this);
    
    /// COPIED FROM marketplaceJobtitles
    this.deleteJobTitle = function() {
        var jid = this.jobTitleID();
        var jname = this.jobTitleName();
        if (jid) {
            app.modals.confirm({
                title: 'Delete ' + jname + ' profile',
                message: 'Are you really sure you want to delete your ' + jname +' profile?',
                yes: 'Delete',
                no: 'Keep'
            }).then(function() {
                app.shell.goBack();
                return app.model.userJobProfile.deleteUserJobTitle(jid);
            })
            .catch(function(err) {
                if (err) {
                    app.modals.showError({ error: err, title: 'Error while deleting a job title' });
                }
            });
        }
    }.bind(this);
}
