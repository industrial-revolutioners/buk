/**
 * Contains all the delegated events used by the game.
 * 
 * - Movement in relative to the wiewport: `player.move.front`, `back`, `left`, `right`. 
 * - Rotation of the camera: `camera.rotate.cw`, `ccw`
 * - Camera zoom: `camera.zoom` - direction is given in parameter
 * 
 * @author Caiwan 
 */

import * as THREE from 'three';
import * as TWEEN from 'tween.js';

import { EventEmitter } from 'events';

import { cube } from './objects';

const DEBUG = true;

/**
 * Global namespace for defined events
 * In casse of screwup 
 */
export const names = {
    animation: {
        done: "animation.done"
    },
    camera: {
        rotate: {
            cw: "camera.rotate.cw",
            ccw: "camera.rotate.ccw"
        },
        zoom: "camera.zoom"
    },
    player: {
        move: {
            front: "player.move.front",
            back: "player.move.back",
            left: "player.move.left",
            right: "player.move.back"
        }
    }
};

/**
 * ============================================================================
 * Event definitions
 * ============================================================================
 */

/** 
 * mock event 
 */
class InputMock extends EventEmitter {
    constructor() {
        super();
    }

    /** Dumy event */
    sendEvent(): void {
        if (DEBUG)
            console.log("emit");
        this.emit("event.mock", "cica");
    }

}

/** 
 * Player events 
 */
class PlayerEvents extends EventEmitter {
    constructor() {
        super();
    }

    moveFront(): void {
        this.emit(names.player.move.front);
    }

    moveBack(): void {
        this.emit(names.player.move.back);
    }

    moveLeft(): void {
        this.emit(names.player.move.left);
    }

    moveRight(): void {
        this.emit(names.player.move.right);
    }
}

/**
 * Camera events 
 */
class CameraEvents extends EventEmitter {
    constructor() {
        super();
    }

    rotateCw() {
        this.emit(names.camera.rotate.cw);
    }

    rotateCcw() {
        this.emit(names.camera.rotate.ccw);
    }

    /**
     * @param {number} d direction/difference of the zoom (positive: zoom in, negative: zoom out)
     */
    zoom(d: number) {
        this.emit(names.camera.zoom, d);
    }
}

/** 
 * Animation events
 */
class AnimationEvents extends EventEmitter {
    constructor() {
        super();
    }

    /**
     * @parameter eventID name of the event which had ended
     */
    animationDone(eventID: string): void {
        this.emit(names.animation.done, eventID);
    }
}

/**
 * ============================================================================
 * Event action definitions
 * ============================================================================
 */

// global mutex to toss events while an action is running 
let lock = false;

/**
 * Define mock event actions
 */
export const input = new InputMock();

input.on("event.mock", function (obj: Object) {
    if (lock) {
        console.info("locked");
        return;
    }

    lock = true;

    console.log("event", obj);

    // var coords = { x: 0, y: 0 };
    cube.rotation.x = 0;
    var tween = new TWEEN.Tween(cube.rotation)
        .to({ x: Math.PI / 2 }, 1000)
        .onUpdate(function () {
            if (DEBUG && false)
                console.log(this.x, this.y);
        })
        .onComplete(function () {
            if (DEBUG)
                console.log("vege");
            animationEvents.animationDone("event.mock");
            lock = false;
        })
        .start();

});

/**
 * Define player event actions
 */
export const playerEvents = new PlayerEvents();
let playerLock = false;

/** Move player forward */
playerEvents.on(names.player.move.front, function (): void {
    if (lock) {
        if (DEBUG)
            console.log("event " + names.player.move.front + " locked");
        return;
    }

    lock = true;

    if (DEBUG)
        console.log("event " + names.player.move.front);
});

/** Move player backward */
playerEvents.on(names.player.move.back, function (): void {
    if (lock) {
        if (DEBUG)
            console.log("event " + names.player.move.front + " locked");
        return;
    }

    lock = true;
    if (DEBUG)
        console.log("event " + names.player.move.back);
});

/** Move player left */
playerEvents.on(names.player.move.left, function (): void {
    if (lock) {
        if (DEBUG)
            console.log("event " + names.player.move.left + " locked");
        return;
    }

    lock = true;
    if (DEBUG)
        console.log("event " + names.player.move.left);
});

/** Move player right */
playerEvents.on(names.player.move.right, function (): void {
    if (lock) {
        if (DEBUG)
            console.log("event " + names.player.move.right + " locked");
        return;
    }

    lock = true;

    if (DEBUG)
        console.log("event " + names.player.move.right);
});

/**
 * Define camera event actions
 */
export const cameraEvents = new CameraEvents();

/** Rotate camera clockwise */
cameraEvents.on(names.camera.rotate.cw, function (): void {
    if (lock) {
        if (DEBUG)
            console.log("event " + names.player.move.right + " locked");
        return;
    }

    if (DEBUG)
        console.log("event" + names.camera.rotate.cw);
});

/** Rotate camera counter clockwise */
cameraEvents.on(names.camera.zoom, function (diff: number): void {
    if (lock) {
        if (DEBUG)
            console.log("event " + names.player.move.right + " locked");
        return;
    }

    console.log("event" + names.camera.rotate.cw);
})

/**
 * Define animation event actions - if any
 */
export const animationEvents = new AnimationEvents();

animationEvents.on(names.animation.done, () : void => {
    lock = false;
})