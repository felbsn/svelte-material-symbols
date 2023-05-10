<script>
    import Symbol from "$lib/Symbol.svelte";
    import { flip } from "svelte/animate";
    import codepoints from "../lib/codepoints.js";
    import { scale, slide } from "svelte/transition";
    import Fuse from "fuse.js";
    import { onMount, tick } from "svelte";
    import { preferences } from "./store.js";

    let search = "";

    let fill = false;
    let type = "outlined";
    let color = "";
    let size = 32;

    let sizeSet = false;
    let sliceSize = 100;
    let sliceStart = 0;

    let titles = $preferences.titles;
    let dark = $preferences.dark;

    let copied = "";
    let copiedOnlyName = false;
    let copiedInstall = false;
    let copiedImport = false;

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
        sliceSize = 100;

        const adaptedSearchTerm = s
            .split(" ")
            .reduce((previousValue, currentValue) => previousValue + ` '${currentValue}`, "");

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

    function copyImport() {
        navigator.clipboard.writeText(`import { Symbol } from "@felbsn/svelte-material-symbols"`);
        copiedImport = true;
        startImportClearCopy();
    }

    function copyInstall() {
        copiedInstall = true;
        navigator.clipboard.writeText(`npm i @felbsn/svelte-material-symbols`);

        startInstallClearCopy();
    }

    let clearTimer = 0;
    function startClearCopy() {
        if (clearTimer) clearInterval(clearTimer);
        clearTimer = setTimeout(() => {
            copied = "";
            clearTimer = 0;
        }, 5_000);
    }

    let clearInstallTimer = 0;
    function startInstallClearCopy() {
        if (clearInstallTimer) clearInterval(clearInstallTimer);
        clearInstallTimer = setTimeout(() => {
            copiedInstall = false;
            clearInstallTimer = 0;
        }, 3_000);
    }

    let clearImportTimer = 0;
    function startImportClearCopy() {
        if (clearImportTimer) clearInterval(clearImportTimer);
        clearImportTimer = setTimeout(() => {
            copiedImport = false;
            clearImportTimer = 0;
        }, 3_000);
    }

    let pops = [];
    let index = 0;

    /**
     * @type {HTMLElement}
     */
    let container;

    async function fillView() {
        while (sliceSize < results.length && container.scrollTop >= container.scrollHeight - container.offsetHeight) {
            sliceSize += 100;
            pops.push([container.scrollTop, sliceSize - 100]);
            await tick();
        }

        if (pops.length > 0) {
            while (pops.length > 0 && container.scrollTop + 20 < pops.at(-1)[0]) {
                sliceSize = pops.pop()[1];
            }
        }

        // let diff = container.scrollHeight - container.offsetHeight;
        // while (diff <= 0 && sliceSize < results.length) {
        //     sliceSize += 200;
        //     pops.push([container.scrollTop, sliceSize - 200]);
        //     await tick();
        //     diff = container.scrollHeight - container.offsetHeight;
        // }
    }

    onMount(async () => {
        await fillView();
    });
</script>

<svelte:window on:resize={fillView} />

<div
    bind:this={container}
    class="container"
    class:dark
    on:scroll={(ev) => {
        fillView();
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

        <label class="toggle">
            <a href="https://www.npmjs.com/package/@felbsn/svelte-material-symbols" style="display: flex;">
                <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"
                    ><rect x="227.6" y="213.1" width="28.4" height="57.1" /><path
                        d="M0,156V327.4H142.2V356H256V327.4H512V156ZM142.2,298.9H113.8V213.2H85.3v85.7H28.4V184.6H142.2Zm142.2,0H227.5v28.6H170.6V184.6H284.4Zm199.2,0H455.2V213.2H426.8v85.7H398.4V213.2H370v85.7H313.1V184.6H483.8V298.9Z" /></svg>
            </a>
            <div class="col" style="display:flex; flex-direction: column;">
                <code class="init"
                    >npm i @felbsn/svelte-material-symbols <button
                        class="copy-button"
                        on:click={() => copyInstall()}
                        class:copied-install={copiedInstall}>{copiedInstall ? "copied" : "copy"}</button
                    ></code>

                <code class="init"
                    >{`import { Symbol } from "@felbsn/svelte-material-symbols" `}<button
                        class="copy-button"
                        on:click={() => copyImport()}
                        class:copied-install={copiedImport}>{copiedImport ? "copied" : "copy"}</button
                    ></code>
            </div>
        </label>

        <!-- <span style="display:flex;gap:inherit;margin-left:auto;"> -->
        <label class="toggle">
            <input
                type="checkbox"
                bind:checked={dark}
                on:change={() => ($preferences.dark = dark)}
                style="display:none" />

            <Symbol name={dark ? "light_mode" : "dark_mode"} fill />
        </label>

        <label class="toggle">
            <input
                type="checkbox"
                bind:checked={titles}
                on:change={() => ($preferences.titles = titles)}
                style="display:none" />

            <Symbol name={titles ? "subtitles" : "subtitles_off"} />
        </label>

        <label class="toggle">
            <a href="https://github.com/felbsn/svelte-material-symbols">
                <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"
                    ><path
                        d="M256,32C132.3,32,32,134.9,32,261.7c0,101.5,64.2,187.5,153.2,217.9a17.56,17.56,0,0,0,3.8.4c8.3,0,11.5-6.1,11.5-11.4,0-5.5-.2-19.9-.3-39.1a102.4,102.4,0,0,1-22.6,2.7c-43.1,0-52.9-33.5-52.9-33.5-10.2-26.5-24.9-33.6-24.9-33.6-19.5-13.7-.1-14.1,1.4-14.1h.1c22.5,2,34.3,23.8,34.3,23.8,11.2,19.6,26.2,25.1,39.6,25.1a63,63,0,0,0,25.6-6c2-14.8,7.8-24.9,14.2-30.7-49.7-5.8-102-25.5-102-113.5,0-25.1,8.7-45.6,23-61.6-2.3-5.8-10-29.2,2.2-60.8a18.64,18.64,0,0,1,5-.5c8.1,0,26.4,3.1,56.6,24.1a208.21,208.21,0,0,1,112.2,0c30.2-21,48.5-24.1,56.6-24.1a18.64,18.64,0,0,1,5,.5c12.2,31.6,4.5,55,2.2,60.8,14.3,16.1,23,36.6,23,61.6,0,88.2-52.4,107.6-102.3,113.3,8,7.1,15.2,21.1,15.2,42.5,0,30.7-.3,55.5-.3,63,0,5.4,3.1,11.5,11.4,11.5a19.35,19.35,0,0,0,4-.4C415.9,449.2,480,363.1,480,261.7,480,134.9,379.7,32,256,32Z" /></svg>
            </a>
        </label>
        <!-- </span> -->
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
        fill: #333;
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

    .copy-button {
        background: unset;
        border: none;
        box-shadow: 0 0px 2px #0004;
        color: whitesmoke;
        background-color: rgba(30, 143, 255, 0.77);
        border-radius: 3px;
        cursor: pointer;
    }
    .copy-button:hover {
        background-color: rgba(79, 165, 251, 0.692);
    }

    .init {
        max-width: 0;
        overflow: hidden;
        transition: all 400ms;
        white-space: nowrap;
        font-size: 14px;

        box-shadow: inset 0 3px 32px #0002;
        border-radius: 3px;
        padding: 0px;

        transition-delay: 2000ms;
    }
    .toggle:hover .init {
        max-width: 450px;
        overflow: hidden;
        padding: 4px;
        transition-delay: 200ms;
    }

    code {
        background: #fff1;
    }
    code.init {
        cursor: text;
        user-select: text;
        color: #777;
        margin: 1px;
    }

    svg {
        height: 28px;
        width: 28px;
    }

    a {
        text-decoration: none;
        fill: inherit;
    }
    a:hover {
        fill: dodgerblue;
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

        bottom: -10px;

        font-size: 12px;
        /* overflow: hidden; */
        /* text-overflow: ellipsis; */
        /* max-width: 60px; */
        transition: all 180ms;
        width: calc(100%);
        text-align: center;

        overflow: hidden;
        text-overflow: ellipsis;
        box-sizing: border-box;
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
        font-size: 5px;
        padding-bottom: 1px;
        bottom: 4px;
        padding-inline: 2px;

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
        fill: whitesmoke;
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
