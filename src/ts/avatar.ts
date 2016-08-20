/**
 * avatar.ts
 *
 * The avatar object represents the player on the level
 *
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import { Tile } from './tiles';
import { controlDirections, ControlEvent } from "./input";


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
    accept: Function
}


export class Avatar {
    private tile: Tile;
    private faces: Faces;

    constructor(startTile: Tile){
        this.tile = startTile;
        this.faces = <Faces>{
            top: AvatarFaces.TOP, bottom: AvatarFaces.BOTTOM,
            left: AvatarFaces.LEFT, right: AvatarFaces.RIGHT,
            front: AvatarFaces.FRONT, back: AvatarFaces.BACK
        }
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
            accept: () => {
                console.log('AvatarState.accept');
                // TODO: This part depends on animation code
            }
        }
    }

    move(e: ControlEvent){
        let stateDelegate = this.delegateState(e);

        switch(e.direction){
            case controlDirections.FRONT:
                console.log('avatar.FRONT', stateDelegate);
                break;
            case controlDirections.BACK:
                console.log('avatar.BACK', stateDelegate);
                break;
            case controlDirections.LEFT:
                console.log('avatar.LEFT', stateDelegate);
                break;
            case controlDirections.RIGHT:
                console.log('avatar.RIGHT', stateDelegate);
                break;
            default:
                throw e;
        }
    }
}