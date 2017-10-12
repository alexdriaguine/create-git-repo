// @flow

import fetch from 'node-fetch'
import {GITHUB_API_BASE_URL, getHeaders} from './utils'
import {GithubRequestParams} from './entities'

export function createRepo(
  {name, isPrivate, description, accessToken}: GithubRequestParams
): Promise<any> {
  console.log(description)
  const headers = getHeaders(accessToken)
  const body = JSON.stringify({
    name,
    private: isPrivate,
    description
  })

  return fetch(
    `${GITHUB_API_BASE_URL}/user/repos`, 
    {method: 'POST', headers, body}
  )
  .then(res => res.json())
}

export function checkIfRepoExists(name: string, accessToken: string): Promise<boolean> {
  const headers = getHeaders(accessToken)

  return fetch(
      `${GITHUB_API_BASE_URL}/user/repos/${name}`, 
      {method: 'GET', headers}
    )
    .then(({ status }) => ({
      wrongCredentials: status === 401,
      repoExists: status === 404,
    }))
}
