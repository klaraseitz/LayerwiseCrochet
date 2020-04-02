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
                graph: ForceGraph3D(),
                stitchDistances: {
                    'ch': 0,
                    'sc': 10,
                    'hdc': 20,
                    'dc': 30,
                    'tr': 40,
                    'dtr': 50,
                    'slst': 0
                },
                highlightNodes: [],
                highlightLink: null,
                isEdgeVisible: true
            }
        },
        methods: {
            refreshGraph() {
              this.graph.refresh();
            },
            setEdgeVisibility(isVisible) {
                this.isEdgeVisible = isVisible;
                if(!isVisible){
                    this.graph
                        .linkColor(link => 'rgba(0, 0, 0, 0)') // no links
                        .nodeThreeObject(node => this.getThreeObjectForNode(node, true))
                        .linkThreeObject(link => this.getThreeObjectForLink(link, true));
                }else{
                    // values for thin lines: alpha: 0.7, opacity: 1, width: 0
                    this.graph
                        .linkColor(link => this.calcColorOfLink(link, '0.7'))
                        .nodeThreeObject(node => this.getThreeObjectForNode(node, false))
                        .linkThreeObject(link => this.getThreeObjectForLink(link, false));
                }
                this.refreshGraph();
            },
            getThreeObjectForNode(node, isColored) {
                // all drawings are relative to the nodes' current coordinates
                if(node.type === "mr" || node.type === "ch"){
                    let color = this.getNodeColor(node, isColored);
                    return stitchPaths.draw(node.type, color).rotateX(1/2*Math.PI);
                }else{
                    return false;
                }
            },
            getThreeObjectForLink(link, isColored, fixedColor) {
                let color = fixedColor || this.getLinkColor(link, isColored);
                if(link.inserts){
                    let {source} = this.getNodesFromLink(link);
                    if(source && source.type){
                        return stitchPaths.draw(source.type, color);
                    }
                }else if(link.slipstitch){
                    return stitchPaths.draw("slst", color).rotateX(1/2*Math.PI);
                }
                return false;
            },
            getNodeColor(node, isColored) {
                let isCurrent = node.uuid === this.currentNode.uuid && node.uuid != null;
                let color = new THREE.Color( 0x000000 );
                if(isCurrent){
                    color = new THREE.Color( 0xe68a00 );
                }else if(isColored){
                    let isEven = node.layer % 2 === 0;
                    color = isEven ? new THREE.Color( 0xff0000 ) : new THREE.Color( 0x000000 );
                }
                return color;
            },
            getLinkColor(link, isColored) {
                let {source} = this.getNodesFromLink(link);
                let color = new THREE.Color( 0x000000 );
                if(link.inserts) {
                    let isCurrent = source.uuid === this.currentNode.uuid;
                    if (isCurrent) {
                        color = new THREE.Color(0xe68a00);
                    }
                }
                if(isColored){
                    let isEven = source.layer % 2 === 0;
                    color = isEven ? new THREE.Color( 0xff0000 ) : new THREE.Color( 0x000000 );
                }
                return color;

            },
            getNodesFromLink(link) {
                let source;
                let target;
                // get source/target of the link either by id or from link directly
                if(link.source.type != null && link.target.type != null){
                    // the link already refers to nodes in source and target
                    source = link.source;
                    target = link.target;
                }else{
                    // the link so far only has the uuids of the nodes
                    this.graph.graphData().nodes.find(node => {
                        if(node.uuid === link.source){
                            source = node
                        }
                        if(node.uuid === link.target){
                            target = node
                        }
                    });
                }
                return {
                    source,
                    target
                }
            },
            calcColorOfLink(link, alpha){
                let {source, target} = this.getNodesFromLink(link);
                let color = 'rgba(0, 0, 0, 0)'; // by default link is invisible
                if(source.layer === target.layer){
                    // link connects nodes of same layer, gets color of row
                    let isEven = source.layer%2 === 0;
                    color =  isEven ? "rgba(0, 0, 0, "+alpha+")" : "rgba(255, 0, 0, "+alpha+")";
                }else if(!link.inserts){
                    // link connects nodes of different layer, but is not an insert (previous link of ch at beginning of row)
                    color = "rgba(0, 0, 255, "+alpha+")";
                }
                return color;
            },
            addToScene(gltf) {
              this.graph.scene().add(gltf.scene);
            },
            highlightHoveredElements(){
                this.graph
                    .nodeColor(node => this.highlightNodes.indexOf(node) === -1 ? 'rgba(0,0,0,0)' : 'rgb(230,138,0,1)')
                    .linkColor(link => link === this.highlightLink && link.inserts ? 'rgb(230,138,0,1)' : this.calcColorOfLink(link,'0.7'));
            }
        },
        mounted() {
            let element = this.$refs.canvas3D;
            this.graph(element)
                //.graphData(gData)
                .numDimensions(3)
                .backgroundColor("#ffffff")
                .nodeId("uuid")
                //.d3Force('center', null)  // we don't want center force because otherwise all nodes will pull until all are balanced around center point
                .onNodeHover((node) => {
                    element.style.cursor = node ? 'pointer' : null;
                    if ((!node && !this.highlightNodes.length) || (this.highlightNodes.length === 1 && this.highlightNodes[0] === node)) return;

                    this.highlightNodes = node ? [node] : [];
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
                .onLinkHover((link) => {
                    element.style.cursor = link && link.inserts ? 'pointer' : null;

                    if (this.highlightLink === link || !link || !link.inserts) return;
                    this.highlightLink = link;
                    this.highlightNodes = link ? [link.source] : [];
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
                .onNodeDragEnd((node, translate) => {
                    // handle like a click when drag distance is minimal
                    if(translate.x <= 1 && translate.x >= -1 && translate.y <= 1 && translate.y >= -1 && translate.z <= 1 && translate.z >= -1){
                        this.handleNodeClick(node);
                    }
                })
                .nodeColor(node => 'rgba(0,0,0,0)')
                .nodeOpacity(0.5) // keep node visible for when node is highlighted on hover
                .nodeRelSize(5)
                .nodeThreeObjectExtend(true)
                .nodeThreeObject(node => this.getThreeObjectForNode(node, false))
                .linkOpacity(1)
                .linkWidth(0)
                .linkColor(link => this.calcColorOfLink(link, '0.7'))
                .linkThreeObjectExtend(true)
                .linkThreeObject(link => this.getThreeObjectForLink(link, false))
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