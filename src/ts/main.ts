/**
 * main.ts
 *
 * buk - a cube rolling puzzle
 *
 * @author Caiwan
 * @author Slapec
 */


import './events';
import { Avatar } from './avatar';




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
