'use strict';

const browserify = require('browserify');
const browserSync = require('browser-sync').create();
const errorify = require('errorify');
const gulp = require('gulp');
const metascript = require('gulp-metascript');
const sass = require('gulp-sass');
const stream = require('stream');
const tsify = require('tsify');
const util = require('gulp-util');
const vinylBuffer = require('vinyl-buffer');
const vinylSourceStream = require('vinyl-source-stream');
const watchify = require('watchify');

const DEBUG_CONTEXT = {DEBUG: true};
const RELEASE_CONTEXT = {DEBUG: false};

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
    return gulp.src('./src/ts/*.ts')
        .pipe(metascript(RELEASE_CONTEXT))
        .pipe(gulp.dest('./build/ts'))
        .on('end', () =>{
            return browserify('./build/ts/main.ts')
            .plugin(tsify)
            .bundle()
            .pipe(vinylSourceStream('main.js'))
            .pipe(vinylBuffer())
            .pipe(gulp.dest('./dist/assets'));
        });
});

gulp.task('watch-ts', () => {
    gulp.watch('./src/ts/*.ts', () => {
        return gulp.src('./src/ts/*.ts')
            .pipe(metascript(DEBUG_CONTEXT))
            .pipe(gulp.dest('./build/ts'))
    });

    gulp.src('./src/ts/*.ts')
        .pipe(metascript(DEBUG_CONTEXT))
        .pipe(gulp.dest('./build/ts'))
        .on('end', () => {
            let b = browserify({
                entries: ['./build/ts/main.ts'],
                cache: {},
                packageCache: {},
                plugin: [tsify, watchify, errorify],
                debug: true
            });

            b.on('update', bundle);
            b.on('log', util.log);
            bundle();

            function bundle(){
                return b
                    .bundle()
                    .pipe(vinylSourceStream('main.js'))
                    .pipe(gulp.dest('./dist/assets'))
                    .pipe(browserSync.stream({match: '**/*.js'}));
            }
        });
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
