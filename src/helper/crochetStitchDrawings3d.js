import * as THREE from 'three';
import Vector from '@/helper/vector';

export default class CrochetStitchDrawings3d {
    constructor(color) {
        this.color = color || 0x000000;
    }

    draw(stitch, color){
        this.color = color || 0x000000;

        let isLocal = true;
        if(!isLocal) {
            if (stitch === 'slst') {
                let geometry = new THREE.SphereGeometry(2, 16, 16);
                let material = new THREE.MeshBasicMaterial({color: this.color});
                return new THREE.Mesh(geometry, material);
            } else {
                return this.createSphereWithTexture('/imgs/' + stitch + '.svg')
            }
        }else {
            switch (stitch) {
                case 'slst':
                    let geometry = new THREE.SphereGeometry(2, 16, 16);
                    let material = new THREE.MeshBasicMaterial({color: this.color});
                    return new THREE.Mesh(geometry, material);
                case 'sc':
                    return this.createSphereWithTexture(
                        `https://raw.githubusercontent.com/klaraseitz/icons/master/128px/in%20white/minified/sc.svg?token=AC3Q2AQVPDANWRVF4OLSXB26UKUQA`
                    );
                case 'mr':
                    return this.createSphereWithTexture(
                        `https://raw.githubusercontent.com/klaraseitz/icons/master/128px/in%20white/minified/mr.svg?token=AC3Q2ATSMEXRETGTT55KL2C6UKUP2`
                    );
                case 'ch':
                    return this.createSphereWithTexture(
                        `https://raw.githubusercontent.com/klaraseitz/icons/master/128px/in%20white/minified/ch.svg?token=AC3Q2AUB6C5Y4R25BSY3DE26UKUO6`
                    );
                case 'hdc':
                    return this.createSphereWithTexture(
                        `https://raw.githubusercontent.com/klaraseitz/icons/master/128px/in%20white/minified/hdc.svg?token=AC3Q2AVRRLTDREASSP73QEC6UKUPO`
                    );
                case 'dc':
                    return this.createSphereWithTexture(
                        `https://raw.githubusercontent.com/klaraseitz/icons/master/128px/in%20white/minified/dc.svg?token=AC3Q2AQLFP7IGC32NOXON3C6UKUPE`
                    );
                case 'tr':
                    return this.createSphereWithTexture(
                        `https://raw.githubusercontent.com/klaraseitz/icons/master/128px/in%20white/minified/trc.svg?token=AC3Q2ARITTBGBJFNQARH7HC6UKUQK`
                    );
                case 'dtr':
                    return this.createSphereWithTexture(
                        `https://raw.githubusercontent.com/klaraseitz/icons/master/128px/in%20white/minified/dtr.svg?token=AC3Q2AX3P5X7JAKV7334KES6UKUPK`
                    );
                case 'hole':
                    return this.createSphereWithTexture(
                        `https://raw.githubusercontent.com/klaraseitz/icons/master/128px/in%20white/minified/hole.svg?token=AC3Q2ASY3TRCQU436KSUJ5S6UKUPU`
                    );
                default:
                    return false;
            }
        }
    }

    createSphereWithTexture(textureUrl) {
        // use a sphere as a drag handle
        const obj = new THREE.Mesh(
            new THREE.SphereGeometry(7),
            new THREE.MeshBasicMaterial({ depthWrite: false, transparent: true, opacity: 0})
        );

        // add img sprite as child
        const imgTexture = new THREE.TextureLoader().load(textureUrl);
        const material = new THREE.SpriteMaterial({
            map: imgTexture,
            depthFunc: THREE.NotEqualDepth,
            color: this.color
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(15, 15, 15);
        obj.add(sprite);

        return obj;
    }
}