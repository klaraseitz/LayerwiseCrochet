<template>
    <div ref="canvas3D"></div>
</template>

<script >
    import * as THREE from 'three';
    import ForceGraph3D from '3d-force-graph';
    import {graphMixin} from "@/mixins/graphMixin";
    import CrochetPaths from "@/helper/crochetThreejsPaths";
    const stitchPaths = new CrochetPaths(0xff0000);
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
                name: 'GraphCanvas3D',
                graph: ForceGraph3D(),
            }
        },
        methods: {
          refreshGraph() {
              this.graph.refresh();
          }
        },
        mounted() {
            let element = this.$refs.canvas3D;
            this.graph(element)
                .graphData(gData)
                .numDimensions(3)
                .backgroundColor("#ffffff")
                //.d3Force('center', null)  // we don't want center force because otherwise all nodes will pull until all are balanced around center point
                .onNodeHover((node) => {
                    element.style.cursor = node ? 'pointer' : null;
                })
                .onNodeClick(node => {
                    this.handleNodeClick(node);
                    this.graph.refresh();
                })
                .onNodeRightClick(node => {
                    this.handleNodeRightClick(node);
                    this.graph.refresh();
                })
                .nodeOpacity(0)
                .nodeRelSize(5)
                .nodeThreeObjectExtend(true)
                .nodeThreeObject((node) => {
                    // all drawings are relative to the nodes' current coordinates
                    if(node.type === "mr" || node.type === "ch"){
                        let isCurrent = node.id === this.currentNode.id;
                        return stitchPaths.draw(node.type, isCurrent ? 0xe68a00 : 0x000000).rotateX(1/2*Math.PI);
                    }else{
                        return false;
                    }
                })
                .linkWidth(1)
                .linkColor(link => {
                    let source;
                    let target;
                    let color = 'rgba(0, 0, 0, 100)';
                    if(link.source.type != null){
                        source = link.source;
                        target = link.target;
                    }else{
                        let sourceNodeID = link.source;
                        let targetNodeID = link.target;
                        this.graph.graphData().nodes.find(node => {
                            if(node.id === sourceNodeID){
                                source = node
                            }
                            if(node.id === targetNodeID){
                                target = node
                            }
                        });
                    }
                    if(source.layer === target.layer){
                        let isEven = source.layer%2 === 0;
                        color =  isEven ? 'rgba(0, 108, 170, 100)' : 'rgba(200, 80, 0, 100)';
                    }else if(!link.inserts){
                        color = 'rgba(34, 139, 34, 100)';
                    }
                    return color;
                })
                .linkThreeObjectExtend(true)
                .linkThreeObject(link => {
                    if(link.inserts){
                        let source;
                        if(link.source.type){
                            source = link.source;
                        }else{
                            let nodeID = link.source;
                            source = this.graph.graphData().nodes.find(node => {
                                return node.id === nodeID
                            });
                        }
                        if(source && source.type){
                            let isCurrent = source.id === this.currentNode.id;
                            return stitchPaths.draw(source.type, isCurrent ? 0xe68a00 : 0x000000);
                        }
                    }else if(link.slipstitch){
                        return stitchPaths.draw("slst").rotateX(1/2*Math.PI);
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
                    let startCenterMiddlePoint = {
                        "x": (startPoint.x +  centerPoint.x) / 2,
                        "y": (startPoint.y +  centerPoint.y) / 2,
                        "z": (startPoint.z +  centerPoint.z) / 2,
                    };
                    if(link.slipstitch){
                        position = centerPoint;
                    }else{
                        position = startCenterMiddlePoint;
                        // change up vector to decide the spin of the object after the rotate of LookAt
                        // Object.assign(linkObject.up, new THREE.Vector3(0,1,0));
                        let targetVec = new THREE.Vector3(link.target.x, link.target.y, link.target.z);
                        let sourceVec = new THREE.Vector3(link.source.x, link.source.y, link.source.z);
                        let isIncreaseStitch = link.source.isIncrease;
                        linkObject.lookAt(isIncreaseStitch ? targetVec : sourceVec); // rotates objects' z-axis to face a point(dont normalize that point or it flickers)
                    }

                    Object.assign(linkObject.position, position);
                });
        }
    }
</script>