'use strict';

const browserify = require('browserify');
const gulp = require('gulp');
const gulpUtil = require('gulp-util');
const sass = require('gulp-sass');
const tsify = require('tsify');
const vinylSourceStream = require('vinyl-source-stream');
const watchify = require('watchify');

// html ------------------------------------------------------------------------
gulp.task('copy-html', () => {
    return gulp.src(['./src/html/index.html'])
        .pipe(gulp.dest('./dist'));
});

// sass ------------------------------------------------------------------------
gulp.task('build-sass', () => {
    return gulp.src('./src/sass/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./dist/assets'))
});

gulp.task('watch-sass', () => {
    gulp.watch('./src/sass/style.scss', ['build-sass']);
});

// ts --------------------------------------------------------------------------
const bukBundle = browserify('./src/ts/main.ts', {debug: true}).plugin(tsify);
gulp.task('build-ts', () => {
    bukBundle.bundle()
        .pipe(vinylSourceStream('main.js'))
        .pipe(gulp.dest('./dist/assets'));
});

// main tasks ------------------------------------------------------------------
gulp.task('default', ['copy-html', 'build-sass', 'build-ts']);
gulp.task('watch', ['default', 'watch-sass'], () => {
    const watchedBrowserify = watchify(bukBundle);

    watchedBrowserify.on('update', () => {
        return watchedBrowserify
            .bundle()
            .pipe(vinylSourceStream('main.js'))
            .pipe(gulp.dest('./dist/assets'));
    });
    watchedBrowserify.on("log", gulpUtil.log);
});
