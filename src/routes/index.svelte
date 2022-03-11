<script lang="ts">
    import { onMount } from 'svelte';
    import { browser } from '$app/env';
    import axios from "axios";
    import type Place from "../types/place";
    import type Campus from "../types/place";
    import {Compass, Hourglass} from "svelte-bootstrap-icons";
    import Fuse from 'fuse.js'

    let campus: undefined | Campus;
    let placeholder = "λέσχη";
    let searchBoxIsFocussed = false;
    let showOverlay = true;
    let searchQuery = "";
    let searchResults: any;
    let fuse: any;

    let doSearch: () => Promise<void>;

    let searchBoxEvent = (e) => {
            if(e.type == "keydown" || e.type == "change" || e.type == "keyup" ) {
                if(searchQuery){
                    searchBoxIsFocussed = true;
                    doSearch();
                }
                else searchBoxIsFocussed = false
            }

    }

    let toggleOverlay = () => showOverlay = !showOverlay

    let possiblePlaceholders = [
        "λέσχη",
        "εργαστήριο 2",
        "φοιτητική μέριμνα",
        "αμφιθέατρο α",
        "γραμματεία ημμυ",
        "εργαστήριο σαε",
        "αίθουσα 5",
        "νοσηλευτική",

    ]
    onMount(async () => {
        if(browser) {
            const L = await import('leaflet');

            let config = {
                minZoom: 0,
                maxZoom: 19,
                attributionControl: false,
                zoomControl: false
            };

            // Set random placeholder at the search text field
            setInterval(()=>{
                placeholder = possiblePlaceholders[Math.floor(Math.random() * possiblePlaceholders.length)];
            },3000)

            const zoom = 18;
            const lat = 35.31796;
            const lng = 25.10308;

            var map = L.map("map", config).setView([lat, lng], zoom);
            campus = (await axios.get("./herakleion.json")).data


            fuse = new Fuse(campus.places, {
                includeScore: true,
                useExtendedSearch: true,
                keys: ['name.en', 'name.el', "description.en", "description.el", 'keywords']
            })

            // https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
            // add the OpenStreetMap tiles
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution:
                '&#127279; <a href="https://poiw.org">po/iw hackerspace</a>',
            }).addTo(map);

            // show the scale bar on the lower left corner
            // L.control.scale({ imperial: true, metric: true }).addTo(map);

            campus.places.forEach((place: Place) => {
                console.log(fuse.getIndex().size())
                L.marker({ lat: place.coordinates[0], lon: place.coordinates[1] })
                .bindPopup(place.description.el)
                .addTo(map);
            });

            doSearch = async () => {
                searchResults = fuse.search(searchQuery);
                console.log(searchResults)
            }

            // obtaining coordinates after clicking on the map
            map.on("click", function (e) {
                // console.log(e.latlng);
                // L.marker(e.latlng, {
                // draggable: true,
                // autoPan: true,
                // })
                // .addTo(map)
                // .on("dragend", function (e) {
                //     console.log(e.latlng);
                // });
            });
        }
    });
</script>


<main>
    <div id="map" class="absolute top-0 bottom-0 right-0 left-0 z-10"></div>
    <div class="flex flex-col justify-center items-center h-screen w-full  z-20 ">
        {#if showOverlay}
            {#if !campus}
            <p class="text-2xl"><Hourglass/></p>
            {:else}
                <div class="h-full w-full py-4 px-4  text-hmu-green z-20 flex justify-center items-center gap-12 bg-[#ffffff81] backdrop-blur flex-col">
                    <img src="/logo-el.png" class="w-56 md:w-40 -mt-20" alt="HMU"/>
                    <div class="flex items-center justify-center gap-4 flex-wrap">
                        <!-- <p class="font-bold tracking-wide text-lg">{campus.name.el}</p> -->
                        {#if !searchBoxIsFocussed} <p class="text-4xl md:text-4xl w-screen md:w-auto text-center">Που είναι</p>{/if}
                        <input type="text" on:keyup={searchBoxEvent} on:change={searchBoxEvent} on:focus={searchBoxEvent} bind:value={searchQuery} class="w-64 md:w-96 rounded-sm text-center tracking-wide font-medium bg-transparent text-hmu-green placeholder:text-hmu-green text-4xl md:text-4xl border-b-2 border-hmu-green" placeholder={placeholder}>
                        {#if !searchBoxIsFocussed}<p class="text-4xl md:text-4xl">;</p>{/if}
                    </div>

                    {#if searchBoxIsFocussed}
                        <div class="bg-white p-4 w-64 md:w-96 -mt-12 flex flex-col gap-5">
                            {#if searchResults}
                                {#each searchResults as place}
                                    <div class="cursor-pointer " on:click={toggleOverlay}>{place.item.name.en}</div>
                                {/each}
                                {:else}
                                <span class="text-2xl">Δεν βρέθηκαν αποτελέσματα για την αναζήτησή σου. Μήπως έχεις επιλέξει λάθος πανεπιστημιούπολη;</span>
                            {/if}
                        </div>
                    {/if}
                    <span class="text-sm flex gap-2 items-center cursor-pointer" on:click={toggleOverlay}><Compass/>Θέλω απλά να δώ τον χάρτη</span>

                </div>
                <!-- <div class="w-full py-10 bg-[#202020d3] backdrop-blur shadow-lg z-20 flex justify-center items-center flex-col gap-6">

                </div> -->
            {/if}
        {/if}
    </div>
</main>

<style>
    @import 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
</style>