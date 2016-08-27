/**
 * Common palette provider
 */

/// <reference path="../../typings/index.d.ts" />

import * as THREE from 'three';


class Palette {
    protected materials: Array<THREE.Material> = new Array<THREE.Material>();

    constructor() {
        // ... 
    }

    protected newMaterial(color: number): THREE.Material {
        let material = new THREE.MeshLambertMaterial();
        material.color = new THREE.Color(color);

        return material;
    }
}

interface PaletteEntry {
    color: number
};

export enum avatarColor {
    WHITE,
    YELLOW,
    RED,
    ORANGE,
    BLUE,
    GREEN
}


/** Build up materials for the avatar*/

class AvatarPalette extends Palette {

    private avatarColors = {
        WHITE: { color: 0xffffff },
        YELLOW: { color: 0xffff00 },
        RED: { color: 0xff0000 },
        ORANGE: { color: 0xffa500 },
        BLUE: { color: 0x0000ff },
        GREEN: { color: 0x00ff00 }
    }

    constructor() {
        super()

        let p: PaletteEntry;
        for (let k in this.avatarColors) {
            p = this.avatarColors[k];

            let material_ = this.newMaterial(p.color);
            material_.name = "material_" + k;
            this.materials.push(material_);
            
            // (in that case if we wish to have different ground texture for each
            // we'd most likely to generate diffuse maps, and assingn them too (e.g. color blind mode))
        }

    }

    getMaterial(id: number): THREE.Material {
        if (id >= this.materials.length)
            throw "overaddress"
        else
            return this.materials[id];
    }
}

export let avatarPalette = new AvatarPalette();

