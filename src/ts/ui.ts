/**
 * ui.ts
 *
 * This module handles the user interactions
 *
 */


/// <reference path="../../typings/index.d.ts" />

let html = document.documentElement;

const buttons = {
    goFullscreen: document.getElementById('go-fullscreen')
};

class UserInterface {
    constructor(){
        html.onwebkitfullscreenchange = function(){
            console.log(this, arguments);
        }
    }

    static requestFullscreen(): void {
        let requestFullscreen = html.requestFullscreen
            || html.webkitRequestFullscreen
            || html.mozRequestFullscreen
            || html.msRequestFullscreen;

        requestFullscreen.call(html);
    }
}

export let ui = new UserInterface();

buttons.goFullscreen.onclick = function(){
    UserInterface.requestFullscreen();
};
