"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const Tile = require('./tile');
// CONSTANTS
const PI = Math.PI;
const PI_4 = PI / 4;
const DEGREES_TO_RADIANS = PI / 180;
const RADIANS_TO_DEGREES = 180 / PI;
const TILE_SIZE = 512;
module.exports = class Layer {
    constructor(zoom) {
        this.zoom = zoom;
        const length = 2 ** zoom;
        for (const x of Array(length).keys()) {
            for (const y of Array(length).keys()) {
                this.tiles[x][y] = new Tile();
            }
        }
    }
    /**
     * Project [lng,lat] on sphere onto [x,y] on 512*512 Mercator Zoom 0 tile.
     * Performs the nonlinear part of the web mercator projection.
     * Remaining projection is done with 4x4 matrices which also handles
     * perspective.
     *
     * @see https://github.com/uber-web/math.gl/blob/master/modules/web-mercator/src/web-mercator-utils.js
     *
     * @param Point {x: lng, y: lat} Specifies a point on the sphere to project onto the map.
     * @return Point world pixel position.
     */
    coordToWorld({ x: lng, y: lat }) {
        //  Lattitude flipped because canvas system has flipped y axis
        lat = -lat;
        const lambda2 = lng * DEGREES_TO_RADIANS;
        const phi2 = lat * DEGREES_TO_RADIANS;
        const x = (TILE_SIZE * (lambda2 + PI)) / (2 * PI);
        const y = (TILE_SIZE * (PI + Math.log(Math.tan(PI_4 + phi2 * 0.5)))) / (2 * PI);
        return { x: x, y: y };
    }
    // Unproject world point [x,y] on map onto {lat, lon} on sphere
    worldToLngLat({ x, y }) {
        const lambda2 = (x / TILE_SIZE) * (2 * PI) - PI;
        const phi2 = 2 * (Math.atan(Math.exp((y / TILE_SIZE) * (2 * PI) - PI)) - PI_4);
        return [lambda2 * RADIANS_TO_DEGREES, phi2 * RADIANS_TO_DEGREES];
    }
    // coordToPixel({x, y}: Point) {
    //     const zoom: number = 0;
    //     const zFactor: number = (512 / (2 * Math.PI)) * (2 ** zoom);
    //     const xFactor: number = degToRad(x) + Math.PI;
    //     const yFactor: number = Math.PI - Math.log( Math.trunc ( Math.tan( (Math.PI / 4) + (degToRad(y) / 2) ) ) );
    //     console.log(Math.tan( (Math.PI / 4) + (degToRad(y) / 2) ));
    //     return {
    //         x: Math.floor( zFactor * xFactor ),
    //         y: Math.floor( zFactor * yFactor ),
    //     }
    // }
    // coordToPixel({x, y}: Point) {
    //     const unitX = x + this.coordMaxX;
    //     const unitY = Math.abs(y - this.coordMaxY);
    //     return {x: unitX * this.scaleX, y: unitY * this.scaleY};
    // }
    createMarker(coord, color) {
        // const world = this.coordToWorld(coord);
        // console.log(coord, world);
        // this.context.fillStyle = color;
        // this.context.beginPath();
        // this.context.ellipse(world.x, world.y, 4, 4, 0, 0, 2 * Math.PI)
        // this.context.fill();
        // this.context.restore();
    }
    createPolygon(coordList, color) {
        // this.context.fillStyle = color;
        // this.context.strokeStyle = color;
        // this.context.beginPath();
        // for(const i in coordList) {
        //     const pixel = this.coordToWorld(coordList[i]);
        //     const method = (i === '0') ? 'moveTo' : 'lineTo';
        //     this.context[method](pixel.x, pixel.y)
        // }
        // this.context.closePath();
        // this.context.stroke();
        // this.context.restore();
    }
    createFeature(feature, color) {
        // let polygons: any[] = [];
        // if(feature.geometry.type == 'MultiPolygon')
        //     polygons = feature.geometry.coordinates;
        // else if(feature.geometry.type == 'Polygon')
        //     polygons = [feature.geometry.coordinates];
        // for(let polygon of polygons) {
        //     polygon = polygon[0].map(([x, y]) =>({x: x, y: y}));
        //     this.createPolygon(polygon, color);
        // }
    }
};
