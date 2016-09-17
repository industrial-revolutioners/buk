/**
 * ui.ts
 *
 * This module handles the user interactions
 *
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import {EventEmitter} from 'events';

import {dom, Storage} from './utils';
import {LevelDescription, Level} from './levels';
import {LevelStats, FinishState} from './game';
import {settingsStorage, palette, canvasWrapper} from './settings';


declare global {
    interface HTMLElement {
        mozRequestFullScreen?(): void;
        msRequestFullscreen?(): void;
    }

    interface DOMStringMap {
        current: any;
        total: any;
        name: any;
    }

    interface Document {
        mozFullScreenElement?: HTMLElement;
        msFullscreenElement?: HTMLElement;
        onmozfullscreenchange?(): void;
        onmsfullscreenchange?(): void;
    }
}

export let UIEvents = {
    LOAD_LEVEL: 'UIEvents.loadLevel',
    RESET_SETTINGS: 'UIEvents.resetSettings',
    LEAVE_GAME: 'UIEvents.leaveGame',
    REPLAY_LEVEL: 'UIEvents.replayLevel'
};


export class UserInterface extends EventEmitter {
    classes = {
        hidden: 'hidden'
    };

    elements = {
        html: document.documentElement,
        loading: dom.byId('loading'),
        uiLayer: dom.byId('ui-layer'),
        gameLayer: dom.byId('game-layer'),
        finishLayer: dom.byId('finish-layer'),
        loadLog: dom.byId('loading-log'),
        stepCounter: dom.byId('step-counter'),
        bonusCounter: dom.byId('bonus-counter'),
        finishedLevel: dom.byId('finished-level'),
        finishSteps: dom.byId('finish-steps'),
        finishBonus: dom.byId('finish-bonus'),
        finishStar: dom.byId('finish-star'),
        bonusStar: dom.byId('bonus-star'),
        stepStar: dom.byId('step-star')
    };

    screens = {
        levels: dom.byId('levels'),
    };
    
    buttons = {
        goFullscreen: dom.byId('go-fullscreen'),
        resetGame: dom.byId('reset-game'),
        saveSettings: dom.byId('save-settings'),
        leaveGame: dom.byId('leave-game'),
        replayGame: dom.byId('replay-game'),
        replay: dom.byId('replay'),
        finishLeave: dom.byId('leave'),
        next: dom.byId('next')
    };

    inputs = {
        swapRotation: <HTMLInputElement>dom.byId('swap-rotation'),
        antialias: <HTMLInputElement>dom.byId('antialias'),
        shadow: <HTMLInputElement>dom.byId('shadow')
    };

    toggles = {
        goFullscreen: <HTMLInputElement>dom.byId('go-fullscreen-area-toggle'),
        levels: <HTMLInputElement>dom.byId('levels-toggle'),
        settings: <HTMLInputElement>dom.byId('settings-toggle'),
        help: <HTMLInputElement>dom.byId('help-toggle'),
        tutorial: <HTMLInputElement>dom.byId('tutorial-toggle')
    };

    private reloadRequired = false;
    private defaultBackground = window.getComputedStyle(document.body).backgroundColor;
    private storage = new Storage('ui');

    constructor(){
        super();

        this.registerElementHandlers();
        this.registerButtonHandlers();
        this.loadSettings();
        this.registerInputHandlers();

        this.showGoFullscreenArea();
    };

    loadSettings(): void {
        this.inputs.swapRotation.checked = settingsStorage.get('swapRotation');
        this.inputs.antialias.checked = settingsStorage.get('antialias');

        let shadow = this.inputs.shadow;
        let shadowEnabled = settingsStorage.get('shadowEnabled');
        let shadowMap = settingsStorage.get('shadowMap');

        if(!shadowEnabled){
            shadow.value = 'off';
        }
        else {
            if(shadowMap >= 2000){
                shadow.value = 'high';
            }
            else {
                shadow.value = 'low';
            }
        }
    }

    registerElementHandlers(): void {
        let showArea = () => {
            this.showGoFullscreenArea();
        };

        document.onwebkitfullscreenchange = showArea;
        document.onmozfullscreenchange = showArea;
        document.onmsfullscreenchange = showArea;
    }

    registerButtonHandlers(): void {
        let buttons = this.buttons;

        buttons.goFullscreen.onclick = () => {
            this.goFullscreen();
        };

        buttons.resetGame.onclick = () => {
            let confirmed = confirm(
                'This will erase levels and game settings.\n\n' +
                'Are you sure you want to reset the game?'
            );

            if(confirmed){
                this.storage.clear();
                this.emit(UIEvents.RESET_SETTINGS);
            }
        };

        buttons.saveSettings.onclick = () => {
            if(this.reloadRequired){
                alert('The game will restart for the new settings to take effect');
                window.location.reload();
            }
        };

        buttons.leaveGame.onclick = () => {
            let confirmed = confirm(
                'Are you sure you want to leave the game?\n' +
                'Your status will be lost.');

            if(confirmed){
                this.emit(UIEvents.LEAVE_GAME);
            }
        };

        buttons.replayGame.onclick = () => {
            let confirmed = confirm('Are you sure you want to retry this level?');

            if(confirmed){
                this.emit(UIEvents.REPLAY_LEVEL);
            }
        }
    }

    registerInputHandlers(): void {
        var self = this;

        this.inputs.swapRotation.onchange = function(){
            settingsStorage.set('swapRotation', this.checked);
            self.reloadRequired = true;
        };

        this.inputs.antialias.onchange = function(){
            settingsStorage.set('antialias', this.checked);
            self.reloadRequired = true;
        };

        this.inputs.shadow.onchange = function(){
            switch(this.value){
                case 'off':
                    settingsStorage.set('shadowEnabled', false);
                    break;
                case 'low':
                    settingsStorage.set('shadowEnabled', true);
                    settingsStorage.set('shadowMap', 1000);
                    break;
                case 'high':
                    settingsStorage.set('shadowEnabled', true);
                    settingsStorage.set('shadowMap', 2000);
                    break;
                default:
                    throw new Error(`Invalid value ${this.value}`);
            }
            self.reloadRequired = true;
        }
    }

    showGoFullscreenArea(): void {
        let goFullscreen = this.toggles.goFullscreen;

        goFullscreen.checked = !this.isInFullscreen();
    }
    
    isInFullscreen(): boolean {
        let fullscreenElement = document.fullscreenElement
            || document.webkitFullscreenElement
            || document.mozFullScreenElement
            || document.msFullscreenElement;

        return !!fullscreenElement;
    }

    goFullscreen(): void {
        let html = this.elements.html;

        let requestFullscreen = html.requestFullscreen
            || html.webkitRequestFullscreen
            || html.mozRequestFullScreen
            || html.msRequestFullscreen;

        requestFullscreen.call(html);
    }

    loadLog(msg: string): void{
        this.elements.loadLog.innerText = msg;
    }

    showLoading(state: boolean): void {
        let className = this.classes.hidden;
        let classList = this.elements.loading.classList;

        if(state){
            classList.remove(className);
        }
        else {
            classList.add(className);
        }
    }

    showUi(state: boolean): void {
        let className = this.classes.hidden;
        let classList = this.elements.uiLayer.classList;

        if(state){
            classList.remove(className);
        }
        else {
            for(let toggle in this.toggles){
                this.toggles[toggle].checked = state;
            }

            classList.add(className);
        }
    }

    showGameUi(state: boolean): void {
        let className = this.classes.hidden;
        let classList = this.elements.gameLayer.classList;

        if(state){
            classList.remove(className);
        }
        else {
            classList.add(className);
        }
    }

    hideFinishUi(): void{
        this.elements.finishLayer.classList.remove('visible');
        this.elements.finishStar.classList.remove('delay-0', 'delay-1', 'delay-2', 'yellow');
        this.elements.bonusStar.classList.remove('delay-0', 'delay-1', 'delay-2', 'yellow');
        this.elements.stepStar.classList.remove('delay-0', 'delay-1', 'delay-2', 'yellow');
    }

    showFinishUi(level: Level, state: FinishState, stats: LevelStats){
        this.elements.finishLayer.classList.add('visible');

        this.buttons.replay.onclick = () => {
            this.emit(UIEvents.LOAD_LEVEL, level.name);
        };

        if(level.nextLevel !== null){
            this.buttons.next.classList.remove('hidden');
            this.buttons.next.onclick = () => {
                this.emit(UIEvents.LOAD_LEVEL, level.nextLevel.name);
            };
        }
        else {
            this.buttons.next.classList.add('hidden');
        }


        this.buttons.finishLeave.onclick = () => {
            this.emit(UIEvents.LEAVE_GAME);
        };

        this.elements.finishBonus.dataset.current = stats.bonus;
        this.elements.finishBonus.dataset.total = level.bonus;
        this.elements.finishSteps.dataset.current = stats.steps;
        this.elements.finishedLevel.dataset.name = level.name;

        let delay = 0;
        if(state.finishedStar){
            this.elements.finishStar.classList.add('delay-' + delay, 'yellow');
            delay++;
        }

        if(state.bonusStar){
            this.elements.bonusStar.classList.add('delay-' + delay, 'yellow');
            delay++;
        }

        if(state.stepsStar){
            this.elements.stepStar.classList.add('delay-' + delay, 'yellow');
        }
    }

    loadLevelDescriptions(descriptions: LevelDescription[]){
        let levels = this.screens.levels;

        levels.innerHTML = '';

        descriptions.forEach(level =>{
            let card = document.createElement('div');
            card.className = 'level-card';
            card.id = 'card_' + level.name;

            let finished = document.createElement('span');
            finished.className = 'star-finished fa fa-star';
            if(level.finishedStar){
                finished.classList.add('yellow');
            }
            card.appendChild(finished);

            let bonus = document.createElement('span');
            bonus.className = 'star-bonus fa fa-star';
            if(level.bonusStar){
                bonus.classList.add('yellow');
            }
            card.appendChild(bonus);

            let steps = document.createElement('span');
            steps.className = 'star-steps fa fa-star';
            if(level.stepsStar){
                steps.classList.add('yellow');
            }
            card.appendChild(steps);

            let name = document.createElement('span');
            name.className = 'level-name';
            name.innerText = level.name;
            card.appendChild(name);

            levels.appendChild(card);

            card.onclick = () => {
                this.emit(UIEvents.LOAD_LEVEL, level.name);
            }
        });
    }

    updateFinishState(name: string, state: FinishState){
        let card = dom.byId('card_' + name);
        let finishedStar = card.querySelector('.star-finished');
        let bonusStar = card.querySelector('.star-bonus');
        let stepsStar = card.querySelector('.star-steps');
        
        state.finishedStar === true ? finishedStar.classList.add('yellow') : finishedStar.classList.remove('yellow');
        state.bonusStar === true ? bonusStar.classList.add('yellow') : bonusStar.classList.remove('yellow');
        state.stepsStar === true ? stepsStar.classList.add('yellow') : stepsStar.classList.remove('yellow');
    }

    bonusCounter(current: number, total: number): void {
        let dataset = this.elements.bonusCounter.dataset;

        dataset.current = current;
        dataset.total = total;
    }

    stepCounter(current: number): void {
        let dataset = this.elements.stepCounter.dataset;

        dataset.current = current;
    }

    setBackground(background: string){
        let activePalette = palette[0];

        if(background !== undefined){
            let color = activePalette[background];
            if(color){
                document.body.style.backgroundColor = '#' + color.toString(16);
            }
            else {
                document.body.style.backgroundColor = this.defaultBackground;
            }
        }
        else {
            document.body.style.backgroundColor = this.defaultBackground;
        }
    }

    focusCanvas(): void {
        canvasWrapper.focus();
    }

    showTutorial(): void {
        let tutorialShown = this.storage.get('tutorialShown', false);
        if(!tutorialShown){
            this.toggles.tutorial.checked = true;
            this.storage.set('tutorialShown', true);
        }
    }
}


export function bootstrap(): Promise<UserInterface>{
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(new UserInterface());
        });
    });
}
