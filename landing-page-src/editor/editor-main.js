// Option 1
// Load the example js file, dump it to the text area,
// first time: import the contents of the text area,
// on change: replace the runtime methods


// Option 1
// interpret textarea as js module; use import()

// Option 2
// interpret textarea as function bodies; use new Function() or eval()


// import Model

// class SomeModel extends Model {
//   constructor() {

//   }

//   setup() {

//   }

//   step() {

//   }

//   helperFn() {

//   }
// }

// textarea.value = code


// import {
//   Model,
//   modelOpts,
//   View,
//   viewOpts,
//   drawOpts
// } from './flock-example-for-editor.js'

let model
let view

async function initEditor() {
  let code = await fetch('./flock-example-for-editor.js').then(res => res.text())
  document.querySelector('.ide-textarea').value = code

  await rebuildModel()

  function step() {
    model.step()
    view.draw()

    setTimeout(() => step(), 20)
  }

  step()

}

async function rebuildModel() {
  let code = document.querySelector('.ide-textarea').value
  
  const dataUri = 'data:text/javascript;charset=utf-8,'
    + encodeURIComponent(code)
  
  let {
    Model,
    modelOpts,
    View,
    viewOpts,
    drawOpts
  } = await import(dataUri)

  model = window.model = new Model(modelOpts)

  viewOpts.div = 'ide-canvas-container'
  document.querySelector(`#${viewOpts.div}`).innerHTML = ''
  
  view = new View(model, viewOpts, drawOpts)

  model.setup()
}

initEditor()

window.rebuildModel = rebuildModel