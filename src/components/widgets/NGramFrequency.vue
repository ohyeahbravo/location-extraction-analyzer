<template>
    <v-col class="d-flex flex-column ma-0 pa-0">
        <v-row
            v-show="sets.length != 0"
            class="flex-grow-0 flex-shrink-0 mx-7 mb-5 pa-0"
            align="end"
            justify="center"
            style="font-family: 'Varela Round', sans-serif;"
        >
            <v-col cols="12" sm="2" align="center" class="ma-0 py-0 px-5">
                <v-switch
                    v-model="tfBar"
                    label="TF bar"
                    color="grey darken-3"
                    class="ma-0 pa-0"
                    hide-details
                ></v-switch>
                <v-radio-group
                    v-model="type"
                    :mandatory="true"
                    class="mt-3 my-0 pa-0"
                    hide-details
                >
                    <v-radio
                        label="TF"
                        value="tf"
                        color="grey darken-1"
                    ></v-radio>
                    <v-radio
                        label="TF-IDF"
                        value="tfidf"
                        color="grey darken-1"
                    ></v-radio>
                </v-radio-group>
                <v-card
                    class="mt-3 pa-0 font-weight-bold"
                    align="center"
                    color="grey darken-3"
                    dark
                    round
                    flat
                >
                    <div>Type</div>
                </v-card>
            </v-col>
            <v-col cols="12" sm="2" align="center" class="ma-0 py-0 px-5">
                <v-radio-group
                    v-model="N"
                    :mandatory="true"
                    class="ma-0 pa-0"
                    hide-details
                >
                    <v-radio
                        label="unigram"
                        value="1"
                        color="grey darken-1"
                    ></v-radio>
                    <v-radio
                        label="bigram"
                        value="2"
                        color="grey darken-1"
                    ></v-radio>
                    <v-radio
                        label="trigram"
                        value="3"
                        color="grey darken-1"
                    ></v-radio>
                </v-radio-group>
                <v-card
                    class="mt-3 pa-0 font-weight-bold"
                    align="center"
                    color="grey darken-3"
                    dark
                    round
                    flat
                >
                    <div>n-gram</div>
                </v-card>
            </v-col>
            <v-col cols="12" sm="4" justify="center" class="ma-0 py-0 px-5">
                <v-row class="ma-0 pa-0">
                    <Plotly
                        id="slider_plot"
                        :data="slider_data"
                        :layout="slider_layout"
                        :displayModeBar="false"
                    ></Plotly>
                </v-row>
                <v-row class="ma-0 pa-0">
                    <v-slider
                        v-model="topPercent"
                        color="grey darken-3"
                        track-color="grey lighten-2"
                        min="1"
                        max="99"
                        step="1"
                        height="20"
                        thumb-label
                        dense
                        class="ma-0 pa-0"
                        hide-details
                    ></v-slider>
                </v-row>
                <v-card
                    class="mt-3 pa-0 font-weight-bold"
                    align="center"
                    color="grey darken-3"
                    dark
                    round
                    flat
                >
                    <div>top %</div>
                </v-card>
            </v-col>
            <v-col cols="12" sm="4" class="ma-0 py-0 px-5">
                <v-chip-group
                    mandatory
                    v-model="sortIndex"
                    max="1"
                    show-arrows
                    column
                >
                    <v-chip
                        :color="colorAll"
                        outlined
                        filter
                        :disabled="type === 'tfidf'"
                        >_all</v-chip
                    >
                    <v-chip
                        v-for="set in sets"
                        :key="set"
                        :color="$store.state.sets[set].color"
                        outlined
                        filter
                        >{{ set }}</v-chip
                    >
                </v-chip-group>
                <v-card
                    class="mt-3 pa-0 font-weight-bold"
                    align="center"
                    color="grey darken-3"
                    dark
                    round
                    flat
                >
                    <div>sort by</div>
                </v-card>
            </v-col>
        </v-row>
        <v-row
            v-show="sets.length != 0"
            class="flex-grow-0 flex-shrink-0 mx-6 pa-0"
            align="center"
            justify="center"
            style="font-family: 'Varela Round', sans-serif;"
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
                    @click="goToFirstPage"
                    class="mx-5"
                >
                    <v-icon>fas fa-angle-double-left</v-icon>
                </v-btn>
                <v-btn
                    text
                    icon
                    color="grey darken-1"
                    :disabled="range[0] === 0"
                    @click="goToPreviousPage"
                >
                    <v-icon>fas fa-angle-left</v-icon>
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
            >
                <v-btn
                    text
                    icon
                    color="grey darken-1"
                    :disabled="range[1] == lengths[this.N]"
                    @click="goToNextPage"
                >
                    <v-icon>fas fa-angle-right</v-icon>
                </v-btn>
                <v-btn
                    text
                    icon
                    color="grey darken-1"
                    :disabled="range[1] == lengths[this.N]"
                    @click="goToLastPage"
                    class="mx-5"
                >
                    <v-icon>fas fa-angle-double-right</v-icon>
                </v-btn>
            </v-col>
        </v-row>
        <v-row
            v-show="sets.length != 0"
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
import * as _ from 'underscore';
import { quantile } from 'simple-statistics';
import chroma from 'chroma-js';

export default {
    name: 'NGramFrequency',
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
            tf_all: { 1: [], 2: [], 3: [] },
            tfidfs: {},
            lengths: { 1: 0, 2: 0, 3: 0 },
            quantiles: { tf_all: { 1: [], 2: [], 3: [] }, tfidf: {} },
            quantiles_hist_tfidf: {},
            range: [0, 10],
            // user options
            type: 'tf',
            tfBar: true,
            topPercent: 10,
            sortIndex: 0,
            N: '1',
            terms: [],
            colorAll: '#202020',
            dotSize: 12,
            // slider chart variables
            slider_data: [],
            slider_layout: {
                height: 80,
                margin: {
                    l: 8,
                    r: 8,
                    b: 0,
                    t: 0,
                    pad: 0,
                    autoexpand: false
                },
                font: {
                    family: 'Varela Round',
                    size: 14,
                    color: '#7f7f7f'
                },
                xaxis: {
                    visible: false,
                    fixedrange: true
                },
                yaxis: {
                    visible: false,
                    fixedrange: true,
                    type: 'log'
                },
                fixedrange: true,
                showlegend: false,
                hoverlabel: {
                    font: {
                        family: 'Varela Round'
                    }
                }
            },
            // chart variables
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
                xaxis: {
                    zeroline: false,
                    fixedrange: true
                },
                yaxis: {
                    automargin: true,
                    type: 'category',
                    fixedrange: true,
                    showgrid: true
                },
                xaxis2: {
                    visible: false,
                    fixedrange: true,
                    overlaying: 'x'
                },
                showlegend: false,
                hoverlabel: {
                    font: {
                        family: 'Varela Round'
                    }
                },
                hovermode: 'closest'
            }
        };
    },

    computed: {
        chartContainerId() {
            return 'container-' + this.chartId;
        },
        sort() {
            if (this.sortIndex == 0) return '_all';
            else return this.sets[this.sortIndex - 1];
        }
    },
    created() {
        this.topPercents = [];
        for (let i = 1; i < 100; i++) {
            this.topPercents.push(i);
        }
    },
    methods: {
        addSet(setName) {
            // update the term frequency for all sets combined
            this.getTFforAll();
            // get tf-idf for the new set and update for other sets
            this.getTFIDFs();
            // set the adding set as a sorting option if it's the first set in tfidf type
            if (this.type == 'tfidf' && this.sets.length == 1)
                this.sortIndex = 1;
            // updating slider chart
            if (this.type == 'tf') {
                this.slider_data.push({
                    type: 'bar',
                    name: setName,
                    x: this.topPercents,
                    y: this.$store.state.sets[setName].textStats
                        .tf_quantiles_hist[this.N],
                    marker: {
                        color: this.$store.state.sets[setName].color,
                        opacity: 0.5
                    }
                });
            } else {
                this.slider_data.push({
                    type: 'bar',
                    name: setName,
                    x: this.topPercents,
                    y: this.quantiles_hist_tfidf[setName][this.N],
                    marker: {
                        color: this.$store.state.sets[setName].color,
                        opacity: 0.5
                    }
                });
            }
            this.reorderTerms();
            // adding data to the chart
            this.updateChart();
        },
        deleteSet(setName) {
            // change current sorting if it's the deleting set
            if (this.sort == setName && this.type == 'tf') this.sortIndex = 0;
            else if (
                this.sort == setName &&
                this.type == 'tfidf' &&
                this.sets.length > 0
            )
                this.sortIndex = 1;
            // delete quantiles
            delete this.quantiles.tfidf[setName];
            // delete quantile histogram data from slider chart
            this.slider_data.splice(
                _.find(this.slider_data, function(datum) {
                    return datum.name == 'setName';
                }),
                1
            );
            delete this.quantiles_hist_tfidf[setName];
            // the deleted set isn't the last one
            if (this.sets.length > 0) {
                // update the term frequency for all sets combined
                this.getTFforAll();
                // get tf-idf for the new set and update for other sets
                this.getTFIDFs();
                // change the range when the new terms are less than the previous range
                if (this.range[1] > this.lengths[this.N]) this.goToLastPage();
                this.updateChart();
            } else {
                // set the sorting option to null when there are no sets
                this.sortIndex = 0;
            }
        },
        // reorder all terms to prioritize the main set terms
        reorderTerms() {
            // get all terms first
            let all = this.tf_all[this.N].map(x => x[0]);
            // when the type is tf and sorting option is '_all' (which doesn't exist in tfidf type)
            if (this.sort == '_all') this.terms = all;
            // when the sorting option is a specific set
            else {
                // get the main set terms first
                let main;
                if (this.type == 'tf')
                    main = this.$store.state.sets[
                        this.sort
                    ].textStats.tf_normalized[this.N].map(x => x[0]);
                else main = this.tfidfs[this.sort][this.N].map(x => x[0]);
                // extract the difference and place them after the main set terms
                let remained = _.difference(all, main);
                this.terms = main.concat(remained);
            }
        },
        getTFforAll() {
            let unigrams = {};
            let bigrams = {};
            let trigrams = {};
            let n_unigrams = 0;
            let n_bigrams = 0;
            let n_trigrams = 0;
            // get TF for all
            this.sets.forEach(setName => {
                let setTF = this.$store.state.sets[setName].textStats.tf;
                // unigram
                Object.keys(setTF['1']).forEach(key => {
                    if (unigrams.hasOwnProperty(key))
                        unigrams[key] += setTF['1'][key];
                    else unigrams[key] = setTF['1'][key];
                    n_unigrams += setTF['1'][key];
                });
                // bigrams
                Object.keys(setTF['2']).forEach(key => {
                    if (bigrams.hasOwnProperty(key))
                        bigrams[key] += setTF['2'][key];
                    else bigrams[key] = setTF['2'][key];
                    n_bigrams += setTF['2'][key];
                });
                // trigrams
                Object.keys(setTF['3']).forEach(key => {
                    if (trigrams.hasOwnProperty(key))
                        trigrams[key] += setTF['3'][key];
                    else trigrams[key] = setTF['3'][key];
                    n_trigrams += setTF['3'][key];
                });
            });
            // normalize & sort
            let unigrams_arr = [];
            Object.keys(unigrams).forEach(gram => {
                unigrams_arr.push([gram, unigrams[gram] / n_unigrams]);
            });
            unigrams_arr.sort(function(first, second) {
                return second[1] - first[1];
            });
            let bigrams_arr = [];
            Object.keys(bigrams).forEach(gram => {
                bigrams_arr.push([gram, bigrams[gram] / n_bigrams]);
            });
            bigrams_arr.sort(function(first, second) {
                return second[1] - first[1];
            });
            let trigrams_arr = [];
            Object.keys(trigrams).forEach(gram => {
                trigrams_arr.push([gram, trigrams[gram] / n_trigrams]);
            });
            trigrams_arr.sort(function(first, second) {
                return second[1] - first[1];
            });
            this.tf_all['1'] = unigrams_arr;
            this.tf_all['2'] = bigrams_arr;
            this.tf_all['3'] = trigrams_arr;
            // calculating max length for pagination
            this.lengths['1'] = unigrams_arr.length;
            this.lengths['2'] = bigrams_arr.length;
            this.lengths['3'] = trigrams_arr.length;

            // get quantiles
            ['1', '2', '3'].forEach(N => {
                this.quantiles.tf_all[N] = [];
                // quantiles are calculated based on unique values (not terms, as many of them have the same values)
                let values = _.uniq(this.tf_all[N].map(x => x[1]));
                // pre-calculate quantiles for all options
                for (let i = 1; i < 100; i++) {
                    this.quantiles.tf_all[N].push(
                        quantile(values, 1 - i / 100)
                    );
                }
            });
        },
        getIDF(term, n) {
            let inclusion = 0;
            this.sets.forEach(setName => {
                let setTF = this.$store.state.sets[setName].textStats.tf;
                if (setTF[n].hasOwnProperty(term)) inclusion++;
            });
            return Math.log(this.sets.length / inclusion);
        },
        getTFIDFs() {
            this.tfidfs = {};
            this.sets.forEach(setName => {
                let unigrams = [];
                let bigrams = [];
                let trigrams = [];
                let setTF = this.$store.state.sets[setName].textStats
                    .tf_normalized;
                // unigram
                setTF['1'].forEach(pair => {
                    let tfidf = pair[1] * this.getIDF(pair[0], '1');
                    unigrams.push([pair[0], tfidf]);
                });
                // bigram
                setTF['2'].forEach(pair => {
                    let tfidf = pair[1] * this.getIDF(pair[0], '2');
                    bigrams.push([pair[0], tfidf]);
                });
                // trigram
                setTF['3'].forEach(pair => {
                    let tfidf = pair[1] * this.getIDF(pair[0], '3');
                    trigrams.push([pair[0], tfidf]);
                });
                // sort
                unigrams.sort(function(first, second) {
                    return second[1] - first[1];
                });
                bigrams.sort(function(first, second) {
                    return second[1] - first[1];
                });
                trigrams.sort(function(first, second) {
                    return second[1] - first[1];
                });
                this.tfidfs[setName] = {
                    1: unigrams,
                    2: bigrams,
                    3: trigrams
                };
                this.quantiles.tfidf[setName] = {};
                this.quantiles_hist_tfidf[setName] = {};
                // get quantiles
                ['1', '2', '3'].forEach(N => {
                    this.quantiles.tfidf[setName][N] = [];
                    this.quantiles_hist_tfidf[setName][N] = [];
                    // quantiles are calculated based on unique values (not terms, as many of them have the same values)
                    let values = _.uniq(this.tfidfs[setName][N].map(x => x[1]));
                    // pre-calculate quantiles for all options
                    for (let i = 1; i < 100; i++) {
                        let value = quantile(values, 1 - i / 100);
                        this.quantiles.tfidf[setName][N].push(value);
                        let hist_count = 0;
                        this.tfidfs[setName][N].forEach(item => {
                            if (i == 1 && item[1] > value) hist_count++;
                            else if (
                                i > 1 &&
                                item[1] > value &&
                                item[1] <=
                                    this.quantiles.tfidf[setName][N][i - 2]
                            )
                                hist_count++;
                            else return;
                        });
                        this.quantiles_hist_tfidf[setName][N].push(hist_count);
                    }
                });
            });
        },
        goToFirstPage() {
            if (this.range[0] === 0) return;
            this.range = [0, 10];
            this.updateChart();
        },
        goToPreviousPage() {
            if (this.range[0] === 0) return;
            this.range[1] = this.range[0];
            this.range[0] -= 10;
            this.updateChart();
        },
        goToNextPage() {
            if (this.range[1] >= this.lengths[this.N]) return;
            this.range[0] = this.range[1];
            this.range[1] += 10;
            if (this.range[1] >= this.lengths[this.N])
                this.range[1] = this.lengths[this.N];
            this.updateChart();
        },
        goToLastPage() {
            if (this.range[1] >= this.lengths[this.N]) return;
            this.range[1] = this.lengths[this.N];
            this.range[0] = this.range[1] - (this.range[1] % 10);
            this.updateChart();
        },
        updateChart() {
            this.data = [];
            let terms = [];
            let numbers = [];
            let values;
            let quantile;
            let datum;
            // get terms for y axis
            for (let i = this.range[0]; i < this.range[1]; i++)
                terms.push(this.terms[i]);
            // add data for each sets
            this.sets.forEach(setName => {
                // get all values froma set and quantile
                if (this.type == 'tf') {
                    values = this.$store.state.sets[setName].textStats
                        .tf_normalized[this.N];
                    quantile = this.$store.state.sets[setName].textStats
                        .tf_quantiles[this.N][this.topPercent - 1];
                } else {
                    // tf-idf
                    values = this.tfidfs[setName][this.N];
                    quantile = this.quantiles.tfidf[setName][this.N][
                        this.topPercent - 1
                    ];
                }
                numbers = [];
                let colors = [];
                let line_colors = [];
                // get values for each term
                terms.forEach(term => {
                    let item = values.find(element => element[0] == term);
                    // if the term exist in the set
                    let number;
                    if (item !== undefined) number = item[1];
                    else if (this.type == 'tf') number = 0;
                    else number = NaN;
                    if (number > quantile) {
                        colors.push(
                            chroma(this.$store.state.sets[setName].color)
                                .alpha(0.7)
                                .css()
                        );
                        line_colors.push(
                            chroma(this.$store.state.sets[setName].color)
                                .alpha(0)
                                .css()
                        );
                    } else {
                        colors.push(
                            chroma(this.$store.state.sets[setName].color)
                                .alpha(0)
                                .css()
                        );
                        line_colors.push(
                            chroma(this.$store.state.sets[setName].color)
                                .alpha(1.0)
                                .css()
                        );
                    }
                    numbers.push(number);
                });
                // construct the marker datum
                datum = {
                    mode: 'markers',
                    orientation: 'h',
                    name: setName,
                    marker: {
                        color: colors,
                        size: this.dotSize,
                        line: {
                            color: line_colors,
                            width: this.dotSize * 0.1
                        }
                    },
                    x: numbers,
                    y: terms,
                    hoverinfo: 'x'
                };
                // add halo around the marker if the set is the sorting option
                if (this.sort == setName)
                    this.data.push({
                        mode: 'markers',
                        orientation: 'h',
                        name: setName + '_sort',
                        marker: {
                            color: 'rgba(255, 255, 255, 0.0)',
                            size: this.dotSize,
                            line: {
                                width: this.dotSize * 0.5,
                                color: chroma(
                                    this.$store.state.sets[setName].color
                                )
                                    .alpha(0.2)
                                    .css()
                            }
                        },
                        x: numbers,
                        y: terms,
                        hoverinfo: 'none'
                    });
                // add to the chart
                this.data.push(datum);
            });
            // add TF bar trace
            values = this.tf_all[this.N];
            quantile = this.quantiles.tf_all[this.N][this.topPercent - 1];
            numbers = [];
            let bar_colors = [];
            let bar_line_colors = [];
            // get values for each term
            terms.forEach(term => {
                // if the term exist in the set
                let number = values.find(element => element[0] == term)[1];
                if (number > quantile) {
                    bar_colors.push(
                        chroma(this.colorAll)
                            .alpha(0.5)
                            .css()
                    );
                    bar_line_colors.push(
                        chroma(this.colorAll)
                            .alpha(0)
                            .css()
                    );
                } else {
                    bar_colors.push(
                        chroma(this.colorAll)
                            .alpha(0)
                            .css()
                    );
                    bar_line_colors.push(
                        chroma(this.colorAll)
                            .alpha(0.2)
                            .css()
                    );
                }
                numbers.push(number);
            });
            // change opacity to control the visibility
            datum = {
                type: 'bar',
                orientation: 'h',
                name: '_all',
                marker: {
                    color: bar_colors,
                    line: {
                        color: bar_line_colors,
                        width: this.dotSize * 0.1
                    }
                },
                x: numbers,
                y: terms
            };
            if (this.type == 'tf') datum.xaxis = 'x';
            else datum.xaxis = 'x2';
            if (this.tfBar) {
                datum.marker.opacity = 1;
                datum.hoverinfo = 'x';
            } else {
                datum.marker.opacity = 0;
                datum.hoverinfo = 'skip';
            }
            this.data.unshift(datum);
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
        N() {
            this.range = [0, 10];
            // reorder the terms
            this.reorderTerms();
            this.updateChart();
        },
        topPercent() {
            this.updateChart();
        },
        type(type) {
            if (type == 'tfidf') {
                // change the sorting option to the first set when the current on is '_all'
                if (this.sortIndex == 0) this.sortIndex = 1;
                this.data[0].xaxis = 'x2';
            } else {
                this.data[0].xaxis = 'x';
            }
            //change the slider plot
            this.slider_data = [];
            this.sets.forEach(setName => {
                let y;
                if (type == 'tf')
                    y = this.$store.state.sets[setName].textStats
                        .tf_quantiles_hist[this.N];
                else y = this.quantiles_hist_tfidf[setName][this.N];
                this.slider_data.push({
                    type: 'bar',
                    name: setName,
                    x: this.topPercents,
                    y: y,
                    marker: {
                        color: this.$store.state.sets[setName].color,
                        opacity: 0.5
                    }
                });
            });
            // reset the range
            this.range = [0, 10];
            // reorder the terms
            this.reorderTerms();
            this.updateChart();
        },
        sortIndex() {
            if (this.sets.length > 0) {
                // reorder the terms
                this.reorderTerms();
                this.updateChart();
            }
        },
        tfBar(value) {
            // add tf bar
            if (value) {
                this.data[0].marker.opacity = 1;
                // disable hover
                this.data[0].hoverinfo = 'x';
                // remove the tf bar
            } else {
                this.data[0].marker.opacity = 0;
                // enable hover
                this.data[0].hoverinfo = 'skip';
            }
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
