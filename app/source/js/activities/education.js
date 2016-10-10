/**
    Education activity
**/
'use strict';

var Activity = require('../components/Activity');

var A = Activity.extend(function EducationActivity() {

    Activity.apply(this, arguments);

    this.accessLevel = this.app.UserType.loggedUser;
    this.viewModel = new ViewModel(this.app);
    // Defaults settings for navBar.
    this.navBar = Activity.createSubsectionNavBar('Account', {
        backLink: '/account' , helpLink: this.viewModel.helpLink
    });
});

exports.init = A.init;

A.prototype.show = function show(options) {
    Activity.prototype.show.call(this, options);
    
    // Request a sync and catch any error
    this.app.model.education.sync()
    .catch(function (err) {
        this.app.modals.showError({
            title: 'Error loading education information',
            error: err
        });
    }.bind(this));
};

function ViewModel(app) {
    this.helpLink = '/help/relatedArticles/201960833-adding-education-to-your-profile';

    this.isLoading = app.model.education.state.isLoading;
    this.isSyncing = app.model.education.state.isSyncing;

    this.list = app.model.education.list;
}
