<template>
    <v-card flat light @dragover="allowDrop" @drop="addSetToWidget" :id="widgetId" class="widget">
        <v-card-title class="ma-0 px-4 pt-2">
            <span
                class="viz-title"
                v-bind:style="titleColor"
            >{{ $store.state.widgets[widget].type }}</span>
            <v-spacer></v-spacer>
            <div class="float-right">
                <v-avatar
                    v-for="(set, idx) in sets"
                    :color="getSetColor(set)"
                    :key="idx"
                    size="16"
                    class="ma-1"
                    draggable
                    @dragstart="dragStart(set, $event)"
                    style="cursor: pointer"
                >
                    <v-icon
                        v-if="$store.state.editMode"
                        @click="delSetFromWidget(set)"
                        color="white"
                        x-small
                    >fa-times</v-icon>
                </v-avatar>
            </div>
        </v-card-title>
        <component
            :is="component"
            :id="componentId"
            :chartId="chartId"
            :selected="selected"
            :sets="sets"
            :class="containerClass"
            :selectionMode="selectionMode"
            :update="update"
            :resizeInfo="resizeInfo"
            :componentId="componentId"
        />
    </v-card>
</template>

<script>
import MapVerOne from '@/components/widgets/MapVerOne';
import OldMap from '@/components/widgets/OldMap';
import Map from '@/components/widgets/Map';
import ErrorDistance from '@/components/widgets/ErrorDistance';
import OriginCountries from '@/components/widgets/OriginCountries';
import LocatedCountries from '@/components/widgets/LocatedCountries';
import TextLength from '@/components/widgets/TextLength';
import NGramFrequency from '@/components/widgets/NGramFrequency';
import SingleMetrics from '@/components/widgets/SingleMetrics';

export default {
    name: 'VizWidget',
    props: ['widget', 'editable', 'resized'],
    components: {
        MapVerOne,
        OldMap,
        Map,
        ErrorDistance,
        OriginCountries,
        LocatedCountries,
        TextLength,
        NGramFrequency,
        SingleMetrics
    },
    data() {
        return {
            resizeInfo: null
        };
    },
    computed: {
        update() {
            return this.$store.state.widgets[this.widget].update;
        },
        chartId() {
            return 'chart' + this.widget;
        },
        component() {
            // removing white spaces
            let fileName = this.$store.state.widgets[this.widget].type
                .replace(/\s+/g, '')
                .replace('-', '');
            return fileName;
        },
        containerClass() {
            if (this.component == 'Map') return 'map-container';
            if (this.component == 'OldMap') return 'map-container';
            if (this.component == 'MapVerOne') return 'map-container';
            else return 'component-container';
        },
        componentId() {
            return 'component-' + this.widget;
        },
        sets() {
            return this.$store.state.widgets[this.widget].sets;
        },
        titleColor() {
            if (this.$store.state.widgets[this.widget].type == 'OldMap')
                return { color: 'white' };
            if (this.$store.state.widgets[this.widget].type == 'Map')
                return { color: 'white' };
            if (this.$store.state.widgets[this.widget].type == 'MapVerOne')
                return { color: 'white' };
            else return { color: 'black' };
        },
        selectionMode() {
            return this.$store.state.selectionMode;
        },
        selected() {
            return this.$store.state.selected;
        },
        widgetId() {
            return 'widget' + this.widget;
        }
    },
    methods: {
        dragStart(set, e) {
            e.dataTransfer.setData('set', set);
        },
        delSetFromWidget(set) {
            this.$store.commit('delSetFromWidget', {
                widget: this.widget,
                set: set
            });
        },
        addSetToWidget(e) {
            event.preventDefault();
            let payload = {
                set: e.dataTransfer.getData('set'),
                widget: this.widget
            };
            this.$store.commit('addSetToWidget', payload);
        },
        allowDrop(event) {
            event.preventDefault();
        },
        getSetColor(set) {
            return this.$store.state.sets[set].color;
        },
        addToSelection(member) {
            this.$store.commit('addToSelection', member);
        }
    },
    watch: {
        // needed because chart libs I'm using are not reducing heights automatically
        resized(payload) {
            if (payload.widget == this.widget) {
                let childPos = document.getElementById(this.componentId)
                    .offsetTop;
                let parentPos = document.getElementById(this.componentId)
                    .parentElement.offsetTop;
                let offset = childPos - parentPos;
                this.resizeInfo = payload.height - offset;
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.viz-title {
    font-family: 'Montserrat', sans-serif;
    font-weight: 600;
    font-size: 18px !important;
}

// added because the these have to be on top of the map
.viz-title,
.v-avatar {
    z-index: 100;
}

// map takes up all the cell space
.map-container {
    position: absolute;
    top: 0;
    overflow: hidden;
}

.widget {
    display: flex;
    flex-flow: column;
    overflow-y: auto;
    overflow-x: hidden;
    height: 100%;
}
</style>
