/**
 * animations.ts
 *
 * Contains all the animation tasks that being invoked by the event dispatchers
 *
 * @author Caiwan
 * 
 */

/// <reference path="../../typings/index.d.ts" />
import {EventEmitter} from "events";

import * as THREE from 'three';
import * as TWEEN from 'tween.js';

import * as SETTINGS from './settings';

import {
    cameraDirections, cameraAttributes, controlDirections, cameraZoomDirection
} from './input';
import { concurrence } from './utils'
import { avatarModel, AvatarModel} from './objects';
import { cameraModel, CameraModel } from './camera';


export const ANIMATION_START_EVT_NAME = "animation.start";

class AnimationEvent extends EventEmitter {
    constructor() {
        super();
    }

    emitAnimationStart() {
        this.emit(ANIMATION_START_EVT_NAME);
    }
}

export let animationEvent = new AnimationEvent();

interface Direction {
    x: number;
    z: number;
}

/** Common stuff and interface for all kind of animations */
class AnimationBase {
    constructor() {
        this.lock = new concurrence.Lock();
    }

    protected lock: concurrence.Lock;

    /** @return True if any animations are running */
    isAnimationRunning(): boolean {
        return this.lock.isLocked();
    }
}

/** Animation clips for the avatar */
class AvatarAnimations extends AnimationBase {

    private avatarModel: AvatarModel;
    private node: THREE.Object3D;

    constructor(avatarModel_: AvatarModel) {
        super();
        this.avatarModel = avatarModel_;
        this.node = avatarModel_.avatar;
    }

    /** Moves the avatar node towards the given direction */
    move(dir: controlDirections): void {
        // the floor under the cube is the {X, Z} plane. 
        let moveDir: Direction;
        let rotateEdge: Direction;
        let invRotEdge: boolean;
        switch (dir) {
            case controlDirections.FRONT:
                moveDir = this.getForwardDirection(false);
                invRotEdge = false;
                break;

            case controlDirections.BACK:
                moveDir = this.getForwardDirection(true);
                invRotEdge = false;
                break;

            case controlDirections.LEFT:
                moveDir = this.getRightDirection(true);
                invRotEdge = true;
                break;

            case controlDirections.RIGHT:
                moveDir = this.getRightDirection(false);
                invRotEdge = true;
                break;

            default:
                throw "invalid enum" + dir;
        }

        // rotate edge is the opposite one of the moving direction
        rotateEdge = {
            x: invRotEdge ? -moveDir.z : moveDir.z,
            z: invRotEdge ? -moveDir.x : moveDir.x
        };

        this.setupTweens(moveDir, rotateEdge);
    }

    /** TODO cleanup */

    /**
     * Get forward direction of the character in relation of the camera position 
     * (back:= -forward)
     * @param {boolean} inv invert to get the oppositye direction
    */
    private getForwardDirection(inv: boolean): { x: number, z: number } {
        let x = 0;  // mock direction
        let z = -1;

        // ...

        return {
            x: inv ? -x : x,
            z: inv ? -z : z
        };
    }

    /**
     * Get right direction of the character in relation of the camera position
     * @param {boolean} inv invert to get the oppositye direction
    */
    private getRightDirection(inv: boolean): { x: number, z: number } {
        let x = 1; // mock direction
        let z = 0;

        // ...

        return {
            x: inv ? -x : x,
            z: inv ? -z : z
        };
    }

    /**
     * Custom tween ease which makes a value "rotated around" a point in a semi-circle
     */
    private semiCircularEase(k: number): number {
        const t = 2 * k - 1;
        return Math.sqrt(1 - t * t);
    }

    /** Common setup method for tweens */
    private masterTween: TWEEN.Tween;
    private setupTweens(mov: Direction, rot: Direction) {
        if (this.lock.isLocked()) {
            //? if(DEBUG){
            console.info("locked");
            //? }
            return;
        }

        let lockPop = () => {
            this.lock.pop();
        }

        const duration = SETTINGS.animationDuration;

        // --- rotation
        this.node.rotation.set(0, 0, 0);
        var t_rotation = new TWEEN.Tween(this.node.rotation)
            .to({ x: rot.x * Math.PI / 2, z: rot.z * Math.PI / 2 }, duration)
            .onComplete(lockPop);

        // --- bump
        this.node.position.set(0, 0, 0);
        var t_elevation = new TWEEN.Tween(this.node.position)
            .to({ y: Math.SQRT2 * .125 }, duration)
            .easing(this.semiCircularEase)
            .onComplete(lockPop);

        // --- move
        var t_move = new TWEEN.Tween(this.node.position)
            .to({ x: mov.x, z: mov.z }, duration)
            .onComplete(lockPop);

        // move back, tmep
        var t_move2 = new TWEEN.Tween(this.node.position)
            .to({ x: 0, z: 0 }, duration)
            .onComplete(lockPop);

        // --- start

        this.lock.push();
        t_elevation.start();

        this.lock.push();
        this.lock.push();
        t_move.chain(t_move2).start();

        this.lock.push();
        t_rotation.start();

        animationEvent.emitAnimationStart();
    }
}

/** Animation for the camera */
class CameraAnimations extends AnimationBase {

    private camera: THREE.Camera;
    private cameraModel: CameraModel;

    // private t: { t: number } = { t: 0 };

    constructor(cameraModel: CameraModel) {
        super();
        this.cameraModel = cameraModel;
        this.camera = cameraModel.camera;
    }

    rotate(d: cameraDirections): void {

        if (this.lock.isLocked()) {
            //? if(DEBUG){
            console.info("locked");
            //? }
            return;
        }

        let angle = cameraModel.getAngle();
        angle.to = angle.from + ((d == cameraDirections.CCW) ? -1 : +1) * Math.PI / 2;

        // this.t.t = angle.from;
        let t = { t: angle.from };

        let camera = this.cameraModel;
        let tween = new TWEEN.Tween(t)
            .to({ t: angle.to }, SETTINGS.animationDuration)
            .onUpdate(function () {
                camera.setViewAngle(this.t);
            })
            .onComplete(() => { this.lock.pop() });

        this.lock.push();
        tween.start();

        animationEvent.emitAnimationStart();
    }

    zoom(direction: cameraZoomDirection): void {
        if (this.lock.isLocked()) {
            //? if(DEBUG){
            console.info("locked");
            //? }
            return;
        }

        const zoom = this.cameraModel.getZoom();
        const zoomTo = zoom + SETTINGS.zoomLevelStep * (direction == cameraZoomDirection.ZOOM_OUT ? 1 : -1);

        if (zoomTo > SETTINGS.zoom.max || zoomTo < SETTINGS.zoom.min) {
            //? if(DEBUG){
            console.info("zoom min or max reached", zoomTo);
            //? }
            return;
        }

        let t = { t: zoom };
        let camera = this.cameraModel;

        let tween = new TWEEN.Tween(t)
            .to({ t: zoomTo }, SETTINGS.animationDuration)
            .onUpdate(function () {
                camera.setZoom(this.t);
            })
            .onComplete(() => { this.lock.pop() });

        this.lock.push();
        tween.start();

        animationEvent.emitAnimationStart();
    }

}

// ----------------------------------------------------------------------------
/** Export beans of the animation objecs */
export const avatarAnimations = new AvatarAnimations(avatarModel);
export const cameraAnimations = new CameraAnimations(cameraModel);

/** Steps all the animations if any
 * @return true if those are running
 */
export function updateAnimations(): boolean {
    TWEEN.update();

    const b = avatarAnimations.isAnimationRunning() ||
        cameraAnimations.isAnimationRunning() ||
        true;

    return b;
}
