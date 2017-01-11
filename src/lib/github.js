// @flow

import fetch from 'node-fetch'
import {GITHUB_API_BASE_URL, getHeaders} from './utils'

export function createRepo(
  {name, isPrivate}: {name: string, isPrivate: boolean}
): Promise<any> {
  const headers = getHeaders()
  const body = JSON.stringify({
    name,
    private: isPrivate
  })

  return fetch(
    `${GITHUB_API_BASE_URL}/user/repos`, 
    {method: 'POST', headers, body}
  )
  .then(res => res.json())
}

export function checkIfRepoExists(name: string): Promise<boolean> {
  const headers = getHeaders()

  return fetch(
      `${GITHUB_API_BASE_URL}/user/repos/${name}`, 
      {method: 'GET', headers: getHeaders()}
    )
    .then(res => res.status !== 404)
}


