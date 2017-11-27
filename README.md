# 🌗 Moonwave

Moonwave is a small framework for building web applications with JavaScript.

Moonwave is 100 lines of code, because it combines an existing set of composable libraries.

* [react](https://reactjs.org/) / [preact](https://preactjs.com/) / custom - component rendering.
* [tiny-atom](https://qubitproducts.github.io/tiny-atom) - state management.
* [space-router](https://github.com/KidkArolis/space-router) - routing.

Each of these libraries is independent and can be useful on their own. Moonwave is just one, simple way to combine the three for common cases.

If Moonwave doesn't quite fit your needs as your application grows, you can combine the three libraries, or others, in your own way and use Moonwave as a reference implementation.

## Usage

    yarn add moonwave

## Example

```js
const Preact = require('preact')
const { moonwave } = require('moonwave/preact')

// each route maps to a Preact component
const routes = [
  ['/', MainView]
]

// actions is how we update application state
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

// the preact component receives full application state
// and a `split` function for dispatching actions or updates
// use ConnectAtom component to map state/split to props
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

// assemble all the pieces
moonwave()
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

#### const app = moonwave(options)

Create an app. Available options are:

* `store.merge` - custom state merge strategy, default implementation is `(state, update) => Object.assign({}, state, update)`.
* `store.debug` - a debug hook. Set to `debug: require('moonwave/log')` for console logger or `debug: require('moonwave/devtools')` for integration with Redux dev tools.
* `router.mode` - one of `history`, `hash`, `memory`. Default is `history`.
* `router.interceptLinks` - whether clicks on links are automatically handled by the router. Default is `true`.
* `router.qs` - custom query string parser. Object of shape { parse, stringify }.

See [tiny-atom docs](https://github.com/QubitProducts/tiny-atom) for more information on the store. See [space-router docs](https://github.com/KidkArolis/space-router) for more information on the router.

#### app.state()

Provide initial state.

```js
app.state({})
app.state({ count: 0 })
app.state(Immutable.Map({})) // note: in this case, you'll need to provide a custom store.merge function
```

#### app.evolve()

Provide a function of signature `(get, split, action)` that will receive all actions that were `split` by the app.

**Note**: think of `split` as `dispatch` if you're familiar with that.

```js
app.evolve((get, split, action) => {
  actions[action.type](get, split, action.payload)
})

app.evolve(async (get, split, action) => {
  switch (action.type) {
    case 'increment':
      split({ count: get().count + 1 })
      break
    case 'decrement':
      split({ count: get().count - 1 })
      break
    case 'fetch':
      split({ loading: true })
      const res = await axios.get('/data')
      split({ items: res.data, loading: false })
      break;
  }
})
```

#### app.actions()

Provide a map of actions. Can be used instead of the evolve for common cases.

```js
app.actions({
  increment: (get, split, x) => {
    split({ count: get().count + x })
  },
  decrement: (get, split, x) => {
    split({ count: get().count - x })
  }
})
```

If both `app.actions()` and `app.evolve()` is used, the `actions` provided is passed as the 4th argument to the evolve function.

#### app.routes()

Provide an array of routes. An optional second argument can be used for a custom [`onTransition`](https://github.com/KidkArolis/space-router#startontransition) implementation.

```js
// if you don't need routing
app.routes([
  ['*', SinglePage]
])

// common case
app.routes([
  ['/', Home],
  ['/Space', Space],
  ['/Ocean', Ocean]
])

// nested routes
app.routes([
  ['', Shell, [
    ['/inbox', Inbox],
    ['/account', Account, [
      ['password', Password]
    ]],
    ['*', NotFound]
  ]]
])

// async route loading
app.routes([
  ['/', { load: () => System.import('./pages/Index') }],
  ['/Space', { load: () => System.import('./pages/Space') }]
], async function onTransition (route, data) {
  await Promise.all(data.map(async d => {
    if (!d.Component) d.Component = await d.load()
  }))
  atom.split({ route })
})
```

To navigate around your application programmatically, you `split` an action like so:

```js
function MyApp ({ split }) {
  return <form onSubmit={onSubmit}>...</form>

  function onSubmit () {
    const id = 1
    split('navigate', {
      // path
      path: `/space/${id}`,
      // query params
      query: { angle: 0 },
      // push vs replace the url
      replace: false
    })
  }
}
```

#### app.mount()

Mount the app to a DOM element. Initialise the store, router and render the app into DOM. Defaults to `document.body`

```js
app.mount(document.getElementById('root'))
```

#### app.unmount()

Stop the router, unrender the app from DOM.

```js
app.unmount()
```