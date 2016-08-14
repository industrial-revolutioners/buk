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
    value: any
}

class Input extends EventEmitter {
    public zoomDelta = 0.1;
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
                    eventName = events.player.MOVE;
                    eventObject = <PlayerEvent>{direction: playerDirections.FRONT};
                    break;
                case 's':
                case 'ArrowDown':
                    eventName = events.player.MOVE;
                    eventObject = <PlayerEvent>{direction: playerDirections.BACK};
                    break;
                case 'a':
                case 'ArrowLeft':
                    eventName = events.player.MOVE;
                    eventObject = <PlayerEvent>{direction: playerDirections.LEFT};
                    break;
                case 'd':
                case 'ArrowRight':
                    eventName = events.player.MOVE;
                    eventObject = <PlayerEvent>{direction: playerDirections.RIGHT};
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
                        value: this.zoomDelta
                    };
                    break;
                case 'S':
                    eventName = events.camera.ZOOM;
                    eventObject = <CameraAttributeEvent>{
                        attribute: cameraAttributes.ZOOM,
                        value: -1 * this.zoomDelta
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
        let elem = this.eventSource;

        let startX: number;
        let startY: number;

        this.eventSource.addEventListener('touchstart', e => {
            e.preventDefault();

            let touch = e.changedTouches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        });

        this.eventSource.addEventListener('touchend', e => {
            e.preventDefault();

            let touch = e.changedTouches[0];
            let endX = touch.clientX;
            let endY = touch.clientY;

            console.log(startX, startY, endX, endY, endX - startX, endY - startY);
        });
    }

    update(): void {
        let height = this.eventSource.clientHeight;

        this.rotateAreaY = height * 0.95;

        // TODO: Continue here
    }
}

export const input = new Input(canvasWrapper);

window.addEventListener('resize', () => {
    input.update();
});