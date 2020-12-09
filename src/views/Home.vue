<template>
    <div class="home">
        <v-app :style="{ background: $vuetify.theme.themes[isDark].background }">
            <v-container fluid class="ma-0 pa-0" app>
                <v-row class="mx-10 mt-4 pa-0">
                    <control-bar></control-bar>
                </v-row>
                <v-row class="mx-10 mt-2 pa-0">
                    <set-bar></set-bar>
                </v-row>
                <v-sheet class="mx-7 mt-2 pa-0" light color="background">
                    <viz-grid></viz-grid>
                </v-sheet>
            </v-container>

            <v-dialog v-model="dialog" persistent max-width="300px">
                <v-card>
                    <v-card-text class="pt-5 pb-0">
                        <v-text-field v-model="setName" label="Enter the set name" required></v-text-field>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" text @click="cancelAddSet">Cancel</v-btn>
                        <v-btn color="blue darken-1" text @click="addSet">Add</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-app>
    </div>
</template>

<script>
// @ is an alias to /src
import ControlBar from '@/components/ControlBar.vue';
import SetBar from '@/components/SetBar.vue';
import VizGrid from '@/components/VizGrid.vue';
import axios from 'axios';

export default {
	name: 'home',
	components: {
		ControlBar,
		SetBar,
		VizGrid
	},
	// style binding needed to force background color applied from vuetify.js
	computed: {
		isDark() {
			return this.$vuetify.theme.dark ? 'dark' : 'light';
		},
		directSetSelectionSignal() {
			return this.$store.state.directSetSelectionSignal;
		}
	},

	data() {
		return {
			dialog: false,
			setName: ''
		};
	},

	methods: {
		getTweets() {
			const path = 'http://localhost:3000/init';
			axios
				.get(path)
				.then(res => {
					let data = res.data;
					data.forEach(datum => {
						this.$store.commit('dataReceived', datum);
					});
				})
				.catch(error => {
					console.error(error);
				});
		},
		onKeyDown(e) {
			// If the ESC key is pressed in a selection mode
			if (e.keyCode === 27 && this.$store.state.selectionMode) {
				this.$store.commit('resetSelection');
			} // selection mode toggling
			else if (e.keyCode === 16 && !this.dialog) {
				if (!this.$store.state.selectionMode)
					this.$store.commit('toggleSelectionMode');
			}
		},
		onKeyUp(e) {
			// selection mode toggling
			if (e.keyCode === 16 && !this.dialog) {
				if (this.$store.state.selectionMode) {
					this.$store.commit('toggleSelectionMode');
					if (this.$store.state.selected.length > 0)
						this.dialog = true;
				}
			}
		},
		directSetSelection() {
			if (!this.dialog)
				if (this.$store.state.selected.length > 0) this.dialog = true;
			this.$store.commit('updateDirectSetSelectionSignal', false);
		},
		addSet() {
			if (this.setName !== '') {
				let payload = {
					name: this.setName,
					members: this.$store.state.selected
				};
				console.log(payload)
				this.$store.commit('addSet', payload);

				this.dialog = false;
				this.$store.commit('resetSelection');
			}
		},
		cancelAddSet() {
			this.dialog = false;
			this.$store.commit('resetSelection');
		}
	},

	created() {
		this.getTweets();
		document.addEventListener('keydown', this.onKeyDown);
		document.addEventListener('keyup', this.onKeyUp);
	},

	watch: {
		dialog() {
			this.setName = '';
		},
		directSetSelectionSignal(value) {
			console.log("happening")
			if (value) this.directSetSelection();
		}
	}
};
</script>

<style lang="scss" scoped></style>
