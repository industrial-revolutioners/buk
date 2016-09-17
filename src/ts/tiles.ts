/**
 * tiles.ts
 *
 * Tile objects describe each game level.
 * In the MVC pattern this could be the M.
 *
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import {AvatarState, AvatarFaces, stringToAvatarFace} from "./avatar";
import {Level, LevelJsonTile} from './levels';


/**
 * This is the abstract base class of every tile
 *
 * Derived classes should implement `action()` and `reset()` optionally.
 */
export abstract class BaseTile {
    // This object is populated at the end of this module
    static tileTypes = {};
    type: string;

    id: number;
    col: number;
    row: number;

    front: number|BaseTile;
    back: number|BaseTile;
    left: number|BaseTile;
    right: number|BaseTile;

    level: Level;

    constructor(level: Level, tileJson: LevelJsonTile){
        this.level = level;

        this.id = tileJson.id;
        this.col = tileJson.col;
        this.row = tileJson.row;

        this.front = tileJson.neighbors.front;
        this.right = tileJson.neighbors.right;
        this.back = tileJson.neighbors.back;
        this.left = tileJson.neighbors.left;
    }

    /**
     * This method is invoked by the `Avatar` instance every time when the she's preparing
     * to step on the tile. The argument `state` is the state the avatar wishes to have if
     * her step succeeds.
     *
     * Here the class can make a decision based on its own and the avatar's future state
     * and then call some of the delegated methods (see the `AvatarState` interface).
     */
    abstract action(state: AvatarState): any;

    /**
     * If the derived class is expected to be statefull (like it's going to track how many
     * times the avatar have stepped on it) you have reset its internal state here.
     *
     * This method is called on instantiation and later on level reset.
     */
    reset(): void {}

    static tileFactory(level: Level, tileJson: LevelJsonTile): BaseTile {
        let TileConstructor = BaseTile.tileTypes[tileJson.type];
        return new TileConstructor(level, tileJson);
    }

    resolveNeighbors(): void {
        let tileMap = this.level.tileMap;

        if(this.front !== undefined){
            this.front = tileMap[<number>this.front];
        }

        if(this.right !== undefined){
            this.right = tileMap[<number>this.right];
        }

        if(this.back !== undefined){
            this.back = tileMap[<number>this.back];
        }

        if(this.left !== undefined){
            this.left = tileMap[<number>this.left];
        }

        if(!(this instanceof Border) && (this.front === undefined || this.right === undefined || this.back === undefined || this.left === undefined)){
            throw new Error(`Tile #${this.id} does not have 4 neighbors`);
        }
    }
}


/**
 * This is the main tile. It doesn't have any color and accepts any avatar state meaning that
 * the avatar can step on it freely.
 */
export class Tile extends BaseTile {
    type = 'tile';

    action(state: AvatarState){
        state.accept(this);
    }
}


/**
 * The void tile kills the avatar instantly. It's invisible in the game.
 * The level should be bordered with void tiles.
 */
export class Border extends BaseTile {
    type = 'border';

    action(state: AvatarState){
        state.kill(this);
    }
}


/**
 * The avatar can step on a `Gate` if the face of the gate and her face match.
 */
export class Gate extends Tile {
    protected face: AvatarFaces;
    type = 'gate';

    constructor(level: Level, tileJson: LevelJsonTile){
        super(level, tileJson);

        let face = stringToAvatarFace[tileJson.properties.face];
        if(face === undefined) {
            throw new Error(`Unsupported face ${face}`);
        }
        else {
            this.face = face;
        }
    }

    action(state: AvatarState): any{
        if(state.face === this.face){
            state.accept(this);
            return true;
        }
        return false;
    }

    getFaceName() : string{
        return this.face.toString();
    }
}


/**
 * The `Bonus` is very similar to a `Tile` but it has face (it's colored in the game).
 * The avatar can step on it freely but if her face and the checkpoint's face matches the
 * avatar gets 1 point (once in her lifetime).
 */
export class Bonus extends Gate {
    protected reached = false;
    type = 'bonus';

    reset(): void {
        super.reset();

        this.reached = false;
    }

    action(state: AvatarState){
        let success = super.action(state);

        if(success){
            if(!this.reached){
                this.reached = true;
                state.bonus(this);
            }
        }

        return success;
    }
}


/**
 * The avatar is spawned on this tile. It also behaves like a Gate.
 */
export class Start extends Gate {
    type = 'start';
}


/**
 * The level is finished if the avatar steps on this tile. It's also a gate.
 */
export class Finish extends Gate {
    type = 'finish';

    action(state: AvatarState){
        if(super.action(state)){
            state.finish(this);
        }
    }
}


BaseTile.tileTypes = {
    'border': Border,
    'start': Start,
    'base': Tile,
    'gate': Gate,
    'finish': Finish,
    'bonus': Bonus
};
