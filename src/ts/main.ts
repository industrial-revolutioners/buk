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
import * as SETTINGS from './settings';
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
        ui.loadLog(`Loading level #${name}`);
        ui.showUi(false);
        ui.showLoading(true);
        setTimeout(() => {
            game.loadLevel(levels.getLevelByName(name));
        }, SETTINGS.loadDelay);
    });

    ui.on(UI.UIEvents.RESET_SETTINGS, () => {
        game.resetSettings();
    });

    game.on(Game.GameEvents.level.loaded, (level: Levels.Level) => {
        ui.showLoading(false);
        ui.bonusCounter(0, level.bonus);
        ui.stepCounter(0, level.steps);
        ui.showGameUi(true);
    });

    game.on(Game.GameEvents.storage.clear, () => {
        window.location.reload();
    });

    game.on(Game.GameEvents.level.bonus, (current: number, total: number) => {
        ui.bonusCounter(current, total)
    });

    game.on(Game.GameEvents.level.step, (current: number, total: number) => {
        ui.stepCounter(current, total);
    });

    ui.showLoading(false);
    ui.showUi(true);
}