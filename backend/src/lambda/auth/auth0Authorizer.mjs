
import Axios from 'axios'
import jwt from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')

const jwksUrl = process.env.AUTH_0_JWKS_URL
const issuer = process.env.AUTH_0_ISSUER
const audience = process.env.AUTH_0_AUDIENCE

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

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
    logger.error('User not authorized', { error: e.message })

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

async function verifyToken(authHeader) {
  const token = getToken(authHeader)

  return new Promise(async (resolve, reject) => {
    try {
      const decoded = jwt.decode(token, { complete: true })
      if (!decoded) return reject(new Error('Invalid token'))

      const kid = decoded.header.kid

      const response = await Axios.get(jwksUrl)
      const key = response.data.keys.find(k => k.kid === kid)
      if (!key) return reject(new Error('Signing key not found'))

      const cert = key.x5c[0]
      const publicKey = `-----BEGIN CERTIFICATE-----
${cert}
-----END CERTIFICATE-----`

      const options = {
        audience: audience,
        issuer: issuer,
        algorithms: ['RS256']
      }

      jwt.verify(token, publicKey, options, (err, verifiedToken) => {
        if (err) reject(err)
        else resolve(verifiedToken)
      })
    } catch (err) {
      reject(err)
    }
  })
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  return authHeader.split(' ')[1]
}
