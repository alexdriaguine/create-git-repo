#!/usr/bin/env node
// @flow
require('dotenv').config()
require('babel-polyfill')

import dotenv from 'dotenv'
import Promise from 'bluebird'
import program from 'commander'
import co from 'co'
import prompt from 'co-prompt'
import chalk from 'chalk'
import fs from 'fs'
import {createRepo, checkIfRepoExists} from './lib/github'
import {getHeaders, initiateRepo, getEnvVar, getBasicAuthToken} from './lib/utils'
import fetch from 'node-fetch'


function main(name: string): void {
  co(function *() {
    let username = getEnvVar('GITHUB_USERNAME')
    let githubAccessToken = getEnvVar('GITHUB_CREATE_REPO_ACCESS_TOKEN')
    let password: string
    let basicAuthToken: string

    if (username.length === 0 || githubAccessToken.length === 0) {
      console.log('No username or github access token found set as enviroment variables..')
      console.log('Please enter your github credentials instead')

      username = yield prompt('Username: ')
      password = yield prompt.password('Password: ')
      basicAuthToken = getBasicAuthToken(username, password)
    } else {
      basicAuthToken = getBasicAuthToken(username, githubAccessToken)
    }

    const exists = yield checkIfRepoExists(name, basicAuthToken)
    const dir = `./${name}`

    if (fs.existsSync(dir)) {
      console.log(chalk.bold.red(`A folder with the name ${name} already exists in this folder..`))
      process.exit(0)
    }
    if (exists) {
      console.log(chalk.bold.red(`A repository with the name ${name} already exists on your github account..`))
      process.exit(0)
    }
    fs.mkdirSync(dir)
    const useSSHRemote = yield prompt('Use SSH remote instead of https? y/N')
    const isPrivate = yield prompt('Private repo? y/N: ')
    const description = yield prompt('Description: ')
    
    const repoOptions = {
      name,
      description,
      isPrivate: isPrivate === 'y',
      accessToken: basicAuthToken
    }
    const repo = yield createRepo(repoOptions)
    const {html_url, ssh_url, clone_url} = repo
    const initRepoOptions = {
      dir,
      name,
      remoteUrl: useSSHRemote === 'y' ? ssh_url : clone_url
    }
    const {init, createReadme, add, commit, addRemote} = initiateRepo(initRepoOptions)

    init()
      .then(() => addRemote())
      .then(() => createReadme())
      .then(() => add())
      .then(() => commit())
      .then(() => {
        console.log(
          `Your newly created repository is created and located at ${chalk.bold.cyan(html_url)}`
        )
        console.log(
          `To start working:`
        )
        console.log(`1. ${chalk.bold.green(`cd ${name}`)}`)
        console.log(`2. ${chalk.bold.green(`git push -u origin master`)}`)
        console.log(`Hack away!`)
        process.exit(1)
      })
      .catch(err => console.error(err))
  })
}

program
  .arguments('<name>')
  .action(main)
  .parse(process.argv);

if (!program.arguments('name')) {
  console.log('Please supply a name for the repository')
  process.exit(0)
}
