/**
 * ui.ts
 *
 * This module handles the user interactions
 *
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import {EventEmitter} from 'events';

import {dom} from './utils';
import {LevelDescription} from './levels';
import {settingsStorage} from './settings';


declare global {
    interface HTMLElement {
        mozRequestFullScreen?(): void;
        msRequestFullscreen?(): void;
    }

    interface DOMStringMap {
        current: any;
        total: any;
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
    LEAVE_GAME: 'UIEvents.leaveGame'
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
        loadLog: dom.byId('loading-log'),
        stepCounter: dom.byId('step-counter'),
        bonusCounter: dom.byId('bonus-counter')
    };

    screens = {
        levels: dom.byId('levels')
    };
    
    buttons = {
        goFullscreen: dom.byId('go-fullscreen'),
        resetGame: dom.byId('reset-game'),
        saveSettings: dom.byId('save-settings'),
        leaveGame: dom.byId('leave-game')
    };

    inputs = {
        swapRotation: <HTMLInputElement>dom.byId('swap-rotation'),
        antialias: <HTMLInputElement>dom.byId('antialias'),
        ssao: <HTMLInputElement>dom.byId('ssao'),
        shadow: <HTMLInputElement>dom.byId('shadow')
    };

    toggles = {
        goFullscreen: <HTMLInputElement>dom.byId('go-fullscreen-area-toggle')
    };

    private reloadRequired = false;

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
        this.inputs.ssao.checked = settingsStorage.get('ssao');

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

        this.inputs.ssao.onchange = function(){
            settingsStorage.set('ssao', this.checked);
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

    loadLevelDescriptions(descriptions: LevelDescription[]){
        let levels = this.screens.levels;

        levels.innerHTML = '';

        descriptions.forEach(level =>{
            let card = document.createElement('div');
            card.className = 'level-card';

            let finished = document.createElement('span');
            finished.className = 'star-finished fa fa-star';
            card.appendChild(finished);

            let bonus = document.createElement('span');
            bonus.className = 'star-bonus fa fa-star';
            card.appendChild(bonus);

            let steps = document.createElement('span');
            steps.className = 'star-steps fa fa-star';
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

    bonusCounter(current: number, total: number): void {
        let dataset = this.elements.bonusCounter.dataset;

        dataset.current = current;
        dataset.total = total;
    }

    stepCounter(current: number): void {
        let dataset = this.elements.stepCounter.dataset;

        dataset.current = current;
    }
}


export function bootstrap(): Promise<UserInterface>{
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(new UserInterface());
        });
    });
}
