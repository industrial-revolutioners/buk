/**
 * input.ts
 *
 * Input handler classes.
 *
 * @author Caiwan
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import { EventEmitter } from "events";
import {
    canvasWrapper,
    rotateAreaY,
    rotateSwipeThreshold, moveSwipeThreshold,
    frontRange, backRange, leftRange, rightRange,
    zoom
} from './settings';

export const CLASS_NAME: string = 'event-source';

export const events = {
    camera: {
        ROTATE: 'camera.rotate',
        ZOOM: 'camera.zoom'
    },
    avatar: {
        MOVE: 'avatar.move'
    }
};

export enum ControlDirection {
    FRONT, RIGHT, BACK, LEFT
}

export enum CameraDirection {
    CW, CCW
}

export enum CameraAttribute {
    ZOOM
}

export interface ControlEvent {
    direction: ControlDirection,
    angle: number
}

export interface CameraDirectionEvent {
    direction: CameraDirection
}

export interface CameraAttributeEvent {
    attribute: CameraAttribute
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
                    eventObject = <ControlEvent>{ direction: ControlDirection.FRONT };
                    break;
                case 's':
                case 'ArrowDown':
                    eventName = events.avatar.MOVE;
                    eventObject = <ControlEvent>{ direction: ControlDirection.BACK };
                    break;
                case 'a':
                case 'ArrowLeft':
                    eventName = events.avatar.MOVE;
                    eventObject = <ControlEvent>{ direction: ControlDirection.LEFT };
                    break;
                case 'd':
                case 'ArrowRight':
                    eventName = events.avatar.MOVE;
                    eventObject = <ControlEvent>{ direction: ControlDirection.RIGHT };
                    break;
                case 'A':
                    eventName = events.camera.ROTATE;
                    eventObject = <CameraDirectionEvent>{ direction: CameraDirection.CCW };
                    break;
                case 'D':
                    eventName = events.camera.ROTATE;
                    eventObject = <CameraDirectionEvent>{ direction: CameraDirection.CW };
                    break;
                case 'W':
                    eventName = events.camera.ZOOM;
                    eventObject = <CameraAttributeEvent>{
                        attribute: CameraAttribute.ZOOM,
                        value: -1 * zoom.step
                    };
                    break;
                case 'S':
                    eventName = events.camera.ZOOM;
                    eventObject = <CameraAttributeEvent>{
                        attribute: CameraAttribute.ZOOM,
                        value: zoom.step
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
                let eventObject = <CameraAttributeEvent>{ attribute: CameraAttribute.ZOOM };

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

                if (Math.abs(distanceDelta) >= zoom.threshold) {
                    eventObject.value = -1 * (distanceDelta / zoom.deltaDivisor);
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
                            eventObject.direction = CameraDirection.CW;
                        }
                        else {
                            eventObject.direction = CameraDirection.CCW;
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
                            eventObject.direction = ControlDirection.FRONT;
                        }
                        else if (angle >= backRange.from && angle < backRange.to) {
                            eventObject.direction = ControlDirection.BACK;
                        }
                        else if (angle >= leftRange.from && angle < leftRange.to) {
                            eventObject.direction = ControlDirection.LEFT;
                        }
                        else if (angle >= rightRange.from && angle < rightRange.to) {
                            eventObject.direction = ControlDirection.RIGHT;
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

export const input = new Input(canvasWrapper);
