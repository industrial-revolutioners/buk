/**
 * Input events
 * 
 * @author Slapec
 */

import { EventEmitter } from "events";
import {
    canvasWrapper,
    rotateAreaY,
    rotateSwipeThreshold, moveSwipeThreshold,
    frontRange, backRange, leftRange, rightRange,
    zoom, zoomThreshold
} from './settings';

const DEBUG = true;

export const CLASS_NAME: string = 'event-source';

export const events = Object.freeze({
    camera: {
        ROTATE: 'camera.rotate',
        ZOOM: 'camera.zoom'
    },
    avatar: {
        MOVE: 'avatar.move'
    }
});

export enum avatarDirections {
    FRONT, BACK, LEFT, RIGHT
}

export enum cameraDirections {
    CW, CCW
}

export enum cameraAttributes {
    ZOOM
}

export interface AvatarEvent {
    direction: avatarDirections,
    angle: number
}

export interface CameraDirectionEvent {
    direction: cameraDirections
}

export interface CameraAttributeEvent {
    attribute: cameraAttributes
    value: any
}

/** Input events */
class Input extends EventEmitter {
    private eventSource: HTMLElement;
    private rotateAreaY: number;

    constructor(eventSourceElement: HTMLElement){
        super();

        this.setEventSource(eventSourceElement);

        this.update();
        this.setupKeyboardHandlers();
        this.setupTouchHandlers();
    }

    getEventSource(): HTMLElement {
        return this.eventSource;
    }

    setEventSource(eventSourceElement: HTMLElement): void {
        if(!(eventSourceElement instanceof HTMLElement)){
            throw new Error("Argument 'eventSourceElement' must be an HTMLElement instance.");
        }

        eventSourceElement.setAttribute('tabindex', '1');
        eventSourceElement.focus();
        eventSourceElement.classList.add(CLASS_NAME);
        this.eventSource = eventSourceElement;
    }

    setupKeyboardHandlers(): void{
        let elem = this.eventSource;

        elem.addEventListener('keydown', e => {
            let eventName: string;
            let eventObject: Object;

            switch(e.key){
                case 'w':
                case 'ArrowUp':
                    eventName = events.avatar.MOVE;
                    eventObject = <AvatarEvent>{direction: avatarDirections.FRONT};
                    break;
                case 's':
                case 'ArrowDown':
                    eventName = events.avatar.MOVE;
                    eventObject = <AvatarEvent>{direction: avatarDirections.BACK};
                    break;
                case 'a':
                case 'ArrowLeft':
                    eventName = events.avatar.MOVE;
                    eventObject = <AvatarEvent>{direction: avatarDirections.LEFT};
                    break;
                case 'd':
                case 'ArrowRight':
                    eventName = events.avatar.MOVE;
                    eventObject = <AvatarEvent>{direction: avatarDirections.RIGHT};
                    break;
                case 'A':
                    eventName = events.camera.ROTATE;
                    eventObject = <CameraDirectionEvent>{direction: cameraDirections.CCW};
                    break;
                case 'D':
                    eventName = events.camera.ROTATE;
                    eventObject = <CameraDirectionEvent>{direction: cameraDirections.CW};
                    break;
                case 'W':
                    eventName = events.camera.ZOOM;
                    eventObject = <CameraAttributeEvent>{
                        attribute: cameraAttributes.ZOOM,
                        value: zoom
                    };
                    break;
                case 'S':
                    eventName = events.camera.ZOOM;
                    eventObject = <CameraAttributeEvent>{
                        attribute: cameraAttributes.ZOOM,
                        value: -1 * zoom
                    };
                    break;
                default:
                    console.warn('Unhandled', e);
                    return;
            }

            this.emit(eventName, eventObject);
        });
    }

    setupTouchHandlers(): void {
        let startX: number;
        let startY: number;

        let dropEvent: boolean = false;
        let isPinch: boolean = false;
        let lastDistance: number;

        this.eventSource.addEventListener('touchstart', e => {
            e.preventDefault();

            dropEvent = false;
            isPinch = e.touches.length > 1;

            let touch = e.changedTouches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        });

        this.eventSource.addEventListener('touchmove', e => {
            e.preventDefault();

            if(isPinch){
                let eventObject = <CameraAttributeEvent>{attribute: cameraAttributes.ZOOM};

                let touch0 = e.touches[0];
                let touch1 = e.touches[1];
                let distance = Math.sqrt(
                    Math.pow(touch0.clientX - touch1.clientX, 2) +
                    Math.pow(touch0.clientY - touch0.clientY, 2)
                );

                if(!lastDistance){
                    lastDistance = distance;
                }

                let distanceDelta = distance - lastDistance;
                lastDistance = distance;

                if(distanceDelta >= zoomThreshold){
                    eventObject.value = zoom;
                    this.emit(events.camera.ZOOM, eventObject);
                }
                else if(distanceDelta <= -1 * zoomThreshold){
                    eventObject.value = -1 * zoom;
                    this.emit(events.camera.ZOOM, eventObject);
                }
            }
        });

        this.eventSource.addEventListener('touchend', e => {
            e.preventDefault();

            if(isPinch){
                isPinch = e.touches.length > 1;
                if(!isPinch){
                    lastDistance = null;
                    dropEvent = true;
                }
                return;
            }

            if(!dropEvent){
                let touch = e.changedTouches[0];
                let endX = touch.clientX;
                let endY = touch.clientY;

                let deltaX = endX - startX;
                let deltaY = endY - startY;
                if(startY >= this.rotateAreaY){
                    if(Math.abs(deltaX) >= rotateSwipeThreshold){
                        let eventName = events.camera.ROTATE;
                        let eventObject = <CameraDirectionEvent>{};
                        if(deltaX > 0){
                            eventObject.direction = cameraDirections.CCW;
                        }
                        else {
                            eventObject.direction = cameraDirections.CW;
                        }

                        this.emit(eventName, eventObject);
                    }
                }
                else {
                    let r = Math.sqrt(Math.abs(deltaX * deltaX) + Math.abs(deltaY * deltaY));
                    let angle = -1 * ((Math.atan2(deltaY, deltaX) * (180 / Math.PI)));
                    if(angle < 0){
                        angle += 360;
                    }

                    if(r > moveSwipeThreshold){
                        let eventName = events.avatar.MOVE;
                        let eventObject = <AvatarEvent>{angle: angle};

                        if(angle >= frontRange.from && angle < frontRange.to){
                            eventObject.direction = avatarDirections.FRONT;
                        }
                        else if(angle >= backRange.from && angle < backRange.to){
                            eventObject.direction = avatarDirections.BACK;
                        }
                        else if(angle >= leftRange.from && angle < leftRange.to){
                            eventObject.direction = avatarDirections.LEFT;
                        }
                        else if(angle >= rightRange.from && angle < rightRange.to){
                            eventObject.direction = avatarDirections.RIGHT;
                        }
                        else {
                            throw new Error(`Angle ${angle} should never appear.`);
                        }

                        this.emit(eventName, eventObject);
                    }
                }
            }
        });
    }

    update(): void {
        let height = this.eventSource.clientHeight;

        this.rotateAreaY = height * rotateAreaY;
    }
}

/** Mock input events */
class InputMock extends EventEmitter {
    constructor() {
        super();
    }

    /** Dumy event */
    sendEvent(): void {
        if (DEBUG)
            console.log("emit");
        this.emit("event.mock", "cica");
    }

}

export const input = new Input(canvasWrapper);

window.addEventListener('resize', () => {
    input.update();
});
