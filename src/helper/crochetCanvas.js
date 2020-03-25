export default class CrochetCanvas {
    draw(stitch, ctx, x, y, color){
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.strokeStyle = color;

        switch(stitch) {
            case 'slst':
                this.drawSlipstitch(ctx, x, y);
                break;
            case 'sc':
                this.drawSingleCrochet(ctx, x, y);
                break;
            case 'mr':
                this.drawMagicRing(ctx, x, y);
                break;
            case 'ch':
                this.drawChainStitch(ctx, x, y);
                break;
            case 'hdc':
                this.drawHalfDoubleCrochet(ctx, x, y);
                break;
            case 'dc':
                this.drawDoubleCrochet(ctx, x, y);
                break;
            case 'tr':
                this.drawTrebleCrochet(ctx, x, y);
                break;
            case 'dtr':
                this.drawDoubleTrebleCrochet(ctx, x, y);
                break;
        }
        ctx.closePath();
    }

    drawMagicRing(ctx, x, y) {
        let radius = 0;
        let angle = 0;
        ctx.moveTo(x,y);
        for (let n = 0; n < 40; n++) {
            radius += 0.2;
            // make a complete circle every 50 iterations
            angle += (Math.PI * 2) / 20;
            let newX = x + radius * Math.cos(angle);
            let newY = y + radius * Math.sin(angle);
            ctx.lineTo(newX, newY);
        }

        ctx.stroke();
    }

    drawChainStitch(ctx, x, y) {
        ctx.save(); ctx.scale(1.3, 1); // save() saves settings before scaling
        ctx.arc(x/1.3, y, 5, 0, 2 * Math.PI, false); ctx.stroke(); // drawing circle, normalizing scaled x coordinate
        ctx.closePath(); ctx.restore(); // restores settings from last save (next drawings are unaffected by scaling)
    }

    drawSlipstitch(ctx, x, y) {
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
    }

    drawSingleCrochet(ctx, x, y) {
        ctx.moveTo(x-10, y); ctx.lineTo(x + 10, y ); ctx.moveTo(x, y-10); ctx.lineTo(x, y+10);
        ctx.stroke();
    }

    tShape(ctx, x, y) {
        ctx.moveTo(x, y-15); ctx.lineTo(x, y+15 ); ctx.moveTo(x - 10, y-15); ctx.lineTo(x +10, y-15);
    }

    drawHalfDoubleCrochet(ctx, x, y){ // T-Shape
        this.tShape(ctx, x, y);
        ctx.stroke();
    }

    drawDoubleCrochet(ctx, x, y) {
        this.tShape(ctx, x, y);
        ctx.moveTo(x-5, y+5); ctx.lineTo(x+5, y-5 ); // middle slash
        ctx.stroke();
    }

    drawTrebleCrochet(ctx, x, y) {
        this.tShape(ctx, x, y);
        ctx.moveTo(x-5, y); ctx.lineTo(x+5, y-10 ); // top slash
        ctx.moveTo(x-5, y+10); ctx.lineTo(x+5, y ); // bottom slash
        ctx.stroke();
    }

    drawDoubleTrebleCrochet(ctx, x, y) {
        this.tShape(ctx, x, y);
        ctx.moveTo(x-5, y); ctx.lineTo(x+5, y-10 ); // top slash
        ctx.moveTo(x-5, y+5); ctx.lineTo(x+5, y-5 ); // middle slash
        ctx.moveTo(x-5, y+10); ctx.lineTo(x+5, y ); // bottom slash
        ctx.stroke();
    }
}