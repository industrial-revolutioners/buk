import {
    events, input, PlayerEvent,
    CameraDirectionEvent, CameraAttributeEvent,
    cameraDirections, cameraAttributes, playerDirections} from './input';

import { canvasWrapper } from './settings';


input.on(events.player.MOVE, (e: PlayerEvent) => {
    console.log('player.MOVE', e);
    canvasWrapper.dataset['name'] = `player.MOVE; direction=${playerDirections[e.direction]}`;
});

input.on(events.camera.ROTATE, (e: CameraDirectionEvent) => {
    console.log('camera.ROTATE', e);
    canvasWrapper.dataset['name'] = `camera.ROTATE; direction=${cameraDirections[e.direction]}`;
});

input.on(events.camera.ZOOM, (e: CameraAttributeEvent) => {
    console.log('camera.ZOOM', e);
    canvasWrapper.dataset['name'] = `camera.ZOOM; attribute=${cameraAttributes[e.attribute]}, value=${e.value}`;
});
