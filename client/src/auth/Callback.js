import React, { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

const Callback = () => {
  const { handleRedirectCallback, isLoading } = useAuth0()

  useEffect(() => {
    handleRedirectCallback()
  }, [handleRedirectCallback])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <div>Redirecting...</div>
}

export default Callback
