/**
 * utils.ts
 *
 * Utility functions
 *
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

/** Simple utils to get random stuff */
export namespace random {
    /** Returns a random element from the given array */
    export function choice(list: Array<any>){
        let index = Math.floor(Math.random() * list.length);

        return list[index];
    }
}
