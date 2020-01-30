import * as THREE from 'three';

export default class CrochetPaths {

        constructor(color) {
            this.material = new THREE.LineBasicMaterial({
                color: color | 0x000000
            });
        }

        draw(stitch){
        let x = 0;
        let y = 0;
        switch(stitch) {
            case 'Slipstitch':
                return this.drawSlipstitch(x, y);
            case 'Single Crochet':
                return this.drawSingleCrochet(x, y);
            case 'Magic Ring':
                return this.drawMagicRing(x, y);
            case 'Chain Stitch':
                return this.drawChainStitch(x, y);
            case 'Half Double Crochet':
                return this.drawHalfDoubleCrochet(x, y);
            case 'Double Crochet':
                return this.drawDoubleCrochet(x, y);
            case 'Treble Crochet':
                return this.drawTrebleCrochet(x, y);
            case 'Double Treble Crochet':
                return this.drawDoubleTrebleCrochet(x, y);
            default:
                return false;
        }
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
        return new THREE.Line( geometry, this.material );
    }

    drawChainStitch(x, y) {
        let path = new THREE.Path();

        path.absellipse(x, y, 4, 2, 0, 2*Math.PI, null, null);
        let points = path.getPoints();
        let geometry = new THREE.BufferGeometry().setFromPoints( points );

        return new THREE.Line( geometry, this.material );
    }

    drawCone(){
        let geometry = new THREE.ConeBufferGeometry( 5, 20, 32 );
        let material = new THREE.MeshBasicMaterial( {color: 0x0000ff} );
        return new THREE.Mesh( geometry, material );
    }

    drawSlipstitch(x, y) {
        let path = new THREE.Path();
        path.absarc(x, y, 1, 0, 2*Math.PI, null);
        let points = path.getPoints();
        let geometryLine = new THREE.BufferGeometry().setFromPoints( points );
        let circleLine = new THREE.Line( geometryLine, this.material );

        // this draws a filled circle (what I'd like) But only one side is drawn.
        // Therefore I keep the circle made out of lines.
        let geometryCircle = new THREE.CircleBufferGeometry( 1, 16 );
        let material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
        let circle = new THREE.Mesh( geometryCircle, material );

        let group = new THREE.Group();
        group.add(circleLine, circle);
        return group;
    }

    createLine(vec1, vec2) {
        let geometry = new THREE.Geometry();
        geometry.vertices.push(
            vec1,
            vec2
        );
        return new THREE.Line( geometry, this.material );
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