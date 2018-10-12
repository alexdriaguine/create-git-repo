import 'babel-polyfill'
import * as program from 'commander'
import * as co from 'co'
import * as chalk from 'chalk'
import * as fs from 'fs'
import {createRepo, checkIfRepoExists} from './lib/github'
import {getSelection} from './lib/actions'
import {
  initiateRepo,
  getEnvVar,
  getBasicAuthToken,
  prompt,
} from './lib/utils'

function main(name: string): void {
  co(function*() {
    let username = getEnvVar('GITHUB_USERNAME')
    let githubAccessToken = getEnvVar('GITHUB_CREATE_REPO_ACCESS_TOKEN')
    let password: string
    let basicAuthToken: string

    if (username.length === 0 || githubAccessToken.length === 0) {
      console.log(
        'No username or github access token found set as enviroment variables..'
      )
      console.log('Please enter your github credentials instead')

      username = yield prompt('Username: ')
      password = yield prompt('Password: ', {masked: true})
      basicAuthToken = getBasicAuthToken(username, password)
    } else {
      basicAuthToken = getBasicAuthToken(username, githubAccessToken)
    }

    const {wrongCredentials, repoExists} = yield checkIfRepoExists(
      name,
      basicAuthToken,
      username
    )
    const dir = `./${name}`

    if (fs.existsSync(dir)) {
      console.log(
        chalk.bold.red(
          `A folder with the name ${name} already exists in this folder..`
        )
      )
      process.exit(0)
    }
    if (repoExists) {
      console.log(
        chalk.bold.red(
          `A repository with the name ${name} already exists on your github account..`
        )
      )
      process.exit(0)
    }
    if (wrongCredentials) {
      console.log(
        chalk.bold.red(`Hey! You got your credentials all wrong ${username}!`)
      )
      process.exit(0)
    }
    fs.mkdirSync(dir)
    const useSSHRemote = yield prompt('Use SSH remote instead of https? y/N: ')
    const isPrivate = yield prompt('Private repo? y/N: ')
    const description = yield prompt('Description: ')
    const selection = yield getSelection()
    const repoOptions = {
      name,
      description,
      isPrivate: isPrivate === 'y',
      accessToken: basicAuthToken,
    }
    const repo = yield createRepo(repoOptions)
    const {html_url, ssh_url, clone_url} = repo
    const initRepoOptions = {
      dir,
      name,
      remoteUrl: useSSHRemote === 'y' ? ssh_url : clone_url,
    }

    const {init, actions, add, commit, addRemote} = yield initiateRepo(
      initRepoOptions
    )

    init()
      .then(addRemote)
      .then(actions[selection])
      .then(add)
      .then(commit)
      .then(() => {
        console.log(
          `Your newly created repository is created and located at ${chalk.bold.cyan(
            html_url
          )}`
        )
        console.log(`To start working:`)
        console.log(`1. ${chalk.bold.green(`cd ${name}`)}`)
        console.log(`2. ${chalk.bold.green(`git push -u origin master`)}`)
        console.log(`Hack away!`)
        process.exit(0)
      })
      .catch(err => (console.error(err), process.exit(1)))
  })
}

program
  .version('1.0.2')
  .arguments('<name>')
  .action(main)
  .parse(process.argv)

if (!program['name']) {
  console.log('Please supply a name for the repository')
  process.exit(1)
}
