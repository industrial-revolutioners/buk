/**
 * avatar.ts
 *
 * The avatar object represents the player on the level
 *
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import { Start, BaseTile } from './tiles';
import { controlDirections, ControlEvent } from "./input";
import { avatarAnimations } from './animations';


export enum AvatarFaces {
    WHITE, YELLOW, RED, ORANGE, GREEN, BLUE
}

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
    }

    delegateState(e: ControlEvent){
        let faces = Object.assign({}, this.faces);

        let temp = faces.top;
        switch(e.direction){
            case controlDirections.FRONT:
                faces.top = faces.front;
                faces.front = faces.bottom;
                faces.bottom = faces.back;
                faces.back = temp;
                break;
            case controlDirections.BACK:
                faces.top = faces.back;
                faces.back = faces.bottom;
                faces.bottom = faces.front;
                faces.front = temp;
                break;
            case controlDirections.LEFT:
                faces.top = faces.right;
                faces.right = faces.bottom;
                faces.bottom = faces.left;
                faces.left = temp;
                break;
            case controlDirections.RIGHT:
                faces.top = faces.left;
                faces.left = faces.bottom;
                faces.bottom = faces.right;
                faces.right = temp;
                break;
        }

        /** TODO: Delegate more events */
        return <AvatarState>{
            face: faces.bottom,
            accept: (target) => {
                this.faces = faces;
                this.setTile(target);
                avatarAnimations.move(e.direction);
                //? if(DEBUG){
                console.log(this);
                //? }
            }
        }
    }

    move(e: ControlEvent){
        let stateDelegate = this.delegateState(e);
        let target: BaseTile;

        switch(e.direction){
            case controlDirections.FRONT:
                target = <BaseTile>this.tile.front;
                break;
            case controlDirections.BACK:
                target = <BaseTile>this.tile.back;
                break;
            case controlDirections.LEFT:
                target = <BaseTile>this.tile.left;
                break;
            case controlDirections.RIGHT:
                target = <BaseTile>this.tile.right;
                break;
            default:
                throw e;
        }

        //? if(DEBUG){
        try {
            target.action(stateDelegate);
        }
        catch(err){
            console.warn(`Move skipped: no ${controlDirections[e.direction]} neighbor for tile`, this.tile);
        }
        //? } else {
            target.action(stateDelegate);
        //? }
    }

    setTile(tile: BaseTile){
        this.tile = tile;
    }
}
