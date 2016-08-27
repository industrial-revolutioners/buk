/**
 * camera.ts
 *
 * Defines and exports the camera
 *
 * @author Caiwan
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import {PerspectiveCamera, OrthographicCamera, Vector3 } from 'three';

import {ControlEvent, controlDirections, cameraDirections} from './input';

// export let camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
export let camera = new OrthographicCamera(-1, 1, 1, -1, 0, 100);
camera.position.set(5, 5, 5);
// camera.position.set(5, 0, 0);
camera.lookAt(new Vector3(0, 0, 0));

camera.zoom = 1. / 3;

export function updateCamera(w: number, h: number): void {
    // --- orthographic camera
    let wh: number;
    let hw: number;

    if (w > h) {
        hw = h / w;
        wh = 1;
    } else {
        hw = 1;
        wh = w / h;
    }

    camera.top = hw;
    camera.bottom = -hw;
    camera.left = -wh;
    camera.right = wh;

    // --- perspective camera
    // camera.aspect = w / h;

    camera.updateProjectionMatrix();
}

/** ------------------------------------------------------------------------
 * Camera
 * ------------------------------------------------------------------------- */

export enum AbsDirection {
    NORTH, EAST, SOUTH, WEST
}

export enum CameraOrientation {
    SE, SW, NW, NE
}

interface CamRotDir<T> {
    from: T, to: T
}

interface StructCamData {
    name: string;
    rad: number;
    orientation: CameraOrientation;
    absoluteDirections: Array<AbsDirection>;
}

// angle is in radian, where value is n*PI/4
const camData = ([
    { name: "SE", rad: 7, orientation: CameraOrientation.SE, absoluteDirections: [AbsDirection.NORTH, AbsDirection.EAST, AbsDirection.SOUTH, AbsDirection.WEST] },
    { name: "SW", rad: 5, orientation: CameraOrientation.SW, absoluteDirections: [AbsDirection.EAST, AbsDirection.SOUTH, AbsDirection.WEST, AbsDirection.NORTH] },
    { name: "NW", rad: 3, orientation: CameraOrientation.NW, absoluteDirections: [AbsDirection.SOUTH, AbsDirection.WEST, AbsDirection.NORTH, AbsDirection.EAST] },
    { name: "NE", rad: 1, orientation: CameraOrientation.NE, absoluteDirections: [AbsDirection.WEST, AbsDirection.NORTH, AbsDirection.EAST, AbsDirection.SOUTH] }
]);

/** Model of the camera */
export class CameraModel {
    /** Index of current camera status */
    private status: number;
    private prevStatus: number;

    constructor() {
        this.status = 0;
        this.prevStatus = 0;
    }

    rotate(d: cameraDirections): void {
        this.prevStatus = this.status;
        switch (d) {
            case cameraDirections.CCW:
                this.status = --this.status % 4;
                if (this.status == -1) this.status = 3;
                break;

            case cameraDirections.CW:
                this.status = ++this.status % 4;
                break;
        }

        console.log("status id", this.status);
    }

    getAbsoluteDirection(evt: ControlEvent): AbsDirection {
        return camData[this.status].absoluteDirections[evt.direction];
    }

    private getInternalState(): CamRotDir<StructCamData> {
        return <CamRotDir<StructCamData>>{
            to: camData[this.status],
            from: camData[this.prevStatus],
        }
    }

    getAngle(): CamRotDir<number> {
        const status = this.getInternalState();
        return <CamRotDir<number>>{
            from: status.from.rad * Math.PI / 4,
            to: status.to.rad * Math.PI / 4
        }
    }

    getStatus(): CamRotDir<CameraOrientation> {
        const status = this.getInternalState();
        return <CamRotDir<CameraOrientation>>{
            from: status.from.orientation,
            to: status.to.orientation
        }
    }
}

/** Instantitate camera */
export let cameraModel = new CameraModel();
