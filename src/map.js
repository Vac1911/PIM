import {tileLayer as TileLayer, map as LeafletMap, control, DivIcon, Point as LeafletPoint, Marker, Polyline, Polygon} from "leaflet";
import HotkeyManager from "./HotkeyManager";
import {lineString, midpoint, nearestPointOnLine, point, featureCollection, nearestPoint, circle} from "@turf/turf";

// map.addHandler('draw', Polyline);
var base = TileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1
});
// Overlay layers (TMS)
var lyr = TileLayer('./{z}/{x}/{y}.png', {tms: true, opacity: 0.7, attribution: "", minZoom: 1, maxZoom: 6});
const map = LeafletMap('map', {layers: [base]}).setView([51.505, -0.09], 12);
control.layers({"Base": base}, {"Layer": lyr}, {collapsed: false}).addTo(map);
let markers = [],
    midMarkers = [],
    cursorMarker = false,
    coords = [],
    overlay = [],
    poly = null,
    mode = 'none',
    options = {
        icon: new DivIcon({
            iconSize: new LeafletPoint(16, 16),
            className: 'leaflet-div-icon leaflet-editing-icon'
        }),
        cursorIcon: new DivIcon({
            iconSize: new LeafletPoint(12, 12),
            className: 'leaflet-div-icon leaflet-cursor-icon'
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
// document.getElementById('circleMode').addEventListener('click', () => setMode('circle', false));

enableDrawMixin();

function enableDrawMixin() {
    map.on('click', handleClick);
    map.on('mousemove', trackCursor);
    setMode('none');
}

function trackCursor(e) {
    if (cursorMarker)
        cursorMarker.remove();

    let cursorCoord = e.latlng;

    if (e.originalEvent.shiftKey && overlay.length)
        if (e.originalEvent.ctrlKey)
            cursorCoord = pointToCoord(nearestVertexInPolyLines(cursorCoord, overlay));
        else
            cursorCoord = pointToCoord(nearestPointOnPolyLines(cursorCoord, overlay));

    cursorMarker = new Marker(cursorCoord, {
        icon: options.cursorIcon,
        zIndexOffset: 1900,
        interactive: false
    }).addTo(map);
}

function nearestPointOnPolyLines(coord, polylines) {
    const nearestLinePoints = polylines.map(s => s.getLatLngs()[0].map(c => coordToArray(c)))
            .map(arr => nearestPointOnLine(lineString([...arr, arr[0]]), coordToPoint(coord))),
        distances = nearestLinePoints.map(p => p.properties.dist),
        lowestDistance = Math.min(...distances),
        nearestIndex = distances.indexOf(lowestDistance);
    return nearestLinePoints[nearestIndex];
}

function nearestVertexInPolyLines(coord, polylines) {
    const vertices = polylines.flatMap(s => s.getLatLngs()[0].map(c => coordToPoint(c)));
    return nearestPoint(coordToPoint(coord), featureCollection(vertices));
}

function disableDrawMixin() {
    map.off('click', handleClick);
    setMode('none');
}

function handleClick(e) {
    if (mode === 'create')
        if (e.originalEvent.shiftKey && cursorMarker)
            return drawCoord(cursorMarker.getLatLng());
        else
            return drawCoord(e.latlng);

    if (mode === 'circle')
        return drawCircle(coordToPoint(e.latlng));
}

function drawCircle(center) {
    var radius = 2000;
    var options = {steps: 32, units: 'kilometers'};
    var greatCircle = circle(center, radius, options);
    console.log(greatCircle);
    coords = greatCircle.geometry.coordinates[0].slice(1).map(p => arrayToCoord(p));
    markers.forEach(m => m.remove());
    markers = [];
    midMarkers.forEach(m => m.remove());
    midMarkers = [];
    coords.forEach(c => createMarker(c));
    updateShape();
}

function drawCoord(c) {
    coords.push(c);
    createMarker(c);
    updateShape();
}

function createMarker(c) {
    let marker = new Marker(c, {
        icon: options.icon,
        zIndexOffset: 2000,
        draggable: true,
    }).addTo(map);
    markers.push(marker);
    marker.on('click', (e) => touchMarker(marker, e));
    marker.on("drag", (e) => {
        let marker = e.target,
            cursorCoord = marker.getLatLng();
        const index = markers.findIndex(m => m._leaflet_id === marker._leaflet_id);

        // if (e.originalEvent.shiftKey && overlay.length)
        //     if (e.originalEvent.ctrlKey)
        //         cursorCoord = pointToCoord(nearestVertexInPolyLines(cursorCoord, overlay));
        //     else
        //         cursorCoord = pointToCoord(nearestPointOnPolyLines(cursorCoord, overlay));

        coords[index] = cursorCoord;
        updateShape();
    });
    return marker;
}

function updateShape() {
    if (!poly)
        poly = new Polyline(coords, options.shape).addTo(map);
    else
        poly.setLatLngs(coords).redraw();

    updateMidpoints();
}

function updateMidpoints() {
    if (coords.length > 1) {
        midMarkers.forEach(m => m.remove());
        midMarkers = [];
        for (let i = 0; i < (mode === 'create' ? coords.length - 1 : coords.length); i++) {
            const p0 = coordToPoint(coords[i]),
                p1 = coordToPoint(coords[i + 1 < coords.length ? i + 1 : 0]),
                pMid = pointToCoord(midpoint(p0, p1));
            let midMarker = new Marker(pMid, {
                icon: options.icon,
                zIndexOffset: 2000,
                draggable: false,
                opacity: 0.5,
            }).addTo(map);
            midMarkers.push(midMarker);
            midMarker.on("click", (e) => {
                const midMarker = e.target,
                    index = midMarkers.findIndex(m => m._leaflet_id === midMarker._leaflet_id);
                coords = [...coords.slice(0, index + 1), e.latlng, ...coords.slice(index + 1)];
                markers = [...markers.slice(0, index + 1), createMarker(e.latlng), ...markers.slice(index + 1)];

                updateShape();
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
    if (!setMode('edit', false))
        return false;
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
        document.getElementById('map').setAttribute("mode", nextMode);
        mode = nextMode;
        return true;
    }
    else {
        return false;
    }
}

function coordToPoint(coord) {
    return point(coordToArray(coord));
}

function coordToArray(coord) {
    return [coord.lng, coord.lat];
}

function arrayToCoord(arr) {
    return {lat: arr[1], lng: arr[0]};
}
function pointToCoord(point) {
    return arrayToCoord(point.geometry.coordinates);
}
