/**
    Onboarding tracking information
**/
'use strict';

var OnboardingProgress = require('../viewmodels/OnboardingProgress');
var NavAction = require('../viewmodels/NavAction');
var ko = require('knockout');

exports.create = function create(appModel) {
    
    // Onboarding management and state, initially empty so no progress
    var api = new OnboardingProgress();
    
    api.currentActivity = ko.observable('');
    
    // Requires initialization to receive and app instance
    api.init = function init(app) {
        api.app = app;
        api.currentActivity(app.shell.currentRoute.name);
        app.shell.on(app.shell.events.itemReady, function() {
            api.currentActivity(app.shell.currentRoute.name);
        });
    };

    // Extended with new methods

    // Set the correct onboarding progress and step given a step reference
    // (usually from database)
    api.setStep = function(stepReference) {
        if (stepReference) {
            var stepItems = stepReference.split(':', 2),
                group = stepItems[0],
                // step is the second part, or just the same as
                // the full name (that happens for the first steps that share
                // name with the group and only need to define the group name)
                step = stepItems[1] || group;

            // Try to set current step, follow to look for group if does not success
            if (this.setStepByName(step)) {
                return true;
            }
            // else:
            // Look for a group that matches
            var groupSteps = OnboardingProgress.predefinedStepGroups[group];
            if (groupSteps) {
                this.steps(groupSteps);
                this.group(group);
                if (this.setStepByName(step)) {
                    return true;
                }
            }
        }
        // No progress:
        this.model.reset();
        return false;
    };

    // Update the given navbar with the current onboarding information (only if in progress)
    api.updateNavBar = function(navBar) {
        var yep = this.inProgress();
        if (yep) {
            // On 2015-06-16 #575, changed decission from use a 'go back' action
            // (commented in following lines):
//            navBar.leftAction(NavAction.goBack.model.clone());
//            navBar.leftAction().handler(function() {
//                api.goPrevious();
//                return false;
//            });
            
            // On 2016-09-16 #760, changed decission from use a 'log out' action and progress
            // info as title to new design:
            // to use the Log-out action
            //#575
//            navBar.leftAction(NavAction.goLogout);
//            navBar.title(this.progressText());
            
            
            //#760: Menu on left and fixed message on title
            navBar.leftAction(NavAction.menuIn);
            navBar.title('Get Started');
        }
        return yep;
    };

    api.goCurrentStep = function() {
        // Go current step of onboarding, and if no one, go to dashboard
        var url = this.stepUrl() || 'dashboard';
        this.app.shell.go(url);
    };
    
    api.goNext = function goNext() {
        var current = this.stepNumber();

        current++;

        if (current > this.totalSteps()) {
            // It ended!!
            this.stepNumber(-1);
            appModel.userProfile.saveOnboardingStep(null);
            this.app.shell.go('/onboardingSuccess', { completedOnboarding: api.group() });
        }
        else {
            // Get next step
            this.stepNumber(current);
            appModel.userProfile.saveOnboardingStep(this.stepReference());
            this.app.shell.go(this.stepUrl());
        }
    };
    
    api.goPrevious = function goPrevious() {
        var current = this.stepNumber();

        current--;

        if (current >= 0 && current <= this.totalSteps()) {
            // Get previous step
            this.stepNumber(current);
        }
        else {
            this.stepNumber(0);
        }

        appModel.userProfile.saveOnboardingStep(this.stepReference());
        this.app.shell.go(this.stepUrl());
    };
    
    api.isAtCurrentStep = ko.computed(function() {
        return api.currentActivity() === api.stepName();
    });
    
    /**
        Check if onboarding is enabled on the user profile
        and redirects to the current step, or do nothing.
        IMPORTANT: Exception: if the page is loading coming from itself,
        like from a target=_blank link, does not redirect to
        avoid to break the proposal of the link (like a help or FAQ link
        on onboarding), BUT we need to set the onboarding step so the state is correct.
    **/
    api.goIfEnabled = function() {
        var step = api.app.model.user().onboardingStep();
        if (step && api.setStep(step)) {
            var r = window.document.referrer;
            // We check that there is a referrer (so comes from a link) and it shares the origin
            // (be aware that referrer includes origin+pathname, we just look for same origin).
            var fromItSelf = r && r.indexOf(window.document.location.origin) === 0;
            if (fromItSelf) return true;
            
            // Go to the step URL if we are NOT already there, by checking name to
            // not overwrite additional details, like a jobTitleID at the URL
            if (!api.isAtCurrentStep()) {
                var url = api.stepUrl();
                api.app.shell.go(url);
            }
            return true;
        }
        return false;
    };
    
    return api;
};
