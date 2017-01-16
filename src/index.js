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
import {getHeaders, initiateRepo, getEnvVar} from './lib/utils'
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
    const {init, createReadme, add, commit, addRemote}= initiateRepo(dir, name, html_url)

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
