import { EventEmitter } from "events";
import { canvasWrapper } from './settings';

export const CLASS_NAME: string = 'event-source';

export const events = Object.freeze({
    camera: {
        ROTATE: 'camera.rotate',
        ZOOM: 'camera.zoom'
    },
    player: {
        MOVE: 'player.move'
    }
});

export const enum playerDirections {
    FRONT, BACK, LEFT, RIGHT
}

export const enum cameraDirections {
    CW, CCW
}

export const enum cameraAttributes {
    ZOOM
}

export interface PlayerEvent {
    direction: playerDirections,
}

export interface CameraDirectionEvent {
    direction: cameraDirections
}

export interface CameraAttributeEvent {
    attribute: cameraAttributes
}


abstract class InputBase extends EventEmitter {
    protected eventSource: HTMLElement;

    constructor(eventSourceElement: HTMLElement){
        super();

        this.setEventSource(eventSourceElement);
        this.setupHandlers();
    }

    getEventSource(): HTMLElement {
        return this.eventSource;
    }

    setEventSource(eventSourceElement: HTMLElement): void {
        if(!(eventSourceElement instanceof HTMLElement)){
            throw new Error("Argument 'eventSourceElement' must be an HTMLElement instance.");
        }

        eventSourceElement.classList.add(CLASS_NAME);
        this.eventSource = eventSourceElement;
    }

    protected abstract setupHandlers(): void;
}


export class TouchInput extends InputBase {
    constructor(eventSourceElement: HTMLElement){
        super(eventSourceElement);
    }

    setupHandlers(){
        this.eventSource.addEventListener('touchstart', function(){
            console.log(arguments);
        });

        this.eventSource.addEventListener('touchend', function(){
            console.log(arguments);
        })
    }
}


export function getActiveInput(){
    return new TouchInput(canvasWrapper);
}
