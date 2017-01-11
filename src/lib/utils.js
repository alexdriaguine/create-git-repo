// @flow
import {exec} from 'child_process'
import Promise from 'bluebird'
import co from 'co'

export const GITHUB_API_BASE_URL = 'https://api.github.com'

export const getBasicAuthBase64String = (username: string, token: string) => {
  return new Buffer(`${username}:${token}`, 'ascii').toString('base64')
}

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

// export const execute = (command: string, options?: any): Promise<any> => 
//   new Promise((resolve, reject) => {
//     exec(command, options, err => {
//       if (err) return reject(err)
//       return resolve()
//     })
//   })

export const execute = (options?: any) => {
  return function(command: string) {
    return new Promise((resolve, reject) => {
      
      exec(command, options, err => {
        if (err) return reject(err)
        return resolve()
      })
    })
  }
}

type RepoMethods = {
  init: Promise<any>;
  createReadme: Promise<any>;
  add: Promise<any>;
  commit: Promise<any>;
  addRemote: Promise<any>;
  push: Promise<any>;
  openBrowser: Promise<any>;
}

export function initiateRepo(dir: string, name: string, url: string): RepoMethods {
  const makeCommand = execute({cwd: dir})
  const init = makeCommand('git init')
  const createReadme = makeCommand(`echo "# ${name}" >> README.md`)
  const add = makeCommand('git add README.md')
  const addRemote = makeCommand(`git remote add origin ${url}.git`)
  const commit = makeCommand('git commit -m "first commit"')
  const push = makeCommand('git push -u origin master')
  const openBrowser = makeCommand(`google-chrome ${url}`)

  return {
    init,
    createReadme,
    add,
    commit,
    addRemote,
    push,
    openBrowser
  }

}

