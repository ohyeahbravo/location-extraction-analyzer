<template>
    <form>
        <div class="radio-group">
            <input
                type="radio"
                id="lineButton"
                name="radio"
                checked="checked"
                @input="$emit('toggled', 'line')"
            />
            <label class="label1" for="lineButton">
                <span>Line</span>
            </label>
            <input
                type="radio"
                id="arcButton"
                name="radio"
                @input="$emit('toggled', 'arc')"
            />
            <label class="label2" for="arcButton">
                <span>Arc</span>
            </label>
        </div>
    </form>
</template>

<script>
export default {
    name: 'LayerToggle'
};
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css?family=Rubik');

input[type='radio'] {
    display: none;
}

.label1,
.label2 {
    display: block;
    height: 80px;
    width: 75px;
    background-size: 75px 80px;
    background: linear-gradient(
        to bottom,
        white 0,
        white 40px,
        #fccd04 40px,
        #fccd04 80px
    );
    position: absolute;
    top: 0;
    color: #fccd04;
}

.label2 {
    right: 0;
}

span {
    display: flex;
    height: 40px;
    width: 75px;
    justify-content: center;
    align-items: center;
    font-family: 'Rubik', sans-serif;
    font-weight: 600;
    font-size: 18px;
}

input:checked + label {
    background-position: 0 -40px;
    color: white;
}
</style>
