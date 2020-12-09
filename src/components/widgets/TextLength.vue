<template>
    <div v-show="data.length != 0" class="flex-grow-1 ma-0 pa-0">
        <Plotly :data="data" :layout="layout" :display-mode-bar="false"></Plotly>
    </div>
</template>

<script>
import { Plotly } from 'vue-plotly';

export default {
    name: 'TextLength',
    components: {
        Plotly
    },
    props: ['chartId', 'componentId', 'selected', 'selectionMode', 'update', 'resizeInfo'],
    data: function() {
        return {
            data: [],
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
                yaxis: {
                    zeroline: false
                },
                xaxis: {
                    visible: false
                },
                showlegend: false,
                hoverlabel: {
                    font: {
                        family: 'Varela Round'
                    }
                }
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
                type: 'box',
                name: setName,
                boxpoints: 'Outliers',
                boxmean: true,
                marker: { color: set.color }
            };
            let y = [];
            set.members.forEach(member => {
                y.push(
                    this.$store.state.data[member.type][member.idx].text.length
                );
            });
            datum.y = y;
            this.data.push(datum);
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
        },
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
