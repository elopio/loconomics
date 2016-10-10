'use strict';

module.exports = function(grunt) {

    var includedPatterns = ['modals/**/*.html', 'activities/**/*.html', 'templates/**/*.html'];
    var includedDir = 'source/html/';
    var includedFiles = grunt.file.expand({
        cwd: includedDir,
        filter: grunt.file.isFile
    }, includedPatterns);
    
    var facebookAppID = '180579422039773',
        facebookLang = 'en-US';
    
    var moment = require('moment');
    var version = moment().format('YYYYMMDDHHmm');
    var pkg = grunt.file.readJSON('package.json');
    var appVersion = pkg.version;
    // Version number as single number, 2 digits per position
    // Example: 1.1.0 -> 10100, 2.34.5 -> 23405
    var versionCode = appVersion.split('.').reverse().reduce(function(t, x, i) { return t + (x|0) * Math.pow(10, i * 2); }, 0);

    return {
        app: {
          files: {
            'build/app.html': ['source/html/app.js.html']
          },
          options: {
            context: {
                debug: false,
                includedFiles: includedFiles,
                cordovajs: false,
                siteUrl: 'http://dev.loconomics.com',
                facebookAppID: facebookAppID,
                facebookLang: facebookLang,
                appVersion: '<%= package.version %>',
                appId: '<%= package.appId %>',
                appName: '<%= package.appName %>'
            }
          }
        },
        webapp: {
          files: {
            '../web/_specialRoutes/app.html': ['source/html/web.js.html']
          },
          options: {
            context: {
                debug: false,
                includedFiles: includedFiles,
                cordovajs: false,
                facebookAppID: facebookAppID,
                facebookLang: facebookLang,
                cssVersion: version,
                jsVersion: version,
                appVersion: '<%= package.version %>',
                appId: '<%= package.appId %>',
                appName: '<%= package.appName %>'
            }
          }
        },
        appDebug: {
          files: {
            'build/appDebug.html': ['source/html/app.js.html']
          },
          options: {
            context: {
                debug: true,
                includedFiles: includedFiles,
                cordovajs: false,
                siteUrl: 'http://dev.loconomics.com',
                facebookAppID: facebookAppID,
                facebookLang: facebookLang,
                appVersion: '<%= package.version %>',
                appId: '<%= package.devAppId %>',
                appName: '<%= package.devAppName %>'
                //siteUrl: 'http://localhost/source'
            }
          }
        },
        phonegap: {
          files: {
            'phonegap/www/index.html': ['source/html/app.js.html']
          },
          options: {
            context: {
                debug: false,
                includedFiles: includedFiles,
                cordovajs: true,
                siteUrl: 'https://loconomics.com',
                facebookAppID: facebookAppID,
                facebookLang: facebookLang,
                appVersion: '<%= package.version %>',
                appId: '<%= package.appId %>',
                appName: '<%= package.appName %>'
            }
          }
        },
        phonegapDev: {
          files: {
            'phonegap/www/index.html': ['source/html/app.js.html']
          },
          options: {
            context: {
                debug: true,
                includedFiles: includedFiles,
                cordovajs: true,
                siteUrl: 'http://dev.loconomics.com',
                facebookAppID: facebookAppID,
                facebookLang: facebookLang,
                appVersion: '<%= package.version %>',
                appId: '<%= package.devAppId %>',
                appName: '<%= package.devAppName %>'
            }
          }
        },
        cordovaConfigJson: {
            files: {
                'phonegap/.cordova/config.json': ['source/cordova-config.js.json']
            },
            options: {
                context: {
                    id: '<%= package.appId %>',
                    phonegapbuildId: '<%= package.phonegapbuildId %>',
                    version: '<%= package.version %>'
                }
            }
        },
        cordovaConfigXml: {
            files: {
                'phonegap/www/config.xml': ['source/cordova-config.js.xml']
            },
            options: {
                context: {
                    id: '<%= package.appId %>',
                    version: '<%= package.version %>',
                    versionCode: versionCode,
                    name: '<%= package.appName %>',
                    description: '<%= package.appDescription %>',
                    author: {
                      email: 'support@loconomics.com',
                      url: 'https://loconomics.com',
                      text: '<%= package.author %>'
                    },
                    facebookAppID: facebookAppID,
                    facebookLang: facebookLang,
                    facebookAppName: '<%= package.appName %>'
                }
            }
        },
        cordovaConfigXmlDev: {
            files: {
                'phonegap/www/config.xml': ['source/cordova-config.js.xml']
            },
            options: {
                context: {
                    id: '<%= package.devAppId %>',
                    version: '<%= package.version %>',
                    versionCode: versionCode,
                    name: '<%= package.devAppName %>',
                    description: '<%= package.appDescription %>',
                    author: {
                      email: 'support@loconomics.com',
                      url: 'https://loconomics.com',
                      text: '<%= package.author %>'
                    },
                    facebookAppID: facebookAppID,
                    facebookLang: facebookLang,
                    facebookAppName: '<%= package.appName %>'
                }
            }
        }
    };
};
