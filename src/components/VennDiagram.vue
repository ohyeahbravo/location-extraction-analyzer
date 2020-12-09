<template>
    <div style="cursor: pointer;">
        <canvas id="canvas" :width="width" :height="height"></canvas>
    </div>
</template>

<script>
import chroma from 'chroma-js';

export default {
	name: 'VennDiagram',
	props: ['width', 'height', 'hit_set', 'dropped_set', 'dialog'],
	data() {
		return {
			canvas: null,
			colors: {
				neitherButAll: {
					default: {
						chroma: null,
						rgb: null
					},
					selected: {
						chroma: null,
						rgb: null
					}
				},
				hit_only: {
					default: {
						chroma: null,
						rgb: null
					},
					selected: {
						chroma: null,
						rgb: null
					}
				},
				dropped_only: {
					default: {
						chroma: null,
						rgb: null
					},
					selected: {
						chroma: null,
						rgb: null
					}
				},
				intersect: {
					default: {
						chroma: null,
						rgb: null
					},
					selected: {
						chroma: null,
						rgb: null
					}
				}
			},
			selected: {
				neitherButAll: false,
				hit_only: false,
				dropped_only: false,
				intersect: false
			},
			default_opacity: 0.3,
			selected_opacity: 0.8,
			radius: 85
		};
	},

	mounted() {
		this.canvas = document.getElementById('canvas');
		Object.keys(this.selected).forEach(key => {
			this.selected[key] = false;
		});
		this.getColor();
		this.draw();
		this.canvas.addEventListener('hover', this.onClick);
		this.canvas.addEventListener('click', this.onClick);
	},

	methods: {
		getColor() {
			let colorHitGL = chroma(
				this.$store.state.sets[this.hit_set].color
			).gl();
			let colorHitOverlayedDefault = chroma([
				((1 - this.default_opacity) * 1 +
					colorHitGL[0] * this.default_opacity) *
					255,
				((1 - this.default_opacity) * 1 +
					colorHitGL[1] * this.default_opacity) *
					255,
				((1 - this.default_opacity) * 1 +
					colorHitGL[2] * this.default_opacity) *
					255
			]);
			let colorHitOverlayedSelected = chroma([
				((1 - this.selected_opacity) * 1 +
					colorHitGL[0] * this.selected_opacity) *
					255,
				((1 - this.selected_opacity) * 1 +
					colorHitGL[1] * this.selected_opacity) *
					255,
				((1 - this.selected_opacity) * 1 +
					colorHitGL[2] * this.selected_opacity) *
					255
			]);
			this.colors[
				'hit_only'
			].default.chroma = colorHitOverlayedDefault;
			this.colors[
				'hit_only'
			].default.rgb = colorHitOverlayedDefault.rgb();
			this.colors[
				'hit_only'
			].selected.chroma = colorHitOverlayedSelected;
			this.colors[
				'hit_only'
			].selected.rgb = colorHitOverlayedSelected.rgb();
			let colorDroppedGL = chroma(
				this.$store.state.sets[this.dropped_set].color
			).gl();
			let colorDroppedOverlayedDefault = chroma([
				((1 - this.default_opacity) * 1 +
					colorDroppedGL[0] * this.default_opacity) *
					255,
				((1 - this.default_opacity) * 1 +
					colorDroppedGL[1] * this.default_opacity) *
					255,
				((1 - this.default_opacity) * 1 +
					colorDroppedGL[2] * this.default_opacity) *
					255
			]);
			let colorDroppedOverlayedSelected = chroma([
				((1 - this.selected_opacity) * 1 +
					colorDroppedGL[0] * this.selected_opacity) *
					255,
				((1 - this.selected_opacity) * 1 +
					colorDroppedGL[1] * this.selected_opacity) *
					255,
				((1 - this.selected_opacity) * 1 +
					colorDroppedGL[2] * this.selected_opacity) *
					255
			]);
			this.colors[
				'dropped_only'
			].default.chroma = colorDroppedOverlayedDefault;
			this.colors[
				'dropped_only'
			].default.rgb = colorDroppedOverlayedDefault.rgb();
			this.colors[
				'dropped_only'
			].selected.chroma = colorDroppedOverlayedSelected;
			this.colors[
				'dropped_only'
			].selected.rgb = colorDroppedOverlayedSelected.rgb();
			let colorHitDefaultNormalizedGL = chroma(
				colorHitOverlayedDefault
			).gl();
			let colorMixOverlayedDefault = chroma([
				((1 - this.default_opacity) * colorHitDefaultNormalizedGL[0] +
					colorDroppedGL[0] * this.default_opacity) *
					255,
				((1 - this.default_opacity) * colorHitDefaultNormalizedGL[1] +
					colorDroppedGL[1] * this.default_opacity) *
					255,
				((1 - this.default_opacity) * colorHitDefaultNormalizedGL[2] +
					colorDroppedGL[2] * this.default_opacity) *
					255
			]);
			let colorHitSelectedNormalizedGL = chroma(
				colorHitOverlayedSelected
			).gl();
			let colorMixOverlayedSelected = chroma([
				((1 - this.selected_opacity) * colorHitSelectedNormalizedGL[0] +
					colorDroppedGL[0] * this.selected_opacity) *
					255,
				((1 - this.selected_opacity) * colorHitSelectedNormalizedGL[1] +
					colorDroppedGL[1] * this.selected_opacity) *
					255,
				((1 - this.selected_opacity) * colorHitSelectedNormalizedGL[2] +
					colorDroppedGL[2] * this.selected_opacity) *
					255
			]);
			this.colors[
				'intersect'
			].default.chroma = colorMixOverlayedDefault;
			this.colors[
				'intersect'
			].default.rgb = colorMixOverlayedDefault.rgb();
			this.colors[
				'intersect'
			].selected.chroma = colorMixOverlayedSelected;
			this.colors[
				'intersect'
			].selected.rgb = colorMixOverlayedSelected.rgb();
			let colorBG = chroma(this.$store.state.sets['all'].color);
			this.colors['neitherButAll'].default.chroma = colorBG;
			this.colors['neitherButAll'].default.rgb = colorBG.rgb();
			this.colors['neitherButAll'].selected.chroma = colorBG;
			this.colors['neitherButAll'].selected.rgb = colorBG.rgb();
		},
		draw() {
			let context = this.canvas.getContext('2d');
			let centerleftX = this.canvas.width / 4;
			let centerY = this.canvas.height / 2;

			// draw background (set 'neitherButAll')
			context.beginPath();
			context.rect(0, 0, this.canvas.width, this.canvas.height);
			let color = chroma(this.$store.state.sets['all'].color)
				.alpha(this.default_opacity)
				.css();
			context.fillStyle = color;
			context.fill();

			// painting white first
			context.beginPath();
			context.arc(
				centerleftX + 50,
				centerY,
				this.radius,
				0,
				2 * Math.PI,
				false
			);
			context.fillStyle = 'white';
			context.fill();
			context.beginPath();
			context.arc(
				centerleftX * 3 - 50,
				centerY,
				this.radius,
				0,
				2 * Math.PI,
				false
			);
			context.fillStyle = 'white';
			context.fill();

			// first circle (hit_set)
			context.beginPath();
			context.arc(
				centerleftX + 50,
				centerY,
				this.radius,
				0,
				2 * Math.PI,
				false
			);
			color = color = chroma(this.$store.state.sets[this.hit_set].color)
				.alpha(this.default_opacity)
				.css();
			context.fillStyle = color;
			context.fill();

			// second circle (dropped set)
			context.beginPath();
			context.arc(
				centerleftX * 3 - 50,
				centerY,
				this.radius,
				0,
				2 * Math.PI,
				false
			);
			color = color = chroma(
				this.$store.state.sets[this.dropped_set].color
			)
				.alpha(this.default_opacity)
				.css();
			context.fillStyle = color;
			context.fill();
		},

		redraw(target) {
			let imageData = this.canvas
				.getContext('2d')
				.getImageData(0, 0, this.width, this.height);
			let data = imageData.data;
			if (target == 'neitherButAll') {
				let opacity;
				if (this.selected['neitherButAll'])
					opacity = this.selected_opacity * 255;
				else opacity = this.default_opacity * 255;
				for (let i = 0; i < data.length; i += 4) {
					if (
						chroma.deltaE(
							chroma([data[i], data[i + 1], data[i + 2]]),
							this.colors['neitherButAll'].default.chroma
						) < 1.0
					)
						data[i + 3] = opacity;
				}
			} else {
				let color, type;
				if (this.selected[target]) {
					type = 'default';
					color = this.colors[target].selected.rgb;
				} else {
					type = 'selected';
					color = this.colors[target].default.rgb;
				}
				for (let i = 0; i < data.length; i += 4) {
					let oldColor = chroma([
						data[i],
						data[i + 1],
						data[i + 2]
					]);
					if (
						chroma.deltaE(oldColor, this.colors[target][type].chroma) <
						1.0
					) {
						data[i] = color[0];
						data[i + 1] = color[1];
						data[i + 2] = color[2];
					}
				}
			}
			this.canvas.getContext('2d').putImageData(imageData, 0, 0);
		},

		onClick(e) {
			const mousePos = {
				x: e.offsetX,
				y: e.offsetY
			};
			// get pixel under cursor
			const pixel = this.canvas
				.getContext('2d')
				.getImageData(mousePos.x, mousePos.y, 1, 1).data;
			// create hex color for that pixel
			// const color = `rgba(${pixel[0]},${pixel[1]},${pixel[2]},${pixel[3]})`;
			let color = chroma([pixel[0], pixel[1], pixel[2]]);
			// check if the color difference is small enough to conclude they're the same
			if (
				(this.selected['neitherButAll'] &&
					chroma.deltaE(
						color,
						this.colors['neitherButAll'].selected.chroma
					) < 1.0) ||
				(!this.selected['neitherButAll'] &&
					chroma.deltaE(
						color,
						this.colors['neitherButAll'].default.chroma
					) < 1.0)
			) {
				this.selected['neitherButAll'] = !this.selected[
					'neitherButAll'
				];
				this.redraw('neitherButAll');
			} else if (
				(this.selected['dropped_only'] &&
					chroma.deltaE(
						color,
						this.colors['dropped_only'].selected.chroma
					) < 1.0) ||
				(!this.selected['dropped_only'] &&
					chroma.deltaE(
						color,
						this.colors['dropped_only'].default.chroma
					) < 1.0)
			) {
				this.selected['dropped_only'] = !this.selected['dropped_only'];
				this.redraw('dropped_only');
			} else if (
				(this.selected['hit_only'] &&
					chroma.deltaE(color, this.colors['hit_only'].selected.chroma) <
						1.0) ||
				(!this.selected['hit_only'] &&
					chroma.deltaE(color, this.colors['hit_only'].default.chroma) <
						1.0)
			) {
				this.selected['hit_only'] = !this.selected['hit_only'];
				this.redraw('hit_only');
			} else {
				// intersect
				this.selected['intersect'] = !this.selected['intersect'];
				this.redraw('intersect');
			}
			this.$emit('selectedOnDiagram', this.selected);
		}
	},
	watch: {
		dialog(dialog) {
			if (!dialog) {
				Object.keys(this.selected).forEach(key => {
					this.selected[key] = false;
				});
				this.getColor();
				this.draw();
			}
		},
		dropped_set() {
			this.getColor();
			this.draw();
		},
		hit_set() {
			this.getColor();
			this.draw();
		}
	}
};
</script>