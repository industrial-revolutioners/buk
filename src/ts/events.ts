/**
 * Contains all the delegated events used by the game.
 * 
 * @author Caiwan
 * @author Slapec
 */

import {
    events, input, ControlEvent,
    CameraDirectionEvent, CameraAttributeEvent,
    cameraDirections, cameraAttributes, controlDirections} from './input';

import {} from './animations';

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
    if (lock) {
        if (DEBUG)
            console.info("locked");
        return;
    }

    // lock = true;

    console.log('avatar.MOVE', e);
    canvasWrapper.dataset['name'] = `avatar.MOVE; direction=${controlDirections[e.direction]}`;
});

input.on(events.camera.ROTATE, (e: CameraDirectionEvent) => {
    console.log('camera.ROTATE', e);
    canvasWrapper.dataset['name'] = `camera.ROTATE; direction=${cameraDirections[e.direction]}`;
});

let zoomTest = document.getElementById('zoom-test');
input.on(events.camera.ZOOM, (e: CameraAttributeEvent) => {
    console.log('camera.ZOOM', e);
    canvasWrapper.dataset['name'] = `camera.ZOOM; attribute=${cameraAttributes[e.attribute]}, value=${e.value}`;
    zoomTest.style.zoom = (parseFloat(zoomTest.style.zoom) || 0) + e.value;
});
