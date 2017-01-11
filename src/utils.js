// @flow

export const GITHUB_API_BASE_URL = 'https://api.github.com'

export const getBasicAuthBase64String = (username: string, token: string) => {
  return new Buffer(`${username}:${token}`, 'ascii').toString('base64')
}

export const getEnvVar = (key: string): string => process.env[key] || ''

export const getHeaders = (headers?: {}): {} => {
  const username = getEnvVar('USERNAME')
  const token = getEnvVar('ACCESS_TOKEN')
  return { 
    ...headers,
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': `Basic ${getBasicAuthBase64String(username, token)}`
  }
}
