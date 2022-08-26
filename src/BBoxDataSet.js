import * as util from './utils.js'
import * as gis from './gis.js'
import * as TileData from './TileData.js'
// import RGBDataSet from './RGBDataSet.js'

class BBoxDataSet {
    constructor(bbox, zoom, tileData = 'mapzen', tileSize = 256) {
        if (util.isString(tileData)) tileData = TileData[tileData]
        Object.assign(this, { tileData, tileSize })
        this.reset(bbox, zoom)
    }
    // used by ctor
    // to get a bboxDataSet for a different bbox, use this
    reset(bbox, zoom) {
        Object.assign(this, { bbox, zoom })
        this.tiles = {}
    }

    // xyz = [x, y, z(oom)], a tile's slippy map location
    // tile = a slippy map image
    // bbox = [west, south, east, west] in lon/lats
    tileName(xyz) {
        const [x, y, z] = xyz
        return x + '/' + y + '/' + z
    }
    addTile(tile, xyz) {
        const dataSet = this.tileData.tileDataSet(tile)
        // dataSet.xyz = xyz
        // dataSet.tile = tile
        const key = this.tileName(xyz)
        this.tiles[key] = dataSet
    }
    removeTile(xyz) {
        delete this.tiles[this.tileName(xyz)]
    }

    async getBBoxDataSet(bbox, zoom) {
        const bboxXYs = bboxToXYZs(bbox, zoom)
        const bboxTiles = await getBBoxDataSets(bboxXYs)
        const { dataSets, width, height } = bboxTiles
        const dataSetMatrix = util.arrayToMatrix(dataSets, width, height)
        const tilesDataSet = dataSetMatrixToDataSet(dataSetMatrix)
        const cropParameters = getCropParameters(bbox, zoom)
        console.log('cropParameters', cropParameters)
        const bboxDataSet = tilesDataSet.crop(cropParams)
        return bboxDataSet
    }
}

export default BBoxDataSet

// these may be useful by themselves.
// test with bbox = gis.santaFeBBox; zoom = 11

export function bboxCornerXYs(bbox, zoom) {
    return gis.tilesBBox(bbox, zoom)
}

export function bboxToXYZs(bbox, zoom) {
    const [westX, southY, eastX, northY] = bboxCornerXYs(bbox, zoom)

    const xyzs = []
    for (let y = northY; y <= southY; y++) {
        for (let x = westX; x <= eastX; x++) {
            xyzs.push([x, y, zoom])
        }
    }

    const [width, height] = [eastX - westX + 1, southY - northY + 1]
    return { xyzs, width, height } // sorta like a tile dataSet
}

export function zxy(xyz) {
    const [x, y, z] = xyz
    return [z, x, y]
}

export async function getBBoxDataSets(xyzDataSet) {
    const { xyzs, width, height } = xyzDataSet
    const promises = xyzs.map(xyz => tileData.zxyToDataSet(...zxy(xyz)))
    const dataSets = await Promise.all(promises)
    return { dataSets, width, height }
}

// export function dataSetsMatrix(dataSets, width, height){
//     return util.arrayToMatrix(dataSets, width, height)
// }

// export function arrayToMatrix(array, width, height) {
//     if (array.length !== width * height)
//         throw Error('arrayToMatrix: length !== width * height')

//     const matrix = []
//     for (let i = 0; i < height; i++) {
//         const row = array.slice(i * width, (i + 1) * width)
//         matrix.push(row)
//     }

//     return matrix
// }

export function dataSetMatrixToDataSet(dataSetMatrix) {
    const rows = dataSetMatrix.map(col =>
        col.reduce((prev, cur) => prev.concatEast(cur))
    )
    const dataSet = rows.reduce((prev, cur) => prev.concatSouth(cur))
    return dataSet
}

export function getCropParameters(bbox, zoom, tileSize = 256) {
    // Get bbox lons & lats (in float degrees)
    const [west, south, east, north] = bbox // geo coords

    // Get tile coords (in floats) of bbox
    const westX = gis.lonz2xFloat(west, zoom)
    const eastX = gis.lonz2xFloat(east, zoom)
    const northY = gis.latz2yFloat(north, zoom)
    const southY = gis.latz2yFloat(south, zoom)

    // Get tile edge coords in ints
    const northOuter = Math.floor(northY)
    const southOuter = Math.ceil(southY)
    const westOuter = Math.floor(westX)
    const eastOuter = Math.ceil(eastX)

    // Calculate the crop values in pixels.
    const left = Math.round((westX - westOuter) * tileSize)
    const top = Math.round((northY - northOuter) * tileSize)
    const right = Math.round((eastOuter - eastX) * tileSize)
    const bottom = Math.round((southOuter - southY) * tileSize)
    return { top, bottom, left, right }
}

// export function bboxDataSet
