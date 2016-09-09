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

    constructor(scene: Scene) {
        this.lock = new concurrence.Lock();
        this.scene = scene;
    }

    protected lock: concurrence.Lock;

    /** @return True if any animations are running */
    isAnimationRunning(): boolean {
        return this.lock.isLocked();
    }
}

/** Animation clips for the avatar */
export class AvatarAnimations extends AnimationBase {
    constructor(scene: Scene) {
        super(scene);
    }

    /** Moves the avatar node towards the given direction */
    setupTweens(d: AbsoluteDirection): TWEEN.Tween[] {
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

        return this.setupMoveTweens(moveDir, rotateEdge);
    }

    move(d: AbsoluteDirection) {
        if (this.lock.isLocked()) {
            //? if(DEBUG){
            console.info("locked");
            //? }
            return;
        }

        let tweens = this.setupTweens(d);
        tweens.forEach((tween: TWEEN.Tween) => {
            this.lock.push();
            tween.start();
        })

        this.scene.startRendering();
    }

    die(d: AbsoluteDirection, callback?: () => void): void {
        if (this.lock.isLocked()) {
            //? if(DEBUG){
            console.info("locked");
            //? }
            return;
        }

        let tweens = this.setupTweens(d);

        const duration = SETTINGS.animationDuration * 2;
        let node = this.scene.avatarAnimation;

        this.lock.setCallback(callback);

        node.position.set(0, 0, 0);
        let die = new TWEEN.Tween(node.position)
            .to({ y: -1 }, duration)
            .easing(TWEEN.Easing.Cubic.Out)
            .onComplete(() => {
                this.lock.pop();
            });

        this.lock.push();
        tweens[0].chain(die);

        tweens.forEach((tween: TWEEN.Tween) => {
            this.lock.push();
            tween.start();
        })

        this.scene.startRendering();
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

    private setupMoveTweens(mov: Direction, rot: Direction): TWEEN.Tween[] {
        let lockPop = () => {
            this.lock.pop();
        };

        const duration = SETTINGS.animationDuration;
        let node = this.scene.avatarAnimation;
        let camera = this.scene.camera;

        // --- rotation
        node.rotation.set(0, 0, 0);
        let t_rotation = new TWEEN.Tween(node.rotation)
            .to({ x: rot.x * Math.PI / 2, z: rot.z * Math.PI / 2 }, duration)
            .onComplete(lockPop);

        // --- bump
        node.position.set(0, 0, 0);
        let t_elevation = new TWEEN.Tween(node.position)
            .to({ y: Math.SQRT2 * .125 }, duration)
            .easing(this.semiCircularEase)
            .onComplete(lockPop);

        // --- move
        let t_move = new TWEEN.Tween(node.position)
            .to({ x: mov.x, z: mov.z }, duration)
            .onUpdate(function () {
                camera.shift(this.x, this.z);
            })
            .onComplete(lockPop);


        this.lock.setCallback(() => {
            node.position.set(0, 0, 0);
            let position = this.scene.avatar.position.clone();

            this.scene.avatar.position.x = position.x + mov.x;
            this.scene.avatar.position.z = position.z + mov.z;

            let rotation = new THREE.Quaternion();
            node.rotation.set(0, 0, 0);

            rotation.setFromEuler(new THREE.Euler(rot.x * Math.PI / 2, 0, rot.z * Math.PI / 2));
            /// TODO: quantize orientation angles if it starts ating funky because of float accuracy.

            this.scene.avatarOrientation.quaternion.premultiply(rotation);

            camera.shift(0, 0);
            camera.setCenter(this.scene.avatar.position.x, this.scene.avatar.position.z);
        });

        return [
            t_rotation,
            t_elevation,
            t_move
        ];

    }


    spawn(x: number, y: number, respawn: boolean): void {
        if (this.lock.isLocked()) {
            //? if(DEBUG){
            console.info("locked");
            //? }
            return;
        }

        let lockPop = () => {
            this.lock.pop();
        };

        const duration = SETTINGS.animationDuration * 4;
        const q = new THREE.Quaternion();
        this.scene.avatarOrientation.quaternion.set(q.x, q.y, q.z, q.w);
        this.scene.avatar.position.set(x, 0, y);

        let node = this.scene.avatarAnimation;
        let camera = this.scene.camera;

        // reset camera position on respawn
        let rollback: TWEEN.Tween;
        let camPos = camera.getCenter();

        if (respawn) {
            rollback = new TWEEN.Tween(camPos)
                .to({ x: x, y: y }, duration)
                .easing(TWEEN.Easing.Cubic.InOut)
                .onUpdate(function () {
                    camera.setCenter(this.x, this.y);
                })
                .onComplete(lockPop);
        } else {
            this.scene.camera.setCenter(x, y);
        }

        // --- fall down
        node.position.set(0, 10, 0);
        let fall = new TWEEN.Tween(node.position)
            .to({ y: 0 }, duration)
            .easing(TWEEN.Easing.Cubic.In)
            .onComplete(lockPop);

        // -- shake camera like shit

        const freq = 0.24;
        let v = { v: 1 };
        let bang = new TWEEN.Tween(v)
            .to({ v: 0 }, duration)
            .easing(TWEEN.Easing.Exponential.Out)
            .onUpdate(function () {
                const h = this.v * Math.sin((new Date).getTime() * freq);
                camera.shake(h);
            })
            .onComplete(lockPop);

        // --- start
        // push for each tweens at once
        this.lock.push();
        this.lock.push();
        if (respawn) {
            this.lock.push();
            rollback.start();
            fall.chain(bang).start();
        } else {
            fall.chain(bang).start();
        }

        this.scene.startRendering();
    }
}

/** Animation for the camera */
export class CameraAnimations extends AnimationBase {
    constructor(scene: Scene) {
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

        let camera = this.scene.camera;

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
        let camera = this.scene.camera;

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
