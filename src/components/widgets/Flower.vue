<template>
    <div class="flex-grow-1 ma-0 pa-0">
        <Plotly
            :id="chartId"
            :data="data"
            :layout="layout"
            :display-mode-bar="false"
        ></Plotly>
    </div>
</template>

<script>
import { Plotly } from 'vue-plotly';

export default {
    name: 'Flower',
    components: {
        Plotly
    },
    props: ['features', 'chartId', 'size', 'data', 'range', 'source'],
    data: function() {
        return {
            layout: {
                width: this.size,
                margin: {
                    l: 0,
                    r: 0,
                    b: 0,
                    t: 0,
                    pad: 0
                },
                font: {
                    family: 'Varela Round',
                    size: 14,
                    color: '#7f7f7f'
                },
                paper_bgcolor: 'rgba(0,0,0,0)',
                showlegend: false,
                hoverlabel: {
                    bgcolor: 'rgba(0,0,0,0)',
                    font: {
                        family: 'Varela Round'
                    }
                },
                hovermode: 'closest',
                polar: {
                    // barmode: 'overlay',
                    barmode: 'stack',
                    bargap: 0,
                    radialaxis: { visible: false, range: this.range },
                    angularaxis: { visible: false, direction: 'clockwise' },
                    bgcolor: 'rgba(0, 0, 0, 0)'
                }
            }
        };
    },
    mounted() {
        let chart = document.getElementById(this.chartId);
        chart.on('plotly_hover', this.hoverHandler);
        chart.on('plotly_unhover', this.unhoverHandler);
        chart.on('plotly_click', this.clickHandler);
        this.colors = [];
        this.data.forEach(datum => {
            this.colors.push(datum.marker.color);
        });
    },
    methods: {
        hoverHandler(data) {
            let idx = data.points[0].pointIndex;
            this.data.forEach((datum, i) => {
                let colors = [];
                for (let j = 0; j < 8; j++) {
                    if (j == idx) colors.push('#ffffff');
                    else colors.push(this.colors[i]);
                }
                datum.marker.color = colors;
            });
            let info = []
            this.data.forEach(set => {
                info.push({set: set.name, value: set.r[data.points[0].pointIndex]})
            });
            let payload = {
                items: this.features[data.points[0].theta],
                clusterId: this.chartId.split('-')[1],
                source: this.source,
                size: this.size,
                info: info
            };
            this.$emit('hoverOnPetal', payload);
        },
        unhoverHandler() {
            this.data.forEach((datum, i) => {
                datum.marker.color = this.colors[i];
            });
            this.$emit('hoverOnPetal', null);
        },
        clickHandler(data) {
            let payload = this.features[data.points[0].theta];
            this.$emit('clickOnPetal', payload);
        }
    },
    created() {
        this.$emit('roseCreated');        
    },
    watch: {
        size(size) {
            this.layout.width = size;
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
