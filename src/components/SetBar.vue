<template>
    <v-toolbar flat light color="#E7E7E7">
        <v-toolbar-title class="ma-2">SETS</v-toolbar-title>
        <v-chip-group class="ml-2" show-arrows dark>
            <v-chip
                v-for="(set, idx) in sets"
                :key="idx"
                draggable
                @dragstart="dragStart"
                @dragover="allowDrop"
                @drop="promptSetOperation"
                :close="isClosable"
                class="mr-3"
                :color="set.color"
                @click:close="delSet(set.name)"
            >{{ set.name }}</v-chip>
        </v-chip-group>
        <v-dialog v-model="dialog" persistent max-width="400px">
            <v-card>
                <VennDiagram
                    width="400"
                    height="250"
                    :hit_set="hit_set"
                    :dropped_set="dropped_set"
                    :dialog="dialog"
                    @selectedOnDiagram="selectedOnDiagram"
                />
                <v-card-text v-if="setOperationSelected" class="pt-5 pb-0">
                    <v-text-field v-model="setName" dense hide-details single-line required></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-card-text class="pt-5 pb-0">
                        <v-text-field v-model="setName" label="Enter the set name" required></v-text-field>
                    </v-card-text>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="cancelAddSet">Cancel</v-btn>
                    <v-btn
                        color="blue darken-1"
                        text
                        @click="addSet"
                        :disabled="dialogAddDisabled"
                    >Add</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-toolbar>
</template>

<script>
import VennDiagram from '@/components/VennDiagram';
import * as _ from 'lodash';

export default {
	name: 'SetBar',
	components: {
		VennDiagram
	},
	computed: {
		isClosable() {
			return this.$store.state.editMode;
		},
		sets() {
			return this.$store.state.sets;
		},
		dialogAddDisabled() {
			if (this.setOperationSelected) return true;
			else return false;
		}
	},

	data() {
		return {
			dialog: false,
			setName: '',
			setOperationSelected: false,
			dropped_set: null,
			hit_set: null,
			diagramCalculations: {
				intersect: [],
				hit_only: [],
				dropped_only: [],
				neitherButAll: []
			},
			selection: null
		};
	},
	methods: {
		allowDrop(event) {
			event.preventDefault();
		},
		delSet(set) {
			if (set == 'all') this.$store.commit('delAllSet');
			else this.$store.commit('delSet', set);
		},
		dragStart(e) {
			e.dataTransfer.setData('set', e.target.textContent);
		},
		promptSetOperation(e) {
			event.preventDefault();
			this.dropped_set = e.dataTransfer.getData('set');
			this.hit_set = e.target.textContent;
			if (this.dropped_set == this.hit_set) return;
			if (!this.dialog) {
                this.dialog = true;
				this.precalculate();
			}
		},
		addSet() {
			let tweets = [];
			Object.keys(this.diagramCalculations).forEach(key => {
				if (this.selection[key])
					tweets = _.concat(tweets, this.diagramCalculations[key]);
			});
			console.log(tweets.length);
			if (this.setName !== '') {
				let payload = {
					name: this.setName,
					members: tweets
				};
				this.$store.commit('addSet', payload);
				this.dialog = false;
				this.selection = null;
				Object.keys(this.diagramCalculations).forEach(key => {
					this.diagramCalculations[key] = [];
				});
				this.setName = '';
			}
		},
		cancelAddSet() {
			this.dialog = false;
			this.selection = null;
			Object.keys(this.diagramCalculations).forEach(key => {
				this.diagramCalculations[key] = [];
			});
			this.setName = '';
		},
		precalculate() {
			let hit = this.$store.state.sets[this.hit_set].members;
			let dropped = this.$store.state.sets[this.dropped_set].members;
			this.diagramCalculations['hit_only'] = _.difference(hit, dropped);
			this.diagramCalculations['dropped_only'] = _.difference(
				dropped,
				hit
			);
			this.diagramCalculations['intersect'] = _.difference(
				dropped,
				this.diagramCalculations['dropped_only']
			);
			let both = _.concat(
				this.diagramCalculations['hit_only'],
				this.diagramCalculations['dropped_only'],
				this.diagramCalculations['intersect']
			);
			this.diagramCalculations['neitherButAll'] = _.difference(
				this.$store.state.sets['all'].members,
				both
			);
		},
		selectedOnDiagram(selection) {
			this.selection = selection;
		}
	}
};
</script>

<style lang="scss" scoped>
.v-toolbar {
	font-family: 'Montserrat', sans-serif;
	font-weight: 600;
}

.v-chip {
	font-family: 'Varela Round', sans-serif;
	font-weight: 600;
}

.v-alert {
	margin: 0;
	position: absolute;
	top: 50%;
	left: 50%;
	-ms-transform: translate(-50%, -50%);
	transform: translate(-50%, -50%);
}
</style>
