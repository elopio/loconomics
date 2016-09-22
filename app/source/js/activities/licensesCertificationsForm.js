/**
    LicensesCertificationsForm activity
**/
'use strict';

var Activity = require('../components/Activity'),
    ko = require('knockout'),
    photoTools = require('../utils/photoTools');
require('jquery.fileupload-image');

var A = Activity.extend(function LicensesCertificationsFormActivity() {
    
    Activity.apply(this, arguments);
    
    this.viewModel = new ViewModel(this.app);
    this.accessLevel = this.app.UserType.serviceProfessional;
    
    this.navBar = Activity.createSubsectionNavBar('Job Title', {
        backLink: '/marketplaceProfile', helpLink: '/help/relatedArticles/201967966-adding-professional-licenses-and-certifications'
    });
    this.defaultNavBarSettings = this.navBar.model.toPlainObject(true);
    
    if (!photoTools.takePhotoSupported()) {
        // Web version to pick a photo/file
        var $input = this.$activity.find('#licensesCertificationsForm-photoFile');//input[type=file]
        // Constant size: is the maximum as defined in the CSS and server processing.
        var PHOTO_WIDTH = 442;
        var PHOTO_HEIGHT = 332;
        $input.fileupload({
            // Asigned per file uploaded:
            //url: 'assigned per file uploaded',
            //type: 'PUT',
            //paramName: 'file',
            dataType: 'json',
            autoUpload: false,
            acceptFileTypes: /(\.|\/)(png|gif|tiff|pdf|jpe?g)$/i,
            maxFileSize: 20000000, // 20MB
            disableImageResize: true,
            // // Enable image resizing, except for Android and Opera,
            // // which actually support image resizing, but fail to
            // // send Blob objects via XHR requests:
            // disableImageResize: /Android(?!.*Chrome)|Opera/
            // .test(window.navigator.userAgent),
            previewMaxWidth: PHOTO_WIDTH,
            previewMaxHeight: PHOTO_HEIGHT,
            previewCrop: true
        })
        .on('fileuploadadd', function (e, data) {
            this.viewModel.item().localTempFileData(data);
            if (!data.originalFiles.length ||
                !/^image\//.test(data.originalFiles[0].type)) {
                this.viewModel.item().localTempPhotoPreview(null);
            }
            this.viewModel.item().localTempFileName(data.originalFiles[0] && data.originalFiles[0].name);
        }.bind(this))
        .on('fileuploadprocessalways', function (e, data) {
            var file = data.files[data.index];
            if (file.error) {
                // TODO Show preview error?
                this.viewModel.item().localTempPhotoPreview(null);
                console.error('Photo Preview', file.error);
            }
            else if (file.preview) {
                //this.viewModel.item().localTempFileData(data);
                this.viewModel.item().localTempPhotoPreview(file.preview);
            }
        }.bind(this));
    }
});

exports.init = A.init;

A.prototype.updateNavBarState = function updateNavBarState() {

    var link = this.requestData.cancelLink || '/licensesCertifications/';
    
    if (this.viewModel.isNew())
        this.convertToCancelAction(this.navBar.leftAction(), link);
    else
        this.navBar.model.updateWith(this.defaultNavBarSettings, true);
};

A.prototype.show = function show(state) {
    Activity.prototype.show.call(this, state);
    
    // Reset
    this.viewModel.version(null);

    // Params
    var params = state && state.route && state.route.segments || [];
    var query = state && state.route && state.route.query || {};
    
    this.viewModel.jobTitleID(params[0] |0);
    this.viewModel.userLicenseCertificationID(params[1] |0);
    this.viewModel.licenseCertificationID(query.licenseCertificationID |0);

    this.updateNavBarState();
    
    var ModelVersion = require('../utils/ModelVersion'),
        UserLicenseCertification = require('../models/UserLicenseCertification');
    
    if (!this.viewModel.isNew()) {
        this.app.model.userLicensesCertifications
        .getItem(this.viewModel.jobTitleID(), this.viewModel.userLicenseCertificationID())
        .then(function(data) {
            this.viewModel.version(new ModelVersion(new UserLicenseCertification(data)));
        }.bind(this))
        .catch(function (err) {
            this.app.modals.showError({
                title: 'There was an error while loading.',
                error: err
            })
            .then(function() {
                // On close modal, go back
                this.app.shell.goBack();
            }.bind(this));
        }.bind(this));
    }
    else {
        this.app.model.licenseCertification
        .getItem(this.viewModel.licenseCertificationID())
        .then(function(data) {
            var item = new UserLicenseCertification({
                jobTitleID: this.viewModel.jobTitleID(),
                licenseCertificationID: this.viewModel.licenseCertificationID()
            });
            item.licenseCertification().model.updateWith(data);
            this.viewModel.version(new ModelVersion(item));
        }.bind(this))
        .catch(function (err) {
            this.app.modals.showError({
                title: 'There was an error while loading.',
                error: err
            })
            .then(function() {
                // On close modal, go back
                this.app.shell.goBack();
            }.bind(this));
        }.bind(this));
    }
};

function ViewModel(app) {

    this.isInOnboarding = app.model.onboarding.inProgress;

    this.userLicenseCertificationID = ko.observable(0);
    this.licenseCertificationID = ko.observable(0);
    this.jobTitleID = ko.observable(0);
    this.jobTitleNamePlural = ko.observable(); 
    this.isLoading = ko.pureComputed(function() {
        return (
            app.model.userLicensesCertifications.state.isLoading()
        );
    }, this);
    this.isSaving = app.model.userLicensesCertifications.state.isSaving;
    this.isSyncing = app.model.userLicensesCertifications.state.isSyncing;
    this.isDeleting = app.model.userLicensesCertifications.state.isDeleting;
    this.isLocked = ko.pureComputed(function() {
        return (
            app.model.userLicensesCertifications.state.isLocked()
        );
    }, this);
    this.isReady = ko.pureComputed(function() {
        var it = this.item();
        return !!(it && (it.localTempFilePath() || it.localTempFileData()));
    }, this);
    this.takePhotoSupported = ko.observable(photoTools.takePhotoSupported());
    
    this.submitText = ko.pureComputed(function() {
        return (this.isLoading() || this.isSyncing()) ? 'Loading..' : this.isSaving() ? 'Saving..' : this.isDeleting() ? 'Deleting..' : 'Save';
    }, this);

    this.isNew = ko.pureComputed(function() {
        return !this.userLicenseCertificationID();
    }, this);
    
    this.version = ko.observable(null);
    this.item = ko.pureComputed(function() {
        var v = this.version();
        if (v) {
            return v.version;
        }
        return null;
    }, this);

    this.unsavedChanges = ko.pureComputed(function() {
        var v = this.version();
        return v && v.areDifferent();
    }, this);
    
    this.deleteText = ko.pureComputed(function() {
        return (
            this.isDeleting() ? 
                'Deleting...' : 
                'Delete'
        );
    }, this);

    this.save = function() {
        var data = this.item().model.toPlainObject(true);
        app.model.userLicensesCertifications.setItem(data)
        .then(function(serverData) {
            // Update version with server data.
            this.item().model.updateWith(serverData);
            // Push version so it appears as saved
            this.version().push({ evenIfObsolete: true });
            // Cache of licenses info for the user and job title is dirty, clean up so is updated later
            app.model.jobTitleLicenses.clearCache();
            app.model.userLicensesCertifications.clearCache();
            // Go out
            app.successSave();
        }.bind(this))
        .catch(function(err) {
            app.modals.showError({
                title: 'There was an error while saving.',
                error: err
            });
        });

    }.bind(this);
    
    this.confirmRemoval = function() {
        // L18N
        app.modals.confirm({
            title: 'Delete',
            message: 'Are you sure? This cannot be undone.',
            yes: 'Delete',
            no: 'Keep'
        })
        .then(function() {
            this.remove();
        }.bind(this));
    }.bind(this);

    this.remove = function() {
        app.model.userLicensesCertifications.delItem(this.jobTitleID(), this.userLicenseCertificationID())
        .then(function() {
            // Go out
            app.successSave();
        }.bind(this))
        .catch(function(err) {
            app.modals.showError({
                title: 'There was an error while deleting.',
                error: err
            });
        });
    }.bind(this);
    
    var addNew = function(fromCamera) {
        var settings = {
            sourceType: fromCamera ?
                window.Camera && window.Camera.PictureSourceType.CAMERA :
                window.Camera && window.Camera.PictureSourceType.PHOTOLIBRARY
        };
        if (photoTools.takePhotoSupported()) {
            return photoTools.cameraGetPicture(settings)
            .then(function(imgLocalUrl) {
                this.item().localTempFilePath(imgLocalUrl);
                this.item().localTempPhotoPreviewUrl(photoTools.getPreviewPhotoUrl(imgLocalUrl));
            }.bind(this))
            .catch(function(err) {
                // A user abort gives no error or 'no image selected' on iOS 9/9.1
                if (err && err !== 'no image selected' && err !== 'has no access to camera') {
                    app.modals.showError({ error: err, title: 'Error selecting photo.' });
                }
            });
        }
        else {
            app.modals.showError({ error: 'This feature is currently only available on mobile devices' });
        }
    }.bind(this);
    
    this.takePhotoForNew = function() {
        addNew(true);
    }.bind(this);
    
    this.pickPhotoForNew = function() {
        addNew(false);
    }.bind(this);
}
