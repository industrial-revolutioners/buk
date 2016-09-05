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

    Promise.all([loadLevelsPromise]).then((values: any[]) => {
        main(ui, values[0])
    });
});


function main(ui: UI.UserInterface, levels: Levels.LevelContainer){
    let game = new Game.Game(levels);

    ui.showLoading(false);

    console.log(ui, levels);
}