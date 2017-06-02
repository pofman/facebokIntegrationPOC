'use strict';

/* eslint global-require: 0, no-path-concat:0 */

/**
 * Module dependencies
 */
var _ = require('lodash'),
    fs = require('fs'),
    glob = require('glob'),
    gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    runSequence = require('run-sequence'),
    plugins = gulpLoadPlugins();

// Local settings
var changedTestFiles = [];

var allJS = ['*.js'];

// Set NODE_ENV to 'test'
gulp.task('env:test', function () {
    process.env.NODE_ENV = 'test';
});

// Set NODE_ENV to 'development'
gulp.task('env:dev', function () {
    process.env.NODE_ENV = 'development';
});

// Set NODE_ENV to 'production'
gulp.task('env:prod', function () {
    process.env.NODE_ENV = 'production';
});

// Nodemon task
gulp.task('nodemon', function () {
    return plugins.nodemon({
        script: 'index.js',
        nodeArgs: ['--inspect'],
        ext: 'js',
        watch: allJS
    });
});

gulp.task('node-inspector', function() {
    gulp.src([])
        .pipe(plugins.nodeInspector({
            debugPort: 5858,
            webHost: '0.0.0.0',
            webPort: 1337,
            saveLiveEdit: false,
            preload: true,
            inject: true,
            hidden: [],
            stackTraceLimit: 50,
            sslKey: '',
            sslCert: ''
        }));
});

// Nodemon debug task
gulp.task('nodemon-debug', function () {
    return plugins.nodemon({
        script: 'index.js',
        nodeArgs: ['--debug'],
        ext: 'js',
        verbose: true,
        watch: allJS
    });
});

// Watch Files For Changes
gulp.task('watch', function () {
    var assets = allJS;

    // Start livereload
    plugins.refresh.listen();

    // Add watch rules
    gulp.watch(assets, ['eslint']).on('change', plugins.refresh.changed);
});

// ESLint JS linting task
gulp.task('eslint', function () {
    var assets = allJS;

    return gulp.src(assets)
        .pipe(plugins.eslint())
        .pipe(plugins.eslint.format());
});

// Drops the MongoDB database, used in e2e testing
gulp.task('dropdb', function (done) {
    // Use mongoose configuration
    var mongoose = require('./config/lib/mongoose.js');

    mongoose.connect(function (db) {
        db.connection.db.dropDatabase(function (err) {
            if (err) {
                console.error(err);
            } else {
                console.log('Successfully dropped db: ', db.connection.db.databaseName);
            }
            db.connection.db.close(done);
        });
    });
});

// Lint CSS and JavaScript files.
gulp.task('lint', function (done) {
    runSequence('eslint', done);
});

// Lint project files and minify them into two production files.
gulp.task('build', function (done) {
    runSequence('env:dev', 'lint', done);
});

// Run the project in development mode
gulp.task('default', function (done) {
    runSequence('env:dev', 'lint', ['nodemon', 'watch'], done);
});

// Run the project in debug mode
gulp.task('debug', function (done) {
    runSequence('env:dev', 'lint', ['node-inspector', 'nodemon-debug', 'watch'], done);
});

// Run the project in production mode
gulp.task('prod', function (done) {
    runSequence('build', 'env:prod', 'lint', ['nodemon', 'watch'], done);
});

// Prepare to run in production mode
gulp.task('prepare', function (done) {
    runSequence('env:prod', 'lint', done);
});
