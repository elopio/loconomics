/** WorkPhotos
**/
'use strict';

var WorkPhoto = require('../models/WorkPhoto'),
    GroupListRemoteModel = require('../utils/GroupListRemoteModel'),
    photoTools = require('../utils/photoTools'),
    extend = require('jquery').extend;
var $ = require('jquery');

exports.create = function create(appModel) {

    var baseUrl = 'me/work-photos/';
    var api = new GroupListRemoteModel({
        // Conservative cache, just 1 minute
        listTtl: { minutes: 1 },
        groupIdField: 'jobTitleID',
        itemIdField: 'workPhotoID',
        Model: WorkPhoto
    });
    
    api.addLocalforageSupport('workPhotos');
    api.addRestSupport(appModel.rest, baseUrl);
    
    appModel.on('clearLocalData', function() {
        api.clearCache();
    });
    
    // Here we have the special case of upload files, that needs use different component than just
    // ajax/rest client.
    // We replace default:
    var pushJustBasicDataToRemote = api.pushItemToRemote.bind(api);
    // With a file-uploader logic
    var photoUploadFieldName = 'photo';
    var pushWithoutFile = function(data) {
        // On new photos, the photo is required!
        if (data.workPhotoID === 0) {
            // In theory, the UI must not let this to happens, so discard silently rather
            // than throw an error, since is an element that even may be dissapeared in the UI.
            //return Promise.reject({ errorMessage: 'Must pick a photo' });
            return Promise.resolve(null);
        }
        else {
            // Standard upload
            return pushJustBasicDataToRemote(data);
        }
    };
    // Support for Native Apps (via Cordova FileTransfer)
    var nativeUploadFile = function pushToRemote(data, options) {
        // If no file to upload:
        if (!data.localTempFilePath) {
            return pushWithoutFile(data);
        }
        else {        
            // Upload with FileTransfer
            var uploadSettings = {
                fileKey: photoUploadFieldName,
                mimeType: 'image/jpeg',
                httpMethod: options.method,
                params: data,
                headers: extend(true, {}, appModel.rest.extraHeaders)
            };
            return photoTools.uploadLocalFileJson(data.localTempFilePath, options.url, uploadSettings);
        }
    }.bind(api);
    // Support for Web upload (via input[type=file] and jquery.uploader)
    var webUploadFile = function(data, options) {
        if (!data.localTempFileData) {
            return pushWithoutFile(data);
        }
        else {
            var fd = data.localTempFileData;
            if (!fd) return Promise.resolve(null);
            fd.url = options.url;
            fd.type = options.method;
            fd.paramName = photoUploadFieldName;
            fd.formData = Object.keys(data)
            .filter(function(k) {
                return k !== 'localTempFileData' && k !== 'localTempPhotoPreview';
            })
            .map(function(k) {
                return {
                    name: k,
                    value: data[k]
                };
            });
            fd.headers = $.extend(true, {}, appModel.rest.extraHeaders);
            return Promise.resolve(fd.submit());
        }
    };
    api.pushItemToRemote = function(data) {
        // Standard ID and URL code
        var groupID = data[this.settings.groupIdField];
        var itemID = data[this.settings.itemIdField];
        var options = {
            method: itemID ? 'put' : 'post',
            url: appModel.rest.baseUrl + baseUrl + groupID + (itemID ? '/' + itemID : '')
        };

        if (photoTools.takePhotoSupported()) {
            return nativeUploadFile(data, options);
        }
        else {
            return webUploadFile(data, options);
        }
    }.bind(api);
    
    return api;
};