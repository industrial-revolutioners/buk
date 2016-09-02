/**
 * levelloader.ts
 *
 * This module contains the level loader
 *
 */

import {levelsJson} from './settings';

interface LevelJSON {

}


class Level {

}


class LevelContainer {
    constructor(levelJson: LevelJSON){

    }
}


class LevelLoader {
    load(path: string=levelsJson){
        // TODO: Proper network handling
        return new Promise((resolve, reject) => {
            fetch(path)
            .then((response) => {
                resolve(new LevelContainer(response.json()));
            });
        });
    }
}


export const levelLoader = new LevelLoader();
