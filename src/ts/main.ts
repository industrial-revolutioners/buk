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

    ui.loadLevelDescriptions(game.getLevelDescriptions());

    ui.on(UI.UIEvents.LOAD_LEVEL, (name: string) => {
        scene.exit();
        ui.hideFinishUi();
        ui.showUi(false);
        ui.loadLog(`Loading level #${name}`);
        ui.showLoading(true);
        setTimeout(() => {
            game.loadLevel(levels.getLevelByName(name));
        }, SETTINGS.loadDelay);
    });

    ui.on(UI.UIEvents.REPLAY_LEVEL, () => {
        scene.exit();
        ui.hideFinishUi();
        ui.showUi(false);
        ui.loadLog(`Loading level #${game.activeLevel.name}`);
        ui.showLoading(true);
        setTimeout(() => {
            game.loadLevel(game.activeLevel);
        }, SETTINGS.loadDelay);
    });

    ui.on(UI.UIEvents.RESET_SETTINGS, () => {
        game.resetSettings();
    });

    ui.on(UI.UIEvents.LEAVE_GAME, () => {
        game.leave();
        ui.hideFinishUi();
        ui.showGameUi(false);
        ui.showUi(true);
    });

    game.on(Game.GameEvents.level.loaded, (level: Levels.Level) => {
        ui.setBackground(level.background);
        ui.showLoading(false);
        ui.bonusCounter(game.bonus, level.bonus);
        ui.stepCounter(game.steps);
        ui.showGameUi(true);
        ui.showTutorial();
        ui.focusCanvas();
    });

    game.on(Game.GameEvents.storage.clear, () => {
        window.location.reload();
    });

    game.on(Game.GameEvents.level.finished, (level: Levels.Level, state: Game.FinishState, stats: Game.LevelStats) => {
        ui.showFinishUi(level, state, stats);
        ui.updateFinishState(level.name, game.getFinishState(level.name));
    });

    game.on(Game.GameEvents.level.bonus, (current: number, total: number) => {
        ui.bonusCounter(current, total)
    });

    game.on(Game.GameEvents.level.step, (current: number) => {
        ui.stepCounter(current);
    });

    ui.showLoading(false);
    ui.showUi(true);
}