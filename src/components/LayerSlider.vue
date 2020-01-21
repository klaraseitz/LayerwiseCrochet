<template>
    <div class="slidecontainer">
        <input type="range" orient="vertical" min="1" step="1" max="10" value="5" class="slider" id="myRange">
    </div>
</template>

<script>
    export default {
        name: "LayerSlider"
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