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
import {Storage} from './utils';
import {settingsStorage} from './settings';

export const GameEvents = {
    level: {
        loaded: 'level.loaded',
        bonus: 'level.bonus',
        step: 'level.step'
    },
    storage: {
        clear: 'storage.clear'
    }
};

export class Game extends EventEmitter{
    private avatar: Avatar;
    private levels: LevelContainer;
    private storage = new Storage('game');
    private swapRotation: boolean = settingsStorage.get('swapRotation');
    public scene: Scene;

    private activeLevel: Level;
    private bonus = 0;
    private steps = 0;
    private isActive = false;

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
        this.scene.build(level);

        this.avatar = new Avatar(this, level.startTile);
        this.activeLevel = level;

        this.emit(GameEvents.level.loaded, level);
        this.isActive = true;
    }

    moveAvatar(e: ControlEvent): void {
        if(this.isActive && !this.scene.animations.isAnimationRunning()){
            let avatar = this.avatar;

            if(!this.avatar){
                throw new Error('No avatar exist')
            }
            else {
                this.steps++;
                avatar.move(this.scene.camera.toAbsoluteDirection(e));
                this.emit(GameEvents.level.step, this.steps, this.activeLevel.steps);
            }
        }
    }

    rotateCamera(e: CameraDirectionEvent): void {
        if(this.isActive && !this.scene.animations.isAnimationRunning()){
            if(this.swapRotation){
                e.direction = e.direction === 0 ? 1: 0;
            }

            this.scene.animations.camera.rotate(e.direction);
        }
    }

    zoomCamera(e: CameraAttributeEvent): void {
        if(this.isActive){
            this.scene.animations.camera.zoom(e.value);
        }
    }

    resetSettings(): void {
        settingsStorage.clear();
        this.storage.clear();
        this.emit(GameEvents.storage.clear);
    }

    died(): void {
        setTimeout(() => {
            let level = this.activeLevel;

            level.reset();
            this.avatar = new Avatar(this, level.startTile);
        }, 10000);
    }

    addBonus(): void {
        this.bonus++;

        this.emit(GameEvents.level.bonus, this.bonus, this.activeLevel.bonus);
    }
}
