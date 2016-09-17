'use strict';

const browserify = require('browserify');
const browserSync = require('browser-sync').create();
const errorify = require('errorify');
const File = require('vinyl');
const fs = require('fs');
const gulp = require('gulp');
const marked = require('marked');
const metascript = require('gulp-metascript');
const path = require('path');
const preprocess = require('gulp-preprocess');
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
    return gulp.src('./src/html/index.html')
        .pipe(preprocess({
            context: {readme: marked(fs.readFileSync('README.md', 'utf8'))}
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('watch-html', ['build-html'], () => {
    return gulp.watch('./src/html/index.html', () => {
        return gulp.src('./src/html/index.html')
            .pipe(preprocess({
                context: {readme: marked(fs.readFileSync('README.md', 'utf8'))}
            }))
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
    return gulp.watch('./src/sass/*.scss', () => {
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
            steps: parseInt(data.properties.steps),
            background: data.properties.background,
            startTile: null,
            finishTile: null,
            tileWidth: data.tileWidth,
            tileHeight: data.tileHeight,
            tiles: [],
            objects: []
        };

        /** Merging tile layers --------------------------------------------- */
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
                    throw new Error(`'base' and 'border' tiles are allowed on the base layer (got '${type}' instead)`);
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
                    throw new Error(`Tile on layer 'gates' must have type 'gate', got ${type} instead`);
                }

                obj.type = type;
                obj.properties = {
                    face: tile.properties.color
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
                        throw new Error('There must be exactly 1 start tile on the triggers layer');
                    }

                    obj.type = type;
                    level.startTile = obj.id;
                    obj.properties = {
                        face: 'yellow'
                    };
                    startCounter--;
                }

                if(type === 'finish'){
                    if(finishCounter === 0){
                        throw new Error('There must be exactly 1 finish tile on the triggers layer');
                    }

                    obj.type = type;
                    level.finishTile = obj.id;
                    finishCounter--;
                }

                if(type === 'bonus'){
                    obj.type = type;
                    level.bonus++;
                }
            }
        });

        for(let i=0; i<flattened.length; i++){
            let tile = flattened[i];

            if(tile !== undefined){
                let front = flattened[((tile.row - 1) * width) + tile.col];
                let right = flattened[(tile.row * width) + (tile.col + 1)];
                let back = flattened[((tile.row + 1) * width) + tile.col];
                let left = flattened[(tile.row * width) + (tile.col - 1)];

                if(front !== undefined){
                    tile.neighbors.front = front.id;
                }

                if(right !== undefined){
                    tile.neighbors.right = right.id;
                }

                if(back !== undefined){
                    tile.neighbors.back = back.id;
                }

                if(left !== undefined){
                    tile.neighbors.left = left.id;
                }
            }
            else {
                let col = i % width;
                let row = Math.floor(i / width);
                
                let front = flattened[((row - 1) * width) + col];
                let right = flattened[(row * width) + (col + 1)];
                let back = flattened[((row + 1) * width) + col];
                let left = flattened[(row * width) + (col - 1)];

                let border = {
                    id: tileId++,
                    col: col,
                    row: row,
                    type: 'border',
                    neighbors: {}
                };

                if(front !== undefined && front.type !== 'border'){
                    border.neighbors.front = front.id;
                    front.neighbors.back = border.id;
                    flattened[i] = border;
                }
                if(right !== undefined && right.type !== 'border'){
                    border.neighbors.right = right.id;
                    right.neighbors.left = border.id;
                    flattened[i] = border;
                }
                if(back !== undefined && back.type !== 'border'){
                    border.neighbors.back = back.id;
                    back.neighbors.front = border.id;
                    flattened[i] = border;
                }
                if(left !== undefined && left.type !== 'border'){
                    border.neighbors.left = left.id;
                    left.neighbors.right = border.id;
                    flattened[i] = border;
                }
            }
        }

        level.tiles = flattened.filter(obj => obj !== undefined);

        /** Collecting objects ---------------------------------------------- */
        let objectId = 0;
        layers.objects.objects.forEach(model => {
            level.objects.push({
                id: objectId++,
                col: Math.floor(model.x / data.tileWidth),
                row: Math.floor(model.y / data.tileHeight),
                name: model.name
            });
        });

        return level
    }

    return through2.obj(
        function(file, encoding, callback){
            util.log('Parsing', file.path);

            tmxParser.parse(file.contents.toString(), './resources/tiled/tileset.tsx', (err, map) => {
                if(err){
                    throw err;
                }

                let name = path.parse(file.path).name;
                let level = serialize(map);
                level.name = name;
                levels.push(level);

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

gulp.task('watch-tmx', ['build-tmx'], () => {
    return gulp.watch('./src/levels/*.tmx', () => {
        return gulp.src('./src/levels/*.tmx')
            .pipe(tmxParserPlugin('levels.json'))
            .pipe(gulp.dest('./dist/assets/'))
    }).on('change', browserSync.reload);
});

// objects ---------------------------------------------------------------------
function objectCollector(outFile){
    let objects = [];

    return through2.obj(
        function(file, encoding, callback){
            util.log('Parsing', file.path);
            let json = JSON.parse(file.contents);
            json["name"] = path.parse(file.path).name;
            objects.push(json);
            callback();
        },
        function(callback){
            this.push(new File({
                path: outFile,
                contents: new Buffer(JSON.stringify(objects))
            }));
            callback();
        }
    );
}

gulp.task('build-objects', () => {
    return gulp.src('./src/objects/*.json')
        .pipe(objectCollector('objects.json'))
        .pipe(gulp.dest('./dist/assets/'));
});

gulp.task('watch-objects', ['build-objects'], () => {
    return gulp.watch('./src/objects/*.json', () => {
        return gulp.src('./src/objects/*.json')
            .pipe(objectCollector('./dist/assets/objects.json'))
    }).on('change', browserSync.reload);
});

// static ----------------------------------------------------------------------
gulp.task('copy-static', () => {
    gulp.src('./src/fonts/**/*').pipe(gulp.dest('./dist/assets/fonts/'));
    gulp.src('./src/images/*').pipe(gulp.dest('./dist/assets/images/'));
    gulp.src('./file_id.diz').pipe(gulp.dest('./dist/'));
});


// main tasks ------------------------------------------------------------------
gulp.task('default', ['copy-static', 'build-html', 'build-sass', 'build-ts', 'build-tmx', 'build-objects']);
gulp.task('watch', ['copy-static', 'watch-html', 'watch-sass', 'watch-ts', 'watch-tmx', 'watch-objects'], () => {
    browserSync.init({
        server: {
            baseDir: './dist'
        },
        open: false,
        notify: false
    });
});
