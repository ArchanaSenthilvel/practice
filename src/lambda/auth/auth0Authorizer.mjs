import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { verify, decode } from 'jsonwebtoken'
import Axios from 'axios'

// IMPORTANT: Replace with YOUR Auth0 domain
const auth0Domain = 'dev-0qycn7y76i5r6i1x.us.auth0.com'
const jwksUrl = `https://${auth0Domain}/.well-known/jwks.json`

let cachedCertificate: string | null = null

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  console.log('Authorizing a user', event.authorizationToken)
  
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<any> {
  const token = getToken(authHeader)
  const jwt: any = decode(token, { complete: true })

  if (!jwt) {
    throw new Error('Invalid token')
  }

  console.log('JWT decoded', jwt)

  // Get certificate
  const cert = await getCertificate(jwt.header.kid)
  
  // Verify the token
  const verifiedToken = verify(token, cert, { algorithms: ['RS256'] })
  
  console.log('Token verified successfully')
  
  return verifiedToken
}

async function getCertificate(kid: string): Promise<string> {
  // Return cached certificate if available
  if (cachedCertificate) {
    return cachedCertificate
  }

  console.log('Downloading certificate from', jwksUrl)

  try {
    const response = await Axios.get(jwksUrl)
    const keys = response.data.keys

    if (!keys || !keys.length) {
      throw new Error('No keys found in JWKS')
    }

    // Find the key that matches the kid
    const signingKey = keys.find((key: any) => key.kid === kid)

    if (!signingKey) {
      throw new Error(`Unable to find a signing key that matches kid: ${kid}`)
    }

    // Get the PEM formatted certificate
    const cert = `-----BEGIN CERTIFICATE-----\n${signingKey.x5c[0]}\n-----END CERTIFICATE-----`
    
    // Cache the certificate
    cachedCertificate = cert
    
    return cert
  } catch (error) {
    console.error('Error getting certificate:', error)
    throw new Error('Failed to get signing certificate')
  }
}

function getToken(authHeader: string): string {
  if (!authHeader) {
    throw new Error('No authentication header')
  }

  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    throw new Error('Invalid authentication header')
  }

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}