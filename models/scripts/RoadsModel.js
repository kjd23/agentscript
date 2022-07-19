var util = AS.util
var gis = AS.gis
var World = AS.World
var Model = AS.Model
import { lineStringsToLinks } from '../src/geojson.js'

// The json data is pre-computed due to being very difficult to compute here.
// Thus done offline via node/deno cli's
const xyz = [3370, 6451, 14]
const bbox = gis.xyz2bbox(...xyz)
const jsonUrl = '../models/data/santafe14roads.json'

console.log(bbox.toString())

class RoadsModel extends Model {
    geojson
    network
    numDrivers = 100 // 25
    speed = 0.01
    speedDelta = 0.01

    constructor(worldOptions = World.defaultOptions(100)) {
        super(worldOptions)
    }

    async startup() {
        this.geojson = await fetch(jsonUrl).then(resp => resp.json())
    }

    setup() {
        this.turtleBreeds('intersections nodes drivers')
        // REMIND: this fails! this.nodes.setDefault('atEdge', 'clamp')
        this.turtles.setDefault('atEdge', 'clamp')
        this.network = lineStringsToLinks(this, bbox, this.geojson)

        this.turtles.ask(t => {
            this.nodes.setBreed(t)
            if (t.links.length > 2) this.intersections.setBreed(t)
        })

        util.repeat(this.numDrivers, () => {
            const node = this.nodes.oneOf()
            node.hatch(1, this.drivers, driver => {
                driver.fromNode = node
                driver.toNode = node.linkNeighbors().oneOf()
                driver.face(driver.toNode)
                driver.speed = this.speed + util.randomFloat(this.speedDelta)
            })
        })
    }

    step() {
        this.drivers.ask(t => {
            this.drivers.ask(driver => {
                const moveBy = Math.min(
                    driver.speed,
                    driver.distance(driver.toNode)
                )
                driver.face(driver.toNode)
                driver.forward(moveBy)

                // if moveBy was driver.distance, change to/from nodes
                if (moveBy < driver.speed) {
                    const lastFromNode = driver.fromNode
                    driver.fromNode = driver.toNode

                    if (driver.toNode.links.length === 1) {
                        driver.toNode = lastFromNode
                    } else {
                        const neighbors = driver.toNode.linkNeighbors()
                        driver.toNode = neighbors.otherOneOf(lastFromNode)
                    }
                }
            })
        })
    }
}
const defaultModel = RoadsModel

