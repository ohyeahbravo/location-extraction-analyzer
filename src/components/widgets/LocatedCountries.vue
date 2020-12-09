<template>
    <v-col class="d-flex flex-column ma-0 pa-0">
        <v-row
            v-show="data.length != 0"
            class="flex-grow-0 flex-shrink-0 mx-6 pa-0"
            align="center"
            justify="center"
        >
            <v-col
                cols="12"
                sm="4"
                align="center"
                class="ma-0 pa-0"
                justify="center"
            >
                <v-btn
                    text
                    icon
                    color="grey darken-1"
                    :disabled="range[0] === 0"
                    @click="goToPreviousPage"
                >
                    <v-icon>fas fa-chevron-left</v-icon>
                </v-btn>
            </v-col>
            <v-col
                cols="12"
                sm="4"
                align="center"
                class="ma-0 pa-0"
                justify="center"
            >
                <p class="text-center ma-0">
                    {{ range[0] + 1 }} - {{ range[1] }}
                </p>
            </v-col>
            <v-col
                cols="12"
                sm="4"
                align="center"
                justify="center"
                class="ma-0 pa-0"
                @click="goToNextPage"
            >
                <v-btn
                    text
                    icon
                    color="grey darken-1"
                    :disabled="range[1] >= n_items"
                >
                    <v-icon>fas fa-chevron-right</v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-row
            v-show="data.length != 0"
            class="flex-grow-1 ma-0 pa-0"
            :id="chartContainerId"
        >
            <Plotly
                :id="chartId"
                :data="data"
                :layout="layout"
                :displayModeBar="false"
            ></Plotly>
        </v-row>
    </v-col>
</template>

<script>
import { Plotly } from 'vue-plotly';

export default {
    name: 'LocatedCountries',
    components: {
        Plotly
    },
    props: ['chartId', 'selected', 'selectionMode', 'update', 'resizeInfo'],
    computed: {
        chartContainerId() {
            return 'container-' + this.chartId;
        },
        n_items() {
            return this.sorted.length;
        }
    },
    data: function() {
        return {
            range: [0, 10],
            data: [],
            opacity: 0.8,
            individual_counts: {},
            total_counts: {},
            sorted: [],
            layout: {
                margin: {
                    l: 50,
                    r: 30,
                    b: 50,
                    t: 20,
                    pad: 0
                },
                font: {
                    family: 'Varela Round',
                    size: 14,
                    color: '#7f7f7f'
                },
                xaxis: {
                    zeroline: false,
                    // tick interval is integer
                    tickformat: ',d',
                    fixedrange: true
                },
                yaxis: {
                    visible: true,
                    automargin: true,
                    type: 'category',
                    fixedrange: true,
                    tickangle: 45
                },
                showlegend: false,
                hoverlabel: {
                    font: {
                        family: 'Varela Round'
                    }
                },
                barmode: 'stack',
                bargap: 0.2,
                annotations: []
            }
        };
    },
    methods: {
        deleteSet(setName) {
            if (setName == 'all') {
                this.individual_counts = {};
                this.total_counts = {};
                this.sorted = [];
                this.data = [];
                this.range[0] = 0;
                this.range[1] = 10;
            } else {
                if (this.individual_counts.hasOwnProperty(setName)) {
                    let countries = this.individual_counts[setName];
                    Object.keys(countries).forEach(country => {
                        this.total_counts[country] -= countries[country].count;
                    });
                    delete this.individual_counts[setName];
                    this.range[0] = 0;
                    this.range[1] = 10;
                    this.redrawChart();
                }
            }
        },
        addSet(setName) {
            // set already exists
            if (this.individual_counts.hasOwnProperty(setName)) return;

            // adding data
            let set = this.$store.state.sets[setName];
            let countries = {};
            set.members.forEach(member => {
                let country = this.$store.state.data[member.type][member.idx]
                    .predicted.country;
                if (country === 'United States of America') country = 'USA';
                if (countries.hasOwnProperty(country)) {
                    countries[country].count++;
                    countries[country].members.push(member);
                } else {
                    countries[country] = {
                        count: 1,
                        members: [member]
                    };
                }
                if (this.total_counts.hasOwnProperty(country))
                    this.total_counts[country]++;
                else this.total_counts[country] = 1;
            });
            this.individual_counts[setName] = countries;
            // Create items array & sort based on the second element & slice
            this.redrawChart();
        },
        redrawChart() {
            // Create items array & sort based on the second element & slice
            this.sorted = [];
            Object.keys(this.total_counts).forEach(country => {
                this.sorted.push({
                    country: country,
                    count: this.total_counts[country]
                });
            });
            this.sorted.sort(function(first, second) {
                return second.count - first.count;
            });
            this.data = [];
            Object.keys(this.individual_counts).forEach(setName => {
                this.addDatum(setName);
            });
        },
        goToPreviousPage() {
            if (this.range[0] === 0) return;
            this.range[1] = this.range[0];
            this.range[0] -= 10;
            this.data = [];
            Object.keys(this.individual_counts).forEach(setName => {
                this.addDatum(setName);
            });
        },
        goToNextPage() {
            if (this.range[1] >= this.n_items) return;
            this.range[0] = this.range[1];
            this.range[1] += 10;
            this.data = [];
            Object.keys(this.individual_counts).forEach(setName => {
                this.addDatum(setName);
            });
        },
        addDatum(setName) {
            let result = this.individual_counts[setName];
            // let y = [];
            let counts = [];
            let countries = [];

            let end = this.range[1];
            if (this.range[1] > this.n_items) end = this.n_items;
            // this.layout.annotations = [];
            // let annotation = {};
            for (let i = this.range[0]; i < end; i++) {
                let country = this.sorted[i].country;
                countries.push(country);
                if (result.hasOwnProperty(country)) {
                    counts.push(result[country].count);
                } else {
                    counts.push(NaN); // value 0 makes a tiny line
                }
                // annotation = {
                //     xref: 'x',
                //     y: country,
                //     text: this.sorted[i].count,
                //     xanchor: 'right',
                //     yanchor: 'middle',
                //     showarrow: false,
                //     font: {
                //         family: 'Arial',
                //         size: 16,
                //         color: 'black'
                //     }
                // };
            }
            // this.layout.annotations.push(annotation);
            let datum = {
                type: 'bar',
                orientation: 'h',
                name: setName,
                marker: {
                    color: this.$store.state.sets[setName].color,
                    opacity: this.opacity
                },
                x: counts,
                y: countries,
                hoverinfo: 'x'
            };
            this.data.push(datum);
        },

        clickHandler(data) {
            let country = data.points[0].y;
            let selected = [];
            // make the clicked one more opaque
            data.points.forEach(setPoint => {
                this.data.forEach(datum => {
                    let opacities = [];
                    for (let i = 0; i < 10; i++) {
                        if (i === setPoint.pointIndex) opacities.push(0.8);
                        else opacities.push(0.5);
                    }
                    datum.marker.opacity = opacities;
                });
                let setName = setPoint.data.name;
                selected = selected.concat(
                    this.individual_counts[setName][country].members
                );
            });
            this.$store.commit('updateSelection', selected);
        }
    },
    watch: {
        update(payload) {
            if (payload.type === 'delete') this.deleteSet(payload.set);
            else this.addSet(payload.set);
        },
        resizeInfo(height) {
            let childPos = document.getElementById(this.chartContainerId).offsetTop;
            let parentPos = document.getElementById(this.chartContainerId).parentElement.offsetTop;
            let offset = childPos - parentPos;
            document.getElementById(this.chartContainerId).style.height =
                height - offset + 'px';
        },

        selected(selected) {
            // selection got reset perhaps by ESC key
            if (selected.length === 0 && this.selectionMode) {
                this.data.forEach(datum => {
                    this.opacity = 0.5;
                    datum.marker.opacity = this.opacity;
                });
            }
        },

        selectionMode(value) {
            if (value) {
                this.data.forEach(datum => {
                    this.opacity = 0.5;
                    datum.marker.opacity = this.opacity;
                });
                let chart = document.getElementById(this.chartId);
                chart.on('plotly_click', this.clickHandler);
            } else {
                this.data.forEach(datum => {
                    this.opacity = 0.8;
                    datum.marker.opacity = this.opacity;
                });
                let chart = document.getElementById(this.chartId);
                chart.removeListener('plotly_click', this.clickHandler);
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.text-center {
    font-family: 'Varela Round', sans-serif;
    font-size: 16px;
}

.js-plotly-plot,
.plot-container {
    width: 100%;
    height: 100%;
}
</style>
