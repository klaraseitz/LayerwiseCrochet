<template>
    <div ref="canvas2D"></div>
</template>

<script >
    import ForceGraph from 'force-graph';
    import {graphMixin} from "@/mixins/graphMixin";
    import Vector from '@/helper/vector';
    import CrochetCanvas from "@/helper/crochetCanvas";
    const stitchCanvas = new CrochetCanvas();
    const N = 2;
    const gData = {
        nodes: [...Array(N).keys()].map(i => ({ id: i })),
        links: [...Array(N).keys()]
            .filter(id => id)
            .map(id => ({
                source: id,
                target: Math.round(Math.random() * (id-1))
            }))
    };

    export default {
        mixins: [graphMixin],
        data() {
            return {
                name: 'GraphCanvas2D',
                graph: ForceGraph(),
            }
        },
        mounted() {
            let element = this.$refs.canvas2D;
            this.graph(element)
                .graphData(gData)
                .onNodeHover((node) => {
                    element.style.cursor = node ? 'pointer' : null;
                })
                .onNodeClick(node => {
                    this.handleNodeClick(node)})
                .nodeColor(node => {
                    if(node.layer%2 == 0){
                        return 'red'
                    }else{
                        return 'black'
                    }
                })
                .nodeCanvasObject((node, ctx) => {
                    if(node.type == "Magic Ring" || node.type == "Chain Stitch"){
                        let isCurrent = node.id === this.currentNode;
                        stitchCanvas.draw(node.type, ctx, node.x, node.y, isCurrent ? '#e68a00' : '#000000');
                    }
                })
                .linkWidth(1)
                .linkColor(link => {
                    let color = 'rgba(0, 0, 0, 100)';
                    let source = link.source;
                    let target = link.target;
                    if(source.layer === target.layer){
                        let isEven = source.layer%2 === 0;
                        color =  isEven ? 'rgba(0, 108, 170, 100)' : 'rgba(200, 80, 0, 100)';
                    }
                    return color;
                })
                .linkCanvasObjectMode(() => 'after')
                .linkCanvasObject((link, ctx) =>{
                    // Calculate Angle and Center point for placement
                    let n1Vec = new Vector(link.source.x, link.source.y, link.source.z);
                    let n2Vec = new Vector(link.target.x, link.target.y, link.target.z);
                    let linkVec = n1Vec.subtract(n2Vec).unit();
                    let perpendicularVec = new Vector(0, 1, 0);

                    let angle = perpendicularVec.unitAngleTo(linkVec);
                    let sourceX = link.source.x;
                    let sourceY = link.source.y;
                    let middleX = (sourceX + link.target.x)/2;
                    let middleY = (sourceY + link.target.y)/2;
                    let x = (sourceX + middleX) / 2;
                    let y = (sourceY + middleY) / 2;

                    // Draw on html5 canvas if the edge is of type insert
                    if(link.inserts){
                        ctx.save();
                        ctx.translate(x, y); //translate to center of shape
                        if(linkVec.x < 0){
                            ctx.rotate(Math.PI + angle);
                        }else{
                            ctx.rotate(Math.PI -angle);
                        }
                        if(!link.source.isIncrease){
                            ctx.rotate(Math.PI);
                        }
                        ctx.translate(-x, -y);
                        let isCurrent = link.source.id === this.currentNode;
                        stitchCanvas.draw(link.source.type, ctx, x, y, isCurrent ? '#e68a00' : '#000000');
                        ctx.restore();
                    }else if(link.slipstitch){
                        stitchCanvas.draw("Slipstitch", ctx, middleX, middleY, '#000000');
                    }
                })
        }
    }
</script>