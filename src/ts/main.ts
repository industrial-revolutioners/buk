import * as THREE from 'three';
import * as TWEEN from 'tween.js';

import { EventEmitter } from 'events';

import { input, names } from './events'

import { scene } from './objects'
import { renderer } from './renderer';
import { camera } from './camera';

const DEBUG = false; 

camera.position.z = 5;

/** 
 * Test all the events 
 */

/** Event delay mock */
function newDelay(event: (any: any) => void) : () => Promise<{}>{
    return function () : Promise<{}> {
        return new Promise(function (resolve: () => void) {
            console.log("invoke");
            event.apply(input, arguments);
            input.on(names.animation.done, function(){
                if (DEBUG)
                    console.log("resolve");
                resolve();
            })
        });
    }
};

newDelay(input.sendEvent)()
    .then(newDelay(input.sendEvent))
    .then(newDelay(input.sendEvent))
    .then(newDelay(input.sendEvent));

let render = function (time: number) {

    TWEEN.update(time);

    renderer.render(scene, camera);

    requestAnimationFrame(render);
};

render(performance.now());
