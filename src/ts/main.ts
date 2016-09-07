/**
 * main.ts
 *
 * buk - a cube rolling puzzle
 *
 * @author Caiwan
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import * as Game from './game';
import * as Levels from './levels';
import * as Objects from './objects';
import * as UI from './ui';

//? if(DEBUG){
console.time('UI.bootstrap');
//? }

UI.bootstrap().then(ui => {
    //? if(DEBUG) {
    console.timeEnd('UI.bootstrap');

    console.time('Levels.loadLevels');
    //? }

    ui.loadLog('Initialized the interface');

    let loadLevelsPromise = Levels.loadLevels();
    loadLevelsPromise.then(() => {
        //? if(DEBUG){
        console.timeEnd('Levels.loadLevels');
        //? }

        ui.loadLog('Fetched levels')
    });

    let loadObjectsPromise = Objects.loadObjects();
    loadObjectsPromise.then(() => {
        //? if(DEBUG){
        console.timeEnd('Objects.loadObjects');
        //? }

        ui.loadLog('Fetched objects');
    });

    Promise.all([loadLevelsPromise, loadObjectsPromise]).then((values: any[]) => {
        main(ui, values[0], values[1])
    });
});


function main(ui: UI.UserInterface, levels: Levels.LevelContainer, objects: Objects.ObjectContainer){
    let scene = new Objects.Scene(objects);
    let game = new Game.Game(levels, scene);

    ui.showLoading(false);

    game.loadLevel(levels.getFirstLevel());

    // ui.showUi(true);
}