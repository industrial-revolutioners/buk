/**
 * avatar.ts
 *
 * The avatar object represents the player on the level
 *
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import {Start, BaseTile} from './tiles';
import {AbsoluteDirection} from "./camera";
import {Game} from "./game";


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
    bonus: (target: BaseTile) => void;
}


export class Avatar {
    private game: Game;
    private tile: BaseTile;
    private faces: Faces;

    constructor(game: Game, startTile: Start) {
        if (!(startTile instanceof Start)) {
            throw new Error(`Expected Start, got ${startTile.constructor.name} instead.`);
        }

        this.game = game;

        this.reset();

        this.setTile(startTile);
        const level = startTile.level;
        this.game.scene.animations.avatar.spawn(startTile.col, startTile.row, false);
    }

    reset() {
        this.faces = <Faces>{
            top: AvatarFaces.WHITE, bottom: AvatarFaces.YELLOW,
            left: AvatarFaces.GREEN, right: AvatarFaces.BLUE,
            front: AvatarFaces.RED, back: AvatarFaces.ORANGE
        };
    }

    delegateState(d: AbsoluteDirection) {
        let faces = Object.assign({}, this.faces);

        let temp = faces.top;
        switch (d) {
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
                this.game.scene.animations.avatar.move(d);
                this.game.addStep();
                this.faces = faces;
                this.setTile(target);
            },
            kill: target => {
                this.game.scene.animations.avatar.die(d, () => {
                    this.game.died();
                });
            },
            finish: target => {
                this.game.finished();
            },
            bonus: target => {
                this.game.addBonus();
            }
        }
    }

    move(d: AbsoluteDirection) {
        let stateDelegate = this.delegateState(d);
        let target: BaseTile;

        switch (d) {
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

    setTile(tile: BaseTile) {
        this.tile = tile;
    }
}
