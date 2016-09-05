/**
 * game.ts
 *
 * This is the game controller
 *
 * @author Slapec
 */

import {EventEmitter} from 'events';

import {Avatar} from "./avatar";
import {ControlEvent, CameraDirectionEvent, CameraAttributeEvent, events, input} from './input';
import {Level, LevelContainer} from './levels';
import {Scene, RenderableEvents} from './objects';

export const GameEvents = {
    level: {
        loaded: 'level.loaded'
    }
};

export class Game extends EventEmitter{
    private avatar: Avatar;
    private levels: LevelContainer;
    public scene: Scene;

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

        scene.on(RenderableEvents.SETUP_SIZE, () => {
            input.update();
        })
    }

    loadLevel(level: Level){
        //? if(DEBUG){
        console.log(`Loading ${level.name}`);
        //? }

        this.scene.build(level);

        this.avatar = new Avatar(this, level.startTile);

        this.emit(GameEvents.level.loaded, level);
    }

    moveAvatar(e: ControlEvent): void {
        if(!this.scene.animations.isAnimationRunning()){
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
        if(!this.scene.animations.isAnimationRunning()){
            this.scene.animations.camera.rotate(e.direction);
        }
    }

    zoomCamera(e: CameraAttributeEvent): void {
        this.scene.animations.camera.zoom(e.value);
    }
}
