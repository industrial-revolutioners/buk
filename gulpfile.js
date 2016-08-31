'use strict';

const browserify = require('browserify');
const browserSync = require('browser-sync').create();
const errorify = require('errorify');
const File = require('vinyl');
const gulp = require('gulp');
const metascript = require('gulp-metascript');
const path = require('path');
const sass = require('gulp-sass');
const stream = require('stream');
const through2 = require('through2');
const tmxParser = require('tmx-parser');
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

// tmx -------------------------------------------------------------------------

function tmxParserPlugin(outFile){
    let levels = [];

    function serialize(data){
        let width = data.width;

        let level = {
            width: width,
            height: data.height,
            bonus: 0,
            tiles: []
        };

        let layers = {};
        data.layers.forEach((layer) => {
            layers[layer.name] = layer;
        });

        let tileId = 0;
        let flattened = new Array(width * level.height);
        layers.base.tiles.forEach((tile, i) => {
            if(tile !== undefined){
                let type = tile.properties.type;

                if(type !== 'base' && type !== 'border'){
                    throw new Error(`'base' and 'border' tiles are allowed on the base layer (got '${type}' instead)`)
                }

                flattened[i] = {
                    id: tileId++,
                    col: i % width,
                    row: Math.floor(i / width),
                    type: type,
                    neighbors: {}
                }
            }
        });

        layers.gates.tiles.forEach((tile, i ) => {
            if(tile !== undefined){
                let obj = flattened[i];
                if(obj === undefined || obj.type !== 'base'){
                    throw new Error(`Tile ${i} must be over the base layer`);
                }

                let type = tile.properties.type;
                if(type !== 'gate'){
                    throw new Error(`Tile on layer 'gates' must have type 'gate', got ${type} instead`)
                }

                obj.type = type;
                obj.properties = {
                    allow: tile.properties.color
                }
            }
        });

        let startCounter = 1;
        let finishCounter = 1;
        layers.triggers.tiles.forEach((tile, i) => {
            if(tile !== undefined){
                let obj = flattened[i];
                if(obj === undefined){
                    throw new Error(`Tile ${i} must be over the base layer`)
                }

                let type = tile.properties.type;
                if(type === 'start'){
                    if(startCounter === 0){
                        throw new Error('There must be exactly 1 start tile on the triggers layer')
                    }

                    obj.type = type;
                    delete obj.properties;
                    startCounter--;
                }

                if(type === 'finish'){
                    if(finishCounter === 0){
                        throw new Error('There must be exactly 1 finish tile on the triggers layer')
                    }

                    obj.type = type;
                    finishCounter--;
                }

                if(type === 'bonus'){
                    obj.type = type;
                    level.bonus++;
                }
            }
        });

        flattened.forEach((tile, i) => {
            let up = flattened[((tile.row - 1) * width) + tile.col];
            let right = flattened[(tile.row * width) + (tile.col + 1)];
            let down = flattened[((tile.row + 1) * width) + tile.col];
            let left = flattened[(tile.row * width) + (tile.col - 1)];

            if(up !== undefined){
                tile.neighbors.up = up.id;
            }

            if(right !== undefined){
                tile.neighbors.right = right.id;
            }

            if(down !== undefined){
                tile.neighbors.down = down.id;
            }

            if(left !== undefined){
                tile.neighbors.left = left.id;
            }
        });

        return flattened.filter(obj => obj !== undefined);
    }

    return through2.obj(
        function(file, encoding, callback){
            tmxParser.parse(file.contents.toString(), './resources/tiled/tileset.tsx', (err, map) => {
                if(err){
                    throw err;
                }

                let name = path.parse(file.path).name;
                let data = serialize(map);
                data.name = name;

                levels.push({name: name, data:data});

                callback();
            });
        },
        function(callback){
            this.push(new File({
                path: outFile,
                contents: new Buffer(JSON.stringify(levels))
            }));
            callback();
        }
    )
}

gulp.task('build-tmx', () => {
    return gulp.src('./src/levels/*.tmx')
        .pipe(tmxParserPlugin('levels.json'))
        .pipe(gulp.dest('./dist/assets/'))
});

gulp.task('watch-tmx', () => {
    return gulp.watch('./src/levels/*.tmx', () => {
        return gulp.src('./src/levels/*.tmx')
            .pipe(tmxParserPlugin('levels.json'))
            .pipe(gulp.dest('./dist/assets/'))
    });
});


// main tasks ------------------------------------------------------------------
gulp.task('default', ['build-html', 'build-sass', 'build-ts', 'build-tmx']);
gulp.task('watch', ['watch-html', 'watch-sass', 'watch-ts', 'watch-txm'], () => {
    browserSync.init({
        server: {
            baseDir: './dist'
        },
        open: false,
        notify: false
    });
});
