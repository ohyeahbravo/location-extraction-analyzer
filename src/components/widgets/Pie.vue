<template>
    <div class="flex-grow-1 ma-0 pa-0">
        <Plotly :id="chartId" :data="data" :layout="layout" :display-mode-bar="false"></Plotly>
    </div>
</template>

<script>
import { Plotly } from 'vue-plotly';

export default {
    name: 'Pie',
    components: {
        Plotly
    },
    props: ['features', 'chartId', 'size', 'data', 'source'],
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
                    font: {
                        family: 'Varela Round'
                    }
                }
            }
        };
    },
    mounted() {
        let chart = document.getElementById(this.chartId);
        chart.on('plotly_hover', this.hoverHandler);
        chart.on('plotly_unhover', this.unhoverHandler);
        chart.on('plotly_click', this.clickHandler);
    },
    methods: {
        hoverHandler() {
            let info = []
            this.data[0].labels.forEach((label, i) => {
                info.push({set: label, value: this.data[0].values[i]})
            });
            let payload = {
                items: this.features,
                clusterId: this.chartId.split('-')[1],
                source: this.source,
                size: this.size,
                info: info
            };
            this.$emit('hoverOnPie', payload);
        },
        unhoverHandler() {
            this.$emit('hoverOnPie', null);
        },
        clickHandler() {
            let payload = this.features;
            this.$emit('clickOnPie', payload);
        }
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
