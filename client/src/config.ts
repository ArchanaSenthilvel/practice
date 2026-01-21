// const apiId = '3yy3n970r3' 
// export const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || ''
const apiId = process.env.REACT_APP_API_ID
const region = process.env.REACT_APP_REGION

export const apiEndpoint = `https://${apiId}.execute-api.${region}.amazonaws.com/dev`

export const authConfig = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN || '',     // Domain from Auth0
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID || '',     // Client id from an Auth0 application
  callbackUrl: 'http://localhost:3000/callback',
  audience: process.env.REACT_APP_AUTH0_AUDIENCE || ''
}
