<script>
    export let code;
    export let style;
    export let fill;
    export let size;
    export let color;
</script>

<span style="font-size:{size};color:{color};{style}" class:fill class="material-symbols-rounded">{@html code}</span>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200");
    .material-symbols-rounded {
        font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 48;
        font-size: inherit;
    }
    .fill {
        font-variation-settings: "FILL" 1;
    }
</style>
