#!/usr/bin/env node
// @flow
require('dotenv').config()
require('babel-polyfill')

import dotenv from 'dotenv'
import program from 'commander'
import co from 'co'
import prompt from 'co-prompt'
import chalk from 'chalk'
import fs from 'fs'
import {createRepo, checkIfRepoExists} from './lib/github'
import {getHeaders} from './lib/utils'
import {exec} from 'child_process'
import fetch from 'node-fetch'

function main(name: string): void {
  co(function *() {
    const exists = yield checkIfRepoExists(name)
    const dir = `./${name}`
    console.log(exists)

    if (fs.existsSync(dir)) {
      console.log(chalk.bold.red(`A folder with the name ${name} already exists in this folder..`))
      process.exit(0)
    }
    if (exists) {
      console.log(chalk.bold.red(`A repository with the name ${name} already exists on your github account..`))
      process.exit(0)
    }
    fs.mkdirSync(dir)
    exec('git init', {cwd: dir})

    const isPrivate = yield prompt('Private repo? y/N: ')
    const description = yield prompt('Description: ')
    const repo = yield createRepo({name, isPrivate: isPrivate === 'y', description})
    const {html_url} = repo

    

    
    exec(`google-chrome ${html_url}`, err => {
      if (err) {
        console.error(err)
        console.log(chalk.red('Could not open google chrome..'))
        console.log(`Your newly created repository is created and located at ${chalk.bold.green(html_url)}`)
      }
      process.exit(0)
    })
  })
}

fetch('https://api.github.com/user/repos/yolo', {
  method:  'GET',
  headers: getHeaders()
})
.then(res => res.json())
.then(res => console.log(res))

program
  .arguments('<name>')
  .action(main)
  .parse(process.argv);

if (!program.arguments('name')) {
  console.log('Please supply a name for the repository')
  process.exit(0)
}





