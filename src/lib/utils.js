// @flow
import {exec} from 'child_process'
import Promise from 'bluebird'
import co from 'co'

export const GITHUB_API_BASE_URL: string = 'https://api.github.com'

export const getBasicAuthBase64String = (username: string, token: string): string => 
  new Buffer(`${username}:${token}`, 'ascii').toString('base64')

export const getEnvVar = (key: string): string => process.env[key] || ''

export const getHeaders = (headers?: {}): {} => {
  const username = getEnvVar('GITHUB_USERNAME')
  const token = getEnvVar('GITHUB_CREATE_REPO_ACCESS_TOKEN')

  return { 
    ...headers,
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': `Basic ${getBasicAuthBase64String(username, token)}`
  }
}

const execute = (dir: string) => 
  (command: string) => 
    () => 
      new Promise((resolve, reject) => 
        exec(command, {cwd: dir}, err => err ? reject(err) : resolve()))


export function initiateRepo(dir: string, name: string, url: string) {

  const init = execute(dir)('git init')
  const createReadme = execute(dir)(`echo "# ${name}" >> README.md`)
  const add = execute(dir)('git add .')
  const addRemote = execute(dir)(`git remote add origin ${url}.git`)
  const commit = execute(dir)('git commit -m "first commit"')

  return {
    init,
    createReadme,
    add,
    commit,
    addRemote,
  }
}
