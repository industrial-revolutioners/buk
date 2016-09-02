/**
 * levelloader.ts
 *
 * This module contains the level loader
 *
 */

import {levelsJson} from './settings';



class LevelLoader {
    load(path: string=levelsJson){
        fetch(path);
    }
}


export const levelLoader = new LevelLoader();
