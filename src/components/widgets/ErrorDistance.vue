<template>
    <v-col class="flex-grow-1 d-flex flex-column ma-0 pa-0">
        <v-row class="flex-grow-0 flex-shrink-0 ma-0 pa-0">
            <v-slider
                v-model="bin"
                :min="sliderMin"
                :max="sliderMax"
                step="5"
                thumb-label
                class="mx-10 mt-2"
                label="Bin Size"
                track-color="grey lighten-2"
                color="grey darken-1"
                hide-details
                v-show="data.length != 0"
                style="font-family: 'Varela Round', sans-serif;"
            ></v-slider>
        </v-row>
        <v-row
            v-show="data.length != 0"
            :id="chartContainerId"
            class="flex-grow-1 ma-0 pa-0"
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
    name: 'ErrorDistance',
    components: {
        Plotly
    },
    props: ['chartId', 'selected', 'selectionMode', 'update', 'resizeInfo'],
    computed: {
        chartContainerId() {
            return 'container-' + this.chartId;
        }
    },
    data: function() {
        return {
            data: [],
            sliderMin: 5,
            sliderMax: 1000,
            bin: 1000,
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
                    // visible: false
                },
                yaxis: {
                    zeroline: false,
                    // tick interval is integer
                    // tickformat: ',d'
                },
                showlegend: false,
                hoverlabel: {
                    font: {
                        family: 'Varela Round'
                    }
                },
                barmode: 'overlay',
                bargap: 0.2
            }
        };
    },
    methods: {
        deleteSet(setName) {
            if (setName == 'all') this.data = [];
            else
                for (let i in this.data)
                    if (this.data[i].name == setName) this.data.splice(i, 1);
        },
        addSet(setName) {
            // set already exists
            for (let i in this.data) if (this.data[i].name == setName) return;
            let set = this.$store.state.sets[setName];
            let datum = {
                type: 'histogram',
                histnorm: 'probability',
                name: setName,
                opacity: 0.5,
                marker: { color: set.color },
                xbins: {
                    end: max,
                    size: this.bin,
                    start: 0
                },
                hoverinfo: 'y'
            };
            let min = Infinity;
            let max = 0;
            let x = [];
            set.members.forEach(member => {
                let dist = this.$store.state.data[member.type][member.idx].dist;
                x.push(dist);
                if (dist <= min) min = dist;
                if (dist >= max) max = dist;
            });
            this.sliderMax = Math.round(max / 10);
            datum.x = x;
            this.data.push(datum);
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
        // update series based on the slider value
        bin(bin) {
            // this.updateSeries(this.sets);
            this.data.forEach(datum => {
                datum.xbins.size = bin;
            });
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
