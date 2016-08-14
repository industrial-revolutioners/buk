import {events, input, PlayerEvent, CameraDirectionEvent, CameraAttributeEvent} from './input';


input.on(events.player.MOVE, (e: PlayerEvent) => {
    console.log('player.MOVE', e);
});

input.on(events.camera.ROTATE, (e: CameraDirectionEvent) => {
    console.log('camera.ROTATE', e);
});

input.on(events.camera.ZOOM, (e: CameraAttributeEvent) => {
    console.log('camera.ZOOM', e);
});
