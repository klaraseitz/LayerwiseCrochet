<template>
    <div>
        <v-tooltip right>
            <template v-slot:activator="{ on }">
                <v-btn
                        color="indigo" dark fab
                        outlined elevation="24" fixed left
                        @click="centerView" v-on="on"
                >
                    <v-icon>mdi-cube-scan</v-icon>
                </v-btn>
            </template>
            <span>{{$t('tooltips.center_view')}}</span>
        </v-tooltip>

        <v-tooltip right>
            <template v-slot:activator="{ on }">
                <v-btn
                        class="second-floating-button" color="indigo" dark fab
                        outlined elevation="24" fixed left
                        @click="toggleEdgeVisibility" v-on="on"
                >
                    <v-icon v-if="isEdgeVisible"> mdi-eye </v-icon>
                    <v-icon v-else> mdi-eye-off </v-icon>
                </v-btn>
            </template>
            <span>{{isEdgeVisible ? $t('tooltips.hide_edges') : $t('tooltips.show_edges')}}</span>
        </v-tooltip>

        <v-tooltip right>
            <template v-slot:activator="{ on }">
                <v-btn
                        class="third-floating-button" color="indigo" dark fab
                        outlined elevation="24" fixed left
                        @click="toggleCollapseGraph" v-on="on"
                >
                    <v-icon v-if="isGraphReduced">mdi-arrow-collapse-all</v-icon>
                    <v-icon v-else>mdi-arrow-expand-all</v-icon>
                </v-btn>
            </template>
            <span>{{isGraphReduced ? $t('tooltips.expand_graph') : $t('tooltips.collapse_graph')}}</span>
        </v-tooltip>

        <v-tooltip right>
            <template v-slot:activator="{ on }">
            <v-btn
                    class="fourth-floating-button" color="indigo" dark fab
                    outlined elevation="24" fixed left
                    @click="switchDimension" v-on="on"
            >
                <v-icon v-if="is3D">mdi-video-3d</v-icon>
                <icon-base v-else :width="18" :height="18" :icon-name="iconName"/>
            </v-btn>
            </template>
            <span>{{is3D ? $t('tooltips.switch_to_2d') : $t('tooltips.switch_to_3d')}}</span>
        </v-tooltip>
    </div>
</template>

<script>
    import IconBase from "@/components/IconBase";

    export default {
        data() {
            return {
                name: "ViewButtonBar",
                isGraphReduced: true,
                is3D: false,
                isEdgeVisible: true,
                iconName: 'video3dOff'
            }
        },
        methods: {
            centerView(){
                let msg = {name: 'centerView'};
                this.$emit("triggerGraph", msg);
            },
            switchDimension() {
                this.is3D = !this.is3D;
                let msg = {name: 'saveTempGraph', is3D: this.is3D};
                this.$emit("triggerGraph", msg);
            },
            toggleEdgeVisibility() {
                this.isEdgeVisible = !this.isEdgeVisible;
                let msg = {name: 'toggleEdgeVisibility', visibility: this.isEdgeVisible};
                this.$emit("triggerGraph", msg);
            },
            toggleCollapseGraph() {
                this.isGraphReduced = !this.isGraphReduced;
                let msg = {name: 'toggleCollapse', isCollapsed: this.isGraphReduced};
                this.$emit("triggerGraph", msg);
            }
        },
        components: {
            IconBase
        }
    }
</script>

<style scoped>
    .second-floating-button {
        margin-top: 70px;
    }
    .third-floating-button {
        margin-top: 140px;
    }
    .fourth-floating-button {
        margin-top: 210px;
    }
</style>