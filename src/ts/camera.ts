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
import {CameraDirection, ControlEvent} from './input';

export enum AbsoluteDirection {
    NORTH, EAST, SOUTH, WEST
}

export enum CameraOrientation {
    SOUTH_EAST, SOUTH_WEST, NORTH_WEST, NORTH_EAST
}

/** ------------------------------------------------------------------------
 * Camera wrapper
 * ------------------------------------------------------------------------- */
export class CameraModel {
    public camera: THREE.OrthographicCamera;

    private center: THREE.Vector3;
    private status: CameraOrientation;

    // angle is in radian, where value is n*PI/4
    private cameraOrientations =  [
        {
            rad: 1,
            orientation: CameraOrientation.SOUTH_EAST,
            absoluteDirections: [
                AbsoluteDirection.NORTH, AbsoluteDirection.EAST,
                AbsoluteDirection.SOUTH, AbsoluteDirection.WEST
            ]
        },
        {
            rad: 3,
            orientation: CameraOrientation.SOUTH_WEST,
            absoluteDirections: [
                AbsoluteDirection.EAST, AbsoluteDirection.SOUTH,
                AbsoluteDirection.WEST, AbsoluteDirection.NORTH]
        },
        {
            rad: 5,
            orientation: CameraOrientation.NORTH_WEST,
            absoluteDirections: [
                AbsoluteDirection.SOUTH, AbsoluteDirection.WEST,
                AbsoluteDirection.NORTH, AbsoluteDirection.EAST
            ]
        },
        {
            rad: 7,
            orientation: CameraOrientation.NORTH_EAST,
            absoluteDirections: [
                AbsoluteDirection.WEST, AbsoluteDirection.NORTH,
                AbsoluteDirection.EAST, AbsoluteDirection.SOUTH
            ]
        }
    ];

    constructor(){
        this.status = CameraOrientation.SOUTH_EAST;

        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 100);
        this.camera.position.set(5, 5, 5);

        this.center = new THREE.Vector3(0, 0, 0);
        this.camera.lookAt(this.center);

        this.setZoom(SETTINGS.zoom.initial);
    }

    updateCamera(w: number, h: number): void {
        let wh: number;
        let hw: number;

        if(w > h){
            hw = h / w;
            wh = 1;
        }
        else {
            hw = 1;
            wh = w / h;
        }

        let camera = this.camera;
        camera.top = hw;
        camera.bottom = -hw;
        camera.left = -wh;
        camera.right = wh;
        camera.updateProjectionMatrix();
    }

    setZoom(z: number): void {
        if (z < 0.000001){
            z = 1.;
        }

        this.camera.zoom = 1. / z;
        this.camera.updateProjectionMatrix();
    }

    getZoom(): number {
        return 1. / this.camera.zoom;
    }

    setViewAngle(phi: number) {
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

    rotate(d: CameraDirection): void {
        d === CameraDirection.CW ? this.status-- : this.status++;
        if(this.status > CameraOrientation.NORTH_EAST){
            this.status = CameraOrientation.SOUTH_EAST;
        }
        else if (this.status < CameraOrientation.SOUTH_EAST){
            this.status = CameraOrientation.NORTH_EAST;
        }
    }

    getAngle(): number {
        return this.cameraOrientations[this.status].rad * Math.PI / 4;
    }

    toAbsoluteDirection(e: ControlEvent): AbsoluteDirection {
        return this.cameraOrientations[this.status].absoluteDirections[e.direction];
    }
}

export let cameraModel = new CameraModel();
