import {Canvas, NodeCanvasRenderingContext2D} from "canvas";
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas')

interface Point {
    x: number;
    y: number;
}

module.exports = class Layer {
    width: number;
    height: number;
    coordMaxX: number;
    coordMaxY: number;
    canvas: Canvas;
    context: NodeCanvasRenderingContext2D;

    constructor(width: number, height: number, coordMaxX: number, coordMaxY: number) {
        this.width = width;
        this.height = height;
        this.coordMaxX = coordMaxX;
        this.coordMaxY = coordMaxY;
        this.canvas = createCanvas(this.width, this.height)
        this.context = this.canvas.getContext('2d');
        this.context.save();
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.width, this.height);
        this.context.restore();
    }

    get scaleX() {
        return this.width / (this.coordMaxX * 2);
    }

    get scaleY() {
        return this.height / (this.coordMaxY * 2);
    }

    coordToPixel({x, y}: Point) {
        const unitX = x + this.coordMaxX;
        const unitY = Math.abs(y - this.coordMaxY);

        return {x: unitX * this.scaleX, y: unitY * this.scaleY};
    }

    pixelToCoord({x, y}: Point) {
        const unitX = x / this.scaleX;
        const unitY = y / this.scaleY;

        return {x: unitX - this.coordMaxX, y: (unitY - this.coordMaxY) * -1};
    }

    writeImage(file: string) {
        const buffer = this.canvas.toBuffer('image/png');
        fs.writeFileSync(file, buffer)
    }

    createMarker(coord: Point, color: string) {
        const pixel = this.coordToPixel(coord);
        this.context.fillStyle = color;
        this.context.beginPath();
        this.context.ellipse(pixel.x, pixel.y, 10, 10, 0, 0, 2 * Math.PI)
        this.context.fill();
        this.context.restore();
    }

    createPolygon(coordList: Point[], color: string) {
        this.context.fillStyle = color;
        this.context.strokeStyle = color;
        this.context.beginPath();
        for(const i in coordList) {
            const pixel = this.coordToPixel(coordList[i]);
            const method = (i === '0') ? 'moveTo' : 'lineTo';
            this.context[method](pixel.x, pixel.y)
        }
        this.context.closePath();
        this.context.stroke();
        this.context.restore();
    }

    createFeature(feature: object, color: string) {
        let polygons = [];
        if(feature.geometry.type == 'MultiPolygon')
            polygons = feature.geometry.coordinates;
        else if(feature.geometry.type == 'Polygon')
            polygons = [feature.geometry.coordinates];

        for(let polygon of polygons) {
            polygon = polygon[0].map(([x, y]) =>({x: x, y: y}));
            this.createPolygon(polygon, color);
        }
    }
}