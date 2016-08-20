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

import { cube } from './objects';

const ANIM_DURATION = 1000;

/**
 * Custom tween ease which makes a value "rotated around" a point in a semi-circle
 */



let node = cube;
let lock = false;

/** Animation clips for the avatar */
class AvatarAnimations {

    animateForward(): void {
        const p0 = { x: 0, y: 0 }; // mock position
        const d = this.getForwardDirection(false);
        const p1 = { x: p0.x + d.x, y: p0.y + d.y }; // next position on the map

        this.setupTweens();
    }

    animateBack(): void {
        const d = this.getForwardDirection(true);
    }

    animateLeft(): void {
        const d = this.getForwardDirection(false);
    }

    animateRight(): void {
        const d = this.getForwardDirection(true);
    }

    /**
     * Get forward direction of the character in relation of the camera position 
     * (back:= -forward)
     * @param {boolean} inv invert to get the oppositye direction
    */
    private getForwardDirection(inv: boolean): { x: number, y: number } {
        let x = 0;  // mock direction
        let y = 1;

        // ...

        return {
            x: inv ? -x : x,
            y: inv ? -y : y
        };
    }

    /**
     * Get right direction of the character in relation of the camera position
     * @param {boolean} inv invert to get the oppositye direction
    */
    private getRightDirection(inv: boolean): { x: number, y: number } {
        let x = 1; // mock direction
        let y = 0;

        // ...

        return {
            x: inv ? -x : x,
            y: inv ? -y : y
        };
    }

    private semiCircularEase(k: number): number {
        const t = 2 * k - 1;
        return Math.sqrt(1 - t * t);
    }

        /** Common setup method for tweens */
    private setupTweens() {
        if (lock) {
            //? if(DEBUG){
                console.info("locked");
            //? }
            return;
        }

        lock = true;

        node.rotation.x = 0;
        var t_rotation = new TWEEN.Tween(cube.rotation)
            .to({ x: Math.PI / 2 }, ANIM_DURATION)

        node.position.y = 0;
        var t_elevation = new TWEEN.Tween(node.position)
            .to({ y: Math.SQRT2 * .5 }, ANIM_DURATION)
            .easing(this.semiCircularEase);

        node.position.z = 0;
        var t_move = new TWEEN.Tween(node.position)
            .to({ z: 1 }, ANIM_DURATION);
        
        var t_move2 = new TWEEN.Tween(node.position)
            .to({ z: 0 }, ANIM_DURATION);

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
