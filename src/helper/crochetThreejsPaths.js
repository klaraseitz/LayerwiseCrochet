import * as THREE from 'three';

export default class CrochetPaths {
        constructor(color) {
            this.color = color | 0x000000;
        }

        draw(stitch, color){
            this.color = color | 0x000000;
            let x = 0;
            let y = 0;
            switch(stitch) {
                case 'slst':
                    return this.drawSlipstitch(x, y);
                case 'sc':
                    return this.drawSingleCrochet(x, y);
                case 'mr':
                    return this.drawMagicRing(x, y);
                case 'ch':
                    return this.drawChainStitch(x, y);
                case 'hdc':
                    return this.drawHalfDoubleCrochet(x, y);
                case 'dc':
                    return this.drawDoubleCrochet(x, y);
                case 'tc':
                    return this.drawTrebleCrochet(x, y);
                case 'dtr':
                    return this.drawDoubleTrebleCrochet(x, y);
                default:
                    return false;
        }
    }

    lineMaterial() {
            return new THREE.LineBasicMaterial({
                color: this.color
            });
    }

   meshMaterial() {
        return new THREE.MeshBasicMaterial({
            color: this.color
        });
    }

    drawMagicRing(x, y) {
        let path = new THREE.Path();
        let radius = 0;
        let angle = 0;
        path.moveTo(x,y);
        for (let n = 0; n < 40; n++) {
            radius += 0.2;
            // make a complete circle every 50 iterations
            angle += (Math.PI * 2) / 20;
            let newX = x + radius * Math.cos(angle);
            let newY = y + radius * Math.sin(angle);
            path.lineTo(newX, newY);
        }
        let points = path.getPoints();
        let geometry = new THREE.BufferGeometry().setFromPoints( points );
        return new THREE.Line( geometry.rotateX(90), this.lineMaterial() );
    }

    drawChainStitch(x, y) {
        let path = new THREE.Path();

        path.absellipse(x, y, 4, 2, 0, 2*Math.PI, null, null);
        let points = path.getPoints();
        let geometry = new THREE.BufferGeometry().setFromPoints( points );

        return new THREE.Line( geometry, this.lineMaterial() );
    }

    drawSlipstitch(x, y) {
        // this draws a filled circle (what I'd like) But only one side is drawn.
        // Therefore I draw the same circle again just the other way around, then that side also gets filled.
        let geometryCircle1 = new THREE.CircleBufferGeometry( 1, 16 );
        let geometryCircle2 = new THREE.CircleBufferGeometry( 1, 16, 0, -2*Math.PI );
        let circleSide1 = new THREE.Mesh( geometryCircle1, this.meshMaterial() );
        let circleSide2 = new THREE.Mesh( geometryCircle2, this.meshMaterial() );

        let group = new THREE.Group();
        group.add(circleSide1, circleSide2);
        return group;
    }

    createLine(vec1, vec2) {
        let geometry = new THREE.Geometry();
        geometry.vertices.push(
            vec1,
            vec2
        );
        return new THREE.Line( geometry, this.lineMaterial() );
    }

    drawSingleCrochet(x, y) {
        let group = new THREE.Group();

        let line1 = this.createLine(new THREE.Vector3( x-10, 0, y ),
            new THREE.Vector3( x+10, 0, y ));
        let line2 = this.createLine(new THREE.Vector3( x, 0, y-10 ),
            new THREE.Vector3( x, 0, y+10 ));
        group.add( line1, line2 );
        return group;
    }

    tShape(group, x, y) {
        let line1 = this.createLine(new THREE.Vector3( x, 0, y-15 ),
            new THREE.Vector3( x, 0, y+15 ));
        let line2 = this.createLine(new THREE.Vector3( x-10, 0, y-15 ),
            new THREE.Vector3( x+10, 0, y-15 ));
        group.add(line1, line2);
    }

    drawHalfDoubleCrochet(x, y){
        let group = new THREE.Group();
        this.tShape(group, x, y);
        return group;
    }

    drawDoubleCrochet(x, y) {
        let group = new THREE.Group();
        this.tShape(group, x, y);
        let middleSlash = this.createLine(new THREE.Vector3( x-5, 0, y+5 ),
            new THREE.Vector3( x+5, 0, y-5 ));
        group.add(middleSlash);
        return group;
    }

    drawTrebleCrochet(x, y) {
        let group = new THREE.Group();
        this.tShape(group, x, y);
        let topSlash = this.createLine(new THREE.Vector3( x-5, 0, y ),
            new THREE.Vector3( x+5, 0, y-10 ));
        let bottomSlash = this.createLine(new THREE.Vector3( x-5, 0, y+10 ),
            new THREE.Vector3( x+5, 0, y ));
        group.add(topSlash, bottomSlash);
        return group;
    }

    drawDoubleTrebleCrochet(x, y) {
        let group = new THREE.Group();

        this.tShape(group, x, y);

        let topSlash = this.createLine(new THREE.Vector3( x-5, 0, y ),
            new THREE.Vector3( x+5, 0, y-10 ));
        let middleSlash = this.createLine(new THREE.Vector3( x-5, 0, y+5 ),
            new THREE.Vector3( x+5, 0, y-5 ));
        let bottomSlash = this.createLine(new THREE.Vector3( x-5, 0, y+10 ),
            new THREE.Vector3( x+5, 0, y ));

        group.add(topSlash, middleSlash, bottomSlash);
        return group;
    }
}