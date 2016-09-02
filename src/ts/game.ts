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
import {ControlEvent, events, input} from './input';
import {levelLoader} from './levels';


class Game extends EventEmitter{
    protected avatar: Avatar;

    constructor(){
        super();

        levelLoader.load()
            .then((data) => {
            console.log(data);
        });

        input.on(events.avatar.MOVE, (e: ControlEvent) => {
            this.moveAvatar(e);
        });

        input.on(events.camera.ROTATE, (e: CameraDirectionEvent) => {
            this.rotateCamera(e);
        });

        input.on(events.camera.ZOOM, (e: CameraAttributeEvent) => {
            this.zoomCamera(e);
        });
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
        }
    }

    zoomCamera(e: CameraAttributeEvent): void {
        cameraAnimations.zoom(e.value);
    }
}


export const game = new Game();
