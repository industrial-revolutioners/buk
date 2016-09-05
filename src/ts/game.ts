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
import {ControlEvent, events, input} from './input';
import {EventEmitter} from 'events';
import {Level, LevelContainer} from './levels';
import {Scene} from './objects';

export enum GameEvents {
    LEVELS_LOADED
}


export class Game extends EventEmitter{
    private avatar: Avatar;
    private levels: LevelContainer;
    private scene: Scene;

    constructor(levels: LevelContainer, scene: Scene){
        super();

        this.levels = levels;
        this.scene = scene;

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

        this.scene.build();

        this.avatar = new Avatar(level.startTile);
    }

    moveAvatar(e: ControlEvent): void {
        if(!avatarAnimations.isAnimationRunning()){
            let avatar = this.avatar;

            if(!this.avatar){
                throw new Error('No avatar exist')
            }
            else {
                avatar.move(this.scene.camera.toAbsoluteDirection(e));
            }
        }
    }

    rotateCamera(e: CameraDirectionEvent): void {
        if(!cameraAnimations.isAnimationRunning()){
            cameraAnimations.rotate(e.direction);

            //? if(DEBUG){
            let compass = document.getElementById('perspective');
            let deg = Number(compass.style.transform.slice(7, -4));

            deg = e.direction === 0 ? deg + 90: deg - 90;
            compass.style.transform = `rotate(${deg}deg)`;
            //? }
        }
    }

    zoomCamera(e: CameraAttributeEvent): void {
        cameraAnimations.zoom(e.value);
    }
}
