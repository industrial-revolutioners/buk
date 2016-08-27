/**
 * camera.ts
 *
 * Defines and exports the camera
 *
 * @author Caiwan
 * @author Slapec
 */

/// <reference path="../../typings/index.d.ts" />

import * as THREE from 'three';

import * as SETTINGS from './settings';
import {ControlEvent, controlDirections, cameraDirections} from './input';

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

/** ------------------------------------------------------------------------
 * Camera wrapper
 * ------------------------------------------------------------------------- */
export class CameraModel {
    public camera: THREE.OrthographicCamera;

    private center: THREE.Vector3;

    constructor() {
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 100);
        this.camera.position.set(5, 5, 5);
        this.center = new THREE.Vector3(0, 0, 0);

        this.camera.lookAt(this.center);

        this.camera.zoom = 1. / 3;

        this.status = 0;
        this.prevStatus = 0;
    }

    updateCamera(w: number, h: number): void {
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

        this.camera.top = hw;
        this.camera.bottom = -hw;
        this.camera.left = -wh;
        this.camera.right = wh;

        // --- perspective camera
        // camera.aspect = w / h;

        this.camera.updateProjectionMatrix();
    }

    /** Index of current camera status */
    private status: number;
    private prevStatus: number;

    // angle is in radian, where value is n*PI/4
    private camData = ([
        { name: "SE", rad: 7, orientation: CameraOrientation.SE, absoluteDirections: [AbsDirection.NORTH, AbsDirection.EAST, AbsDirection.SOUTH, AbsDirection.WEST] },
        { name: "SW", rad: 5, orientation: CameraOrientation.SW, absoluteDirections: [AbsDirection.EAST, AbsDirection.SOUTH, AbsDirection.WEST, AbsDirection.NORTH] },
        { name: "NW", rad: 3, orientation: CameraOrientation.NW, absoluteDirections: [AbsDirection.SOUTH, AbsDirection.WEST, AbsDirection.NORTH, AbsDirection.EAST] },
        { name: "NE", rad: 1, orientation: CameraOrientation.NE, absoluteDirections: [AbsDirection.WEST, AbsDirection.NORTH, AbsDirection.EAST, AbsDirection.SOUTH] }
    ]);


    zoom(z: number) {
        if (z < 0.000001)
            z = 1.;
        this.camera.zoom = 1. / z;
    }

    setAngle(phi: number) {
        const x = Math.cos(phi) * SETTINGS.cameraRotationRadius;
        const y = Math.sin(phi) * SETTINGS.cameraRotationRadius;

        this.camera.position.x = x;
        this.camera.position.z = y;
        this.camera.lookAt(this.center);
    }

    setCenter(x: number, y: number) {
        this.center.x = x;
        this.center.z = y;
        this.camera.lookAt(this.center);
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

    }

    getAbsoluteDirection(evt: ControlEvent): AbsDirection {
        return this.camData[this.status].absoluteDirections[evt.direction];
    }

    private getInternalState(): CamRotDir<StructCamData> {
        return <CamRotDir<StructCamData>>{
            to: this.camData[this.status],
            from: this.camData[this.prevStatus],
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
