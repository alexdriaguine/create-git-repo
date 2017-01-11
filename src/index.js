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
import {getHeaders, initiateRepo, RepoMethods} from './lib/utils'
import fetch from 'node-fetch'


function main(name: string): void {
  co(function *() {
    const exists = yield checkIfRepoExists(name)
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

    const isPrivate = yield prompt('Private repo? y/N: ')
    const description = yield prompt('Description: ')
    const repo = yield createRepo({name, isPrivate: isPrivate === 'y', description})
    const {html_url} = repo
    const {init, createReadme, add, commit, addRemote, push, openBrowser}: RepoMethods = initiateRepo(dir, name, html_url)

    Promise.each([init, createReadme, add, commit, addRemote, openBrowser], result => result)

    console.log(
      `Your newly created repository is created and located at ${chalk.bold.green(html_url)}`
    )
    process.exit(1)

    // init
    //   .then(addRemote)
    //   .then(createReadme)
    //   .then(add)
    //   .then(commit)
    //   .then(openBrowser)
    //   .then(() => {
    //     console.log(
    //       `Your newly created repository is created and located at ${chalk.bold.green(html_url)}`
    //     )
    //     process.exit(1)
    //   })
    //   .catch(err => console.log(err))
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





