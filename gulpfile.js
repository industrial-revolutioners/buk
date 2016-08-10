'use strict';

const browserify = require('browserify');
const browserSync = require('browser-sync').create();
const gulp = require('gulp');
const gulpUtil = require('gulp-util');
const sass = require('gulp-sass');
const tsify = require('tsify');
const vinylSourceStream = require('vinyl-source-stream');
const watchify = require('watchify');

// html ------------------------------------------------------------------------
gulp.task('build-html', () => {
    return gulp.src(['./src/html/index.html'])
        .pipe(gulp.dest('./dist'));
});

gulp.task('watch-html', ['build-html'], () => {
    return gulp.watch('./src/html/index.html', () => {
        return gulp.src('./src/html/index.html')
            .pipe(gulp.dest('./dist'))
            .pipe(browserSync.stream({match: '**/*.html'}));
    });
});

// sass ------------------------------------------------------------------------
gulp.task('build-sass', () => {
    return gulp.src('./src/sass/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./dist/assets'))
});

gulp.task('watch-sass', ['build-sass'], () => {
    return gulp.watch('./src/sass/style.scss', () => {
        return gulp.src('./src/sass/style.scss')
            .pipe(sass().on('error', sass.logError))
            .pipe(gulp.dest('./dist/assets'))
            .pipe(browserSync.stream({match: '**/*.css'}));
    });
});

// ts --------------------------------------------------------------------------
const browserified = browserify('./src/ts/main.ts', {debug: true}).plugin(tsify);
gulp.task('build-ts', () => {
    return browserified.bundle()
        .pipe(vinylSourceStream('main.js'))
        .pipe(gulp.dest('./dist/assets'));
});

gulp.task('watch-ts', ['build-ts'], () => {
    let watchedBrowserify = watchify(browserified);

    function bundle(){
        return watchedBrowserify
            .bundle()
            .pipe(vinylSourceStream('main.js'))
            .pipe(gulp.dest('./dist/assets'))
            .pipe(browserSync.stream({match: '**/*.js'}));
    }
    bundle();

    watchedBrowserify.on('update', bundle);
    watchedBrowserify.on('log', gulpUtil.log);
});

// main tasks ------------------------------------------------------------------
gulp.task('default', ['build-html', 'build-sass', 'build-ts']);
gulp.task('watch', ['watch-html', 'watch-sass', 'watch-ts'], () => {
    browserSync.init({
        server: {
            baseDir: './dist'
        },
        open: false,
        notify: false
    });
});
