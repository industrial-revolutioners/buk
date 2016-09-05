/**
 * utils.ts
 *
 * Utility functions
 *
 * @author Caiwan
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

export namespace concurrence {
    /** Common, quick and dirty mutex/lock class */
    export class Lock {
        private count: number;
        constructor() {
            this.count = 0;
        }
        push(): void {
            this.count++;
        }
        pop(): void {
            this.count--;
        }
        isLocked(): boolean {
            return this.count != 0;
        }
    }
}

export namespace dom {
    export function byId(selector: string): HTMLElement{
        return document.getElementById(selector);
    }
}