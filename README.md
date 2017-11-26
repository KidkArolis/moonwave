# Nebula

Nebula is a small framework for building web applications with JavaScript.

Nebula is 100 lines of code, because it combines an existing set of composable libraries.

* [react](https://reactjs.org/) / [preact](https://preactjs.com/) / custom - component rendering.
* [tiny-atom](https://qubitproducts.github.io/tiny-atom) - state management.
* [space-router](https://github.com/KidkArolis/space-router) - routing.

Each of these libraries is independent and can be useful on their own. Nebula is just one, simple way to combine the three for common cases.

If Nebula doesn't quite fit your needs when your application grows larger, you can combine the three provided libraries (or others) in your own way and so only use Nebula as a reference implementation.

## Usage

    yarn add nebula

## Example

```js
const Preact = require('preact')
const { nebula } = require('nebula/preact')

// each route maps to a Preact component
const routes = [
  ['/', MainView]
]

// actions is how we'll update application state
const actions = {
  update: (get, split, title) => {
    split({ title })
  }
}

// evolve is a flexible hook for implementing custom
// action strategies, such as modularising or namespacing
// this implementation calls the actions we declared above
const evolve = (get, split, action) => {
  actions[action.type](get, split, action.payload)
}

// the preact component receives
function MainView ({ state, split }) {
  return (
    <div>
      <h1>Title: {state.title}</h1>
      <input type='text' value={state.title} onInput={update} />
    </div>
  )

  function update (e) {
    split('update', e.target.value)
  }
}

nebula()
  .state({ title: 'Default title' })
  .evolve(evolve)
  .routes(routes)
  .mount(document.body)
```

This example application uses `preact` and will compile to around `6KB`. The individual components are around:

```
preact        3.5KB
tiny-atom     0.5KB
space-router  1.5KB
example-app   0.5KB
-------------------
              6.0KB
```

### API

#### nebula(options)

Create an app. Available options are:

```
{
  // see https://github.com/QubitProducts/tiny-atom for full docs
  store: {
    merge: (state, update) => Object.assign({}, state, update),
    debug: false
  }

  // see https://github.com/KidkArolis/space-router for full docs
  router: {
    mode: 'history' | 'hash' | 'memory',
    interceptLinks: true,
    qs: { parse, stringify }
  }
}
```

#### nebula.state()

Provide initial state.

#### nebula.evolve()

Provide a function of signature `(get, split, action)` that will receive all actions that were `split` by the app.

**Note**: think of `split` as `dispatch` if you're familiar with that.

#### nebula.routes()

Provide an array of routes.

#### nebula.mount()

Mount the app to a DOM element. Initialise the store, router and render the app into DOM.

#### nebula.unmount()

Stop the router, unrender the app from DOM.
