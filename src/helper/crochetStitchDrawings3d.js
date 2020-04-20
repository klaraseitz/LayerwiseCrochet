import * as THREE from 'three';

export default class CrochetStitchDrawings3d {
    constructor(color) {
        this.color = color || 0x000000;
    }

    draw(stitch, color){
        this.color = color || 0x000000;

        if (stitch === 'slst') {
            let geometry = new THREE.SphereGeometry(2, 16, 16);
            let material = new THREE.MeshBasicMaterial({color: this.color});
            return new THREE.Mesh(geometry, material);
        } else {
            return this.createSphereWithTexture('./imgs/' + stitch + '.svg')
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