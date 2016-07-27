'use strict';

module.exports = {
    images: {
        expand: true,
        cwd: 'source/images/',
        src: ['**/*.png', '**/*.jpg', '**/*.svg', '**/*.ico'],
        dest: 'build/assets/images/',
        filter: 'isFile'
    },
    jqueryuiimages: {
        expand: true,
        cwd: 'vendor/jquery-ui/images/',
        src: ['*.png'],
        dest: 'build/assets/css/images/',
        filter: 'isFile'
    },
    html: {
        expand: true,
        cwd: 'source/html/',
        src: ['activities/*.html', 'modals/*.html'],
        dest: 'build/',
        filter: 'isFile'
    },
    webapp_assets: {
        expand: true,
        cwd: 'build/assets/',
        src: ['js/{app,libs,styleguidelibs}.min.js', 'css/{app,libs}.min.css', 'images/**/*.*', 'fonts/**/*.*'],
        dest: '../web/assets/',
        filter: 'isFile'
    },
    phonegap: {
        expand: true,
        cwd: 'build/',
        src: ['assets/js/{app,libs,styleguidelibs}.min.js', 'assets/css/{app,libs}.min.css', 'assets/images/**/*.*', 'assets/fonts/**/*.*'],
        dest: 'phonegap/www/',
        filter: 'isFile'
    },
    platform_merges: {
        expand: true,
        dest: './phonegap/platforms/',
        cwd: './phonegap/platform-merges',
        src: '**/*.*'
    },
    'bootstrap-fonts': {
        expand: true,
        cwd: './vendor/bootstrap/fonts/',
        src: '*.*',
        dest: './build/assets/fonts/',
        filter: 'isFile'
    },
    'font-awesome-fonts': {
        expand: true,
        cwd: './vendor/font-awesome/fonts/',
        src: '*.*',
        dest: './build/assets/fonts/',
        filter: 'isFile'
    },
    'ionicons-fonts': {
        expand: true,
        cwd: './vendor/ionicons/fonts/',
        src: '*.*',
        dest: './build/assets/fonts/',
        filter: 'isFile'
    }
};