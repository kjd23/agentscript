export default class SlimeMoldModel extends Model {
    
    // 
    // The setup function is like a "run once" block. It gets
    // executed only once, to setup the model.
    // 

    setup() {
        // This line should look familiar. One important difference:
        // in the editor, you say "this.turtles" instead of "model.turtles"
        this.turtles.create(100)
        
        // The next line is what gives all patches a property called
        // "pheromone", equal to 0. We were doing this behind the scenes before.
        this.patches.setDefault('pheromone', 0)
        
        // Give each turtle a random starting position
        this.turtles.ask(turtle => {
            // Say something about the world here, and how you can mess
            // with it in the view tab
            let [x, y] = this.world.randomPoint()
            turtle.setxy(x, y)
        })
    }
    
    // 
    // The step function is like a "run forever" block. It gets
    // executed over and over again.
    // 

    step() {        
        this.turtles.ask(turtle => {

        let delta_t = .1
        let speed = 7
        let radius = 3
        let wiggleAngle = 30 // This is an interesting variable to play with
        let turtles_ahead = this.turtles.inRadius(turtle, radius, true)
        let theta = 90

        let aligned_turtles_ahead = turtlesAlignedAhead(turtle, turtles_ahead, theta)
        let aligned_turtles_behind = turtlesAlignedBehind(turtle, turtles_ahead, theta)

          // Reversal Rate lambda
		  let lambda_0 = 1/7
          let lambda_c = 2
          let q = 5.925
          let u_c = lambda_c / 2
          let lambda = lambda_0 + lambda_c * aligned_turtles_ahead.length^q / (aligned_turtles_ahead.length^q + lambda_c^q)

		  // Reversal
          var random_float = util.randomFloat(1)
          if (random_float < lambda*delta_t) {
              turtle.left(180)
          }        
		 // Modified rate considering costreaming
          let lambda_s = 1
          let u_s = lambda_s / 2
          let p = 1
          let modified_lambda = lambda - lambda_s * aligned_turtles_behind.length^p / (aligned_turtles_behind.length^p + u_s^p)

           // Random wiggle
           let sigma = 200
           let a = sigma*delta_t
           var randomWiggle = util.randomFloat2(-a,a)
           turtle.left(randomWiggle)
 
          
          // We look at three patches: directly ahead, ahead and to the right,
          // and ahead and to the left of the turtle
          let patchAhead = turtle.patchAhead(1)
          let patchRight = turtle.patchRightAndAhead(wiggleAngle, 1)
          let patchLeft = turtle.patchLeftAndAhead(wiggleAngle, 1)
          
          if (patchAhead && patchLeft && patchRight) {
              // If the patch to the right has the most pheromone, we turn right
              if (patchRight.pheromone > patchLeft.pheromone &&
                  patchRight.pheromone > patchAhead.pheromone) {
                  turtle.right(wiggleAngle) 
              }

              // If the patch to the left has the most pheromone, we turn left
              if (patchLeft.pheromone > patchRight.pheromone &&
                  patchLeft.pheromone > patchAhead.pheromone) {                  
                  turtle.left(wiggleAngle)  
              }
              
              // If the patch ahead has the most pheromone, we don't rotate at all
          } 

          // If there's no patch to our right or left (because we're at the edge
          // of the world) we turn around.
          if (!patchRight) turtle.left(90)
          if (!patchLeft) turtle.right(90)
        
          // This last bit should look familiar. Move forward,
          // and add some pheromone to the turtle's patch
          turtle.forward(speed*delta_t)
        turtle.patch.pheromone += 0
        })

        // This part is new. patches.diffuse() causes each patch to give
        // some of its pheromone to its neighbors. Try changing the
        // diffusion amount and see what happens.
        this.patches.diffuse('pheromone', 0.5)

        // Evaporate the pheromone over time
        this.patches.ask(patch => {
            patch.pheromone *= 0.1
        })             
    }
    // turtles aligned
    turtlesAlignedAhead(agent, agents, theta) {
        const aligned_agents = agents
        this.ask(a => {
            if (Math.abs(agent.heading - a.heading) <= theta) {
                aligned_agents.push(a)
            }
        })
        return aligned_agents
    }

    turtlesAlignedBehind(agent, agents, theta) {
        const mod = util.mod
        const aligned_agents = agents
        this.ask(a => {
            if (Math.abs(mod(agent.heading + 180, 360) - a.heading) <= theta) {
                aligned_agents.push(a)
            }
        })
        return aligned_agents
    }

}

