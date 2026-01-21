import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { Auth0Provider } from '@auth0/auth0-react'
import App from './App'

const onRedirectCallback = () => {
  window.history.replaceState({}, document.title, '/')
}

ReactDOM.render(
  <BrowserRouter>
    <Auth0Provider
      domain="dev-0qycn7y76i5r6i1x.us.auth0.com"
      clientId="cva6vVd9m9BcvZklXCvBEDIf6QNEJZPV"
      redirectUri={window.location.origin}
      audience="https://todo-api"
      scope="openid profile email read:todo write:todo delete:todo"

      onRedirectCallback={onRedirectCallback}
    >
      <App />
    </Auth0Provider>
  </BrowserRouter>,
  document.getElementById('root')
)
