/**
 * game.ts
 *
 * This is the game controller
 *
 * @author Slapec
 */

import {avatarAnimations, cameraAnimations} from "./animations";
import {Avatar} from "./avatar";
import {CameraDirectionEvent, CameraAttributeEvent} from "./input";
import {cameraModel} from "./camera";
import {ControlEvent, events, input} from './input';


class Game {
    protected avatar: Avatar;



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
            cameraModel.rotate(e.direction);
            cameraAnimations.rotate(e.direction);
        }
    }

    zoomCamera(e: CameraAttributeEvent): void {
        if(!avatarAnimations.isAnimationRunning()){
            console.info('Zoom is not implemented yet');
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
