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


declare global {
    interface HTMLElement {
        mozRequestFullScreen?(): void;
        msRequestFullscreen?(): void;
    }

    interface Document {
        mozFullScreenElement?: HTMLElement;
        msFullscreenElement?: HTMLElement;
        onmozfullscreenchange?(): void;
        onmsfullscreenchange?(): void;
    }
}


export class UserInterface extends EventEmitter {
    classes = {
        hidden: 'hidden'
    };

    elements = {
        html: document.documentElement,
        loading: dom.byId('loading'),
        uiLayer: dom.byId('ui-layer'),
        loadLog: dom.byId('loading-log')
    };

    screens = {
        levels: dom.byId('levels')
    };
    
    buttons = {
        goFullscreen: dom.byId('go-fullscreen')
    };

    toggles = {
        goFullscreen: <HTMLInputElement>dom.byId('go-fullscreen-area-toggle')
    };

    constructor(){
        super();

        this.registerElementHandlers();
        this.registerButtonHandlers();

        this.showGoFullscreenArea();
    };

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

    loadLevelDescriptions(descriptions: LevelDescription[]){
        let levels = this.screens.levels;

        levels.innerHTML = '';

        descriptions.forEach(level =>{
            let card = document.createElement('div');
            card.className = 'level-card';

            let finished = document.createElement('span');
            finished.className = 'star-finished fa';
            level.finished ? finished.classList.add('fa-star') : finished.classList.add('fa-star-o');
            card.appendChild(finished);

            let bonus = document.createElement('span');
            bonus.className = 'star-bonus fa';
            level.bonus ? bonus.classList.add('fa-star') : bonus.classList.add('fa-star-o');
            card.appendChild(bonus);

            let steps = document.createElement('span');
            steps.className = 'star-steps fa';
            level.steps ? steps.classList.add('fa-star') : steps.classList.add('fa-star-o');
            card.appendChild(steps);

            let name = document.createElement('span');
            name.className = 'level-name';
            name.innerText = level.name;
            card.appendChild(name);

            levels.appendChild(card);
        });
    }
}

export function bootstrap(): Promise<UserInterface>{
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(new UserInterface());
        });
    });
}
