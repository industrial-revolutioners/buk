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

import {
    cameraDirections, cameraAttributes, controlDirections
} from './input';
import { concurrence } from './utils'
import { cube } from './objects';
import { camera, cameraModel, CameraModel } from './camera';
import * as SETTINGS from './settings';

const ANIM_DURATION = 250;

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

    constructor(node: THREE.Object3D) {
        super();
        this.node = node;
    }

    protected node: THREE.Object3D;

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

        // --- rotation
        this.node.rotation.set(0, 0, 0);
        var t_rotation = new TWEEN.Tween(cube.rotation)
            .to({ x: rot.x * Math.PI / 2, z: rot.z * Math.PI / 2 }, ANIM_DURATION)
            .onComplete(lockPop);

        // --- bump
        this.node.position.set(0, 0, 0);
        var t_elevation = new TWEEN.Tween(this.node.position)
            .to({ y: Math.SQRT2 * .125 }, ANIM_DURATION)
            .easing(this.semiCircularEase)
            .onComplete(lockPop);

        // --- move
        var t_move = new TWEEN.Tween(this.node.position)
            .to({ x: mov.x, z: mov.z }, ANIM_DURATION)
            .onComplete(lockPop);

        // move back, tmep
        var t_move2 = new TWEEN.Tween(this.node.position)
            .to({ x: 0, z: 0 }, ANIM_DURATION)
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

    private t: { t: number } = { t: 0 };

    constructor(camera: THREE.Camera, cameraModel: CameraModel) {
        super();
        this.camera = camera;
        this.cameraModel = cameraModel;
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

        this.t.t = angle.from;
        this.lock.push();

        let camera = this.camera;

        let tween = new TWEEN.Tween(this.t)
            .to({ t: angle.to }, ANIM_DURATION)
            .onUpdate(function () {
                const x = Math.cos(this.t) * SETTINGS.cameraRotationRadius;
                const y = Math.sin(this.t) * SETTINGS.cameraRotationRadius;

                camera.position.x = x;
                camera.position.z = y;
                camera.lookAt(new THREE.Vector3(0, 0, 0));

            })
            .onComplete(
            () => {
                this.lock.pop()
            });
        // .start();

        tween.start();

        animationEvent.emitAnimationStart();
    }

    zoom(direction: number): void {
        if (this.lock.isLocked()) {
            //? if(DEBUG){
            console.info("locked");
            //? }
            return;
        }

        /// TODO WTF, where is the zoom property
        // let zoomlevel = Math.round(1. / this.camera.zoom) + ((direction < 0) ? -1 : +1);
        // TODO clamp min and max level

        // ... 

    }

}

// ----------------------------------------------------------------------------
/** Export beans of the animation objecs */
export const avatarAnimations = new AvatarAnimations(cube);
export const cameraAnimations = new CameraAnimations(camera, cameraModel);

/** Steps all the animations if any
 * @return true if those are running
 */
export function updateAnimations(): boolean {
    TWEEN.update();

    const b = avatarAnimations.isAnimationRunning() ||
        cameraAnimations.isAnimationRunning() ||
        true;

    //? if(DEBUG){
    // if (false && b != (TWEEN.getAll().length > 0)) {
    //     const msg = "Semaphore is not unlocked properly. Lock=" + b + ", TweenQueue=" + (TWEEN.getAll().length > 0);
    //     // console.log(msg);
    //     throw msg;
    // }
    //? }

    return b;
}
