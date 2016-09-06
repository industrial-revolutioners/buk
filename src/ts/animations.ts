/**
 * animations.ts
 *
 * Contains all the animation tasks that being invoked by the event dispatchers
 *
 * @author Caiwan
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import * as THREE from 'three';
import * as TWEEN from 'tween.js';

import * as SETTINGS from './settings';
import {AbsoluteDirection} from "./camera";
import {CameraDirection} from './input';
import {CameraModel} from './camera';
import {concurrence} from './utils'
import {Scene} from './objects';


interface Direction {
    x: number;
    z: number;
}

/** Common stuff and interface for all kind of animations */
class AnimationBase {
    protected scene: Scene;
    protected camera: CameraModel;

    constructor(scene: Scene){
        this.lock = new concurrence.Lock();

        this.scene = scene;
        this.camera = scene.camera;
    }

    protected lock: concurrence.Lock;

    /** @return True if any animations are running */
    isAnimationRunning(): boolean {
        return this.lock.isLocked();
    }
}

/** Animation clips for the avatar */
export class AvatarAnimations extends AnimationBase {
    private node: THREE.Object3D;

    constructor(scene: Scene){
        super(scene);

        this.node = this.scene.avatar;
    }

    /** Moves the avatar node towards the given direction */
    move(d: AbsoluteDirection): void {
        // the floor under the cube is the {X, Z} plane. 
        let moveDir: Direction;
        let rotateEdge: Direction;
        let invRotEdge: boolean;
        switch (d) {
            case AbsoluteDirection.NORTH:
                moveDir = this.getNorthDirection(false);
                invRotEdge = false;
                break;

            case AbsoluteDirection.EAST:
                moveDir = this.getEastDirection(false);
                invRotEdge = true;
                break;

            case AbsoluteDirection.SOUTH:
                moveDir = this.getNorthDirection(true);
                invRotEdge = false;
                break;

            case AbsoluteDirection.WEST:
                moveDir = this.getEastDirection(true);
                invRotEdge = true;
                break;

            default:
                throw new Error(`Unhandled direction ${d}`);
        }

        // rotate edge is the opposite one of the moving direction
        rotateEdge = {
            x: invRotEdge ? -moveDir.z : moveDir.z,
            z: invRotEdge ? -moveDir.x : moveDir.x
        };

        this.setupTweens(moveDir, rotateEdge);
    }

    /**
     * Get forward direction of the character in relation of the camera position 
     * (back:= -forward)
     * @param {boolean} inv invert to get the oppositye direction
    */
    private getNorthDirection(inv: boolean): { x: number, z: number } {
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
    private getEastDirection(inv: boolean): { x: number, z: number } {
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
        };

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

        // TODO kamerat mozgassa magaval
        // TODO fenyeket mozgassa magaval

        this.lock.setCallback(() => {
            /// TODO az avatar gyoker nodejat kell itt majd novelni abba az iranyba amerre mozog
            console.log("megvan")
        });

        // --- start
        this.lock.push();
        t_elevation.start();

        this.lock.push();
        t_move.start();

        this.lock.push();
        t_rotation.start();

        this.scene.startRendering();
    }
}

/** Animation for the camera */
export class CameraAnimations extends AnimationBase {
    constructor(scene: Scene){
        super(scene);
    }

    rotate(d: CameraDirection): void {
        if (this.lock.isLocked()) {
            //? if(DEBUG){
            console.info("locked");
            //? }
            return;
        }
        else {
            this.lock.push();
        }

        let camera = this.camera;

        let angleFrom = camera.getAngle();
        let angleTo = angleFrom + ((d == CameraDirection.CW) ? -1 : +1) * Math.PI / 2;

        new TWEEN.Tween({ angle: angleFrom })
            .to({ angle: angleTo }, SETTINGS.animationDuration)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function () {
                camera.setViewAngle(this.angle);
            })
            .onComplete(() => {
                camera.rotate(d);
                this.lock.pop();
            })
            .start();

        this.scene.startRendering();
    }

    zoom(distanceDelta: number): void {
        let camera = this.camera;

        let zoomTo = camera.getZoom() + distanceDelta;

        if (zoomTo > SETTINGS.zoom.max || zoomTo < SETTINGS.zoom.min) {
            //? if(DEBUG){
            console.info("zoom min or max reached", zoomTo);
            //? }
            return;
        }

        camera.setZoom(zoomTo);
        this.scene.startRendering();
    }
}

/** Export beans of the animation objecs */
export class Animations {
    public avatar: AvatarAnimations;
    public camera: CameraAnimations;

    constructor(scene: Scene) {
        this.avatar = new AvatarAnimations(scene);
        this.camera = new CameraAnimations(scene);
    }

    updateAnimations(): void {
        TWEEN.update();
    }

    isAnimationRunning(): boolean {
        return this.avatar.isAnimationRunning() || this.camera.isAnimationRunning();
    }
}
