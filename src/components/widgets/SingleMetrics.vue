



<template>
    <v-col class="d-flex flex-column ma-0 pa-0">
        <v-row
            v-show="sets.length != 0"
            class="flex-grow-0 flex-shrink-0 mx-10 pa-0"
            align="center"
            justify="center"
            style="font-family: 'Varela Round', sans-serif;"
        >
            <v-select
                v-model="selectedAxes"
                :items="axes"
                label="Choose Axes"
                chips
                deletable-chips
                multiple
            >
                <template v-slot:prepend-item>
                    <v-list-item ripple @click="toggle">
                        <v-list-item-action>
                            <v-icon
                                :color="selectedAxes.length > 0 ? 'indigo darken-4' : ''"
                            >{{ icon }}</v-icon>
                        </v-list-item-action>
                        <v-list-item-content>
                            <v-list-item-title>Select All</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-divider class="mt-2"></v-divider>
                </template>
                <template v-slot:append-item></template>
            </v-select>
        </v-row>
        <v-row v-show="sets.length != 0" class="flex-grow-1 ma-0 pa-0" :id="chartContainerId">
            <Plotly :id="chartId" :data="data" :layout="layout" :display-mode-bar="false"></Plotly>
        </v-row>
    </v-col>
</template>

<script>
import { Plotly } from 'vue-plotly';
import * as _ from 'underscore';

export default {
	name: 'SingleMetrics',
	components: {
		Plotly
	},
	props: [
		'chartId',
		'sets',
		'selected',
		'selectionMode',
		'update',
		'resizeInfo'
	],
	data: function() {
		return {
			// chart variables
			data: [],
			color: [],
			colorscale: [],
			cmin: 1,
			setNames: [],
			axes: [
				'set',
				'avg num words',
				'avg word len',
				'avg text len',
				'TTR',
				'tweet count',
				'user count',
				'mean ED',
				'median ED',
				'acc:country',
				'acc',
				'acc@161'
			],
			selectedAxes: [
				'set',
				'avg num words',
				'avg word len',
				'avg text len',
				'TTR',
				'tweet count',
				'user count',
				'mean ED',
				'median ED',
				'acc:country',
				'acc',
				'acc@161'
			],
			dimensions: [
				{
					label: 'set',
					values: [],
					visible: true
				},
				{
					label: 'avg num words',
					values: [],
					visible: true
				},
				{
					label: 'avg word len',
					values: [],
					visible: true
				},
				{
					label: 'avg text len',
					values: [],
					visible: true
				},
				{
					label: 'TTR',
					values: [],
					visible: true
				},
				{
					label: 'tweet count',
					values: [],
					visible: true
				},
				{
					label: 'user count',
					values: [],
					visible: true
				},
				{
					label: 'mean ED',
					values: [],
					visible: true
				},
				{
					label: 'median ED',
					values: [],
					visible: true
				},
				{
					label: 'acc:country',
					values: [],
					visible: true
				},
				{
					label: 'acc',
					values: [],
					visible: true
				},
				{
					label: 'acc@161',
					values: [],
					visible: true
				}
			],
			layout: {
				margin: {
					l: 80,
					r: 80,
					b: 50,
					t: 60,
					pad: 0
				},
				font: {
					family: 'Varela Round',
					size: 14,
					color: '#7f7f7f'
				}
				// hovermode: 'closest'
			}
		};
	},
	computed: {
		chartContainerId() {
			return 'container-' + this.chartId;
		},
		selectedAll() {
			return this.selectedAxes.length === this.axes.length;
		},
		selectedSome() {
			return this.selectedAxes.length > 0 && !this.selectedAll;
		},
		icon() {
			if (this.likesAllFruit) return 'mdi-close-box';
			if (this.likesSomeFruit) return 'mdi-minus-box';
			return 'mdi-checkbox-blank-outline';
		}
	},
	methods: {
		toggle() {
			this.$nextTick(() => {
				if (this.selectedAll) {
					this.selectedAxes = [];
				} else {
					this.selectedAxes = this.axes.slice();
				}
			});
		},
		addSet(setName) {
			this.color.push(this.sets.length);
			this.setNames.push(setName);
			// add metric values to the chart
			let metrics = this.$store.state.sets[setName].metrics;
			Object.keys(metrics).forEach(metric => {
				let index = _.findIndex(this.dimensions, {
					label: metric
				});
				let value = metrics[metric];
				// if (value > this.data[0].dimensions[index].range[1])
				// 	range[1] = value;
				// if (value < this.data[0].dimensions[index].range[1])
				// 	range[0] = value;
				this.dimensions[index].values.push(value);
			});
			// only set
			if (this.sets.length == 1)
				this.data.push({
					type: 'parcoords',
					line: {
						cmin: this.cmin
					},
					labelfont: {
						size: 14,
						color: 'black'
					}
				});
			this.updateChart();
		},
		deleteSet(setName) {
			this.color.pop();
			let index = this.setNames.indexOf(setName);
			this.dimensions.forEach((dimension, i) => {
				this.dimensions[i].values.splice(index, 1);
			});
			this.setNames.splice(index, 1);
			if (this.sets.length == 0) this.data = [];
			else this.updateChart();
		},
		updateChart() {
			this.colorscale = [];
			if (this.sets.length == 1) {
				this.colorscale.push([
					0,
					this.$store.state.sets[this.sets[0]].color
				]);
				this.colorscale.push([
					1,
					this.$store.state.sets[this.sets[0]].color
				]);
			} else {
				this.sets.forEach((set, i) => {
					let scale = (i * 1) / (this.sets.length - 1);
					this.colorscale.push([
						scale,
						this.$store.state.sets[set].color
					]);
				});
			}
			this.dimensions[0].ticktext = this.setNames;
			this.dimensions[0].values = [];
			this.setNames.forEach((name, i) => {
				this.dimensions[0].values.push(i);
			});
			this.dimensions.forEach((dimension, i) => {
				this.dimensions[i].tickvals = _.uniq(dimension.values);
			});

			this.data[0].line.color = this.color;
			this.data[0].line.colorscale = this.colorscale;
			this.data[0].line.cmax = this.sets.length;
			this.data[0].dimensions = this.dimensions;
		}
	},
	watch: {
		update(payload) {
			if (payload.type === 'delete') this.deleteSet(payload.set);
			else this.addSet(payload.set);
		},
		resizeInfo(height) {
			let childPos = document.getElementById(this.chartContainerId)
				.offsetTop;
			let parentPos = document.getElementById(this.chartContainerId)
				.parentElement.offsetTop;
			let offset = childPos - parentPos;
			document.getElementById(this.chartContainerId).style.height =
				height - offset + 'px';
		},
		selectedAxes(axes) {
			this.dimensions.forEach((dimension, i) => {
				if (axes.includes(dimension.label))
					this.dimensions[i].visible = true;
				else {
					this.dimensions[i].visible = false;
				}
			});
			if (this.data.length == 1)
				this.data[0].dimensions = this.dimensions;
		}
	}
};
</script>

<style lang="scss" scoped>
.js-plotly-plot,
.plot-container {
	width: 100%;
	height: 100%;
}
</style>
