/**
 * events.ts
 *
 * Contains all the delegated events used by the game.
 * 
 * @author Caiwan
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import {
    events, input, ControlEvent,
    CameraDirectionEvent, CameraAttributeEvent,
    cameraDirections, cameraAttributes, controlDirections
} from './input';

import { avatarAnimations, cameraAnimations } from './animations';


/**
 * ============================================================================
 * Event action definitions
 * ============================================================================
 */

input.on(events.avatar.MOVE, (e: ControlEvent) => {
    // @if DEBUG
    console.log(`avatar.MOVE; direction=${controlDirections[e.direction]}`);
    // @endif

    avatarAnimations.move(e.direction);
});

input.on(events.camera.ROTATE, (e: CameraDirectionEvent) => {
    // @if DEBUG
    console.log(`camera.ROTATE; direction=${cameraDirections[e.direction]}`);
    // @endif
});

input.on(events.camera.ZOOM, (e: CameraAttributeEvent) => {
    // @if DEBUG
    console.log(`camera.ZOOM; attribute=${cameraAttributes[e.attribute]}, value=${e.value}`);
    // @endif
});
