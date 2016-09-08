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

    ui.loadLevelDescriptions(levels.getLevelDescriptions());

    ui.on(UI.UIEvents.LOAD_LEVEL, (name: string) => {
        game.loadLevel(levels.getLevelByName(name));
    });

    ui.on(UI.UIEvents.RESET_SETTINGS, () => {
        game.reset();
    });

    game.on(Game.GameEvents.level.loaded, () => {
        ui.showUi(false);
    });

    game.on(Game.GameEvents.storage.clear, () => {
        window.location.reload();
    });

    ui.showLoading(false);
    ui.showUi(true);
}