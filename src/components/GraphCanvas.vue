<template>
    <div ref="canvas"></div>
</template>

<script >
    import * as THREE from 'three';
    import ForceGraph3D from '3d-force-graph';
    import CrochetPaths from "@/helper/crochetThreejsPaths";
    import {graphMixin} from "@/mixins/graphMixin";
    const stitchPaths = new CrochetPaths();
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
                name: 'GraphCanvas',
                graph: ForceGraph3D(),
            }
        },
        mounted() {
            let element = this.$refs.canvas;
            this.graph(element)
                .graphData(gData)
                .numDimensions(3)
                .backgroundColor("#ffffff")
                //.d3Force('center', null)  // we don't want center force because otherwise all nodes will pull until all are balanced around center point
                .onNodeHover((node) => {
                    element.style.cursor = node ? 'pointer' : null;
                })
                .onNodeClick(node => {
                    this.handleNodeClick(node)})
                .nodeOpacity(0)
                .nodeRelSize(5)
                .nodeThreeObjectExtend(true)
                .nodeThreeObject((node) => {
                    // all drawings are relative to the nodes' current coordinates
                    if(node.type === "Magic Ring" || node.type === "Chain Stitch"){
                        return stitchPaths.draw(node.type).rotateX(1/2*Math.PI);
                    }else{
                        return false;
                    }
                })
                .linkWidth(1)
                .linkColor(() => 'rgba(0, 0, 0, 100)')
                .linkThreeObjectExtend(true)
                .linkThreeObject(link => {
                    if(link.inserts){
                        let nodeID = link.source;
                        let source = this.graph.graphData().nodes.find(node => {
                            return node.id === nodeID
                        });
                        if(source && source.type){
                            return stitchPaths.draw(source.type);
                        }
                    }else if(link.Slipstitch){
                        return stitchPaths.draw("Slipstitch").rotateX(1/2*Math.PI);
                    }
                    return false;
                })
                .linkPositionUpdate((linkObject, { start, end }, link) => {
                    if(!linkObject){
                        return true;
                    }

                    let position;
                    let centerPoint = Object.assign(...['x', 'y', 'z'].map(c => ({
                        [c]: start[c] + (end[c] - start[c]) / 2 // calc middle point
                    })));
                    let startPoint = {
                        "x": start.x,
                        "y": start.y,
                        "z": start.z,
                    };
                    if(link.Slipstitch){
                        position = centerPoint;
                    }else{
                        position = startPoint;
                        // change up vector to decide the spin of the object after the rotate of LookAt
                        // Object.assign(linkObject.up, new THREE.Vector3(0,1,0));
                        let targetVec = new THREE.Vector3(link.target.x, link.target.y, link.target.z);
                        linkObject.lookAt(targetVec); // rotates objects' z-axis to face a point(dont normalize that point or it flickers)
                    }

                    Object.assign(linkObject.position, position);
                });
        }
    }
</script>