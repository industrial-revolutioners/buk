/**
 * utils.ts
 *
 * Utility functions
 *
 * @author Caiwan
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

export namespace random {
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
            // console.log("push" + this.count);
        }
        pop(): void {
            this.count--;
            // console.log("pop" + this.count);
        }
        isLocked(): boolean {
            return this.count != 0;
        }
    }
}
