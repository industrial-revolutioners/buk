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
        private callback : ()=>void = () => {};
        private locked: boolean;

        constructor() {
            this.count = 0;
            
        }
    
        setCallback(callback : () => void){
            if (callback === undefined){
                this.callback = () => {};
            } else {
                this.callback = callback;
            }
        }

        push(): void {
            this.count++;
            this.locked = true;
        }
        
        pop(): void {
            this.count--;
            if (this.count <= 0 && this.locked){
                this.callback();    
                this.locked = false;
            }
        }

        isLocked(): boolean {
            return this.count != 0;
        }

    }
}
