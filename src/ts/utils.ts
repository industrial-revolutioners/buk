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
    export function choice(list: Array<any>) {
        let index = Math.floor(Math.random() * list.length);

        return list[index];
    }
}

export namespace concurrence {
    /** Common, quick and dirty mutex/lock class */
    export class Lock {
        private count: number;
        private callbacks: Array<() => void> = [];
        private locked: boolean;

        constructor() {
            this.count = 0;

        }

        setCallback(callback: () => void) {
            if (callback !== undefined) {
                this.callbacks.push(callback);
            }
        }

        push(): void {
            this.count++;
            this.locked = true;
        }

        pop(): void {
            this.count--;
            const llock = this.locked;
            if (this.callbacks.length > 0 && this.count === 0 && this.locked) {
                this.callbacks.forEach((callback : ()=>{}) => {
                    callback();
                });
                this.callbacks = [];
                this.locked = false;
            }
        }

        isLocked(): boolean {
            return this.count != 0;
        }

    }
}

export namespace dom {
    export function byId(selector: string): HTMLElement {
        return document.getElementById(selector);
    }
}

export class Storage {
    private name: string;

    constructor(name: string) {
        this.name = name;

        let storage = window.localStorage[name];
        if (storage === undefined) {
            window.localStorage[name] = JSON.stringify({});
        }
    }

    get(key: string, defaultValue: any = undefined): any {
        let storage = JSON.parse(window.localStorage[this.name]);
        let value = storage[key];

        if (value === undefined) {
            value = defaultValue;
            if (value !== undefined) {
                storage[key] = value;
                window.localStorage[this.name] = JSON.stringify(storage);
            }
        }

        return value;
    }

    set(key: string, value: any): void {
        let storage = JSON.parse(window.localStorage[this.name]);
        storage[key] = value;
        window.localStorage[this.name] = JSON.stringify(storage);
    }

    clear(): void {
        delete window.localStorage[this.name];
    }
}