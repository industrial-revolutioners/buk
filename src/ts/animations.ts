/**
 * animations.ts
 *
 * Contains all the animation tasks that being invoked by the event dispatchers
 *
 * @author Caiwan
 */

/// <reference path="../../typings/index.d.ts" />

import * as THREE from 'three';
import * as TWEEN from 'tween.js';

import { cube } from './objects';


let lock = false;

/** Animation clips for the avatar */
class AvatarAnimations {

    animateForward(): void {

        if (lock) {
            //?if(DEBUG)
            console.info("locked");
            //?
            return;
        }

        lock = true;

        const p0 = { x: 0, y: 0 }; // mock position
        const d = this.getForwardDirection(false);
        const p1 = { x: p0.x + d.x, y: p0.y + d.y }; // next position on the map


        cube.rotation.x = 0;
        var tween = new TWEEN.Tween(cube.rotation)
            .to({ x: Math.PI / 2 }, 1000)
            .onUpdate(function () {
                // @if DEBUG
                    console.log(this.x, this.y);
                // @endif
            })
            .onComplete(function () {
                // @if DEBUG
                    console.log("done");
                // @endif
                // Events.animationEvents.animationDone("event.mock");
                lock = false;
            })
            .start();

        // folykov.
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
     * Get forward direction of the character in relation of the camera position (back:= -forward)
     * @param {boolean} inv invert to get the oppositye direction
    */
    getForwardDirection(inv: boolean): { x: number, y: number } {
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
    getRightDirection(inv: boolean): { x: number, y: number } {
        let x = 1; // mock direction
        let y = 0;

        // ...

        return {
            x: inv ? -x : x,
            y: inv ? -y : y
        };
    }
}

/** Animation for the camera */
class CameraAnimations {
    animateCw(): void { }
    aniumateCcw(): void { }
    zoom(direction: number): void { }
}

/** Export beans of the animation objecs */
export const avatarAnimations = new AvatarAnimations();
export const cameraAnimations = new CameraAnimations();
