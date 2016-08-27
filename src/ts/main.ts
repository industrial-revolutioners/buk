/**
 * main.ts
 *
 * buk - a cube rolling puzzle
 *
 * @author Caiwan
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import * as TWEEN from 'tween.js';

import './renderer';
import { Avatar } from './avatar';
import { cameraModel } from './camera';
import { avatarAnimations, cameraAnimations } from './animations';

import { events, input, ControlEvent, controlDirections,
    CameraDirectionEvent, CameraAttributeEvent,
    cameraDirections, cameraAttributes
} from './input';

import { StartTile, Tile } from './tiles';


let start = new StartTile();
start.front = new Tile();
start.front.back = start;
start.left = new Tile();
start.left.right = start;

let avatar = new Avatar(start);

input.on(events.avatar.MOVE, (e: ControlEvent) => {
    if (!avatarAnimations.isAnimationRunning()) {
        avatar.move(e);
    }
});

input.on(events.camera.ROTATE, (e: CameraDirectionEvent) => {
    //? if(DEBUG){
    console.log(`camera.ROTATE; direction=${cameraDirections[e.direction]}`);
    //? }
    if (!cameraAnimations.isAnimationRunning()) {
        cameraModel.rotate(e.direction);
        cameraAnimations.rotate(e.direction);
    }

});

input.on(events.camera.ZOOM, (e: CameraAttributeEvent) => {
    //? if(DEBUG){
    console.log(`camera.ZOOM; attribute=${cameraAttributes[e.attribute]}, value=${e.value}`);
    //? }
});
