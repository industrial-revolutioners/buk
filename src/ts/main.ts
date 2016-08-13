import {events, getActiveInput, PlayerEvent} from './input';


let input = getActiveInput();

input.on(events.player.MOVE, (e: PlayerEvent) => {
    console.log(e.direction);
});