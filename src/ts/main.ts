/**
 * main.ts
 *
 * buk - a cube rolling puzzle
 *
 * @author Caiwan
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import './renderer';
import {Avatar, AvatarFaces} from './avatar';
import { avatarAnimations } from './animations';

import { events, input, ControlEvent,
    CameraDirectionEvent, CameraAttributeEvent,
    cameraDirections, cameraAttributes
} from './input';

import { Start, Tile } from './tiles';
import {cameraModel} from "./camera";
import {cameraAnimations} from "../../build/ts/animations";


let start = new Start(AvatarFaces.BLUE);
let front = new Tile();
let right = new Tile();
let back = new Tile();

start.front = front;
front.back = start;
front.right = right;
right.left = front;
right.back = back;
back.front = right;
back.left = start;
start.right = back;

let avatar = new Avatar(start);

input.on(events.avatar.MOVE, (e: ControlEvent) => {
    if (!avatarAnimations.isAnimationRunning()) {
        avatar.move(e);
    }
});

input.on(events.camera.ROTATE, (e: CameraDirectionEvent) => {
    if (!avatarAnimations.isAnimationRunning()){
        cameraModel.rotate(e.direction);
        cameraAnimations.rotate(e.direction);
    }
});

input.on(events.camera.ZOOM, (e: CameraAttributeEvent) => {
    //? if(DEBUG){
    console.log(`camera.ZOOM; attribute=${cameraAttributes[e.attribute]}, value=${e.value}`);
    //? }
});
