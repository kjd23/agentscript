import World from '../src/World.js'
import util from '../src/util.js'
// import DataSet from '../src/DataSet.js'
import Color from '../src/Color.js'
import ColorMap from '../src/ColorMap.js'
import ThreeView from '../src/ThreeView.js'
import DropletsModel from '../models/DropletsModel.js'
util.toWindow({ util, Color, ColorMap, ThreeView, DropletsModel })

const params = util.RESTapi({
    seed: false,
    maxX: 50,
    maxY: 50,
    steps: 500,
    shape: 'circle',
    shapeColor: 'yellow',
    shapeSize: 0.5,
    tile:
        'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/13/1594/3339.png',
    world: null,
})
if (params.seed) util.randomSeed()
params.world = World.defaultOptions(params.maxX, params.maxY)

const grayColorMap = ColorMap.grayColorMap()
const localMinColor = Color.typedColor(255, 0, 0)

const model = new DropletsModel(params.world)
model.tile = params.tile
const view = new ThreeView(params.world)
const sprite = view.getSprite(params.shape, params.shapeColor)
util.toWindow({ model, view, params })

model.startup().then(() => {
    // model.stepType = 'minNeighbor'
    // model.killOffworld = true
    model.setup()
    // const elevations = model.patches.props('elevation')
    const elevations = model.patches.exportDataSet('elevation')
    const patchColors = getPatchColors(elevations)
    view.drawPatches(patchColors, c => c.pixel) // just once

    const perf = util.fps() // Just for testing, not needed for production.
    util.timeoutLoop(() => {
        model.step()
        model.tick()

        view.drawTurtles(model.turtles, { sprite, size: params.shapeSize })
        view.render()
        perf()
    }, params.steps).then(() => {
        console.log(`Done, steps: ${perf.steps}, fps: ${perf.fps}`)
        view.idle()
    })
})

function getPatchColors(dataset) {
    // const { width, height } = params.world
    // const dataset = new DataSet(width, height, elevations)
    const grays = dataset.scale(0, 255).data
    const colors = grays.map(d => grayColorMap[Math.round(d)])
    model.localMins.forEach(p => (colors[p.id] = localMinColor))
    return colors
}
