<template>
    <v-toolbar light color="background" flat>
        <v-text-field
            single-line
            filled
            rounded
            hide-details
            color="grey darken-1"
        >
            <v-icon slot="prepend-inner" class="mr-2">fa-search</v-icon>
        </v-text-field>
        <v-spacer></v-spacer>
        <v-switch
            v-model="editMode"
            inset
            hide-details
            label="Edit Mode"
            class="mr-1"
        ></v-switch>
    </v-toolbar>
</template>

<script>
export default {
    name: 'ControlBar',
    computed: {
        editMode: {
            get() {
                return this.$store.state.editMode;
            },
            set(value) {
                this.$store.commit('toggleEditMode', value);
            }
        }
    }
};
</script>
<style lang="scss" scoped>
.v-toolbar {
    font-family: 'Montserrat', sans-serif;
    font-weight: 600;
    .v-text-field {
        font-family: 'Roboto', sans-serif;
        font-weight: 400;
    }
}

.v-text-field {
    color: '#757575';
}
</style>
