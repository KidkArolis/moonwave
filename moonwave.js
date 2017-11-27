const createAtom = require('tiny-atom')
const createRouter = require('space-router')

module.exports = { moonwave }

function moonwave (options = {}) {
  options.atom = options.atom || {}
  options.router = options.router || {}

  const app = {
    options: options,

    state: (initialState) => {
      options.atom.initialState = initialState
      return app
    },

    routes: (routes, onTransition) => {
      options.router.routes = routes
      options.router.onTransition = onTransition
      return app
    },

    evolve: (evolve) => {
      options.atom.evolve = evolve
      return app
    },

    actions: (actions) => {
      options.atom.actions = actions
      return app
    },

    render: (fn) => {
      options.render = fn
      return app
    },

    unrender: (fn) => {
      options.unrender = fn
      return app
    },

    mount: (root) => {
      options.root = root
      run(app)
      return app
    },

    unmount: () => {
      stop(app)
      return app
    }
  }

  return app
}

const run = (app) => {
  const options = app.options
  options.root = options.root || document.body
  options.atom.actions = options.atom.actions || {}
  options.atom.evolve = options.atom.evolve || defaultEvolve(options.atom.actions)
  validate(options)
  const router = app.router = createRouter(options.router.routes, options.router)
  const evolve = withRouting(options.atom.evolve, options.atom.actions, router)
  const onChange = debounce(app.options.render(app))
  const atom = app.atom = createAtom(options.atom.initialState, evolve, onChange, options.atom)
  const onTransition = options.onTransition || ((route) => atom.split({ route }))
  router.start(onTransition)
}

const stop = (app) => {
  app.router.stop()
  app.options.unrender(app)
}

const withRouting = (evolve, actions, router) => (get, split, action) => {
  if (action.type === 'navigate') {
    router.push(action.payload.path, action.payload)
  } else {
    evolve(get, split, action, actions)
  }
}

const defaultEvolve = (actions) => {
  return (get, split, action) => {
    actions[action.type](get, split, action.payload)
  }
}

const debounce = (fn) => {
  var timeout
  return function () {
    var context = this
    var args = arguments
    var later = function () {
      timeout = null
      fn.apply(context, args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, Math.round(1000 / 60))
  }
}

const validate = (options) => {
  if (!options.render) {
    throw new Error('Missing render implementation, provide with app.render((app) => (atom) => {})')
  }
  if (!options.unrender) {
    throw new Error('Missing unrender implementation, provide with app.unrender((app) => {})')
  }
  if (!options.router.routes) {
    throw new Error('Missing route map, provide with app.routes([[\'*\', App]])')
  }
}
