#!/usr/bin/env node
require('dotenv').config()
require('babel-polyfill')

// @flow
import Promise from 'bluebird'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import program from 'commander'
import co from 'co'
import prompt from 'co-prompt'

import {GITHUB_API_BASE_URL, getHeaders} from './utils'



function createRepo({name, isPrivate}: {name: string, isPrivate: boolean}): Promise<any> {
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

function main(name: string): void {
  co(function *() {
    console.log('heh')
    const isPrivate = yield prompt('Private repo? y/N: ')
    const description = yield prompt('Description: ')
    const repo = yield createRepo({name, isPrivate: isPrivate === 'y'})
    const {html_url} = repo
    console.log(`Your newly created repository is created and located at ${html_url}`)
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

