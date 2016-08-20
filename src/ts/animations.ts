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

import {
    cameraDirections, cameraAttributes, controlDirections
} from './input';

import { cube } from './objects';

const ANIM_DURATION = 250;

/**
 * Custom tween ease which makes a value "rotated around" a point in a semi-circle
 */

let node = cube;
let lock = false;

/** Animation clips for the avatar */
class AvatarAnimations {

    move(dir: controlDirections): void {
        // the floor under the cube is the {X, Z} plane. 
        let moveDir: { x: number; z: number };
        let rotateEdge: { x: number; z: number };
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

    private semiCircularEase(k: number): number {
        const t = 2 * k - 1;
        return Math.sqrt(1 - t * t);
    }

    /** Common setup method for tweens */
    private setupTweens(mov: { x: number, z: number }, rot: { x: number, z: number }) {
        if (lock) {
            //? if(DEBUG){
            console.info("locked");
            //? }
            return;
        }

        lock = true;

        // --- rotation
        node.rotation.set(0, 0, 0);
        var t_rotation = new TWEEN.Tween(cube.rotation)
            .to({ x: rot.x * Math.PI / 2, z: rot.z * Math.PI / 2 }, ANIM_DURATION)

        // --- bump
        node.position.set(0, 0, 0);
        var t_elevation = new TWEEN.Tween(node.position)
            .to({ y: Math.SQRT2 * .125 }, ANIM_DURATION)
            .easing(this.semiCircularEase);

        // --- move
        var t_move = new TWEEN.Tween(node.position)
            .to({ x: mov.x, z: mov.z }, ANIM_DURATION);

        // move back, tmep
        var t_move2 = new TWEEN.Tween(node.position)
            .to({ x: 0, z: 0 }, ANIM_DURATION);

        // --- start
        t_elevation.start();
        t_move.chain(t_move2).start();
        t_rotation.start()
            .onComplete(function () {
                lock = false;
            });

    }
}

/** Animation for the camera */
class CameraAnimations {
    animateCw(): void { }
    aniumateCcw(): void { }
    zoom(direction: number): void { }
}

// ----------------------------------------------------------------------------
/** Export beans of the animation objecs */
export const avatarAnimations = new AvatarAnimations();
export const cameraAnimations = new CameraAnimations();
