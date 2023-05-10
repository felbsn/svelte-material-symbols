<script>
    import Symbol from "$lib/Symbol.svelte";
    import { flip } from "svelte/animate";
    import codepoints from "../lib/codepoints.js";
    import { scale, slide } from "svelte/transition";
    import Fuse from "fuse.js";

    let search = "";

    let fill = false;
    let type = "outlined";
    let color = "";
    let size = 32;

    let sizeSet = false;
    let sliceSize = 200;
    let sliceStart = 0;

    let titles = false;
    let dark = false;

    let copied = "";
    let copiedOnlyName = false;

    /**
     * @type {{name:keyof codepoints, code:string,title:string}[]}
     */
    let all = Object.entries(codepoints).map((d) => ({
        name: d[0],
        code: d[1],
        title: [...d[0].split("_")].join(" "),
    }));
    let fuse = new Fuse(all, { keys: ["title"], threshold: 0.6, ignoreLocation: true, useExtendedSearch: true });

    $: results = onsearch(search);
    $: entries = results.slice(sliceStart, sliceSize);

    function onsearch(s) {
        s = s.trim();
        sliceStart = 0;
        sliceSize = 200;

        const adaptedSearchTerm = s
            .split(" ")
            .reduce((previousValue, currentValue) => previousValue + ` '${currentValue}`, "");
        console.log("searching " + adaptedSearchTerm);

        let results = s ? fuse.search(adaptedSearchTerm).map((d) => d.item) : all;
        return results;
    }
    function copy(codepoint) {
        let { name } = codepoint;

        let element = `<Symbol name="${name}"${fill ? ` fill` : ""}${color ? ` color="${color}"` : ""}${
            sizeSet ? ` size="${size}px"` : ""
        }${type != "outlined" ? ` type="${type}"` : ""}/>`;
        navigator.clipboard.writeText(element);
        // nofitications.show("copied", element);
        copied = codepoint.name;
        copiedOnlyName = false;

        startClearCopy();
    }

    function copyOnlyName(codepoint) {
        let { name } = codepoint;
        navigator.clipboard.writeText(name);
        // nofitications.show("copied", element);
        copied = codepoint.name;
        copiedOnlyName = true;

        startClearCopy();
    }

    let clearTimer = 0;

    function startClearCopy() {
        if (clearTimer) clearInterval(clearTimer);
        clearTimer = setTimeout(() => {
            copied = "";
            clearTimer = 0;
        }, 5_000);
    }

    let pops = [];
    let index = 0;
</script>

<div
    class="container"
    class:dark
    on:scroll={(ev) => {
        // console.log(
        //     `${ev.currentTarget.scrollTop} >= ${ev.currentTarget.scrollHeight - ev.currentTarget.offsetHeight}`
        // );

        if (ev.currentTarget.scrollTop >= ev.currentTarget.scrollHeight - ev.currentTarget.offsetHeight) {
            //alert("end of the road");
            // sliceStart += 100;
            sliceSize += 200;
            pops.push([ev.currentTarget.scrollTop, sliceSize - 200]);
        }

        if (pops.length > 0) {
            while (pops.length > 0 && ev.currentTarget.scrollTop + 20 < pops.at(-1)[0]) {
                sliceSize = pops.pop()[1];
            }
        }
    }}>
    <div class="top">
        <input class="toggle" type="text" autofocus bind:value={search} placeholder="search..." />

        <label class="toggle">
            fill
            <input type="checkbox" bind:checked={fill} style="display:none" />
            <Symbol name="water_drop" {fill} />
        </label>

        <label class="toggle">
            <select bind:value={type}>
                <option value="outlined"> Outlined </option>
                <option value="rounded"> Rounded </option>
                <option value="sharp"> Sharp </option>
            </select>
        </label>

        <label class="toggle">
            color
            <input
                type="color"
                bind:value={color}
                style="visibility: collapse;width:0;border:0;padding:0;margin:-2px;" />
            <Symbol name="palette" {color} fill />
        </label>

        <label class="toggle">
            size
            <input
                type="range"
                bind:value={size}
                min="10"
                max="120"
                on:change={() => {
                    sizeSet = true;
                }} />
        </label>

        <span style="display: flex;flex-grow: 1;" />

        <span style="display:flex;gap:inherit;margin-left:auto;">
            <label class="toggle">
                <input type="checkbox" bind:checked={dark} style="display:none" />
                <Symbol name={dark ? "light_mode" : "dark_mode"} fill color={dark ? "white" : "black"} />
            </label>

            <label class="toggle">
                <input type="checkbox" bind:checked={titles} style="display:none" />
                <Symbol name={titles ? "subtitles" : "subtitles_off"} />
            </label>

            <a class="toggle" href="https://github.com/felbsn/svelte-material-symbols">
                <Symbol name="code" />
                github
                <input type="checkbox" style="display:none" />
            </a>
        </span>
    </div>

    <div
        class="gallery"
        style="grid-template-columns: repeat(auto-fill, minmax({size +
            24}px, 1fr)); padding-top:{size}px;padding-inline:{size}px">
        {#if entries.length < 100}
            {#each entries as codepoint, i (codepoint.name)}
                <div
                    class="codepoint"
                    class:titles
                    class:copied={codepoint.name == copied}
                    on:click={() => copy(codepoint)}
                    on:dblclick={() => copyOnlyName(codepoint)}
                    in:scale={{ duration: 200 }}
                    animate:flip={{ duration: 200 }}>
                    <Symbol name={codepoint.name} {fill} {type} {color} size={size + "px"} />

                    <div class="name" title={codepoint.name}>
                        {codepoint.name}
                    </div>

                    {#if copied == codepoint.name}
                        <div class="copy-indicator">
                            Copied {copiedOnlyName ? "name" : "item"}<Symbol name="inventory" />
                        </div>
                    {/if}
                </div>
            {/each}
        {:else}
            {#each entries as codepoint (codepoint.name)}
                <div
                    class="codepoint"
                    class:titles
                    class:copied={codepoint.name == copied}
                    on:click={() => copy(codepoint)}
                    on:dblclick={() => copyOnlyName(codepoint)}>
                    <Symbol name={codepoint.name} {type} {fill} {color} size={size + "px"} />

                    <div class="name" title={codepoint.name}>
                        {codepoint.name}
                    </div>

                    {#if copied == codepoint.name}
                        <div class="copy-indicator">
                            Copied {copiedOnlyName ? "name" : "item"}<Symbol name="inventory" />
                        </div>
                    {/if}
                </div>
            {/each}
        {/if}
    </div>
</div>

<style>
    :global(html, body) {
        margin: 0;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    * {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    }

    .container {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;

        overflow: auto;
        transition: all 180ms;

        color: #333;
    }

    .top {
        top: 0;
        position: sticky;
        padding: 10px;
        display: flex;
        flex-direction: row;
        width: 100%;

        box-sizing: border-box;

        backdrop-filter: blur(12px);
        z-index: 9;
        min-height: 64px;
        flex-shrink: 0;
        gap: 6px;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
        box-shadow: 0 3px 5px #4442;

        flex-wrap: wrap;
    }

    .toggle {
        display: flex;
        font-size: 24px;
        gap: 4px;
        padding: 4px;
        border-radius: 4px;
        box-shadow: 0 1px 3px #0007;
        align-items: center;
        cursor: pointer;
        background: #4444;
        min-width: 44px;
        justify-content: center;
        box-sizing: border-box;
        user-select: none;
    }

    a.toggle {
        text-decoration: none;
        color: inherit;
    }

    .toggle select {
        position: relative;
        height: 100%;
        background-color: #4440;
        outline: none;
        border: none;
        cursor: pointer;
        font-size: 18px;
    }

    input[type="text"] {
        background: #4444;
        border: none;
        border-radius: 4px;
        outline: none;
        font-size: 24px;
        width: 160px;
        padding-inline: 6px;
    }
    input[type="text"]:focus {
        box-shadow: inset 0px 0px 0px 2px dodgerblue;
    }

    .dark input {
        color: whitesmoke;
    }
    .dark select {
        color: whitesmoke;
    }

    .dark option {
        background: #333;
        border-radius: 4px;
        font-size: 18px;
    }

    .toggle:hover {
        /* filter: brightness(1.3); */
        box-shadow: 0 1px 6px #0004;
        color: dodgerblue;
    }

    .gallery {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));

        gap: 30px;
        padding: 36px;
        box-sizing: border-box;
    }

    .codepoint {
        display: grid;
        place-items: center;
        border-radius: 6px;
        position: relative;

        padding: 10px;
        font-size: 2em;

        /* height: 48px; */

        transition: all 180ms;
        user-select: none;
        /* background-color: white; */
    }
    .codepoint:hover,
    .codepoint.selected {
        background-color: whitesmoke;
        cursor: pointer;
        box-shadow: 0 3px 6px #0007;

        scale: 2;
        z-index: 2;

        outline: 0px solid salmon;
    }
    .copied {
        background: rgba(143, 188, 143, 0.527) !important;
        scale: 1.6;
        box-shadow: inset 0 3px 6px #fff7;
    }

    .name {
        position: absolute;
        max-height: 0;

        bottom: 3px;

        font-size: 12px;
        /* overflow: hidden; */
        /* text-overflow: ellipsis; */
        /* max-width: 60px; */
        transition: all 180ms;
        width: calc(100% + 20px);
        text-align: center;

        overflow: hidden;
        text-overflow: ellipsis;
    }

    .copied .name {
        font-size: 10px;
        width: calc(100% - 8px);
        padding-inline: 4px;
        margin-inline: 0;
        padding-inline: 4px;
    }

    .titles .name {
        max-height: 20px;
    }

    .codepoint:hover .name {
        max-height: 20px;
        font-size: 6px;
        padding-bottom: 1px;

        /* max-width: 100%; */
    }

    @keyframes begin {
        0% {
            max-width: 0;
            max-height: 0;
        }
        100% {
            max-width: 100%;
            max-height: 100%;
        }
    }

    .copy-indicator {
        position: absolute;
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 7px;
        top: 2px;
        right: 2px;
        color: white;
        padding: 2px;
        border-radius: 6px;
        animation: begin 400ms forwards;
        background-color: rgba(128, 128, 128, 0.387);
        backdrop-filter: blur(12px);
        overflow: hidden;
        white-space: nowrap;
    }

    .dark {
        color: whitesmoke;
    }
    .dark.container {
        background: black;
    }
    .dark .codepoint {
        color: whitesmoke;
    }
    .dark .codepoint:hover,
    .dark .copied {
        background-color: #111;
        box-shadow: 0 1px 6px #fff3;
    }

    /* :global(body) {
        background: black;
    }

    .codepoint {
        color: white;
    }
    .codepoint:hover {
        background-color: #111;
        box-shadow: 0 1px 6px #fff3;
    } */
</style>
