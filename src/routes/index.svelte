<script lang="ts">
    import { onMount } from 'svelte';
    import { browser } from '$app/env';
    import axios from "axios";
    import type Place from "../types/place";
    import type Campus from "../types/campus";
    import Fuse from 'fuse.js'

    // Icons
    // You can find what you need at https://svelte-icons-explorer.vercel.app/
    import IoMdCompass from 'svelte-icons/io/IoMdCompass.svelte'
    import IoIosNavigate from 'svelte-icons/io/IoIosNavigate.svelte'
    import IoIosLink from 'svelte-icons/io/IoIosLink.svelte'

    import { Jumper } from 'svelte-loading-spinners';
    import { PlaceType } from '../types/place_types';

    let campus: undefined | Campus;
    let placeholder = "λέσχη";
    let searchBoxIsFocussed = false;
    let showOverlay = true;
    let searchQuery = "";
    let searchResults: any;
    let fuse: any;
    let placeInFocus: undefined | Place;
    let getPlaceIcon: string;

    let doSearch: () => Promise<void>;
    let focusMap: (place: Place) => Promise<void>;

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
            await import("../plugins/leaflet-bounce/bouncemarker")

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
            var markers = new L.layerGroup();

            campus = (await axios.get("./herakleion.json")).data


            fuse = new Fuse([], {
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
            getPlaceIcon = (place: Place): string =>{
                            switch(place.type){
                                case PlaceType.LAB:
                                    return "/microscope_1f52c.png";
                                case PlaceType.CLASSROOM:
                                    return "/teacher_1f9d1-200d-1f3eb.png";
                                case PlaceType.CAFETERIA:
                                    return "/teacher_1f9d1-200d-1f3eb.png";
                                case PlaceType.LIBRARY:
                                    return "/open-book_1f4d6.png";
                                case PlaceType.ADMINISTRATION:
                                    return "/office-building_1f3e2.png";
                                case PlaceType.STUDENT_CLUB:
                                    return "people-holding-hands_1f9d1-200d-1f91d-200d-1f9d1.png";
                                default:
                                    return "/hamburger_1f354.png"
                            }
                        }

            campus.places.forEach((place: Place) => {
                let marker = new L.Marker(new L.LatLng(place.coordinates[0],place.coordinates[1]),{
                    icon: new L.Icon({
                        iconUrl: getPlaceIcon(place),
                        iconSize: [32,32],
                        iconAnchor: new L.Point(8, 16),
                    }),
                })
                .addTo(map)
                .on('click', ()=>focusMap({
                    ...place,
                    marker
                }))

                fuse.add({
                    ...place,
                    marker
                })

            });

            doSearch = async () => {
                searchResults = fuse.search(searchQuery);
            }

            focusMap = async (place: Place) => {
                placeInFocus = place
                map.setView([place.coordinates[0],place.coordinates[1]], 20);

                setTimeout(()=>{
                    map.invalidateSize()
                    place.marker.bounce({duration: 2000, height: 50, loop: 3})
                },500)




                // let marker = L.marker(new L.LatLng(place.coordinates[0],place.coordinates[1]),{
                //     icon: new L.Icon({
                //         iconUrl: '/marker-icon-red.png',
                //         iconAnchor: new L.Point(16, 16),
                //     })
                // })
                //     .bindPopup(place.description ? place.description.el : "")
                //     .addTo(map)


                showOverlay = false;
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
    <div class="absolute top-0 bottom-0 right-0 left-0 z-10 flex flex-col md:flex-row-reverse ">
        <div id="map" class="w-full h-full"></div>
        {#if placeInFocus}
        <div class="flex justify-start xl:items-center p-10 min-h-[50vh] xl:h-auto  w-full xl:w-[50vw] overflow-y-auto">
            <div class="xl:px-10 rounded flex flex-col gap-4  ">
                <h2 class="text-2xl font-bold flex items-center gap-4 text-hmu-green"><img src={getPlaceIcon(placeInFocus)}  class="w-8"/> {placeInFocus.name.el}</h2>
                {#if placeInFocus.floor}<p class="font-bold">ΟΡΟΦΟΣ: {placeInFocus.floor}</p>{/if}

                <p>{placeInFocus.description?.el || ""}</p>


                <!-- Links -->
                <div class="flex items-center gap-5 text-hmu-green">
                    <a class="flex items-center gap-1" href={`https://www.google.com/maps/search/?api=1&query=${placeInFocus.coordinates[0]}%2C${placeInFocus.coordinates[1]}`} target="_blank"><span class="w-5"><IoIosNavigate/></span> Οδηγίες</a>
                    {#if placeInFocus.website}<a class="flex items-center gap-1" href={placeInFocus.website} target="_blank"><span class="w-5"><IoIosLink/></span>Ιστοσελιδα</a>{/if}
                </div>

            </div>
        </div>
        {/if}
    </div>
    <div class={`flex ${placeInFocus ? "flex-col justify-end" : "flex-col justify-center" } items-center h-screen w-screen z-20`}>
        {#if showOverlay}
            {#if !campus}
            <p class="w-8"><Jumper size="60" color="#1b495a" unit="px" duration="1s"></Jumper></p>
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
                                    <div class="cursor-pointer " on:click={focusMap(place.item)}>{place.item.name.el}</div>
                                {/each}
                                {:else}
                                <span class="text-2xl">Δεν βρέθηκαν αποτελέσματα για την αναζήτησή σου. Μήπως έχεις επιλέξει λάθος πανεπιστημιούπολη;</span>
                            {/if}
                        </div>
                    {/if}
                    <span class="text-sm flex gap-2 items-center cursor-pointer" on:click={toggleOverlay}><span class="w-4"><IoMdCompass /></span> Θέλω απλά να δώ τον χάρτη</span>
                </div>

            {/if}
        {/if}
    </div>
</main>

<style>
    @import 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
</style>