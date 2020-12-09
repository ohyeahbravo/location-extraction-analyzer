<template>
    <grid-layout
        :layout.sync="gridLayout"
        :col-num="12"
        :row-height="100"
        :is-draggable="isDraggable"
        :is-resizable="isResizable"
        :is-mirrored="false"
        :vertical-compact="true"
        :margin="[10, 10]"
        :use-css-transforms="true"
    >
        <grid-item
            v-for="item in gridLayout"
            :x="item.x"
            :y="item.y"
            :w="item.w"
            :h="item.h"
            :i="item.i"
            :key="item.i"
            @resized="onResized"
        >
            <viz-widget :widget="item.widget" :editable="isEditable" :resized="resized"></viz-widget>
        </grid-item>
    </grid-layout>
</template>

<script>
import VueGridLayout from 'vue-grid-layout';
import VizWidget from './VizWidget.vue';
import { mapState } from 'vuex';

export default {
    name: 'VizGrid',

    components: {
        GridLayout: VueGridLayout.GridLayout,
        GridItem: VueGridLayout.GridItem,
        VizWidget
    },

    data() {
        return {
            resized: null
        };
    },

    methods: {
        onResized(i, newH, newW, newHPx, newWPx) {
            this.resized = {
                widget: i,
                height: newHPx,
                width: newWPx
            }
        }
    },

    computed: mapState({
        isDraggable: state => state.editMode,
        isResizable: state => state.editMode,
        isEditable: state => state.editMode,
        gridLayout: state => state.gridLayout
    })
};
</script>

<style lang="scss" scoped></style>
