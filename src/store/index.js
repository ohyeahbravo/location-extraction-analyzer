import Vue from 'vue';
import Vuex from 'vuex';
import * as turf from '@turf/turf';
import chroma from 'chroma-js';
import * as _ from 'underscore';
import { quantile, mean, median } from 'simple-statistics';

Vue.use(Vuex);

function getCountryStats(state, members) {
    let origins = {};
    members.forEach(member => {
        let origin = state.data[member.type][member.idx].place.country_code;
        let located =
            state.data[member.type][member.idx].predicted.country_code;
        if (!origins.hasOwnProperty(origin)) origins[origin] = {};
        if (!origins[origin].hasOwnProperty(located))
            origins[origin][located] = {
                count: 1,
                members: [member]
            };
        else {
            origins[origin][located].count++;
            origins[origin][located].members.push(member);
        }
    });

    // flattening
    let connections = [];
    let min = Infinity;
    let max = 0;
    Object.keys(origins).forEach(origin => {
        Object.keys(origins[origin]).forEach(located => {
            // exclude when origin and located are the same
            if (origin != located) {
                let count = origins[origin][located].count;
                if (count < min) min = count;
                if (count > max) max = count;
                connections.push({
                    origin: origin,
                    located: located,
                    count: count,
                    members: origins[origin][located].members
                });
            }
        });
    });
    return { connections: connections, min: min, max: max };
}

function getTextStats(state, members) {
    let unigrams = {};
    let bigrams = {};
    let trigrams = {};
    let n_unigrams = 0;
    let n_bigrams = 0;
    let n_trigrams = 0;
    members.forEach(member => {
        let ngrams = state.data[member.type][member.idx].grams;
        Object.keys(ngrams).forEach(n => {
            ngrams[n].forEach(gram => {
                if (n == 1) {
                    if (unigrams.hasOwnProperty(gram)) unigrams[gram]++;
                    else unigrams[gram] = 1;
                    n_unigrams++;
                } else if (n == 2) {
                    let token = gram[0] + '_' + gram[1];
                    if (bigrams.hasOwnProperty(token)) bigrams[token]++;
                    else bigrams[token] = 1;
                    n_bigrams++;
                } else {
                    let token = gram[0] + '_' + gram[1] + '_' + gram[2];
                    if (trigrams.hasOwnProperty(token)) trigrams[token]++;
                    else trigrams[token] = 1;
                    n_trigrams++;
                }
            });
        });
    });
    // normalize
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
    // sort
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
    // get quantiles from 1 to 99%
    let uniq_unigram = _.uniq(unigrams_arr.map(x => x[1]));
    let uniq_bigram = _.uniq(bigrams_arr.map(x => x[1]));
    let uniq_trigram = _.uniq(trigrams_arr.map(x => x[1]));
    let quantiles_unigram = [];
    let quantiles_bigram = [];
    let quantiles_trigram = [];
    // histogram for each block of quantiles
    let quantiles_unigram_hist = [];
    let quantiles_bigram_hist = [];
    let quantiles_trigram_hist = [];
    let quantile_value;
    let hist_count;
    for (let i = 1; i < 100; i++) {
        quantile_value = quantile(uniq_unigram, 1 - i / 100);
        quantiles_unigram.push(quantile_value);
        hist_count = 0;
        unigrams_arr.forEach(item => {
            if (i == 1 && item[1] > quantile_value) hist_count++;
            else if (
                i > 1 &&
                item[1] > quantile_value &&
                item[1] <= quantiles_unigram[i - 2]
            )
                hist_count++;
            else return;
        });
        quantiles_unigram_hist.push(hist_count);
        quantile_value = quantile(uniq_bigram, 1 - i / 100);
        quantiles_bigram.push(quantile_value);
        hist_count = 0;
        bigrams_arr.forEach(item => {
            if (i == 1 && item[1] > quantile_value) hist_count++;
            else if (
                i > 1 &&
                item[1] > quantile_value &&
                item[1] <= quantiles_bigram[i - 2]
            )
                hist_count++;
            else return;
        });
        quantiles_bigram_hist.push(hist_count);
        quantile_value = quantile(uniq_trigram, 1 - i / 100);
        quantiles_trigram.push(quantile_value);
        hist_count = 0;
        trigrams_arr.forEach(item => {
            if (i == 1 && item[1] > quantile_value) hist_count++;
            else if (
                i > 1 &&
                item[1] > quantile_value &&
                item[1] <= quantiles_trigram[i - 2]
            )
                hist_count++;
            else return;
        });
        quantiles_trigram_hist.push(hist_count);
    }
    // get the last element of the histogram array
    hist_count = 0;
    unigrams_arr.forEach(item => {
        if (item[1] <= quantiles_unigram[98]) hist_count++;
    });
    quantiles_unigram_hist.push(hist_count);
    hist_count = 0;
    bigrams_arr.forEach(item => {
        if (item[1] <= quantiles_bigram[98]) hist_count++;
    });
    quantiles_bigram_hist.push(hist_count);
    hist_count = 0;
    trigrams_arr.forEach(item => {
        if (item[1] <= quantiles_trigram[98]) hist_count++;
    });
    quantiles_trigram_hist.push(hist_count);
    return {
        tf: { 1: unigrams, 2: bigrams, 3: trigrams },
        tf_quantiles: {
            1: quantiles_unigram,
            2: quantiles_bigram,
            3: quantiles_trigram
        },
        tf_quantiles_hist: {
            1: quantiles_unigram_hist,
            2: quantiles_bigram_hist,
            4: quantiles_trigram_hist
        },
        tf_normalized: { 1: unigrams_arr, 2: bigrams_arr, 3: trigrams_arr },
        count: { 1: n_unigrams, 2: n_bigrams, 3: n_trigrams }
    };
}

function getMetrics(state, members, textStats) {
    let result = {};
    let totalNumWords = 0;
    let totalNumLetters = 0;
    let totalTextLen = 0;
    let users = {};
    let dists = [];
    let acc_country = 0;
    let acc = 0;
    let accD = 0;

    // text statistics
    members.forEach(member => {
        let grams = state.data[member.type][member.idx].grams[1];
        let text = state.data[member.type][member.idx].text;
        let user = state.data[member.type][member.idx].user.id;
        if (!users.hasOwnProperty(user)) users[user] = true;
        let words = text.split(' ');
        let wordLength = 0;
        words.forEach(word => {
            wordLength += word.length;
        });
        let avgWordLength = wordLength / words.length;
        totalNumWords += grams.length;
        totalNumLetters += avgWordLength;
        totalTextLen += text.length;
        // evaluation metrics
        dists.push(state.data[member.type][member.idx].dist);
        if (state.data[member.type][member.idx].dist <= 161) accD++;
        if (
            state.data[member.type][member.idx].place.country_code.toLowerCase() ==
            state.data[member.type][member.idx].predicted.country_code.toLowerCase()
        )
            acc_country++;
        if (
            state.data[member.type][member.idx].place.full_name.toLowerCase().replace(' ', '').replace(',', '') ==
            state.data[member.type][member.idx].predicted.name.toLowerCase().replace(' ', '').replace(',', '')
        )
            acc++;
    });
    let ttr = textStats.tf_quantiles[1].length / textStats.count[1];
    result['avg num words'] = Number.parseFloat(
        (totalNumWords / members.length).toFixed(3)
    );
    result['avg word len'] = Number.parseFloat(
        (totalNumLetters / members.length).toFixed(3)
    );
    result['avg text len'] = Number.parseFloat(
        (totalTextLen / members.length).toFixed(3)
    );
    result['TTR'] = Number.parseFloat(ttr.toFixed(3));

    // evaluation metrics
    result['mean ED'] = Number.parseFloat(mean(dists).toFixed(3));
    result['median ED'] = Number.parseFloat(median(dists).toFixed(3));
    result['acc:country'] = Number.parseFloat(
        (acc_country / members.length).toFixed(3)
    );
    result['acc'] = Number.parseFloat((acc / members.length).toFixed(3));
    result['acc@161'] = Number.parseFloat((accD / members.length).toFixed(3));

    // twitter stats
    result['tweet count'] = members.length;
    result['user count'] = Object.keys(users).length;

    return result;
}

export default new Vuex.Store({
    state: {
        data: {},
        sets: {},
        selected: [],
        maxNsets: 20,
        widgets: {
            0: {
                type: 'Map',
                sets: [],
                update: null
            },
            1: {
                type: 'Origin Countries',
                sets: [],
                update: null
            },
            2: {
                type: 'Error Distance',
                sets: [],
                update: null
            },
            3: {
                type: 'Located Countries',
                sets: [],
                update: null
            },
            4: {
                type: 'Text Length',
                sets: [],
                update: null
            },
            5: {
                type: 'N-Gram Frequency',
                sets: [],
                update: null
            },
            6: {
                type: 'Single Metrics',
                sets: [],
                update: null
            },
            7: {
                type: 'OldMap',
                sets: [],
                update: null
            },
            8: {
                type: 'MapVerOne',
                sets: [],
                update: null
            }
        },
        unused_colors: [
            '#F3C300',
            '#875692',
            '#F38400',
            '#A1CAF1',
            '#BE0032',
            '#C2B280',
            '#008856',
            '#E68FAC',
            '#0067A5',
            '#F99379',
            '#604E97',
            '#F6A600',
            '#B3446C',
            '#DCD300',
            '#882D17',
            '#8DB600',
            '#654522',
            '#E25822',
            '#2B3D26'
        ],
        color_for_all: '#848482',
        highlightColor: '#FFCA28',
        editMode: false,
        selectionMode: false,
        directSetSelectionSignal: false,
        gridLayout: [
            { x: 0, y: 0, w: 3, h: 4, i: '0', widget: 1 },
            { x: 3, y: 0, w: 3, h: 4, i: '1', widget: 3 },
            { x: 6, y: 0, w: 3, h: 4, i: '2', widget: 2 },
            { x: 9, y: 0, w: 3, h: 4, i: '4', widget: 4 },
            { x: 0, y: 4, w: 6, h: 3, i: '5', widget: 5 },
            { x: 6, y: 4, w: 6, h: 3, i: '6', widget: 6 },
            { x: 0, y: 7, w: 12, h: 8, i: '3', widget: 0 }
            // { x: 0, y: 0, w: 6, h: 3, i: '0', widget: 1 },
            // { x: 6, y: 0, w: 6, h: 3, i: '1', widget: 3 },
            // { x: 0, y: 3, w: 12, h: 5, i: '5', widget: 5 },
            // { x: 0, y: 8, w: 12, h: 8, i: '3', widget: 8 }
        ]
    },
    mutations: {
        dataReceived(state, payload) {
            let members = [];
            for (let i in payload.data) {
                members.push({ type: payload.type, idx: i });
                let dir;
                // angle from origin to located
                let bearing = turf.bearingToAzimuth(
                    turf.rhumbBearing(
                        turf.point([
                            payload.data[i].place.coordinates[1],
                            payload.data[i].place.coordinates[0]
                        ]),
                        turf.point([
                            payload.data[i].predicted.coordinates[1],
                            payload.data[i].predicted.coordinates[0]
                        ])
                    )
                );
                if (bearing != 0 && (bearing >= 337.5 || bearing < 22.5))
                    dir = 'North';
                else if (bearing >= 22.5 && bearing < 67.5) dir = 'N-E';
                else if (bearing >= 67.5 && bearing < 112.5) dir = 'East';
                else if (bearing >= 112.5 && bearing < 157.5) dir = 'S-E';
                else if (bearing >= 157.5 && bearing < 202.5) dir = 'South';
                else if (bearing >= 202.5 && bearing < 247.5) dir = 'S-W';
                else if (bearing >= 247.5 && bearing < 292.5) dir = 'West';
                else if (bearing >= 292.5 && bearing < 337.5) dir = 'N-W';
                // payload.data[i].place.bearing = bearing;
                payload.data[i].place.dir = dir;
                // angle from located to origin
                bearing = turf.bearingToAzimuth(
                    turf.rhumbBearing(
                        turf.point([
                            payload.data[i].predicted.coordinates[1],
                            payload.data[i].predicted.coordinates[0]
                        ]),
                        turf.point([
                            payload.data[i].place.coordinates[1],
                            payload.data[i].place.coordinates[0]
                        ])
                    )
                );
                if (bearing != 0 && (bearing >= 337.5 || bearing < 22.5))
                    dir = 'North';
                else if (bearing >= 22.5 && bearing < 67.5) dir = 'N-E';
                else if (bearing >= 67.5 && bearing < 112.5) dir = 'East';
                else if (bearing >= 112.5 && bearing < 157.5) dir = 'S-E';
                else if (bearing >= 157.5 && bearing < 202.5) dir = 'South';
                else if (bearing >= 202.5 && bearing < 247.5) dir = 'S-W';
                else if (bearing >= 247.5 && bearing < 292.5) dir = 'West';
                else if (bearing >= 292.5 && bearing < 337.5) dir = 'N-W';
                // payload.data[i].place.bearing = bearing;
                payload.data[i].predicted.dir = dir;
            }
            state.data[payload.type] = payload.data;
            if (!state.sets.hasOwnProperty('all')) {
                let countryStats = getCountryStats(state, members);
                let allSet = {
                    name: 'all',
                    color: state.color_for_all,
                    colors: chroma
                        .scale(['white', state.color_for_all])
                        .colors(7),
                    members: members,
                    widgets: [],
                    stats: { country: countryStats }
                };
                Vue.set(state.sets, 'all', allSet);
            } else {
                let countryStats = getCountryStats(state, members);
                let newMembers = state.sets.all.members.concat(members);
                Vue.set(state.sets.all, 'members', newMembers);
                Vue.set(state.sets.all.stats, 'country', countryStats);
            }
            this.commit('addSet', { name: payload.type, members: members });
        },
        resetSelection(state) {
            state.selected = [];
        },
        updateSelection(state, payload) {
            state.selected = payload;
        },
        toggleEditMode(state, newMode) {
            state.editMode = newMode;
        },
        toggleSelectionMode(state) {
            state.selectionMode = !state.selectionMode;
        },
        updateDirectSetSelectionSignal(state, value) {
            state.directSetSelectionSignal = value;
        },
        triggerSetSelection(state) {
            if (Object.keys(state.data).length === 0) {
                console.log('no data');
            } else if (Object.keys(state.sets).length <= state.maxNsets) {
                this.commit('toggleSelectionMode');
            } else {
                console.log('The number of sets has reached its limit.');
            }
        },
        addSet(state, payload) {
            let name = payload.name;
            let members = payload.members;
            let color = state.unused_colors[0];
            let colors = chroma.scale(['white', color]).colors(7);
            state.unused_colors.shift();
            let countryStats = getCountryStats(state, members);
            let textStats = getTextStats(state, members);
            let metrics = getMetrics(state, members, textStats);
            let newSet = {
                name: name,
                color: color,
                colors: colors,
                members: members,
                widgets: [],
                stats: { country: countryStats },
                textStats: textStats,
                metrics: metrics
            };
            Vue.set(state.sets, name, newSet);
            state.selectionMode = false;
        },
        delSet(state, set) {
            if (state.sets[set] !== 'undefined') {
                // deleting the set from the widget first
                for (let widget in state.sets[set].widgets) {
                    let payload = {
                        widget: state.sets[set].widgets[widget],
                        set: set
                    };
                    this.commit('delSetFromWidget', payload);
                }
                // then delete from the global set lists
                state.unused_colors.unshift(state.sets[set].color);
                Vue.delete(state.sets, set);
            }
        },
        delAllSet(state) {
            for (let set in state.sets)
                if (set != 'all') this.commit('delSet', set);
            this.commit('delSet', 'all');
            Vue.set(state, 'data', {});
        },
        delSetFromWidget(state, payload) {
            let widget = payload.widget;
            let set = payload.set;
            let idx = state.widgets[widget].sets.indexOf(set);
            // set exists in the widget sets
            if (idx > -1) {
                let sets = state.widgets[widget].sets;
                sets.splice(idx, 1);
                Vue.set(state.widgets[widget], 'update', {
                    type: 'delete',
                    set: set
                });
                Vue.set(state.widgets[widget], 'sets', sets);
            }
        },
        addSetToWidget(state, payload) {
            let widget = payload.widget;
            let set = payload.set;
            // check if the set already exists
            if (state.widgets[widget].sets.indexOf(set) == -1) {
                state.widgets[widget].sets.push(set);
                state.sets[set].widgets.push(widget);
                Vue.set(state.widgets[widget], 'update', {
                    type: 'add',
                    set: set
                });
            }
        },
        addToSelection(state, member) {
            state.selected.push(member);
        }
    },
    actions: {},
    modules: {}
});
