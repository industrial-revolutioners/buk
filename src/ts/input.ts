/**
 * input.ts
 *
 * Input handler classes.
 *
 * @author Caiwan
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import {EventEmitter} from "events";
import {
    canvasWrapper,
    rotateAreaY,
    rotateSwipeThreshold, moveSwipeThreshold,
    frontRange, backRange, leftRange, rightRange,
    zoomThreshold
} from './settings';

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

/** CW order, same as camera order, do not change */
export enum controlDirections {
    FRONT, RIGHT, BACK, LEFT
}

export enum cameraDirections {
    CW, CCW
}

export enum cameraAttributes {
    ZOOM
}

export enum cameraZoomDirection {
    ZOOM_IN = 1, ZOOM_OUT = -1
}

export interface ControlEvent {
    direction: controlDirections,
    angle: number
}

export interface CameraDirectionEvent {
    direction: cameraDirections
}

export interface CameraAttributeEvent {
    attribute: cameraAttributes
    value: any
}


abstract class InputBase extends EventEmitter {
    protected eventSource: HTMLElement;

    constructor(eventSourceElement: HTMLElement) {
        super();

        this.setEventSource(eventSourceElement);
    }

    getEventSource(): HTMLElement {
        return this.eventSource;
    }

    setEventSource(eventSourceElement: HTMLElement): void {
        if (!(eventSourceElement instanceof HTMLElement)) {
            throw new Error("Argument 'eventSourceElement' must be an HTMLElement instance.");
        }

        eventSourceElement.setAttribute('tabindex', '1');
        eventSourceElement.focus();
        eventSourceElement.classList.add(CLASS_NAME);
        this.eventSource = eventSourceElement;
    }

    abstract update(): void;
}


/** The default input handler of keyboard and touch events */
class Input extends InputBase {
    private rotateAreaY: number;

    constructor(eventSourceElement: HTMLElement) {
        super(eventSourceElement);

        this.update();
        this.setupKeyboardHandlers();
        this.setupTouchHandlers();
    }

    setupKeyboardHandlers(): void {
        let elem = this.eventSource;

        elem.addEventListener('keydown', e => {
            let eventName: string;
            let eventObject: Object;

            switch (e.key) {
                case 'w':
                case 'ArrowUp':
                    eventName = events.avatar.MOVE;
                    eventObject = <ControlEvent>{ direction: controlDirections.FRONT };
                    break;
                case 's':
                case 'ArrowDown':
                    eventName = events.avatar.MOVE;
                    eventObject = <ControlEvent>{ direction: controlDirections.BACK };
                    break;
                case 'a':
                case 'ArrowLeft':
                    eventName = events.avatar.MOVE;
                    eventObject = <ControlEvent>{ direction: controlDirections.LEFT };
                    break;
                case 'd':
                case 'ArrowRight':
                    eventName = events.avatar.MOVE;
                    eventObject = <ControlEvent>{ direction: controlDirections.RIGHT };
                    break;
                case 'A':
                    eventName = events.camera.ROTATE;
                    eventObject = <CameraDirectionEvent>{ direction: cameraDirections.CCW };
                    break;
                case 'D':
                    eventName = events.camera.ROTATE;
                    eventObject = <CameraDirectionEvent>{ direction: cameraDirections.CW };
                    break;
                case 'W':
                    eventName = events.camera.ZOOM;
                    eventObject = <CameraAttributeEvent>{
                        attribute: cameraAttributes.ZOOM,
                        value: cameraZoomDirection.ZOOM_IN
                    };
                    break;
                case 'S':
                    eventName = events.camera.ZOOM;
                    eventObject = <CameraAttributeEvent>{
                        attribute: cameraAttributes.ZOOM,
                        value: cameraZoomDirection.ZOOM_OUT
                    };
                    break;
                default:
                    //? if(DEBUG){
                    console.warn('Unhandled', e);
                    //? }
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

            if (isPinch) {
                let eventObject = <CameraAttributeEvent>{ attribute: cameraAttributes.ZOOM };

                let touch0 = e.touches[0];
                let touch1 = e.touches[1];
                let distance = Math.sqrt(
                    Math.pow(touch0.clientX - touch1.clientX, 2) +
                    Math.pow(touch0.clientY - touch0.clientY, 2)
                );

                if (!lastDistance) {
                    lastDistance = distance;
                }

                let distanceDelta = distance - lastDistance;
                lastDistance = distance;

                if (distanceDelta >= zoomThreshold) {
                    eventObject.value = cameraZoomDirection.ZOOM_IN;
                    this.emit(events.camera.ZOOM, eventObject);
                }
                else if (distanceDelta <= -1 * zoomThreshold) {
                    eventObject.value = cameraZoomDirection.ZOOM_OUT;
                    this.emit(events.camera.ZOOM, eventObject);
                }
            }
        });

        this.eventSource.addEventListener('touchend', e => {
            e.preventDefault();

            if (isPinch) {
                isPinch = e.touches.length > 1;
                if (!isPinch) {
                    lastDistance = null;
                    dropEvent = true;
                }
                return;
            }

            if (!dropEvent) {
                let touch = e.changedTouches[0];
                let endX = touch.clientX;
                let endY = touch.clientY;

                let deltaX = endX - startX;
                let deltaY = endY - startY;
                if (startY >= this.rotateAreaY) {
                    if (Math.abs(deltaX) >= rotateSwipeThreshold) {
                        let eventName = events.camera.ROTATE;
                        let eventObject = <CameraDirectionEvent>{};
                        if (deltaX > 0) {
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
                    if (angle < 0) {
                        angle += 360;
                    }

                    if (r > moveSwipeThreshold) {
                        let eventName = events.avatar.MOVE;
                        let eventObject = <ControlEvent>{ angle: angle };

                        if (angle >= frontRange.from && angle < frontRange.to) {
                            eventObject.direction = controlDirections.FRONT;
                        }
                        else if (angle >= backRange.from && angle < backRange.to) {
                            eventObject.direction = controlDirections.BACK;
                        }
                        else if (angle >= leftRange.from && angle < leftRange.to) {
                            eventObject.direction = controlDirections.LEFT;
                        }
                        else if (angle >= rightRange.from && angle < rightRange.to) {
                            eventObject.direction = controlDirections.RIGHT;
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

//? if(DEBUG) {
class InputMock extends InputBase {
    /** This class emits [FRONT, BACK, LEFT, RIGHT] input events periodically */
    public mockControlEvents: Array<ControlEvent> = [
        { direction: controlDirections.FRONT, angle: 0 }, // 0
        { direction: controlDirections.BACK, angle: 0 },  // 1
        { direction: controlDirections.LEFT, angle: 0 },  // 2
        { direction: controlDirections.RIGHT, angle: 0 }  // 3
    ];

    public mockCameraEvents: Array<CameraDirectionEvent> = [
        { direction: cameraDirections.CW },
        { direction: cameraDirections.CW },
        { direction: cameraDirections.CW },
        { direction: cameraDirections.CW },
        { direction: cameraDirections.CCW },
        { direction: cameraDirections.CCW },
        { direction: cameraDirections.CCW },
        { direction: cameraDirections.CCW }
    ];

    public mockCameraAttribEvents: Array<CameraAttributeEvent> = [
        { attribute: cameraAttributes.ZOOM, value: cameraZoomDirection.ZOOM_IN },
        { attribute: cameraAttributes.ZOOM, value: cameraZoomDirection.ZOOM_OUT }
    ];

    constructor(eventSourceElement: HTMLElement) {
        super(eventSourceElement);

        let count0 = 0;
        setInterval(() => {
            const rnd = count0 % this.mockControlEvents.length;
            let evt = this.mockControlEvents[rnd];

            this.emit(events.avatar.MOVE, evt);

            count0++;
        }, 300 + 500 * Math.random());

        let count1 = 0;
        setInterval(() => {
            const i = count1 % this.mockCameraEvents.length;
            let evt = this.mockCameraEvents[i];

            this.emit(events.camera.ROTATE, evt);

            count1++;
        }, 300 + 500 * Math.random());

        let count2 = 0;
        setInterval(() => {
            const i = count2 % this.mockCameraAttribEvents.length;
            let evt = this.mockCameraAttribEvents[i];

            this.emit(events.camera.ZOOM, evt);

            count2++;
        }, 300 + 500 * Math.random());

    }

    update(): void {
    }
}

export const input = new InputMock(canvasWrapper);
//? } else {
export const input = new Input(canvasWrapper);
//? }

window.addEventListener('resize', () => {
    input.update();
});
