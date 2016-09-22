/** OnboardingProgress view model.
    It tracks the onboarding information and methods
    to update views to that state
**/
var Model = require('../models/Model'),
    ko = require('knockout');

function OnboardingProgress(values) {

    Model(this);
    
    this.model.defProperties({
        group: '',
        stepNumber: -1,
        steps: [],
        // Let's set a job title to pass in to jobTitleSpecific steps as URL segment
        selectedJobTitleID: null
    }, values);
    
    this.totalSteps = ko.pureComputed(function() {
        // 'Zero' step is a welcome, not accounted:
        return this.steps().length - 1;
    }, this);
    
    this.stepName = ko.pureComputed(function() {
        var num = this.stepNumber(),
            tot = this.steps().length;

        if (tot > 0 &&
            num > -1 &&
            num < tot) {
            var name = this.steps()[num] || '';
            return name;
        }
        else {
            return null;
        }
    }, this);
    
    this.stepUrl = ko.pureComputed(function() {
        var name = this.stepName();
        if (!name) return null;
        var url = '/' + name;

        // Check if there is need for a jobTitleID in the URL
        var defs = OnboardingProgress.stepsDefinitions[this.group()];
        var def = defs && defs[name];
        var jobID = this.selectedJobTitleID();
        if (jobID && def && def.jobTitleSpecific) {
            url += '/' + jobID;
        }

        return url;
    }, this);

    this.stepReference = ko.pureComputed(function() {
        return this.group() + ':' + this.stepName();
    }, this);
    
    this.progressText = ko.pureComputed(function() {
        // TODO L18N
        return this.stepNumber() + ' of ' + this.totalSteps();
    }, this);
    
    this.inProgress = ko.pureComputed(function() {
        return !!this.stepUrl();
    }, this);
}

module.exports = OnboardingProgress;

OnboardingProgress.prototype.setStepByName = function setStepByName(name) {
    var stepIndex = this.steps().indexOf(name);
    if (stepIndex > -1) {
        this.stepNumber(stepIndex);
        return true;
    }
    return false;
};

/**
    Static list of all the steps groups for the app
**/
OnboardingProgress.predefinedStepGroups = {
    // Scheduling onboarding, aka welcome
    // testing bigger list as of #760
    /*welcome: [
        'welcome',
        'addJobTitles',
        // disabled on 2015-06-16 as of #575 comments
        //'serviceProfessionalService',
        //'serviceAddresses',
        'schedulingPreferences',
        'aboutMe'
    ],*/
    welcome: [
        'welcome',
        'addJobTitles',
        'schedulingPreferences',
        'servicesOverview',
        'serviceProfessionalService',
        'serviceAddresses',
        'bookingPolicies',
        'licensesCertifications',
        'aboutMe',
        'paymentAccount'
    ],
    marketplace: [
    ],
    payment: [
    ]
};

// Definitions of the steps for 'welcome' onboarding, for any relevant set-up needed
// on there, like if they need a jobTitleID
OnboardingProgress.stepsDefinitions = {
    welcome: {
        welcome: {},
        addJobTitles: {},
        schedulingPreferences: {},
        servicesOverview: {
            jobTitleSpecific: true
        },
        serviceProfessionalService: {
            jobTitleSpecific: true
        },
        serviceAddresses: {
            jobTitleSpecific: true
        },
        bookingPolicies: {
            jobTitleSpecific: true
        },
        licensesCertifications: {
            jobTitleSpecific: true
        },
        aboutMe: {},
        paymentAccount: {}
    }
};
