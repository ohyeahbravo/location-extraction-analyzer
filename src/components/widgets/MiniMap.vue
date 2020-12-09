<template>
    <MglMap
        :accessToken="accessToken"
        :mapStyle.sync="mapStyle"
        :zoom="zoom"
        @load="onMapLoaded"
        :attributionControl="false"
        :maxBounds="maxBounds"
    >
    </MglMap>
</template>

<script>
import { MglMap } from 'vue-mapbox';

export default {
    name: 'MiniMap',

    components: {
        MglMap
    },

    props: ['payload'],

    data() {
        return {
            accessToken:
                'pk.eyJ1Ijoib2h5ZWFoYnJhdm8iLCJhIjoiY2swMmRwM3RxMG1vejNpbGNmaTh0MGYzaiJ9.SILsxJa7qEHxs-MZsgTk5A', // your access token. Needed if you using Mapbox maps
            mapStyle: 'mapbox://styles/mapbox/dark-v10',
            zoom: 1,
            // not -90 to 90 as it causes the panning to go beyond the map size
            maxBounds: [
                [-180, -85],
                [180, 85]
            ],
            sourceId: 'source',
            layerIds: []
        };
    },

    computed: {},

    methods: {
        onMapLoaded(e) {
            this.minimap = e.map;
            this.zoom = 0;
        }
    },

    watch: {
        payload(payload) {
            if (payload) {
                if (this.minimap.getSource(this.sourceId) === undefined) {
                    let geojson = {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: payload.features
                        }
                    };
                    console.log(geojson);
                    this.minimap.addSource(this.sourceId, geojson);
                } else {
                    this.minimap.getSource('source').setData({
                        type: 'FeatureCollection',
                        features: payload.features
                    });
                }
                this.layerIds.forEach(id => {
                    this.minimap.removeLayer(id);
                });
                this.layerIds = [];
                payload.layers.forEach(layer => {
                    this.layerIds.push(layer.id);
                    this.minimap.addLayer(layer);
                });
            } else {
                this.layerIds.forEach(id => {
                    this.minimap.removeLayer(id);
                });
                this.layerIds = [];
            }
        }
    }
};
</script>

<style lang="scss" scoped></style>
