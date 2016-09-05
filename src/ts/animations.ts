/**
 * animations.ts
 *
 * Contains all the animation tasks that being invoked by the event dispatchers
 *
 * @author Caiwan
 * 
 */

/// <reference path="../../typings/index.d.ts" />

import * as THREE from 'three';
import * as TWEEN from 'tween.js';

import * as SETTINGS from './settings';
import {avatarModel, AvatarModel} from './objects';
import {CameraDirection} from './input';
import {cameraModel, CameraModel} from './camera';
import {concurrence} from './utils'
import {startRendering} from './renderer';
import {AbsoluteDirection} from "./camera";


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
        // this.avatarModel.avatar = avatarModel_.avatar;
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
        this.avatarModel.avatar.rotation.set(0, 0, 0);
        var t_rotation = new TWEEN.Tween(this.avatarModel.avatar.rotation)
            .to({ x: rot.x * Math.PI / 2, z: rot.z * Math.PI / 2 }, duration)
            .onComplete(lockPop);

        // --- bump
        this.avatarModel.avatar.position.set(0, 0, 0);
        var t_elevation = new TWEEN.Tween(this.avatarModel.avatar.position)
            .to({ y: Math.SQRT2 * .125 }, duration)
            .easing(this.semiCircularEase)
            .onComplete(lockPop);

        // --- move
        var t_move = new TWEEN.Tween(this.avatarModel.avatar.position)
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

        startRendering();
    }
}

/** Animation for the camera */
class CameraAnimations extends AnimationBase {
    private camera: THREE.Camera;
    private cameraModel: CameraModel;

    constructor(cameraModel: CameraModel) {
        super();
        this.cameraModel = cameraModel;
        this.camera = cameraModel.camera;
    }

    rotate(d: CameraDirection): void {
        if(this.lock.isLocked()){
            //? if(DEBUG){
            console.info("locked");
            //? }
            return;
        }
        else {
            this.lock.push();
        }

        let cameraModel = this.cameraModel;

        let angleFrom = cameraModel.getAngle();
        let angleTo = angleFrom + ((d == CameraDirection.CW) ? -1 : +1) * Math.PI / 2;

        new TWEEN.Tween({angle: angleFrom})
            .to({angle: angleTo }, SETTINGS.animationDuration)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function(){
                cameraModel.setViewAngle(this.angle);
            })
            .onComplete(() => {
                cameraModel.rotate(d);
                this.lock.pop();
            })
            .start();

        startRendering();
    }

    zoom(distanceDelta: number): void {
        let cameraModel = this.cameraModel;

        let zoomTo = cameraModel.getZoom() +  distanceDelta;

        if (zoomTo > SETTINGS.zoom.max || zoomTo < SETTINGS.zoom.min) {
            //? if(DEBUG){
            console.info("zoom min or max reached", zoomTo);
            //? }
            return;
        }

        cameraModel.setZoom(zoomTo);
        startRendering();
    }
}

// ----------------------------------------------------------------------------
/** Export beans of the animation objecs */
export const avatarAnimations = new AvatarAnimations(avatarModel);
export const cameraAnimations = new CameraAnimations(cameraModel);

/** Steps all the animations if any
 * @return true if those are running
 */
export function updateAnimations(): void {
    TWEEN.update();
}

export function isAnimationRunning(): boolean{
    return avatarAnimations.isAnimationRunning() || cameraAnimations.isAnimationRunning();
}
