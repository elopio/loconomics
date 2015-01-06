'use strict';

module.exports = {
    html: {
        expand: true,
        cwd: 'source/html',
        src: ['app.html', 'activities/*.html', 'modals/*.html'],
        dest: 'build/',
        filter: 'isFile'
    }
};