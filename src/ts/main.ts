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
import './events';
import { Avatar } from './avatar';
import { StartTile, Tile } from './tiles';
import { events, input, ControlEvent, controlDirections } from './input';


let start = new StartTile();
start.front = new Tile();
start.front.back = start;
start.left = new Tile();
start.left.right = start;

let avatar = new Avatar(start);

input.on(events.avatar.MOVE, (e: ControlEvent) => {
    //? if(DEBUG){
    console.log(`avatar.MOVE; direction=${controlDirections[e.direction]}`);
    //? }
    avatar.move(e);
});
