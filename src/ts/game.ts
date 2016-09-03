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
import {Level, LevelContainer, levelLoader} from './levels';


class Game extends EventEmitter{
    private avatar: Avatar;
    private levels: LevelContainer;

    constructor(){
        super();

        levelLoader.load()
            .then(levelContainer => {
                console.log(levelContainer);
                this.levels = <LevelContainer>levelContainer;
                this.loadLevel(levelContainer.getFirstLevel());
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

    loadLevel(level: Level){
        //? if(DEBUG){
        console.log(`Loading ${level.name}`);
        //? }
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
