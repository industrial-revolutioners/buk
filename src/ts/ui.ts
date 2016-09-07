/**
 * ui.ts
 *
 * This module handles the user interactions
 *
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import {dom} from './utils';


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


export class UserInterface {
    classes = {
        hidden: 'hidden'
    };

    elements = {
        html: document.documentElement,
        loading: dom.byId('loading'),
        uiLayer: dom.byId('ui-layer'),
        loadLog: dom.byId('loading-log')
    };
    
    buttons = {
        goFullscreen: dom.byId('go-fullscreen')
    };

    toggles = {
        goFullscreen: <HTMLInputElement>dom.byId('go-fullscreen-area-toggle')
    };

    constructor(){
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
}

export function bootstrap(): Promise<UserInterface>{
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(new UserInterface());
        });
    });
}
