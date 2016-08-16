
import {
    events, input, AvatarEvent,
    CameraDirectionEvent, CameraAttributeEvent,
    cameraDirections, cameraAttributes, avatarDirections} from './input';
import * as TWEEN from 'tween.js';

import { canvasWrapper } from './settings';

import * as faszopm from './events'

const DEBUG = false;



/** Event sending mock and test stub */
// if (false) {
//     /** Event delay mock */
//     function newDelay(event: (any: any) => void): () => Promise<{}> {
//         return function (): Promise<{}> {
//             return new Promise(function (resolve: () => void) {
//                 console.log("invoke");
//                 event.apply(input, arguments);
//                 input.on(names.animation.done, function () {
//                     if (DEBUG)
//                         console.log("resolve");
//                     resolve();
//                 })
//             });
//         }
//     };

//     newDelay(input.sendEvent)()
//         .then(newDelay(input.sendEvent))
//         .then(newDelay(input.sendEvent))
//         .then(newDelay(input.sendEvent));
// }

console.log(input);
