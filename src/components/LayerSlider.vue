<template>
    <div class="slidecontainer">
        <input v-model="sliderVal" type="range" orient="vertical" min="1" step="1" :max="maxLayer" class="slider" id="myRange" @change="changeCurrentLayer">
    </div>
</template>

<script>
    export default {
        data() {
            return {
                name: 'LayerSlider',
                sliderVal: "0"
            }
        },
        props: ['maxLayer'],
        watch: {
            maxLayer: function(newValue) {
                this.sliderVal = newValue;
            }
        },
        methods: {
            changeCurrentLayer() {
                this.$emit("changeCurrentLayer", this.sliderVal);
            }
        }
    }
</script>

<style scoped>
    .slider {
        width: 25px;
        height: 100%;
        -webkit-appearance: slider-vertical;
        writing-mode: bt-lr
    }
</style>