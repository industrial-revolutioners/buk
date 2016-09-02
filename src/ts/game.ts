/**
 * game.ts
 *
 * This is the game controller
 *
 * @author Slapec
 */

import {EventEmitter} from 'events';
import {avatarAnimations, cameraAnimations} from "./animations";
import {Avatar} from "./avatar";
import {CameraDirectionEvent, CameraAttributeEvent} from "./input";
import {cameraModel} from "./camera";
import {ControlEvent, events, input} from './input';
import {levelLoader} from './levels';


class Game extends EventEmitter{
    protected avatar: Avatar;

    constructor(){
        super();
    }

    init(): void {
        levelLoader.load();
    }

    moveAvatar(e: ControlEvent): void {
        if(!avatarAnimations.isAnimationRunning()){
            let avatar = this.avatar;

            if(!this.avatar){
                throw new Error('No avatar exist')
            }
            else {
                avatar.move(e);
            }
        }
    }

    rotateCamera(e: CameraDirectionEvent): void {
        if(!avatarAnimations.isAnimationRunning()){
            cameraAnimations.rotate(e.direction);
            cameraModel.rotate(e.direction);
        }
    }

    zoomCamera(e: CameraAttributeEvent): void {
        if(!avatarAnimations.isAnimationRunning()){
            cameraAnimations.zoom(e.value);
        }
    }
}


export const game = new Game();

input.on(events.avatar.MOVE, (e: ControlEvent) => {
    game.moveAvatar(e);
});

input.on(events.camera.ROTATE, (e: CameraDirectionEvent) => {
    game.rotateCamera(e);
});

input.on(events.camera.ZOOM, (e: CameraAttributeEvent) => {
    game.zoomCamera(e);
});
