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
        methods: {
            refreshGraph() {
                // do nothing. the 2D library doesnt support this function
            },
            setCameraPosition() {
                // do nothing. the 2D library doesnt support this function
            },
            getCanvasObjectForNode(node, ctx) {
                // all drawings are relative to the nodes' current coordinates
                if(node.type === "mr" || node.type === "ch" || node.type === "hole"){
                    let color = this.getStitchColor(node);
                    return stitchCanvas.draw(node.type, ctx, node.x, node.y, color);
                }else{
                    return false;
                }
            }
        },
        mounted() {
            let element = this.$refs.canvas2D;
            this.graph(element)
// *** Data Input ***
                //.graphData(gData)
                .nodeId("uuid")
// *** Node Styling ***
                .nodeRelSize(5)
                .nodeColor(() => 'transparent')
                .nodeCanvasObjectMode(() => 'before')
                .nodeCanvasObject((node, ctx) => this.getCanvasObjectForNode(node, ctx))
// *** Link Styling ***
                .linkWidth(0)
                .linkColor(link => this.getLineColor(link))
                .linkCanvasObjectMode(() => 'before')
                .linkCanvasObject((link, ctx) =>{
                    // Calculate Angle and Center point for placement
                    let n1Vec = new Vector(link.source.x, link.source.y, 0);
                    let n2Vec = new Vector(link.target.x, link.target.y, 0);
                    let linkVec = n1Vec.subtract(n2Vec).unit();
                    let perpendicularVec = new Vector(0, 1, 0);

                    let angle = perpendicularVec.unitAngleTo(linkVec);
                    let sourceX = link.source.x;
                    let sourceY = link.source.y;
                    let middleX = (sourceX + link.target.x)/2;
                    let middleY = (sourceY + link.target.y)/2;
                    let x = (sourceX + middleX) / 2;
                    let y = (sourceY + middleY) / 2;

                    let color = this.getStitchColor(link.source);

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
                        stitchCanvas.draw(link.source.type, ctx, x, y, color);
                        ctx.restore();
                    }else if(link.slipstitch){
                        stitchCanvas.draw("slst", ctx, middleX, middleY, color);
                    }
                })
// *** Interaction ***
                .onNodeHover((node) => {
                    element.style.cursor = node ? 'pointer' : null;
                    if(this.highlightAny) {this.handleNodeHover(node)}
                })
                .onNodeClick(node => {
                    this.handleNodeClick(node)})
                .onNodeRightClick(node => {
                    this.handleNodeRightClick(node);
                })
                .onNodeDragEnd((node, translate) => {
                    // handle like a click when drag distance is minimal
                    if(translate.x <= 1 && translate.x >= -1 && translate.y <= 1 && translate.y >= -1){
                        this.highlightAny ? this.handleNodeClick(node) : this.handleNodeClickToSelect(node);
                    }
                })
                .onLinkHover((link) => {
                    element.style.cursor = link && link.inserts ? 'pointer' : null;
                    if(this.highlightAny) {this.handleLinkHover(link)}
                })
                .onLinkClick(link => {
                    if(link.inserts){
                        this.handleNodeClick(link.source);
                    }
                })
                .onLinkRightClick(link => {
                    if(link.inserts){
                        this.handleNodeRightClick(link.source);
                    }
                })
// *** Force Engine Configuration ***
                .d3Force('link')
                .distance(link => link.inserts || link.slipstitch ? this.stitchDistances[link.source.type] : 10);


            if(localStorage.graphJson){
                this.setGraphFromJson(localStorage.graphJson);
            }
        }
    }
</script>