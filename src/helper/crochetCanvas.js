export default class CrochetCanvas {
    draw(stitch, ctx, x, y){
        ctx.beginPath();
        switch(stitch) {
            case 'Slipstitch':
                this.drawSlipstitch(ctx, x, y);
                break;
            case 'Single Crochet':
                this.drawSingleCrochet(ctx, x, y);
                break;
            case 'Magic Ring':
                this.drawMagicRing(ctx, x, y);
                break;
            case 'Chain Stitch':
                this.drawChainStitch(ctx, x, y);
                break;
            case 'Half Double Crochet':
                this.drawHalfDoubleCrochet(ctx, x, y);
                break;
            case 'Double Crochet':
                this.drawDoubleCrochet(ctx, x, y);
                break;
            case 'Treble Crochet':
                this.drawTrebleCrochet(ctx, x, y);
                break;
            case 'Double Treble Crochet':
                this.drawDoubleTrebleCrochet(ctx, x, y);
                break;
        }
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