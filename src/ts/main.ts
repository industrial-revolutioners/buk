import {
    events, input, AvatarEvent,
    CameraDirectionEvent, CameraAttributeEvent,
    cameraDirections, cameraAttributes, avatarDirections} from './input';

import { canvasWrapper } from './settings';


input.on(events.avatar.MOVE, (e: AvatarEvent) => {
    console.log('avatar.MOVE', e);
    canvasWrapper.dataset['name'] = `avatar.MOVE; direction=${avatarDirections[e.direction]}`;
});

input.on(events.camera.ROTATE, (e: CameraDirectionEvent) => {
    console.log('camera.ROTATE', e);
    canvasWrapper.dataset['name'] = `camera.ROTATE; direction=${cameraDirections[e.direction]}`;
});

let zoomTest = document.getElementById('zoom-test');
input.on(events.camera.ZOOM, (e: CameraAttributeEvent) => {
    console.log('camera.ZOOM', e);
    canvasWrapper.dataset['name'] = `camera.ZOOM; attribute=${cameraAttributes[e.attribute]}, value=${e.value}`;
    zoomTest.style.zoom = (parseFloat(zoomTest.style.zoom) || 0) + e.value;
});
