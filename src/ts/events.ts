/**
 * Contains all the delegated events used by the game.
 * 
 * @author Caiwan
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />
import {
    events, input, ControlEvent,
    CameraDirectionEvent, CameraAttributeEvent,
    cameraDirections, cameraAttributes, controlDirections} from './input';

import {avatarAnimations, cameraAnimations} from './animations';

import { canvasWrapper } from './settings';

const DEBUG = true;

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

input.on(events.avatar.MOVE, (e: ControlEvent) => {
    // @if DEBUG
    console.log('avatar.MOVE', e);
    // @endif
    canvasWrapper.dataset['name'] = `avatar.MOVE; direction=${controlDirections[e.direction]}`;

    switch (e.direction) {
        case controlDirections.FRONT:
            avatarAnimations.animateForward();
            break;
        case controlDirections.BACK:
            break;
        case controlDirections.LEFT:
            break;
        case controlDirections.RIGHT:
            break;

        default:
            throw e;
    }
});

input.on(events.camera.ROTATE, (e: CameraDirectionEvent) => {
    // @if DEBUG
    console.log('camera.ROTATE', e);
    // @endif
    canvasWrapper.dataset['name'] = `camera.ROTATE; direction=${cameraDirections[e.direction]}`;
});

let zoomTest = document.getElementById('zoom-test');
input.on(events.camera.ZOOM, (e: CameraAttributeEvent) => {
    // @if DEBUG
    console.log('camera.ZOOM', e);
    // @endif 
    canvasWrapper.dataset['name'] = `camera.ZOOM; attribute=${cameraAttributes[e.attribute]}, value=${e.value}`;
    zoomTest.style.zoom = (parseFloat(zoomTest.style.zoom) || 0) + e.value;
});
