// @flow
import {exec} from 'child_process'
import Promise from 'bluebird'
import co from 'co'
import {GithubRequestHeaders, InitRepo} from './entities'

export const GITHUB_API_BASE_URL: string = 'https://api.github.com'

export const getBasicAuthToken = (username: string, tokenOrPassword: string): string => 
  new Buffer(`${username}:${tokenOrPassword}`, 'ascii').toString('base64')

export const getEnvVar = (key: string): string => process.env[key] || ''


export const getHeaders = (accessToken: string): GithubRequestHeaders => {

  return { 
    'Accept': 'application/vnd.github.v3+json',
    'Authorization': `Basic ${accessToken}`
  }
}

const execute = (dir: string) => 
  (command: string) => 
    () => 
      new Promise((resolve, reject) => 
        exec(command, {cwd: dir}, err => err ? reject(err) : resolve()))

export type InitRepoArgs = {
  dir: string;
  name: string;
  remoteUrl: string;
}



export function initiateRepo({dir, name, remoteUrl}: InitRepoArgs): InitRepo {

  const init = execute(dir)('git init')
  const createReadme = execute(dir)(`echo "# ${name}" >> README.md`)
  const add = execute(dir)('git add .')
  const addRemote = execute(dir)(`git remote add origin ${remoteUrl}`)
  const commit = execute(dir)('git commit -m "first commit"')

  return {
    init,
    createReadme,
    add,
    commit,
    addRemote,
  }
}
