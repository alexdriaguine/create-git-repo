#!/usr/bin/env node
// @flow
require('dotenv').config()
require('babel-polyfill')

import dotenv from 'dotenv'
import program from 'commander'
import co from 'co'
import prompt from 'co-prompt'
import chalk from 'chalk'
import {createRepo, checkIfRepoExists} from './lib/github'

function main(name: string): void {
  co(function *() {
    const exists = yield checkIfRepoExists(name)
    console.log(name)
    console.log(exists)
    if (exists) {
      console.log(chalk.bold.red(`A repository with the name ${name} already exists on your github account..`))
      process.exit(0)
    }
    const isPrivate = yield prompt('Private repo? y/N: ')
    const description = yield prompt('Description: ')
    const repo = yield createRepo({name, isPrivate: isPrivate === 'y', description})
    const {html_url} = repo
    console.log(`Your newly created repository is created and located at ${chalk.bold.green(html_url)}`)
  })
}

program
  .arguments('<name>')
  .action(main)
  .parse(process.argv);



if (!program.args[0]) {
  console.log('Please supply a name for the repository')
  process.exit(0)
}





