<template>
    <div>
        <div v-if="type == 'tweet'" class="tooltip" :style="placement">
            <p>
                <span class="tooltip-icon">
                    <i class="fas fa-at" aria-hidden="true"></i>
                </span>
                {{ tweet.user.screen_name }}
            </p>
            <p>
                <span class="tooltip-icon">
                    <i class="fab fa-twitter" aria-hidden="true"></i>
                </span>
                {{ tweet.text }}
            </p>
            <p>
                <span class="tooltip-icon">
                    <i class="fas fa-map-marker" aria-hidden="true"></i>
                </span>
                {{ tweet.place.full_name }} ( {{ tweet.place.type }} )
            </p>
            <p>
                <span class="tooltip-icon">
                    <i class="fas fa-question" aria-hidden="true"></i>
                </span>
                {{ tweet.predicted.name }} ( {{ tweet.predicted.type }} )
            </p>
            <p>
                <span class="tooltip-icon">
                    <i class="fas fa-ruler" aria-hidden="true"></i>
                </span>
                {{ tweet.dist }}
            </p>
        </div>
        <div v-else-if="type == 'country'" class="tooltip" :style="placement">
            <p>
                <span class="tooltip-icon">
                    <i class="fas fa-map-marker" aria-hidden="true"></i>
                </span>
                {{ getCountryName(country.origin) }}
            </p>
            <p>
                <span class="tooltip-icon">
                    <i class="fas fa-question" aria-hidden="true"></i>
                </span>
                {{ getCountryName(country.located) }}
            </p>
            <p>
                <span class="tooltip-icon">
                    <i class="fas fa-hashtag" aria-hidden="true"></i>
                </span>
                {{ country.count }}
            </p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Tooltip',

    data() {
        return {
            type: 'none',
            tweet: null,
            country: null,
            placement: {
                display: 'none'
            }
        };
    },

    methods: {
        getCountryName(code) {
            if (!this.country_lookup)
                this.country_lookup = require('country-js');
            let info = this.country_lookup.search(code)[0];
            let result = '';
            if (!info) {
                // Kosovo (XK) not in the library
                if (code.toLowerCase() == 'xk') result = 'Kosovo';
                else result = '';
            } else {
                result = info.name;
            }
            return result;
        },
        setTooltip(object, x, y, type) {
            if (object) {
                this.type = type;
                if (type == 'tweet') {
                    this.tweet = this.$store.state.data[object.type][
                        object.idx
                    ];
                    this.placement.left = String(x + 15) + 'px';
                    this.placement.top = String(y + 10) + 'px';
                    this.placement.display = 'block';
                } else if (type == 'country') {
                    this.country = object;
                    this.placement.left = String(x + 15) + 'px';
                    this.placement.top = String(y + 10) + 'px';
                    this.placement.display = 'block';
                }
            } else {
                this.type = 'none';
                this.placement.display = 'none';
            }
        }
    }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Baloo&display=swap&subset=latin-ext');

.tooltip {
    position: absolute;
    z-index: 1;
    pointer-events: none;
    font-family: 'Baloo', cursive;
    font-size: 16px;
    font-weight: 800;
    color: whitesmoke;
    -webkit-text-stroke: 1px black;
}

.tooltip p {
    line-height: 1.2;
    margin: 0;
    padding-bottom: 0.5em;
}

.tooltip-icon {
    display: inline-block !important;
    width: 1em !important;
    text-align: right;
    color: #1dcaff !important;
    padding-top: 0.08em !important;
    padding-right: 0.5em !important;
}
</style>