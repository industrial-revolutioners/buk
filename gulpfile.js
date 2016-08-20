'use strict';

const browserify = require('browserify');
const browserSync = require('browser-sync').create();
const errorify = require('errorify');
const gulp = require('gulp');
const gulpUtil = require('gulp-util');
const preprocess = require('gulp-preprocess');
const sass = require('gulp-sass');
const tsify = require('tsify');
const vinylBuffer = require('vinyl-buffer');
const vinylSourceStream = require('vinyl-source-stream');
const watchify = require('watchify');

const DEBUG_CONTEXT = {
    context: {
        DEBUG: false
    }
};

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
gulp.task('build-ts', () => {
    let browserified = browserify('./src/ts/main.ts').plugin(tsify);

    return browserified.bundle()
        .pipe(vinylSourceStream('main.js'))
        .pipe(gulp.dest('./dist/assets'));
});

gulp.task('watch-ts', () => {
    let b = browserify({
        entries: ['./src/ts/main.ts'],
        cache: {},
        packageCache: {},
        plugin: [tsify, watchify, errorify],
        debug: true,
    });

    b.on('update', bundle);
    b.on('log', gulpUtil.log);
    bundle();

    function bundle(){
        return b
            .bundle()
            .pipe(vinylSourceStream('main.js'))
            .pipe(vinylBuffer())
            // .pipe(preprocess(DEBUG_CONTEXT))
            .pipe(gulp.dest('./dist/assets'))
            .pipe(browserSync.stream({match: '**/*.js'}));
    }
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
