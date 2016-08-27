/**
 * tiles.ts
 *
 * Tile objects describe each game level.
 * In the MVC pattern this could be the M.
 *
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import { AvatarState, AvatarFaces } from "./avatar";


/**
 * This is the abstract base class of every tile
 *
 * Derived classes should implement `action()` and `reset()` optionally.
 */
export abstract class BaseTile {
    front: BaseTile;
    back: BaseTile;
    left: BaseTile;
    right: BaseTile;

    constructor(){
        this.reset();
    }

    /**
     * This method is invoked by the `Avatar` instance every time when the she's preparing
     * to step on the tile. The argument `state` is the state the avatar wishes to have if
     * her step succeeds.
     *
     * Here the class can make a decision based on its own and the avatar's future state
     * and then call some of the delegated methods (see the `AvatarState` interface).
     */
    abstract action(state: AvatarState): void;

    /**
     * If the derived class is expected to be statefull (like it's going to track how many
     * times the avatar have stepped on it) you have reset its internal state here.
     *
     * This method is called on instantiation and later on level reset.
     */
    reset(): void {}

    resolveNeighbors(): void {

    }
}


/**
 * This is the main tile. It doesn't have any color and accepts any avatar state meaning that
 * the avatar can step on it freely.
 */
export class Tile extends BaseTile {
    action(state: AvatarState){
        state.accept(this);
    }
}

/**
 * The void tile kills the avatar instantly. It's invisible in the game.
 * The level should be bordered with void tiles.
 */
export class Void extends BaseTile {
    action(state: AvatarState){
        state.kill(this);
    }
}

/**
 * The `Checkpoint` is very similar to a `Tile` but it has face (it's colored in the game).
 * The avatar can step on it freely but if her face and the checkpoint's face matches the
 * avatar gets 1 point (once in her lifetime).
 */
export class Checkpoint extends Tile {
    protected reached = false;

    constructor(protected face: AvatarFaces){
        super();
    }

    reset(): void {
        super.reset();
        this.reached = false;
    }

    action(state: AvatarState){
        super.action(state);

        if(!this.reached && state.face === this.face){
            this.reached = true;
            state.checkpoint(this);
        }
    }
}


/**
 * The avatar can step on a `Gate` if the face of the gate and her face match.
 */
export class Gate extends Tile {
    constructor(private face: AvatarFaces){
        super();
    }

    action(state: AvatarState): any{
        if(state.face === this.face){
            state.accept(this);
            return true;
        }
        return false;
    }
}

/**
 * The avatar is spawned on this tile. It also behaves like a Gate.
 */
export class Start extends Gate {

}

/**
 * The level is finished if the avatar steps on this tile. It's also a gate.
 */
export class Finish extends Gate {
    action(state: AvatarState){
        if(super.action(state)){
            state.finish(this);
        }
    }
}
