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
    front?: number,
    right?: number,
    back?: number,
    left?: number
}


interface LevelJsonTileProperties {
    face?: AvatarFaces
}


export interface LevelJsonTile {
    id: number,
    col: number,
    row: number,
    type: string,
    neighbors: LevelJsonNeighbors
    properties?: LevelJsonTileProperties
}


interface LevelJsonModel {
    id: number,
    col: number,
    row: number,
    name: string
}


interface LevelJson {
    width: number,
    height: number,
    bonus: number,
    startTile: number,
    finishTile: number,
    tileWidth: number,
    tileHeight: number
    tiles: LevelJsonTile[]
    models: LevelJsonModel[],
    name: string
}


interface LevelDescription {
    name: string
}


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
    bonus: number;
    nextLevel: Level;
    previousLevel: Level;

    constructor(level: LevelJson){
        this.name = level.name;
        this.width = level.width;
        this.height = level.height;
        this.tileWidth = level.tileWidth;
        this.tileHeight = level.tileHeight;
        this.bonus = level.bonus;

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

        this.reset();
    }

    reset(): void {
        this.tileList.forEach(tile => {
            tile.reset();
        });
    }

    getDescription(): LevelDescription {
        return <LevelDescription>{
            name: this.name
        };
    }
}


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

    getLevelDescriptions(): LevelDescription[]{
        let descriptions: LevelDescription[] = [];

        this.levels.forEach(level => {
            descriptions.push(level.getDescription());
        });

        return descriptions;
    }
}


class LevelLoader {
    load(path: string=paths.levels){
        // TODO: Proper network handling
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
}


export const levelLoader = new LevelLoader();
