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

import './events';
import './renderer';
import { Avatar } from './avatar';
import { avatarAnimations } from './animations';
import { events, input, ControlEvent, controlDirections } from './input';
import { StartTile, Tile } from './tiles';


let start = new StartTile();
start.front = new Tile();
start.front.back = start;
start.left = new Tile();
start.left.right = start;

let avatar = new Avatar(start);

input.on(events.avatar.MOVE, (e: ControlEvent) => {
    if(!avatarAnimations.isAnimationRunning()){
        avatar.move(e);
    }
});
