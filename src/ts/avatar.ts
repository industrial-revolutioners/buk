/**
 * avatar.ts
 *
 * The avatar object represents the player on the level
 *
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import { StartTile, BaseTile } from './tiles';
import { controlDirections, ControlEvent } from "./input";
import { avatarAnimations } from './animations';


enum AvatarFaces {
    TOP, BOTTOM, LEFT, RIGHT, FRONT, BACK
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
}


export class Avatar {
    private tile: BaseTile;
    private faces: Faces;

    constructor(startTile: StartTile){
        if(!(startTile instanceof StartTile)){
            throw new Error(`Expected StartTile, got ${startTile.constructor.name} instead.`);
        }

        this.faces = <Faces>{
            top: AvatarFaces.TOP, bottom: AvatarFaces.BOTTOM,
            left: AvatarFaces.LEFT, right: AvatarFaces.RIGHT,
            front: AvatarFaces.FRONT, back: AvatarFaces.BACK
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

        return <AvatarState>{
            face: faces.bottom,
            accept: (target) => {
                this.faces = faces;
                this.setTile(target);
                avatarAnimations.move(e.direction);
            }
        }
    }

    move(e: ControlEvent){
        let stateDelegate = this.delegateState(e);
        let target: BaseTile;

        switch(e.direction){
            case controlDirections.FRONT:
                target = this.tile.front;
                break;
            case controlDirections.BACK:
                target = this.tile.back;
                break;
            case controlDirections.LEFT:
                target = this.tile.left;
                break;
            case controlDirections.RIGHT:
                target = this.tile.right;
                break;
            default:
                throw e;
        }

        target.action(stateDelegate);
    }

    setTile(tile: BaseTile){
        this.tile = tile;
    }
}