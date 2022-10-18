import * as gis from './gis.js'
import World from './World.js'
import { geojsonBBox } from './geojson.js'
// import { MathUtils } from 'three'

// class World defines the coordinate system for the model.
// It has been upgraded with methods converting from other
// transforms like GIS and DataSets/Canvas transforms.
// This is an example World object for geojson worlds.

class GeoWorld extends World {
    static defaultOptions(bbox = gis.newMexicoBBox, patchesWidth = 100) {
        return {
            bbox,
            patchesWidth,
        }
    }

    // Use geo bbox & patchesWidth to create a World object
    // BBox can be a geojson obj, which is converted to geojson's bbox
    constructor(options = GeoWorld.defaultOptions()) {
        let { bbox, patchesWidth } = options
        let json
        if (!Array.isArray(bbox)) {
            json = bbox
            bbox = geojsonBBox(json)
        }

        const aspect = gis.bboxMetricAspect(bbox)
        const maxZ = Math.round(patchesWidth / 2)
        super({
            minX: 0,
            maxX: patchesWidth - 1,

            minY: 0,
            maxY: Math.round(patchesWidth / aspect),

            minZ: -maxZ,
            maxZ: maxZ,
        })

        this.bbox = bbox
        this.xfm = this.bboxTransform(...bbox)

        if (json) this.geojson = json
    }
    // Convert from world patch coords to geo coords.
    toGeo(x, y) {
        return this.xfm.toBBox([x, y])
    }
    // Convert from geo lon/lat coords to patch coords
    toWorld(geoX, geoY) {
        return this.xfm.toWorld([geoX, geoY])
    }

    // return bbox in geo coords
    // bbox() {
    //     return this.bbox
    // }
    // return bbox lonlat center
    bboxCenter() {
        return this.xfm.bboxCenter()
    }
    // return bbox as 4 lonlat coords/points
    bboxCoords() {
        return this.xfm.bboxCoords()
    }
}

export default GeoWorld
