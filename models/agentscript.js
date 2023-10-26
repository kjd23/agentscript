// hazard function / rate functions 



// Welcome to the model editor! It is similar to the tutorial code blocks
// you saw before, but more flexible--everything can be customized here.
// I'll walk you through it in these comments.
// 

// 
// The first thing to notice is that there are two tabs up top:
// the model tab, and the view tab. The model tab is where you write
// code describing agent behavior, just like before.
// 
// The view tab is totally new. That's where you customize the size of
// the world, and how agents and patches are drawn to the screen.
// 

// 
// The SlimeMoldModel below is based on the code we wrote in the tutorial,
// with two extra things added:
// 
//  1) turtles now intentionally move toward patches with more pheromone
//  2) pheromone diffuses over time to neighboring patches
// 

export default class SlimeMoldModel extends Model {
    
    // 
    // The setup function is like a "run once" block. It gets
    // executed only once, to setup the model.
    // 

    setup() {
        // This line should look familiar. One important difference:
        // in the editor, you say "this.turtles" instead of "model.turtles"
        this.turtles.create(3)
        
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

          let delta_t = 0.05
          let speed = 7
          let radius = 3
          let coneAngle = 180
          let wiggleAngle = 30 // This is an interesting variable to play with

          //const agents = turtle.turtles.inPatchRect(turtle, radius, radius, true)
          let turtles_ahead = this.turtles.inCone(turtle, radius, coneAngle).length
          let agents = this.turtles.inPatchRect(turtle, radius, radius, true)
          let turtles_behind = agents.inCone(turtle, radius, coneAngle, turtle.heading - 180, false).length
          

          // Reversal Rate lambda
		  let lambda_0 = 1/7
          let lambda_c = 1
          let q = 5.925
          let u_c = lambda_c / 2
          let lambda = lambda_0 + lambda_c * turtles_ahead.length^q / (turtles_ahead.length^q + lambda_c^q)

		 // Modified rate considering costreaming
          let lambda_s = 1
          let u_s = lambda_s / 2
          let p = 1
          let modified_lambda = lambda - lambda_s * turtles_behind.length^p / (turtles_behind.length^p + u_s^p)
          
          var random_float = util.randomFloat(1)
          if (random_float < lambda*delta_t) {
              turtle.left(180)
          }

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

          // Reverse direction if turtle is 180 degrees in front, with radnom reversal reversal
          // if (turtles_behind > 0) {var random_float = util.randomFloat(1)
          //    if (random_float < delta_t*lambda) {
          //        turtle.left(180)
          //    }
          // }

          // Get density of turtles behind an individual turtle
          // var behind_turtles = turtle.inCone(radius=10)
          // if (behind_turtles.length > 0) {
          //    turtle.left()

          // Periodic Reversal note: change to probability
          var random_float = util.randomFloat(1)
          if (random_float < lambda*delta_t) {
              turtle.left(180)
          }
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
            patch.pheromone *= 0.99
        })           
    }

}