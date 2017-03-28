import React, { PropTypes } from 'react'
import serialize from 'serialize-javascript'

const Html = (props) => {
  const { component, asyncComponents, preLoadedState, assets } = props
  const content = component || ''

  return (
    <html lang="en">
      <body>
        <div id="root" dangerouslySetInnerHTML={{ __html: content }} />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `window.__data=${serialize(preLoadedState)};
            window.${asyncComponents.STATE_IDENTIFIER}=${serialize(asyncComponents.state)};`
          }}
          charSet="UTF-8"
        />
        <script src={assets.javascript.vendor} />
        <script src={assets.javascript.client} />
      </body>
    </html>
  )
}

Html.propTypes = {
  assets: PropTypes.shape({}).isRequired,
  component: PropTypes.node.isRequired,
  preLoadedState: PropTypes.shape({}).isRequired,
  asyncComponents: PropTypes.shape({
    state: PropTypes.object,
    STATE_IDENTIFIER: PropTypes.string
  }).isRequired
}

export default Html
