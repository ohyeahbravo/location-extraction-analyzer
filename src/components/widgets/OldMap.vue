<template>
    <MglMap
        :accessToken="accessToken"
        :mapStyle.sync="mapStyle"
        :zoom="zoom"
        @load="onMapLoaded"
        :attributionControl="false"
    >
        <!-- <MglAttributionControl position="bottom-left" style="display:inline-block;"/> -->
        <Tooltip ref="tooltip" />
        <div class="wrapper-toggle-layer">
            <LayerToggle @toggled="toggleLayer" />
        </div>
    </MglMap>
</template>

<script>
// import { MglMap,MglAttributionControl } from 'vue-mapbox';
import { MglMap } from 'vue-mapbox';
import { MapboxLayer } from '@deck.gl/mapbox';
import { DataFilterExtension } from '@deck.gl/extensions';
import { LineLayer, ArcLayer, ScatterplotLayer } from '@deck.gl/layers';
import Rainbow from 'rainbowvis.js';
import Tooltip from '@/components/widgets/Tooltip';
import LayerToggle from '@/components/LayerToggle';

var rainbow = new Rainbow();
rainbow.setSpectrum('#2E8B57', '#b22222');
rainbow.setNumberRange(0, 50);

export default {
    name: 'OldMap',

    components: {
        MglMap,
        // MglAttributionControl,
        Tooltip,
        LayerToggle
    },

    props: ['componentId', 'sets', 'selected', 'selectionMode', 'update'],

    data() {
        return {
            accessToken:
                'pk.eyJ1Ijoib2h5ZWFoYnJhdm8iLCJhIjoiY2swMmRwM3RxMG1vejNpbGNmaTh0MGYzaiJ9.SILsxJa7qEHxs-MZsgTk5A', // your access token. Needed if you using Mapbox maps
            mapStyle: 'mapbox://styles/mapbox/dark-v10',
            zoom: 2,
            currentLayers: [],
            dotLayer: null,
            layer: 'line',
            line_opacity: 204, // 0 - 255 (0.8)
            canvas: null,
            startScreenXY: null, // starting xy coords when mousedown
            currentScreenXY: null, // current xy coords when mousemove or moseup
            startMapXY: null,
            currentMapXY: null,
            selectedRange: null,
            filterExtension: [new DataFilterExtension({ filterSize: 2 })],
            brushingRadius: 100000,
            box: null,
            highlighted: [],
            layerCount: 0
        };
    },

    computed: {},

    methods: {
        onMapLoaded(e) {
            this.map = e.map;
            this.canvas = this.map.getCanvasContainer();

            // Disable default box zooming.
            this.map.boxZoom.disable();
            this.map.on('mousedown', this.onMouseDown);
            this.map.on('mouseup', this.onMouseUp);

            // this.addLineLayer();
        },

        onMouseDown(e) {
            // Continue the rest of the function if the shiftkey is pressed.
            if (!(e.originalEvent.shiftKey && e.originalEvent.button === 0))
                return;

            // Disable default drag zooming when the shift key is held down.
            this.map.dragPan.disable();

            // Call functions for the following events
            document.addEventListener('mousemove', this.onMouseMove);

            // Capture the first xy coordinates
            this.startScreenXY = [e.point.x, e.point.y];
            this.startMapXY = e.lngLat;
        },

        mousePos(e) {
            var rect = this.canvas.getBoundingClientRect();
            return [
                e.clientX - rect.left - this.canvas.clientLeft,
                e.clientY - rect.top - this.canvas.clientTop
            ];
        },

        onMouseMove(e) {
            // Capture the ongoing xy coordinates
            this.currentScreenXY = this.mousePos(e);

            // Append the box element if it doesnt exist
            if (!this.box) {
                this.box = document.createElement('div');
                this.box.classList.add('boxdraw');
                this.canvas.appendChild(this.box);
            }

            let minX = Math.min(this.startScreenXY[0], this.currentScreenXY[0]),
                maxX = Math.max(this.startScreenXY[0], this.currentScreenXY[0]),
                minY = Math.min(this.startScreenXY[1], this.currentScreenXY[1]),
                maxY = Math.max(this.startScreenXY[1], this.currentScreenXY[1]);

            // Adjust width and xy position of the box element ongoing
            let pos = 'translate(' + minX + 'px,' + minY + 'px)';
            this.box.style.transform = pos;
            this.box.style.WebkitTransform = pos;
            this.box.style.width = maxX - minX + 'px';
            this.box.style.height = maxY - minY + 'px';
            this.box.style.position = 'absolute';
            this.box.style.background = 'rgba(238, 255, 65, 0.1)'; // yellow
        },

        onMouseUp(e) {
            // Continue the rest of the function if the shiftkey is pressed.
            if (!(e.originalEvent.shiftKey && e.originalEvent.button === 0))
                return;

            // Capture xy coordinates
            this.finish([this.startMapXY, e.lngLat]);
        },

        finish(bbox) {
            // Remove these events now that finish has been called.
            document.removeEventListener('mousemove', this.onMouseMove);

            if (this.box) {
                this.box.parentNode.removeChild(this.box);
                this.box = null;
            }

            // If bbox exists, use it for selection
            if (bbox) {
                let lng1 = Math.min(bbox[0].lng, bbox[1].lng),
                    lng2 = Math.max(bbox[0].lng, bbox[1].lng),
                    lat1 = Math.min(bbox[0].lat, bbox[1].lat),
                    lat2 = Math.max(bbox[0].lat, bbox[1].lat);

                this.selectedRange = [
                    [lng1, lng2],
                    [lat1, lat2]
                ];
            }
            this.map.dragPan.enable();
        },

        // getColor(idx, set_color) {
        //     // let r = d.dist;
        //     // if (r > 15000) r = 15000;
        //     // const color = rainbow.colorAt(Math.round((50 * r) / 15000));
        //     if (idx in this.selected) {
        //         this.hexToRGB('#EEFF41');
        //     } else return this.hexToRGB(set_color);
        // },

        updateMap() {
            if (this.currentLayers.length != 0) {
                console.log("updateMap: currentlayers.length isn't 0")
                console.log(this.currentLayers)
                for (let layer in this.currentLayers)
                    this.map.removeLayer(this.currentLayers[layer]);
            }
            this.currentLayers = [];
            if (this.layer == 'line') this.addLineLayer();
            else this.addArcLayer();
            // this.addHighlightedLayer(this.selectedRange);
            this.addSelectedLayer();
            // this.addDotLayer();
            this.map.triggerRepaint();
        },

        showOnlyDots() {
            if (this.currentLayers.length != 0)
                for (let layer in this.currentLayers)
                    this.map.removeLayer(this.currentLayers[layer]);
            this.currentLayers = [];
            this.addDotLayer();
            this.map.triggerRepaint();
        },

        hexToRGB(hex) {
            let rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            let result = rgb
                ? [
                      parseInt(rgb[1], 16),
                      parseInt(rgb[2], 16),
                      parseInt(rgb[3], 16)
                  ]
                : null;
            if (this.layer == 'line') result.push(this.line_opacity);
            return result;
        },

        getColor(d, color) {
            // if (this.selectedRange) {
            //     if (
            //         this.$store.state.data[d.type][d.idx].place
            //             .coordinates[1] >= this.selectedRange[0][0] &&
            //         this.$store.state.data[d.type][d.idx].place
            //             .coordinates[1] <= this.selectedRange[0][1] &&
            //         this.$store.state.data[d.type][d.idx].place
            //             .coordinates[0] >= this.selectedRange[1][0] &&
            //         this.$store.state.data[d.type][d.idx].place
            //             .coordinates[0] <= this.selectedRange[1][1]
            //     )
            //         return this.hexToRGB(color);
            //     else return this.hexToRGB(color);
            // } else return this.hexToRGB(color);
            return this.hexToRGB(color);
        },

        addLineLayer() {
            for (let idx in this.sets) {
                let setName = this.sets[idx];
                let set = this.$store.state.sets[setName];
                const lineLayer = new MapboxLayer({
                    id: 'line-layer-' + set.name,
                    type: LineLayer,
                    data: set.members,
                    autoHighlight: true,
                    highlightColor: [211, 211, 211],
                    pickable: true,
                    getWidth: 2,
                    getSourcePosition: d => [
                        this.$store.state.data[d.type][d.idx].place
                            .coordinates[1],
                        this.$store.state.data[d.type][d.idx].place
                            .coordinates[0]
                    ],
                    getTargetPosition: d => [
                        this.$store.state.data[d.type][d.idx].predicted
                            .coordinates[1],
                        this.$store.state.data[d.type][d.idx].predicted
                            .coordinates[0]
                    ],
                    getColor: () => this.hexToRGB(set.color),
                    onHover: ({ object, x, y }) =>
                        this.$refs.tooltip.setTooltip(object, x, y)
                });

                this.currentLayers.push(lineLayer.id);
                this.map.addLayer(lineLayer);
            }
        },

        addSelectedLayer() {
            let color = this.hexToRGB(this.$store.state.highlightColor);
            color.push(255 * 0.8);
            let selectedLayer;

            let layer_id = 'selected-layer-' + this.layerCount++;
            if (this.layer == 'line') {
                selectedLayer = new MapboxLayer({
                    id: layer_id,
                    type: LineLayer,
                    data: this.selected,
                    autoHighlight: true,
                    highlightColor: [211, 211, 211],
                    pickable: true,
                    getWidth: 2,
                    getSourcePosition: d => [
                        this.$store.state.data[d.type][d.idx].place
                            .coordinates[1],
                        this.$store.state.data[d.type][d.idx].place
                            .coordinates[0]
                    ],
                    getTargetPosition: d => [
                        this.$store.state.data[d.type][d.idx].predicted
                            .coordinates[1],
                        this.$store.state.data[d.type][d.idx].predicted
                            .coordinates[0]
                    ],
                    getColor: color,
                    onHover: ({ object, x, y }) =>
                        this.$refs.tooltip.setTooltip(object, x, y)
                });
            } else {
                let color_src = color.slice();
                let color_dst = color.slice();
                color_src.push(255);
                color_dst.push(30);
                selectedLayer = new MapboxLayer({
                    id: layer_id,
                    type: ArcLayer,
                    data: this.selected,
                    pickable: true,
                    autoHighlight: true,
                    highlightColor: [211, 211, 211],
                    getWidth: 2,
                    getSourcePosition: d => [
                        this.$store.state.data[d.type][d.idx].place
                            .coordinates[1],
                        this.$store.state.data[d.type][d.idx].place
                            .coordinates[0]
                    ],
                    getTargetPosition: d => [
                        this.$store.state.data[d.type][d.idx].predicted
                            .coordinates[1],
                        this.$store.state.data[d.type][d.idx].predicted
                            .coordinates[0]
                    ],
                    getSourceColor: color_src, // green
                    getTargetColor: color_dst, // red
                    onHover: ({ object, x, y }) =>
                        this.$refs.tooltip.setTooltip(object, x, y)
                });
            }
            this.currentLayers.push(layer_id);
            this.map.addLayer(selectedLayer);
        },

        addHighlightedLayer(range) {
            if (this.selectedRange == null) return;
            let selectedRange = range;
            let highlightedLayer;
            let color = this.hexToRGB('#EEFF41');
            this.highlighted = [];
            for (let idx in this.sets) {
                let setName = this.sets[idx];
                let set = this.$store.state.sets[setName];
                // need to optimize the case when there are the same objects in different sets
                for (let member_idx in set.members) {
                    this.highlighted.push(set.members[member_idx]);
                }
            }
            let layer_id = 'highlighted-layer-' + this.layerCount++;

            if (this.layer == 'line') {
                highlightedLayer = new MapboxLayer({
                    id: layer_id,
                    type: LineLayer,
                    data: this.highlighted,
                    autoHighlight: true,
                    highlightColor: [211, 211, 211],
                    pickable: true,
                    getWidth: 2,
                    getSourcePosition: d => [
                        this.$store.state.data[d.type][d.idx].place
                            .coordinates[1],
                        this.$store.state.data[d.type][d.idx].place
                            .coordinates[0]
                    ],
                    getTargetPosition: d => [
                        this.$store.state.data[d.type][d.idx].predicted
                            .coordinates[1],
                        this.$store.state.data[d.type][d.idx].predicted
                            .coordinates[0]
                    ],
                    getColor: color,
                    onHover: ({ object, x, y }) =>
                        this.$refs.tooltip.setTooltip(object, x, y),
                    getFilterValue: d => [
                        this.$store.state.data[d.type][d.idx].place
                            .coordinates[1],
                        this.$store.state.data[d.type][d.idx].place
                            .coordinates[0]
                    ],
                    filterRange: selectedRange,
                    extensions: this.filterExtension
                });
            } else {
                let color_src = color.slice();
                let color_dst = color.slice();
                color_src.push(255);
                color_dst.push(30);
                highlightedLayer = new MapboxLayer({
                    id: layer_id,
                    type: ArcLayer,
                    data: this.highlighted,
                    pickable: true,
                    autoHighlight: true,
                    highlightColor: [211, 211, 211],
                    getWidth: 2,
                    getSourcePosition: d => [
                        this.$store.state.data[d.type][d.idx].place
                            .coordinates[1],
                        this.$store.state.data[d.type][d.idx].place
                            .coordinates[0]
                    ],
                    getTargetPosition: d => [
                        this.$store.state.data[d.type][d.idx].predicted
                            .coordinates[1],
                        this.$store.state.data[d.type][d.idx].predicted
                            .coordinates[0]
                    ],
                    getSourceColor: color_src, // green
                    getTargetColor: color_dst, // red
                    onHover: ({ object, x, y }) =>
                        this.$refs.tooltip.setTooltip(object, x, y),
                    getFilterValue: d => [
                        this.$store.state.data[d.type][d.idx].place
                            .coordinates[1],
                        this.$store.state.data[d.type][d.idx].place
                            .coordinates[0]
                    ],
                    filterRange: selectedRange,
                    extensions: this.filterExtension
                });
            }
            this.currentLayers.push(layer_id);
            this.map.addLayer(highlightedLayer);
        },

        addArcLayer() {
            for (let idx in this.sets) {
                let setName = this.sets[idx];
                let set = this.$store.state.sets[setName];
                let color = this.hexToRGB(set.color);
                let color_src = color.slice();
                let color_dst = color.slice();
                color_src.push(255);
                color_dst.push(30);
                const arcLayer = new MapboxLayer({
                    id: 'arc-layer-' + set.name,
                    type: ArcLayer,
                    data: set.members,
                    pickable: true,
                    autoHighlight: true,
                    highlightColor: [211, 211, 211],
                    getWidth: 2,
                    getSourcePosition: d => [
                        this.$store.state.data[d.type][d.idx].place
                            .coordinates[1],
                        this.$store.state.data[d.type][d.idx].place
                            .coordinates[0]
                    ],
                    getTargetPosition: d => [
                        this.$store.state.data[d.type][d.idx].predicted
                            .coordinates[1],
                        this.$store.state.data[d.type][d.idx].predicted
                            .coordinates[0]
                    ],
                    getSourceColor: color_src, // green
                    getTargetColor: color_dst, // red
                    onHover: ({ object, x, y }) =>
                        this.$refs.tooltip.setTooltip(object, x, y)
                });

                this.currentLayers.push(arcLayer.id);
                this.map.addLayer(arcLayer);
            }
        },

        addDotLayer() {
            for (let idx in this.sets) {
                let setName = this.sets[idx];
                let set = this.$store.state.sets[setName];
                let srcDotLayer = new MapboxLayer({
                    id: 'src-dot-layer-' + set.name,
                    type: ScatterplotLayer,
                    data: set.members,
                    pickable: true,
                    opacity: 0.5,
                    stroked: false,
                    filled: true,
                    radiusScale: 10,
                    autoHighlight: true,
                    radiusMinPixels: 5,
                    radiusMaxPixels: 100,
                    lineWidthMinPixels: 1,
                    highlightColor: [211, 211, 211],
                    getPosition: d => [
                        this.$store.state.data[d.type][d.idx].place
                            .coordinates[1],
                        this.$store.state.data[d.type][d.idx].place
                            .coordinates[0]
                    ],
                    getRadius: d => Math.sqrt(d.exits),
                    getFillColor: () => this.hexToRGB(set.color),
                    getLineColor: () => this.hexToRGB('#8BC34A'),
                    onHover: ({ object, x, y }) =>
                        this.$refs.tooltip.setTooltip(object, x, y)
                });

                let dstDotLayer = new MapboxLayer({
                    id: 'dst-dot-layer-' + set.name,
                    type: ScatterplotLayer,
                    data: set.members,
                    pickable: true,
                    opacity: 0.5,
                    stroked: true,
                    filled: true,
                    radiusScale: 10,
                    autoHighlight: true,
                    radiusMinPixels: 4,
                    radiusMaxPixels: 100,
                    lineWidthMinPixels: 1,
                    highlightColor: [211, 211, 211],
                    getPosition: d => [
                        this.$store.state.data[d.type][d.idx].predicted
                            .coordinates[1],
                        this.$store.state.data[d.type][d.idx].predicted
                            .coordinates[0]
                    ],
                    getRadius: d => Math.sqrt(d.exits),
                    getFillColor: this.hexToRGB(set.color),
                    getLineColor: d => this.getDotLineColor(d, set.color),
                    onHover: ({ object, x, y }) =>
                        this.$refs.tooltip.setTooltip(object, x, y)
                });
                this.currentLayers.push(dstDotLayer.id);
                this.currentLayers.push(srcDotLayer.id);

                this.map.addLayer(srcDotLayer);
                this.map.addLayer(dstDotLayer);
            }
        },

        getDotLineColor(d, color) {
            if (this.$store.state.data[d.type][d.idx].dist > 1) {
                // if the inferrence more than 1km
                return this.hexToRGB('#D32F2F');
            } else return this.hexToRGB(color);
        },

        toggleLayer(layer) {
            this.layer = layer;
            this.updateMap();
        },

        handleResize() {
            // document.getElementById(this.componentId).style.height =
            //     height + 'px';
            console.log("dfa")
            this.map.resize();
        }
    },

    created() {
        // need to set mapbox-gl library here in order to use it in template
        // this.mapbox = Mapbox;
    },

    watch: {
        sets() {
            this.updateMap();
        },
        selectionMode(value) {
            if (value) {
                let tooltipObject = null;
                this.$refs.tooltip.setTooltip(tooltipObject, 0, 0);
                this.showOnlyDots();
            } else {
                this.updateMap();
            }
        },
        selectedRange(range) {
            let selected = [];
            for (let idx in this.sets) {
                let setName = this.sets[idx];
                let set = this.$store.state.sets[setName];
                // need to optimize the case when there are the same objects in different sets
                for (let member_idx in set.members) {
                    let d = set.members[member_idx];
                    if (
                        (this.$store.state.data[d.type][d.idx].place
                            .coordinates[1] >= range[0][0] &&
                            this.$store.state.data[d.type][d.idx].place
                                .coordinates[1] <= range[0][1] &&
                            this.$store.state.data[d.type][d.idx].place
                                .coordinates[0] >= range[1][0] &&
                            this.$store.state.data[d.type][d.idx].place
                                .coordinates[0] <= range[1][1]) ||
                        (this.$store.state.data[d.type][d.idx].predicted
                            .coordinates[1] >= range[0][0] &&
                            this.$store.state.data[d.type][d.idx].predicted
                                .coordinates[1] <= range[0][1] &&
                            this.$store.state.data[d.type][d.idx].predicted
                                .coordinates[0] >= range[1][0] &&
                            this.$store.state.data[d.type][d.idx].predicted
                                .coordinates[0] <= range[1][1])
                    )
                        selected.push(d);
                }
            }
            this.$store.commit('updateSelection', selected);
        },
        selected() {
            this.updateMap();
        }
    }
};
</script>

<style lang="scss" scoped>
.wrapper-toggle-layer {
    position: absolute;
    right: 1.5em;
    top: 3em;
    background: white;
    height: 40px; // 60
    width: 150px;
    overflow: hidden;
}
</style>
