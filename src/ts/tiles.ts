/**
 * tiles.ts
 *
 * Tile objects describe each game level.
 * In the MVC pattern this could be the M.
 *
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import { AvatarState } from "./avatar";

const enum Tiles {
    VOID
}


export abstract class BaseTile {
    front: BaseTile;
    back: BaseTile;
    left: BaseTile;
    right: BaseTile;

    abstract action(state: AvatarState): void;
}


export class Tile extends BaseTile {
    action(state: AvatarState){
        state.accept(this);
    }
}


export class StartTile extends Tile {

}