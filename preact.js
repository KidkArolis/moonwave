const Preact = require('preact')
const { ProvideAtom, ConnectAtom } = require('tiny-atom/preact')
const { moonwave } = require('./moonwave')

function preactMoonwave (options) {
  const app = moonwave(options)
  app.render(render)
  app.unrender(unrender)
  return app
}

/**
 * Get the current route,
 * get the associated components,
 * render them in a nested fashion
 * and finally render the app into DOM
 */
const render = (app) => (atom) => {
  const { router, options } = app
  const route = atom.get().route
  const components = router.data(route.pattern).map(c => c.Component ? c.Component : c)
  const App = components.reduceRight((children, Component) => (
    <Component state={atom.get()} split={atom.split} route={route}>{children}</Component>
  ), null)
  Preact.render((
    <ProvideRouter router={router}>
      <ProvideAtom atom={atom}>
        {App}
      </ProvideAtom>
    </ProvideRouter>
  ), options.root, options.root.lastElementChild)
}

/**
 * Overwrite the target DOM element with nothing
 */
const unrender = (app) => {
  Preact.render(null, app.options.root, app.options.root.lastElementChild)
}

/**
 * It's useful to provide the router via context in case
 * someone wants to utilise router's functions such as
 * router.href()
 */
class ProvideRouter extends Preact.Component {
  getChildContext () {
    return {
      router: this.props.router
    }
  }

  render () {
    return this.props.children[0]
  }
}

module.exports = { moonwave: preactMoonwave, ProvideAtom, ConnectAtom, ProvideRouter }
