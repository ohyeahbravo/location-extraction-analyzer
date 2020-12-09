<template>
    <MglMap
        :accessToken="accessToken"
        :mapStyle.sync="mapStyle"
        :zoom="zoom"
        @load="onMapLoaded"
        :attributionControl="false"
    >
        <MglMarker
            v-for="marker in markersOriginPie"
            v-bind:key="marker.id"
            class="pie"
            :id="marker.id"
            :coordinates="marker.coords"
        >
            <Pie
                slot="marker"
                :chartId="marker.chartId"
                :data="marker.data"
                :size="marker.size"
                :source="marker.source"
                :features="marker.features"
                @hoverOnPie="hoverOnChart"
                @clickOnPie="clickOnChart"
            />
        </MglMarker>
        <MglMarker
            v-for="marker in markersLocatedPie"
            v-bind:key="marker.id"
            class="pie"
            :id="marker.id"
            :coordinates="marker.coords"
        >
            <Pie
                slot="marker"
                :chartId="marker.chartId"
                :data="marker.data"
                :size="marker.size"
                :source="marker.source"
                :features="marker.features"
                @hoverOnPie="hoverOnChart"
                @clickOnPie="clickOnChart"
            />
        </MglMarker>
        <MglMarker
            v-for="marker in markersOriginFlower"
            v-bind:key="marker.id"
            class="rose"
            :id="marker.id"
            :coordinates="marker.coords"
        >
            <Flower
                slot="marker"
                :chartId="marker.chartId"
                :data="marker.data"
                :size="marker.size"
                :range="marker.range"
                :source="marker.source"
                :features="marker.features"
                @hoverOnPetal="hoverOnChart"
                @clickOnPetal="clickOnChart"
                @roseCreated="roseCreated"
            />
        </MglMarker>
        <MglMarker
            v-for="marker in markersLocatedFlower"
            v-bind:key="marker.id"
            class="rose"
            :id="marker.id"
            :coordinates="marker.coords"
        >
            <Flower
                slot="marker"
                :chartId="marker.chartId"
                :data="marker.data"
                :size="marker.size"
                :range="marker.range"
                :source="marker.source"
                :features="marker.features"
                @hoverOnPetal="hoverOnChart"
                @clickOnPetal="clickOnChart"
                @roseCreated="roseCreated"
            />
        </MglMarker>
        <MglMarker
            v-for="marker in markersOriginLocal"
            v-bind:key="marker.id"
            class="pie"
            :id="marker.id"
            :coordinates="marker.coords"
        >
            <Pie
                slot="marker"
                :chartId="marker.chartId"
                :data="marker.data"
                :size="marker.size"
                :source="marker.source"
                :features="marker.features"
                @hoverOnPie="hoverOnChart"
                @clickOnPie="clickOnChart"
            />
        </MglMarker>
        <MglMarker
            v-for="marker in markersLocatedLocal"
            v-bind:key="marker.id"
            class="pie"
            :id="marker.id"
            :coordinates="marker.coords"
        >
            <Pie
                slot="marker"
                :chartId="marker.chartId"
                :data="marker.data"
                :size="marker.size"
                :source="marker.source"
                :features="marker.features"
                @hoverOnPie="hoverOnChart"
                @clickOnPie="clickOnChart"
            />
        </MglMarker>
        <Tooltip ref="tooltip" />
        <v-card
            v-if="!selectionMode"
            dark
            color="rgba(128, 128, 128, 0.5)"
            class="d-flex flex-column float-right mt-12 mr-5 pa-3"
        >
            <v-checkbox dense hide-details class="my-1 mx-0 pa-0" v-model="isLine" label="Line" />
            <v-checkbox dense hide-details class="my-1 mx-0 pa-0" v-model="isArc" label="Arc" />
            <v-checkbox
                dense
                hide-details
                class="my-1 mx-0 pa-0"
                v-model="isDotOrigin"
                label="Origin Dots"
            />
            <v-checkbox
                dense
                hide-details
                class="my-1 mx-0 pa-0"
                v-model="isDotLocated"
                label="Located Dots"
            />
            <v-checkbox
                dense
                hide-details
                class="my-1 mx-0 pa-0"
                v-model="isLineCountry"
                label="Line By Country"
            />
            <v-checkbox
                dense
                hide-details
                class="my-1 mx-0 pa-0"
                v-model="isArcCountry"
                label="Arc By Country"
            />
                        <v-checkbox
                dense
                hide-details
                class="my-1 mx-0 pa-0"
                v-model="isRosePieOrigin"
                label="RosePies By Origin"
            />
            <v-checkbox
                dense
                hide-details
                class="my-1 mx-0 pa-0"
                v-model="isRosePieLocated"
                label="RosePies By Located"
            />
            <v-switch v-model="isClusterLocked" :label="clusterLockSwitchLabel"></v-switch>
        </v-card>
        <v-btn
            v-if="!minimapShown"
            @click="minimapShown = true"
            icon
            color="rgba(255, 255, 255, 0.5)"
            absolute
            x-large
            dark
            bottom
            left
            class="mb-5"
        >
            <v-icon>fas fa-globe</v-icon>
        </v-btn>
        <v-card
            v-if="minimapShown"
            color="rgba(128, 128, 128, 0.5)"
            style="width: 400px; height: 250px; position: absolute; bottom: 40px;"
            class="d-flex flex-column justify-end pa-1"
        >
            <v-btn @click="minimapShown = false" icon color="rgba(0, 0, 0, 1)" x-small class="ma-0">
                <v-icon>fas fa-times</v-icon>
            </v-btn>
            <MiniMap :payload="minimapPayload" />
        </v-card>
        <ChartTooltip ref="chart_tooltip" />
    </MglMap>
</template>

<script>
// import { MglMap,MglAttributionControl } from 'vue-mapbox';
import { MglMap, MglMarker } from 'vue-mapbox';
import { MapboxLayer } from '@deck.gl/mapbox';
import { DataFilterExtension } from '@deck.gl/extensions';
import { LineLayer, ArcLayer, ScatterplotLayer } from '@deck.gl/layers';
import Tooltip from '@/components/widgets/Tooltip';
import ChartTooltip from '@/components/widgets/ChartTooltip';
import Pie from '@/components/widgets/Pie';
import Flower from '@/components/widgets/Flower';
import MiniMap from '@/components/widgets/MiniMap';
import * as d3 from 'd3';
import * as turf from '@turf/turf';

export default {
	name: 'Map',

	components: {
		MglMap,
		// MglAttributionControl,
		Tooltip,
		MglMarker,
		Pie,
		Flower,
		MiniMap,
		ChartTooltip
	},

	props: ['componentId', 'sets', 'selectionMode', 'update', 'resizeInfo'],

	data() {
		return {
			items: [],
			accessToken:
				'pk.eyJ1Ijoib2h5ZWFoYnJhdm8iLCJhIjoiY2swMmRwM3RxMG1vejNpbGNmaTh0MGYzaiJ9.SILsxJa7qEHxs-MZsgTk5A', // your access token. Needed if you using Mapbox maps
			mapStyle: 'mapbox://styles/mapbox/dark-v10',
			zoom: 2,
			// not -90 to 90 as it causes the panning to go beyond the map size
			maxBounds: [
				[-180, -85],
				[180, 85]
			],
			minimapPayload: null,
			opacity: 0.5, // 204 (0.8)
			canvas: null,
			startScreenXY: null, // starting xy coords when mousedown
			currentScreenXY: null, // current xy coords when mousemove or moseup
			startMapXY: null,
			currentMapXY: null,
			selectedRange: null,
			filterExtension: [new DataFilterExtension({ filterSize: 2 })],
			box: null,
			minimapShown: false,
			minCountryCount: Infinity,
			maxCountryCount: 0,
			setFilters: {},
			isClusterLocked: false,
			hoverSourceId: 'hovered',
			hoverLayerIds: [],
			markersOriginPie: [],
			markersLocatedPie: [],
			markersOriginFlower: [],
			markersLocatedFlower: [],
			markersOriginLocal: [],
			markersLocatedLocal: [],
			clusters: {},
			features: {
				origin: [],
				located: []
			},
			sourceLoaded: {
				origin: false,
				located: false
			},
			layers: {
				origin_noncluster: null,
				located_noncluster: null,
				line: {},
				arc: {},
				dot_located: {},
				dot_origin: {},
				line_country: {},
				arc_country: {},
				highlighted: {}
			},
			// variables for layer toggling
			isLine: false,
			isArc: false,
			isDotOrigin: false,
			isDotLocated: false,
			isLineCountry: false,
            isArcCountry: false,
            isRosePieOrigin: false,
			isRosePieLocated: false,
			isPieOrigin: false,
			isPieLocated: false,
			isFlowerOrigin: false,
			isFlowerLocated: false
            };
	},

	computed: {
		settings() {
			return {
				line: this.isLine,
				arc: this.isArc,
				dot_origin: this.isDotOrigin,
				dot_located: this.isDotLocated,
				line_country: this.isLineCountry,
				arc_country: this.isArcCountry,
				pie_located: this.isPieLocated,
				pie_origin: this.isPieOrigin,
				flower_origin: this.isFlowerOrigin,
				flower_located: this.isFlowerLocated
			};
		},
		countryCountRange() {
			return [this.minCountryCount, this.maxCountryCount];
		},
		colorFilters() {
			let filters = ['case'];
			Object.keys(this.setFilters).forEach(set => {
				filters.push(this.setFilters[set]);
				filters.push(this.$store.state.sets[set].color);
			});
			// default color
			filters.push('#ffffff');
			return filters;
		},
		clusterLockSwitchLabel() {
			if (this.isClusterLocked) return 'Cluster Locked';
			else return 'Cluster Unlocked';
        }
	},

	methods: {
		addSet(setName) {
			let set = this.$store.state.sets[setName];
			// set filter later needed for color setFilters
			this.setFilters[setName] = ['==', ['get', 'set'], setName];

			set.members.forEach(member => {
				let set_id = member.type + '_' + member.idx;
				let item = this.$store.state.data[member.type][member.idx];
				let origin = {
					type: 'Feature',
					properties: {
						set: setName,
						set_id: set_id,
						target: [
							item.predicted.coordinates[1],
							item.predicted.coordinates[0]
						],
						dist: item.dist,
						dir: item.place.dir,
						type: 'origin'
					},
					geometry: {
						type: 'Point',
						coordinates: [
							this.$store.state.data[member.type][member.idx]
								.place.coordinates[1],
							this.$store.state.data[member.type][member.idx]
								.place.coordinates[0]
						]
					}
				};
				this.features.origin.push(origin);
				let located = {
					type: 'Feature',
					properties: {
						set: setName,
						set_id: set_id,
						target: [
							item.place.coordinates[1],
							item.place.coordinates[0]
						],
						dist: item.dist,
						dir: item.predicted.dir,
						type: 'located'
					},
					geometry: {
						type: 'Point',
						coordinates: [
							this.$store.state.data[member.type][member.idx]
								.predicted.coordinates[1],
							this.$store.state.data[member.type][member.idx]
								.predicted.coordinates[0]
						]
					}
				};
				this.features.located.push(located);
			});
			// add source or update features if exists
			Object.keys(this.features).forEach(type => {
				if (this.map.getSource(type) == undefined) {
					let geojson = {
						type: 'geojson',
						data: {
							type: 'FeatureCollection',
							features: this.features[type]
						},
						cluster: true,
						clusterRadius: 50
					};
					this.map.addSource(type, geojson);
				} else
					this.map.getSource(type).setData({
						type: 'FeatureCollection',
						features: this.features[type]
					});
				this.sourceLoaded[type] = false;
			});

			Object.keys(this.settings).forEach(layer => {
				if (this.settings[layer]) {
					if (
						[
							'pie_origin',
							'pie_located',
							'flower_origin',
							'flower_located'
						].includes(layer)
					) {
						let source = layer.split('_')[1];
						if (!this.layers[source + '_noncluster']) {
							this.getIntegratedLayer(layer);
							this.map.addLayer(
								this.layers[source + '_noncluster']
							);
							console.log('layer added');
						}
					} else {
						this.getSetLayer(layer, setName);
						this.map.addLayer(this.layers[layer][setName]);
					}
				}
			});
		},

		deleteSet(setName) {
			// delete filter from the filter collection
			delete this.setFilters[setName];
			// delete set features from the source data
			Object.keys(this.features).forEach(type => {
				let newFeatures = [];
				this.features[type].forEach(feature => {
					if (feature.properties.set != setName)
						newFeatures.push(feature);
				});
				this.features[type] = newFeatures;
				this.map.getSource(type).setData({
					type: 'FeatureCollection',
					features: newFeatures
				});
				this.sourceLoaded[type] = false;
			});
			// removing the layers if needed
			Object.keys(this.settings).forEach(layer => {
				if (this.settings[layer]) {
					if (
						![
							'pie_origin',
							'pie_located',
							'flower_origin',
							'flower_located'
						].includes(layer)
					) {
						this.map.removeLayer(this.layers[layer][setName].id);
						delete this.layers[layer][setName];
					} else {
						let source = layer.split('_')[1];
						if (source == 'origin') this.markersOriginLocal = [];
						else this.markersLocatedLocal = [];

						if (layer == 'pie_origin') this.markersOriginPie = [];
						else if (layer == 'pie_located')
							this.markersLocatedPie = [];
						else if (layer == 'flower_origin')
							this.markersOriginFlower = [];
						else if (layer == 'flower_located')
							this.markersLocatedFlower = [];
					}
				}
			});
		},

		onMapLoaded(e) {
			this.map = e.map;
			this.canvas = this.map.getCanvasContainer();
			// Disable default box zooming.
			this.map.boxZoom.disable();
			this.map.on('mousedown', this.onMouseDown);
			this.map.on('mouseup', this.onMouseUp);
		},

		onRender() {
			if (!this.map.loaded() || this.isClusterLocked) return;
			if (this.isPieOrigin || this.isFlowerOrigin)
				if (!this.sourceLoaded.origin) {
					if (this.isPieOrigin) this.updateMarkers('pie_origin');
					if (this.isFlowerOrigin)
						this.updateMarkers('flower_origin');
					this.sourceLoaded.origin = true;
				}
			if (this.isPieLocated || this.isFlowerLocated)
				if (!this.sourceLoaded.located) {
					if (this.isPieLocated) this.updateMarkers('pie_located');
					if (this.isFlowerLocated)
						this.updateMarkers('flower_located');
					this.sourceLoaded.located = true;
				}
		},

		resetSourceLoaded() {
			Object.keys(this.sourceLoaded).forEach(key => {
				this.sourceLoaded[key] = false;
			});
		},

		mousePos(e) {
			var rect = this.canvas.getBoundingClientRect();
			return [
				e.clientX - rect.left - this.canvas.clientLeft,
				e.clientY - rect.top - this.canvas.clientTop
			];
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

		onMouseUp(e) {
			// Continue the rest of the function if the shiftkey is pressed.
			if (!(e.originalEvent.shiftKey && e.originalEvent.button === 0))
				return;

			// Capture xy coordinates
			this.finish([this.startMapXY, e.lngLat]);
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

		toggleLayer(layer, value) {
			// add layer
			if (value) {
				if (
					[
						'pie_origin',
						'pie_located',
						'flower_origin',
						'flower_located'
					].includes(layer)
				) {
					let source = layer.split('_')[1];
					if (!this.layers[source + '_noncluster']) {
						this.getIntegratedLayer(layer);
						this.map.addLayer(this.layers[source + '_noncluster']);
					}
					this.sourceLoaded[source] = false;
					// adding map event for updating markers
					this.map.on('render', this.onRender);
					this.map.on('zoomend', this.resetSourceLoaded);
				} else {
					this.sets.forEach(setName => {
						if (!this.layers[layer].hasOwnProperty(setName))
							this.getSetLayer(layer, setName);
						this.map.addLayer(this.layers[layer][setName]);
					});
				}
				// remove layer
			} else {
				if (
					[
						'pie_origin',
						'pie_located',
						'flower_origin',
						'flower_located'
					].includes(layer)
				) {
					let source = layer.split('_')[1];
					if (source == 'origin' && !this.isPieOrigin) {
						this.map.removeLayer(
							this.layers['origin_noncluster'].id
						);
						this.layers['origin_noncluster'] = null;
						this.markersOriginLocal = [];
					} else if (source == 'located' && !this.isPieLocated) {
						this.map.removeLayer(
							this.layers['located_noncluster'].id
						);
						this.layers['located_noncluster'] = null;
						this.markersLocatedLocal = [];
					}

					// removing map event when no need to update markers
					if (
						!this.isPieOrigin &&
						!this.isPieLocated &&
						!this.isFlowerOrigin &&
						!this.isFlowerLocated
					) {
						this.map.off('render', this.onRender);
						this.map.off('zoomend', this.resetSourceLoaded);
					}
					if (layer == 'pie_origin') this.markersOriginPie = [];
					else if (layer == 'pie_located')
						this.markersLocatedPie = [];
					else if (layer == 'flower_origin')
						this.markersOriginFlower = [];
					else if (layer == 'flower_located')
						this.markersLocatedFlower = [];
				} else
					this.sets.forEach(setName => {
						this.map.removeLayer(this.layers[layer][setName].id);
					});
			}
		},

		getSelected() {
			let selected = [];
			let range = this.selectedRange;
			this.sets.forEach(setName => {
				let set = this.$store.state.sets[setName];
				set.members.forEach(d => {
					if (
						this.$store.state.data[d.type][d.idx].place
							.coordinates[1] >= range[0][0] &&
						this.$store.state.data[d.type][d.idx].place
							.coordinates[1] <= range[0][1] &&
						this.$store.state.data[d.type][d.idx].place
							.coordinates[0] >= range[1][0] &&
						this.$store.state.data[d.type][d.idx].place
							.coordinates[0] <= range[1][1]
					)
						selected.push(d);
				});
			});
			return selected;
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
			// if (this.lineType == 'line') result.push(this.opacity);
			return result;
		},

		getCountryCoords(name) {
			if (!this.country_lookup)
				this.country_lookup = require('country-js');
			let info = this.country_lookup.search(name)[0];
			let result = [];
			if (!info) {
				// Kosovo (XK) not in the library
				if (name.toLowerCase() == 'xk') result = [21.166191, 42.667542];
				else result = [0, 0];
			} else {
				let coords = info.geo;
				result = [coords.longitude, coords.latitude];
			}
			return result;
		},

		getCalculatedValue(count) {
			let min = 2;
			let max = 50;
			let portion =
				(count - this.minCountryCount) /
				(this.maxCountryCount - this.minCountryCount);
			let result = (max - min + 1) * portion + min;
			return result;
		},

		updateMarkers(layer) {
			let source = layer.split('_')[1];
			let counts = [];
			this.clusters = {};
			this.map.querySourceFeatures(source).forEach(feature => {
				// continue only if the point is part of a cluster
				if (!feature.properties.cluster) return;
				// omit the clusters that are already added
				if (this.clusters.hasOwnProperty(feature.properties.cluster_id))
					return;
				else {
					this.clusters[feature.properties.cluster_id] = {
						count: feature.properties.point_count,
						coords: feature.geometry.coordinates
					};
					counts.push(feature.properties.point_count);
				}
			});
			// this sets the scale for our circle radius and this is why we need the totals. We need to set a mininum and a maximum to define the domain and the range.
			// minimum value should be 22 as pixel value lower than 10 (for local connection) would appear super big
			this.scale = d3
				.scaleLinear()
				.domain([d3.min(counts), d3.max(counts)])
				.range([0, 80]);

			Object.keys(this.clusters).forEach((clusterId, i) => {
				// get points underneath
				this.map
					.getSource(source)
					.getClusterLeaves(
						parseInt(clusterId),
						this.clusters[clusterId].count,
						0,
						(err, leaves) => {
							if (!err)
								this.saveClusterLeaves(
									leaves,
									clusterId,
									i,
									layer
								);
						}
					);
			});
		},

		saveClusterLeaves(leaves, id, i, layer) {
			this.clusters[id].leaves = leaves;
			if (i == Object.keys(this.clusters).length - 1)
				this.updateCharts(layer);
		},

		updateCharts(layer) {
			let markers_local = [];
			let markers = [];
			Object.keys(this.clusters).forEach(clusterId => {
				let cluster = this.clusters[clusterId];
				let radius = 0;
				let center = cluster.coords;
				// get the approximate radius of the cluster
				cluster.leaves.forEach(leaf => {
					let dist = turf.distance(center, leaf.geometry.coordinates);
					if (dist >= radius) radius = dist;
				});
				// get local and non-local connections;
				let nonlocal = {};
				let local = {};
				cluster.leaves.forEach(leaf => {
					let dist = turf.distance(center, leaf.properties.target);
					if (dist > radius) {
						if (nonlocal.hasOwnProperty(leaf.properties.set))
							nonlocal[leaf.properties.set].push(leaf);
						else nonlocal[leaf.properties.set] = [leaf];
					} else {
						if (local.hasOwnProperty(leaf.properties.set))
							local[leaf.properties.set].push(leaf);
						else local[leaf.properties.set] = [leaf];
					}
				});

				let size_final = this.scale(cluster.count);
				let size_min = 10;
				let count_local = d3.sum(
					Array.from(Object.values(local), x => x.length)
				);
				let count_nonlocal = d3.sum(
					Array.from(Object.values(nonlocal), x => x.length)
				);
				let size_local =
					(size_final * count_local) / cluster.count + size_min;
				let size_nonlocal = size_final + size_min;

				// add a chart for non-local connections
				let type = layer.split('_')[0];
				let marker;
				let data;
				// pie chart
				if (type == 'pie' && count_nonlocal > 0) {
					let values = [];
					let labels = [];
					let colors = [];
					let features = [];
					// add local connection pie chart
					Object.keys(local).forEach(set => {
						values.push(local[set].length);
						labels.push(set);
						colors.push(this.$store.state.sets[set].color);
						local[set].forEach(item => {
							features.push(item);
						});
					});
					if (values.length != 0) {
						let data = [];
						data.push({
							values: values,
							labels: labels,
							marker: {
								colors: colors
							},
							opacity: 0.8,
							type: 'pie',
							hoverinfo: 'none',
							textinfo: 'none'
						});
						let marker = {
							id: 'marker_local_' + layer + '-' + clusterId,
							chartId: 'chart_local_' + layer + '-' + clusterId,
							source: layer.split('_')[1],
							coords: center,
							size: size_local,
							data: data,
							features: features
						};
						markers_local.push(marker);
					}

					values = [];
					labels = [];
					colors = [];
					data = [];
					features = [];
					// add non-local connection pie chart
					Object.keys(nonlocal).forEach(set => {
						values.push(nonlocal[set].length);
						labels.push(set);
						// colors.push(this.$store.state.sets[set].color);
						colors.push('#ffffff');
						nonlocal[set].forEach(item => {
							features.push(item);
						});
					});
					if (values.length != 0) {
						data.push({
							values: values,
							labels: labels,
							marker: {
								colors: colors
							},
							opacity: 0.1,
							type: 'pie',
							hoverinfo: 'none',
							textinfo: 'none'
						});
						marker = {
							id: 'marker_nonlocal_' + layer + '-' + clusterId,
							chartId:
								'chart_nonlocal_' + layer + '-' + clusterId,
							source: layer.split('_')[1],
							coords: center,
							size: size_nonlocal,
							data: data,
							features: features
						};
						markers.push(marker);
					}
					// rose chart
				} else if (type == 'flower' && count_nonlocal > 0) {
					data = [];
					let dirs = {
						North: [],
						'N-E': [],
						East: [],
						'S-E': [],
						South: [],
						'S-W': [],
						West: [],
						'N-W': []
					};
					Object.keys(nonlocal).forEach(set => {
						let r = [0, 0, 0, 0, 0, 0, 0, 0];
						nonlocal[set].forEach(item => {
							let dir = item.properties.dir;
							let idx = [
								'North',
								'N-E',
								'East',
								'S-E',
								'South',
								'S-W',
								'West',
								'N-W'
							].indexOf(dir);
							r[idx]++;
							dirs[dir].push(item);
						});
						data.push({
							r: r,
							theta: [
								'North',
								'N-E',
								'East',
								'S-E',
								'South',
								'S-W',
								'West',
								'N-W'
							],
							name: set,
							marker: {
								color: this.$store.state.sets[set].color
							},
							type: 'barpolar',
							opacity: 0.5,
							hoverinfo: 'none'
						});
					});
					let maxN = d3.max(Array.from(data, x => d3.max(x.r)));
					let offset = 0;
					if (count_local > 0)
						offset =
							(maxN * size_local) / (size_nonlocal - size_local);
					// let petal_buffer;
					// // give petal buffer of 10 pixel for small petal size
					// if(count_local > 0)
					//     petal_buffer = 8 * maxN / (size_nonlocal - size_local-8);
					// else petal_buffer = 8 * maxN / size_nonlocal
					// console.log(petal_buffer);
					// for(let i = 0; i < data.length; i++) {
					//     for(let j = 0; j < 8; j++) {
					//         if(data[i].r[j] > 0)
					//             data[i].r[j] += petal_buffer;
					//     }
					// }
					// let offset = (maxN * size_nonlocal) / 25;
					marker = {
						id: 'marker_nonlocal_' + layer + '-' + clusterId,
						chartId: 'chart_nonlocal_' + layer + '-' + clusterId,
						source: layer.split('_')[1],
						coords: center,
						size: size_nonlocal,
						data: data,
						range: [-offset, maxN],
						features: dirs
					};
					markers.push(marker);
				}
			});

			// check if the marker with the cluster_id is already on the screen by iterating through our markersOnScreen object, which keeps track of that
			if (layer == 'pie_origin') {
				// this.markersOriginPie = markers;
				this.markersOriginLocal = markers_local;
			} else if (layer == 'pie_located') {
				// this.markersLocatedPie = markers;
				this.markersLocatedLocal = markers_local;
			} else if (layer == 'flower_origin')
				this.markersOriginFlower = markers;
			else if (layer == 'flower_located')
				this.markersLocatedFlower = markers;
		},

		getIntegratedLayer(layer) {
			let type = layer.split('_')[1];
			let individualDots = {
				id: type + '_noncluster',
				type: 'circle',
				source: type,
				filter: ['!=', ['get', 'cluster'], true],
				paint: {}
			};
			// this.map.on('mouseenter', type + '_cluster', function(e) {
			//     console.log(e);
			//     // var coordinates = e.features[0].geometry.coordinates.slice();
			//     // var description = e.features[0].properties.set;
			//     //     var features = this.map.queryRenderedFeatures(e.point, {
			//     //     layers: [type + '_cluster']
			//     // })
			//     //     console.log(features)
			// });
			// this.map.on('mouseleave', type + '_cluster', function() {
			//     console.log('mouse left');
			// });

			// color and shape settings
			if (type == 'origin') {
				individualDots.paint['circle-color'] = this.colorFilters;
				individualDots.paint['circle-radius'] = 2;
			} else {
				individualDots.paint['circle-stroke-color'] = this.colorFilters;
				individualDots.paint['circle-radius'] = 3;
				individualDots.paint['circle-stroke-width'] = 2;
				individualDots.paint['circle-color'] = 'rgba(0, 0, 0, 0)';
			}
			this.layers[type + '_noncluster'] = individualDots;
			this.updateMarkers(layer);
		},

		getSetLayer(type, setName) {
			let set = this.$store.state.sets[setName];
			let layerConf = {
				id: type + '-' + setName,
				autoHighlight: true,
				highlightColor: [211, 211, 211],
				pickable: true
			};

			// layer type
			if (['line', 'line_country'].includes(type)) {
				layerConf.type = LineLayer;
				layerConf.getColor = () => this.hexToRGB(set.color);
			} else if (['arc', 'arc_country'].includes(type)) {
				layerConf.type = ArcLayer;
			} else if (
				['dot_origin', 'dot_located', 'highlighted'].includes(type)
			) {
				layerConf.type = ScatterplotLayer;
				layerConf.filled = true;
				layerConf.radiusScale = 10;
			}

			// layer data
			if (
				[
					'line',
					'arc',
					'dot_origin',
					'dot_located',
					'highlighted'
				].includes(type)
			) {
				layerConf.data = set.members;
				layerConf.onHover = ({ object, x, y }) =>
					this.$refs.tooltip.setTooltip(object, x, y, 'tweet');
			} else if (['line_country', 'arc_country'].includes(type)) {
				layerConf.data = set.stats.country.connections;
				layerConf.onHover = ({ object, x, y }) =>
					this.$refs.tooltip.setTooltip(object, x, y, 'country');
				layerConf.getWidth = d => this.getCalculatedValue(d.count); // might have to tweak later;
				layerConf.getSourcePosition = d =>
					this.getCountryCoords(d.origin);
				layerConf.getTargetPosition = d =>
					this.getCountryCoords(d.located);
			}

			if (['arc', 'arc_country'].includes(type)) {
				layerConf.getSourceColor = this.hexToRGB(set.color).concat(255);
				layerConf.getTargetColor = this.hexToRGB(set.color).concat(30);
			} else {
				layerConf.opacity = this.opacity;
			}

			if (type == 'line' || type == 'arc') {
				layerConf.getWidth = 2;
				layerConf.getSourcePosition = d => [
					this.$store.state.data[d.type][d.idx].place.coordinates[1],
					this.$store.state.data[d.type][d.idx].place.coordinates[0]
				];
				layerConf.getTargetPosition = d => [
					this.$store.state.data[d.type][d.idx].predicted
						.coordinates[1],
					this.$store.state.data[d.type][d.idx].predicted
						.coordinates[0]
				];
			}

			if (['dot_origin', 'dot_located'].includes(type)) {
				layerConf.stroked = false;
			}
			if (['dot_origin', 'dot_located', 'highlighted'].includes(type)) {
				layerConf.getFillColor = () => this.hexToRGB(set.color);
				layerConf.radiusMinPixels = 2;
				layerConf.radiusMaxPixels = 100;
				layerConf.getRadius = d => Math.sqrt(d.exists);
			}
			if (['dot_origin', 'highlighted'].includes(type)) {
				layerConf.getPosition = d => [
					this.$store.state.data[d.type][d.idx]['place']
						.coordinates[1],
					this.$store.state.data[d.type][d.idx]['place']
						.coordinates[0]
				];
			}
			// individual settings
			switch (type) {
				case 'line':
					break;
				case 'arc':
					break;
				case 'line_country':
					break;
				case 'arc_country':
					break;
				case 'dot_origin':
					break;
				case 'dot_located':
					layerConf.getPosition = d => [
						this.$store.state.data[d.type][d.idx]['predicted']
							.coordinates[1],
						this.$store.state.data[d.type][d.idx]['predicted']
							.coordinates[0]
					];
					break;
				case 'highlighted':
					layerConf.stroked = true;
					layerConf.lineWidthMinPixels = 0.5;
					layerConf.getLineColor = [255, 255, 255];
					layerConf.extensions = this.filterExtension;
					layerConf.filterRange = [
						[0, 0],
						[0, 0]
					];
					layerConf.getFilterValue = d => [
						this.$store.state.data[d.type][d.idx].place
							.coordinates[1],
						this.$store.state.data[d.type][d.idx].place
							.coordinates[0]
					];
					break;
			}
			let layer = new MapboxLayer(layerConf);
			this.layers[type][setName] = layer;
        },
        
        roseCreated() {
            if(this.isRosePieOrigin)
                this.isPieOrigin = true
            if(this.isRosePieLocated)
                this.isPieLocated = true
        },

		hoverOnChart(payload) {
			if (payload == null) {
				this.hoverLayerIds.forEach(id => {
					this.map.removeLayer(id);
				});
				this.minimapPayload = null;
				this.$refs.chart_tooltip.hideTooltip();
			} else {
				this.map
					.querySourceFeatures(payload.source)
					.forEach(feature => {
						// continue only if the point is part of a cluster
						if (
							feature.properties.cluster &&
							feature.properties.cluster_id == payload.clusterId
						) {
							let point = this.map.project(
								feature.geometry.coordinates
							);
							this.$refs.chart_tooltip.setTooltip(
								payload.info,
								point.x,
								point.y,
								payload.size / 2
							);
						}
					});
				// make feature collection with target coordinates
				let features = [];
				payload.items.forEach(item => {
					features.push({
						type: 'Feature',
						properties: {
							set: item.properties.set
						},
						geometry: {
							type: 'Point',
							coordinates: item.properties.target
						}
					});
				});
				if (this.map.getSource(this.hoverSourceId) === undefined) {
					let geojson = {
						type: 'geojson',
						data: {
							type: 'FeatureCollection',
							features: features
						}
					};
					this.map.addSource(this.hoverSourceId, geojson);
				}
				this.map.getSource(this.hoverSourceId).setData({
					type: 'FeatureCollection',
					features: features
				});
				this.hoverLayerIds = [];
				let hoverLayers = [];
				// heatmap layer
				this.sets.forEach(set => {
					let layerId = 'hoverlayer' + '_' + set;
					this.hoverLayerIds.push(layerId);
					let layer = {
						id: layerId,
						type: 'heatmap',
						maxzoom: 15,
						source: this.hoverSourceId,
						paint: {
							// heatmap properties, refer to the pages below
							// https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#paint-heatmap-heatmap-color
							// https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#paint-heatmap-heatmap-color
							// https://blog.mapbox.com/introducing-heatmaps-in-mapbox-gl-js-71355ada9e6c
							'heatmap-color': [
								'interpolate',
								['linear'],
								['heatmap-density'],
								0,
								'rgba(0, 0, 255, 0)',
                                0.3,
								this.$store.state.sets[set].colors[6],
								0.7,
                                this.$store.state.sets[set].colors[5],
                                1,
                                this.$store.state.sets[set].colors[3]
							],
							'heatmap-opacity': 0.5,
							'heatmap-radius': 40
						},
						filter: ['==', ['get', 'set'], set]
					};
					this.map.addLayer(layer);
					hoverLayers.push(layer);
				});
				let newLayers = [];
				hoverLayers.forEach(layer => {
					let newLayer = {};
					Object.assign(newLayer, layer);
					newLayer.id += '_minimap';
					newLayer.source = 'source';
					newLayer.paint['heatmap-radius'] = 5;
					newLayers.push(newLayer);
				});
				this.minimapPayload = {
					layers: newLayers,
					features: features
				};
			}
		},

		clickOnChart(payload) {
			if (payload.length > 0) {
				let selected = [];                
				payload.forEach(item => {

					let lastIdx= item.properties.set_id.lastIndexOf('_')
					let memberType = item.properties.set_id.substring(0, lastIdx)
					let memberIdx = item.properties.set_id.substring(lastIdx+1, item.properties.set_id.length)
					selected.push({
						type: memberType,
						idx: memberIdx
					});
				});
				this.$store.commit('updateSelection', selected);
				this.$store.commit('updateDirectSetSelectionSignal', true);
			}
		}
	},

	watch: {
		update(payload) {
			if (payload.type === 'delete') this.deleteSet(payload.set);
			else this.addSet(payload.set);
		},
		resizeInfo(height) {
			document.getElementById(this.componentId).style.height =
				height + 'px';
			this.map.resize();
		},
		selectedRange(range) {
			Object.keys(this.layers.highlighted).forEach(setName => {
				this.layers.highlighted[setName].setProps({
					filterRange: range
				});
			});
			let selected = this.getSelected();
			if (selected.length > 0)
				this.$store.commit('updateSelection', selected);
		},
		selectionMode(value) {
			if (value) {
				// hide tooltip when selection mode is on
				this.$refs.tooltip.setTooltip(null, 0, 0);
				Object.keys(this.layers).forEach(layer => {
					if (layer == 'highlighted') {
						this.sets.forEach(setName => {
							if (!this.layers[layer].hasOwnProperty(setName))
								this.getSetLayer(layer, setName);
							this.map.addLayer(this.layers[layer][setName]);
						});
					} else if (layer == 'dot_origin' && !this.settings[layer])
						this.toggleLayer(layer, true);
					else if (layer != 'dot_origin' && this.settings[layer])
						this.toggleLayer(layer, false);
				});
				this.sets.forEach(setName => {
					this.layers.dot_origin[setName].setProps({
						opacity: 0.3
					});
				});
				// this.map.triggerRepaint();
			} else {
				this.sets.forEach(setName => {
					this.layers.dot_origin[setName].setProps({
						opacity: this.opacity
					});
				});
				Object.keys(this.layers).forEach(layer => {
					if (layer != 'dot_origin' && this.settings[layer])
						this.toggleLayer(layer, true);
					else if (layer == 'dot_origin' && !this.settings[layer])
						this.toggleLayer(layer, false);
					else if (layer == 'highlighted')
						Object.keys(this.layers[layer]).forEach(setName => {
							this.map.removeLayer(
								this.layers[layer][setName].id
							);
						});
				});
				this.selectedRange = [
					[0, 0],
					[0, 0]
				];
			}
		},
		sets(sets) {
			if (sets.length == 0) {
				this.minCountryCount = Infinity;
				this.maxCountryCount = 0;
			} else {
				let mins = [];
				let maxs = [];
				sets.forEach(set => {
					mins.push(this.$store.state.sets[set].stats.country.min);
					maxs.push(this.$store.state.sets[set].stats.country.max);
				});
				this.minCountryCount = Math.min(...mins);
				this.maxCountryCount = Math.max(...maxs);
			}
		},
		countryCountRange() {
			let layers = ['line_country', 'arc_country'];
			layers.forEach(layer => {
				if (this.settings[layer]) {
					this.toggleLayer(layer, false);
					this.toggleLayer(layer, true);
				}
			});
		},
		isLine(value) {
			this.toggleLayer('line', value);
		},
		isArc(value) {
			this.toggleLayer('arc', value);
		},
		isDotOrigin(value) {
			this.toggleLayer('dot_origin', value);
		},
		isDotLocated(value) {
			this.toggleLayer('dot_located', value);
		},
		isLineCountry(value) {
			this.toggleLayer('line_country', value);
		},
		isArcCountry(value) {
			this.toggleLayer('arc_country', value);
		},
		isPieOrigin(value) {
			this.toggleLayer('pie_origin', value);
		},
		isPieLocated(value) {
			this.toggleLayer('pie_located', value);
		},
		isFlowerOrigin(value) {
			this.toggleLayer('flower_origin', value);
		},
		isFlowerLocated(value) {
			this.toggleLayer('flower_located', value);
		},
		isRosePieOrigin(value) {
			if(value) {
				this.isFlowerOrigin = true
			} else {
				this.isFlowerOrigin = false
				this.isPieOrigin = false
				this.markersOriginFlower = [];
			}
		},
		isRosePieLocated(value) {
			if(value) {
				this.isFlowerLocated = true
			} else {
				this.isFlowerLocated = false
				this.isPieLocated = false
				this.markersLocatedFlower = [];
			}
		}
	}
};
</script>

<style lang="scss" scoped>
.wrapper-control {
	position: absolute;
	right: 1.5em;
	top: 3em;
	overflow: hidden;
}

.v-card {
	font-family: 'Varela Round', sans-serif;
}

.rose {
    z-index: 500 !important;
}

.pie {
    z-index: 1000 !important;
}
</style>
