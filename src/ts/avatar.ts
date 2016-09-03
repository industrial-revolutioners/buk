/**
 * avatar.ts
 *
 * The avatar object represents the player on the level
 *
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import {Start, BaseTile} from './tiles';
import {avatarAnimations} from './animations';
import {AbsoluteDirection} from "./camera";


export enum AvatarFaces {
    WHITE, YELLOW, RED, ORANGE, GREEN, BLUE
}

export const stringToAvatarFace = {
    'white': AvatarFaces.WHITE,
    'yellow': AvatarFaces.YELLOW,
    'red': AvatarFaces.RED,
    'orange': AvatarFaces.ORANGE,
    'green': AvatarFaces.GREEN,
    'blue': AvatarFaces.BLUE
};

interface Faces {
    top: AvatarFaces,
    bottom: AvatarFaces,
    left: AvatarFaces,
    right: AvatarFaces,
    front: AvatarFaces,
    back: AvatarFaces
}


export interface AvatarState {
    face: AvatarFaces;
    accept: (target: BaseTile) => void;
    kill: (target: BaseTile) => void;
    finish: (target: BaseTile) => void;
    checkpoint: (target: BaseTile) => void;
}


export class Avatar {
    private tile: BaseTile;
    private faces: Faces;

    constructor(startTile: Start){
        if(!(startTile instanceof Start)){
            throw new Error(`Expected Start, got ${startTile.constructor.name} instead.`);
        }

        this.faces = <Faces>{
            top: AvatarFaces.WHITE, bottom: AvatarFaces.YELLOW,
            left: AvatarFaces.GREEN, right: AvatarFaces.BLUE,
            front: AvatarFaces.RED, back: AvatarFaces.ORANGE
        };

        this.setTile(startTile);

        console.log(this);
    }

    delegateState(d: AbsoluteDirection){
        let faces = Object.assign({}, this.faces);

        let temp = faces.top;
        switch(d){
            case AbsoluteDirection.NORTH:
                faces.top = faces.front;
                faces.front = faces.bottom;
                faces.bottom = faces.back;
                faces.back = temp;
                break;

            case AbsoluteDirection.EAST:
                faces.top = faces.left;
                faces.left = faces.bottom;
                faces.bottom = faces.right;
                faces.right = temp;
                break;

            case AbsoluteDirection.SOUTH:
                faces.top = faces.back;
                faces.back = faces.bottom;
                faces.bottom = faces.front;
                faces.front = temp;
                break;

            case AbsoluteDirection.WEST:
                faces.top = faces.right;
                faces.right = faces.bottom;
                faces.bottom = faces.left;
                faces.left = temp;
                break;
        }

        /** TODO: Delegate more events */
        return <AvatarState>{
            face: faces.bottom,
            accept: target => {
                avatarAnimations.move(d);
                this.faces = faces;
                this.setTile(target);
                //? if(DEBUG){
                console.log(this);
                //? }
            },
            kill: target => {
                console.warn('Died');
            },
            finish: target => {
                console.warn('Finished');
            }
        }
    }

    move(d: AbsoluteDirection){
        let stateDelegate = this.delegateState(d);
        let target: BaseTile;

        switch(d){
            case AbsoluteDirection.NORTH:
                target = <BaseTile>this.tile.front;
                break;

            case AbsoluteDirection.EAST:
                target = <BaseTile>this.tile.right;
                break;

            case AbsoluteDirection.SOUTH:
                target = <BaseTile>this.tile.back;
                break;

            case AbsoluteDirection.WEST:
                target = <BaseTile>this.tile.left;
                break;

            default:
                throw new Error(`Unhandled direction ${d}`);
        }

        target.action(stateDelegate);
    }

    setTile(tile: BaseTile){
        this.tile = tile;
    }
}
