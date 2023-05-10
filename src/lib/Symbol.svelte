<script>
    import codepoints from "./codepoints.js";
    import Sharp from "./Symbols/Sharp.svelte";
    import Outlined from "./Symbols/Outlined.svelte";
    import Rounded from "./Symbols/Rounded.svelte";
    /**
     * @type {keyof codepoints}
     */
    export let name;

    /**
     * @type {string|undefined}
     */
    export let style = undefined;

    /**
     * @type {keyof types}
     */
    export let type = "outlined";

    /**
     * @type {string}
     */
    export let size = "";

    /**
     * @type {string}
     */
    export let color = "";

    /**
     * @type {boolean}
     */
    export let fill = false;

    const types = {
        outlined: Outlined,
        sharp: Sharp,
        rounded: Rounded,
    };
</script>

<svelte:component this={types[type]} code="&#x{codepoints[name]};" {style} {fill} {size} {color} />
