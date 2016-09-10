/**
 * levelloader.ts
 *
 * This module contains the level loader
 *
 */

import {paths} from './settings';
import {Start, Finish, BaseTile} from './tiles';
import {AvatarFaces} from "./avatar";


interface LevelJsonNeighbors {
    front?: number;
    right?: number;
    back?: number;
    left?: number;
}


interface LevelJsonTileProperties {
    face?: AvatarFaces;
}


export interface LevelJsonTile {
    id: number;
    col: number;
    row: number;
    type: string;
    neighbors: LevelJsonNeighbors;
    properties?: LevelJsonTileProperties;
}


interface LevelJsonObjects {
    id: number;
    col: number;
    row: number;
    name: string;
}


interface LevelJson {
    width: number;
    height: number;
    bonus: number;
    steps: number;
    background: string;
    startTile: number;
    finishTile: number;
    tileWidth: number;
    tileHeight: number;
    tiles: LevelJsonTile[];
    objects: LevelJsonObjects[];
    name: string;
}

/**
 * LevelDescription objects are used by the UI to show the level list
 */
export interface LevelDescription {
    name: string;
    background: string;
    finished: boolean;
    bonus: boolean;
    steps: boolean;
    finishedStar: boolean;
    bonusStar: boolean;
    stepsStar: boolean;
}


// TODO: It's just a plain object
export interface LevelObject {
    id: number;
    col: number;
    row: number;
    name: string;
}


/** A level represents a single object in the levels.json file */
export class Level {
    name: string;
    width: number;
    height: number;
    tileWidth: number;
    tileHeight: number;
    tileList: BaseTile[] = [];

    tileMap: {[id: number]: BaseTile} = {};
    startTile: Start;
    finishTile: Finish;
    nextLevel: Level;
    previousLevel: Level;

    objects: LevelObject[] = [];

    background: string;
    bonus: number;
    steps: number;

    constructor(level: LevelJson){
        this.name = level.name;
        this.width = level.width;
        this.height = level.height;
        this.tileWidth = level.tileWidth;
        this.tileHeight = level.tileHeight;
        this.bonus = level.bonus;
        this.steps = level.steps;
        this.background = level.background;

        level.tiles.forEach(tileJson =>{
            let tile = BaseTile.tileFactory(this, tileJson);

            if(tile.id === level.startTile && tile instanceof Start){
                if(!this.startTile){
                    this.startTile = tile;
                }
                else {
                    throw new Error(`More than 1 start tile on the level: ${this.startTile.id} conflicts ${tile.id}`);
                }
            }
            else if(tile.id === level.finishTile && tile instanceof Finish){
                if(!this.finishTile){
                    this.finishTile = tile;
                }
                else {
                    throw new Error(`More than 1 finish tile on the level: ${this.finishTile.id} conflicts ${tile.id}`);
                }
            }

            this.tileMap[tile.id] = tile;
            this.tileList.push(tile);
        });

        this.tileList.forEach(tile => {
            tile.resolveNeighbors();
        });

        level.objects.forEach(modelJson => {
            this.objects.push(<LevelObject>{
                id: modelJson.id,
                col: modelJson.col,
                row: modelJson.row,
                name: modelJson.name
            });
        });

        this.reset();
    }

    /** This resets the state of the level itself and the state of its tiles too */
    reset(): void {
        this.tileList.forEach(tile => {
            tile.reset();
        });
    }

    /** Returns a light object with the brief description of the level. Used by the UI */
    getDescription(): LevelDescription {
        return <LevelDescription>{
            name: this.name,
            background: this.background
        };
    }
}

/** This class parses the levels.json file. */
export class LevelContainer {
    private levels: Level[] = [];

    constructor(levelsJson: LevelJson[]){
        if(levelsJson.length === 0){
            throw new Error('no levels supplied');
        }

        levelsJson.forEach(level => {
            this.levels.push(new Level(level));
        });

        this.levels.forEach((level, i) => {
            let nextLevel = this.levels[i + 1];
            let previousLevel = this.levels[i - 1];

            level.nextLevel = nextLevel !== undefined ? nextLevel : null;
            level.previousLevel = previousLevel !== undefined ? previousLevel : null;
        });
    }

    /** Reset the state of every level in the container */
    reset(): void {
        this.levels.forEach(level => {
            level.reset();
        })
    }

    getFirstLevel(): Level {
        return this.levels[0];
    }

    getLevelByName(name: string): Level {
        let levels = this.levels;

        for(let i=0; i<levels.length; i++){
            if(levels[i].name === name){
                return levels[i];
            }
        }

        return null;
    }

    /** Returns a list of the brief description of every level in the container */
    getLevelDescriptions(): LevelDescription[]{
        let descriptions: LevelDescription[] = [];

        this.levels.forEach(level => {
            descriptions.push(level.getDescription());
        });

        return descriptions;
    }
}


export function loadLevels(path: string=paths.levels): Promise<LevelContainer> {
    //? if(DEBUG){
    console.time('Levels.loadLevels');
    //? }

    return new Promise((resolve, reject) => {
        fetch(path)
        .then(response => {
            return response.json();
        })
        .then(levelsJson => {
            return resolve(new LevelContainer(levelsJson))
        })
    });
}
