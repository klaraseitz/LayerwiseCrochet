<template>
    <div ref="canvas3D"></div>
</template>

<script >
    import * as THREE from 'three';
    import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
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
                graph: ForceGraph3D({controlType: 'orbit'})
            }
        },
        methods: {
            refreshGraph() {
              this.graph.refresh();
            },
            getThreeObjectForNode(node) {
                // all drawings are relative to the nodes' current coordinates
                if(node.type === "mr" || node.type === "ch"){
                    let color = this.getStitchColor(node);
                    return stitchPaths.draw(node.type, color).rotateX(1/2*Math.PI);
                }else{
                    return false;
                }
            },
            getThreeObjectForLink(link) {
                let {source} = this.getNodesFromLink(link);
                let color = this.getStitchColor(source);
                if(link.inserts){
                    if(source && source.type){
                        return stitchPaths.draw(source.type, color);
                    }
                }else if(link.slipstitch){
                    return stitchPaths.draw("slst", color).rotateX(1/2*Math.PI);
                }
                return false;
            },
            addToScene(gltf) {
              this.graph.scene().add(gltf.scene);
            }
        },
        mounted() {
            let element = this.$refs.canvas3D;
            this.graph(element)
// *** Data Input ***
                //.graphData(gData)
                .nodeId("uuid")
// *** Container Layout ***
                .backgroundColor("#ffffff")
// *** Node Styling ***
                .nodeRelSize(5)
                .nodeColor(node => 'rgba(0,0,0,0)')
                .nodeOpacity(0.5) // keep node visible for when node is highlighted on hover
                .nodeThreeObjectExtend(true)
                .nodeThreeObject(node => this.getThreeObjectForNode(node))
// *** Link Styling ***
                .linkOpacity(1)
                .linkWidth(0)
                .linkColor(link => this.getLineColor(link))
                .linkThreeObjectExtend(true)
                .linkThreeObject(link => this.getThreeObjectForLink(link))
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
                })
// *** Interaction ***
                .onNodeHover((node) => {
                    element.style.cursor = node ? 'pointer' : null;
                    this.highlightedNode = node ? node : null;
                    this.highlightedLink = null;
                    this.highlightHoveredElements();
                })
                .onNodeClick(node => {
                    this.handleNodeClick(node);
                    this.graph.refresh();
                })
                .onNodeRightClick(node => {
                    this.handleNodeRightClick(node);
                    this.graph.refresh();
                })
                .onNodeDragEnd((node, translate) => {
                    // handle like a click when drag distance is minimal
                    if(translate.x <= 1 && translate.x >= -1 && translate.y <= 1 && translate.y >= -1 && translate.z <= 1 && translate.z >= -1){
                        this.handleNodeClick(node);
                    }
                })
                .onLinkHover((link) => {
                    element.style.cursor = link && link.inserts ? 'pointer' : null;
                    if(link && link.inserts){
                        this.highlightedLink = link;
                        this.highlightedNode = link.source;
                    }else{
                        this.highlightedLink = null;
                        this.highlightedNode = null;
                    }
                    this.highlightHoveredElements();
                })
                .onLinkClick(link => {
                    if(link.inserts){
                        this.handleNodeClick(link.source);
                        this.graph.refresh();
                    }
                })
                .onLinkRightClick(link => {
                    if(link.inserts){
                        this.handleNodeRightClick(link.source);
                        this.graph.refresh();
                    }
                })
// *** Force Engine Configuration ***
                .numDimensions(3)
                //.d3Force('center', null)  // we don't want center force because otherwise all nodes will pull until all are balanced around center point
                .d3Force('link')
                .distance(link => link.inserts || link.slipstitch ? this.stitchDistances[link.source.type] : 10);
            
            if(localStorage.graphJson){
                this.setGraphFromJson(localStorage.graphJson);
            }

            // use this to add a 3D model to the scene. I couldnt get a local path to load the model yet.
            /*loader.load( "https://threejsfundamentals.org/threejs/resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf",
                this.addToScene, undefined,
                function ( error ) {
                    console.error( error );
                }
            );*/
        }
    }
</script>