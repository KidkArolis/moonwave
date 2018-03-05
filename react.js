const React = require('react')
const ReactDOM = require('react-dom')
const { ProvideAtom, ConnectAtom } = require('tiny-atom/react')
const { moonwave } = require('./moonwave')

function reactMoonwave (options) {
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
  ReactDOM.render((
    <ProvideRouter router={router}>
      <ProvideAtom atom={atom}>
        {App}
      </ProvideAtom>
    </ProvideRouter>
  ), options.root)
}

/**
 * Overwrite the target DOM element with nothing
 */
const unrender = (app) => {
  ReactDOM.render(null, app.options.root)
}

/**
 * It's useful to provide the router via context in case
 * someone wants to utilise router's functions such as
 * router.href()
 */
class ProvideRouter extends React.Component {
  getChildContext () {
    return {
      router: this.props.router
    }
  }

  render () {
    return React.Children.only(this.props.children)
  }
}

ProvideRouter.childContextTypes = {
  router: propsValidation
}

function propsValidation (props, propName, componentName) {
  if (typeof props === 'object') {
    return null
  }
  return new Error('Invalid prop ' + propName + ' supplied to componentName')
}

module.exports = { moonwave: reactMoonwave, ProvideAtom, ConnectAtom, ProvideRouter }
