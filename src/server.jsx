import express from 'express'
import React from 'react'
import { Provider } from 'react-redux'
import { withAsyncComponents } from 'react-async-component'
import { renderToString as renderToStringEpic } from 'react-redux-epic'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { createProxyServer } from 'http-proxy'
import path from 'path'
import configureStore, { wrappedEpic } from './redux/configureStore'
import Html from './helpers/Html'
import renderShell from './helpers/Shell'
import App from './containers/App/App'

const { API_HOST, API_PORT } = process.env
const apiUrl = `http://${API_HOST}:${API_PORT}/api/`

export default function (assets) {
  const app = express()
  const proxy = createProxyServer()

  app.use('/api', (req, res) => {
    proxy.web(req, res, { target: apiUrl })
  })

  app.use('/shell', (req, res) => res.send(renderShell(assets)))

  app.use(express.static(path.join(__dirname, '..', 'dist')))
  app.use(express.static(path.join(__dirname, '..', 'static')))

  app.use((req, res) => {
    const store = configureStore()
    const reactRouterContext = {}

    const component = (
      <Provider store={store} key="provider">
        <StaticRouter
          location={req.url}
          context={reactRouterContext}
        >
          <App />
        </StaticRouter>
      </Provider>
    )

    withAsyncComponents(component).then((result) => {
      const {
        appWithAsyncComponents,
        state,
        STATE_IDENTIFIER
      } = result

      renderToStringEpic(appWithAsyncComponents, wrappedEpic)
        .map(({ markup }) => ({
          markup,
          data: store.getState()
        }))
        .subscribe(({ markup, data }) => {
          wrappedEpic.unsubscribe()

          const html = renderToStaticMarkup(
            <Html
              assets={assets}
              component={markup}
              preLoadedState={data}
              asyncComponents={{ state, STATE_IDENTIFIER }}
            />
          )
          res.send(`<!doctype html>\n${html}`)
        })
    })
  })

  return app
}
