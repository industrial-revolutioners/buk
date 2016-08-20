/**
 * utils.ts
 *
 * Utility functions
 *
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

export namespace random {
    export function choice(list: Array<any>){
        let index = Math.floor(Math.random() * list.length);

        return list[index];
    }
}
