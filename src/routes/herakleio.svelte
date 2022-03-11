<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/env';

    onMount(async () => {
        if(browser) {
            const leaflet = await import('leaflet');

            let config = {
            minZoom: 6,
            maxZoom: 19,
        };

        const zoom = 18;
        const lat = 35.31796;
        const lng = 25.10308;

        var map = L.map("map", config).setView([lat, lng], zoom);

        // add the OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution:
            '&#127279; <a href="https://poiw.org">po/iw hackerspace</a>',
        }).addTo(map);

        // show the scale bar on the lower left corner
        L.control.scale({ imperial: true, metric: true }).addTo(map);

        L.marker({ lat: 35.3184293, lon: 25.1032471 })
            .bindPopup("po/iw hackerspace. Φοιτητικό εργαστήριο ελευθέρας χρήσης.")
            .addTo(map);

        L.marker({ lat: 35.318388390440674, lng: 25.102925598621372 })
            .bindPopup("Εργαστήριο 2 και 3")
            .addTo(map);

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
    <div id="map"></div>
</main>

<style>
    @import 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    main #map {
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;
    }
</style>