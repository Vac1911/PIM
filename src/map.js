import L from "leaflet";
import HotkeyManager from "./HotkeyManager";
import {midpoint, point} from "@turf/turf";
import {latLng} from "leaflet/dist/leaflet-src.esm";

// map.addHandler('draw', Polyline);
var base = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1
});
// Overlay layers (TMS)
var lyr = L.tileLayer('./{z}/{x}/{y}.png', {tms: true, opacity: 0.7, attribution: "", minZoom: 1, maxZoom: 6});
const map = L.map('map', {layers: [base]}).setView([51.505, -0.09], 12);
L.control.layers({"Base": base}, {"Layer": lyr}, {collapsed: false}).addTo(map);
let markers = [],
    midMarkers = [],
    coords = [],
    overlay = [],
    poly = null,
    mode = 'none',
    options = {
        icon: new L.DivIcon({
            iconSize: new L.Point(16, 16),
            className: 'leaflet-div-icon leaflet-editing-icon'
        }),
        shape: {
            stroke: true,
            color: '#3388ff',
            weight: 4,
            opacity: 0.5,
            fill: false,
            clickable: true
        }
    };

HotkeyManager.setHotkey('Escape', finishUpdate);
document.getElementById('createMode').addEventListener('click', () => setMode('create', false));

enableDrawMixin();

function enableDrawMixin() {
    map.on('click', handleClick);
    setMode('none');
}

function disableDrawMixin() {
    map.off('click', handleClick);
    setMode('none');
}

function handleClick(e) {
    if (!e.originalEvent.ctrlKey)
        if (mode === 'create')
            return drawCoord(e.latlng);
}

function drawCoord(c) {
    coords.push(c);
    createMarker(c);
    updateShape();
}

function createMarker(c) {
    let marker = new L.Marker(c, {
        icon: options.icon,
        zIndexOffset: 2000,
        draggable: true,
    }).addTo(map);
    markers.push(marker);
    marker.on('click', (e) => touchMarker(marker, e));
    marker.on("drag", (e) => {
        var marker = e.target;
        const index = markers.findIndex(m => m._leaflet_id === marker._leaflet_id);
        coords[index] = marker.getLatLng();
        updateShape();
    });
    return marker;
}

function updateShape() {
    if (!poly)
        poly = new L.Polyline(coords, options.shape).addTo(map);
    else
        poly.setLatLngs(coords).redraw();

    updateMidpoints();
}

function updateMidpoints() {
    if (coords.length > 1) {
        midMarkers.forEach(m => m.remove());
        midMarkers = [];
        for(let i = 0; i < coords.length; i++) {
            const p0 = latlngToPoint(coords[i]),
                p1 = latlngToPoint(coords[i + 1 < coords.length ? i + 1 : 0]),
                pMid = pointToLatlng(midpoint(p0, p1));
            let midMarker = new L.Marker(pMid, {
                icon: options.icon,
                zIndexOffset: 2000,
                draggable: true,
                opacity: 0.5,
            }).addTo(map);
            midMarkers.push(midMarker);
            midMarker.on("click", (e) => {
                var midMarker = e.target;
                const index = midMarkers.findIndex(m => m._leaflet_id === midMarker._leaflet_id);
                console.log('mid click', index);

                // Remove from midMarkers at index
                // add to markers at index + 1

                // updateShape();
            });
        }
    }
}

function touchMarker(marker, e) {
    const position = markers.findIndex(m => m._leaflet_id === marker._leaflet_id);
    if (position === 0 && markers.length > 2) {
        outputShape({
            stroke: true,
            color: '#3388ff',
            weight: 4,
            opacity: 0.5,
            fill: true,
            clickable: true
        });
    } else if (position === markers.length - 1 && markers.length > 1) {
        outputShape({
            stroke: true,
            color: '#3388ff',
            weight: 4,
            opacity: 0.5,
            fill: false,
            clickable: true
        }, 'Polyline');
    }
}

function finishUpdate() {
    poly = null;
    setMode('none');
}

function outputShape(options, type = 'Polygon') {
    if (poly)
        poly.remove();
    poly = null;
    markers.forEach(m => m.remove());
    markers = [];
    let shape = new L[type](coords, options).addTo(map);
    overlay.push(shape);
    shape.on('click', (e) => setShape(shape, e));
    coords = [];

    setMode('none');
}

function setShape(shape, e) {
    if (mode === 'edit')
        return false;
    setMode('edit');
    poly = shape;
    coords = shape.getLatLngs()[0];
    coords.forEach(c => createMarker(c));
    updateMidpoints();
}

function setMode(nextMode, force = true) {
    if (force || mode === 'none') {
        if (markers.length)
            markers.forEach(m => m.remove());
        markers = [];

        if (midMarkers.length)
            midMarkers.forEach(m => m.remove());
        midMarkers = [];

        if (poly !== null)
            poly.remove();
        poly = null;

        coords = [];

        document.getElementById('mode').innerText = nextMode;
        mode = nextMode;
    }
}

function latlngToPoint(latlng) {
    return point([latlng.lng, latlng.lat]);
}
function pointToLatlng(point) {
    return {lat: point.geometry.coordinates[1], lng: point.geometry.coordinates[0]};
}