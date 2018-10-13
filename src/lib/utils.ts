import {exec} from 'child_process'
import {GithubRequestHeaders, InitRepo} from './entities'
import * as readline from 'readline'
import * as chalk from 'chalk'
import {getActions} from './actions'

export const GITHUB_API_BASE_URL: string = 'https://api.github.com'

export const getBasicAuthToken = (
  username: string,
  tokenOrPassword: string
): string =>
  new Buffer(`${username}:${tokenOrPassword}`, 'ascii').toString('base64')

export const getEnvVar = (key: string): string => process.env[key] || ''

export const getHeaders = (accessToken: string): GithubRequestHeaders => {
  return {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `Basic ${accessToken}`,
  }
}

export const execute = (dir: string) => (command: string) => () =>
  new Promise((resolve, reject) =>
    exec(command, {cwd: dir}, err => (err ? reject(err) : resolve()))
  )

export type InitRepoArgs = {
  dir: string
  name: string
  remoteUrl: string
}

export const hasLibrary = (library: string): Promise<string> =>
  execute('.')(`${library} --version`)()
    .then(() => library)
    .catch(() => '')

export const hasNpx = () =>
  execute('.')('npx --version')()
    .then(() => true)
    .catch(() => false)

export async function initiateRepo({
  dir,
  name,
  remoteUrl,
}: InitRepoArgs): Promise<InitRepo> {
  const init = execute(dir)('git init')
  const add = execute(dir)('git add .')
  const addRemote = execute(dir)(`git remote add origin ${remoteUrl}`)
  const commit = execute(dir)('git commit -m "first commit"')
  const actions = await getActions({dir, name})

  return {
    init,
    actions,
    add,
    commit,
    addRemote,
  }
}

export const prompt = (function() {
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return function run(question: string, options: {masked?: boolean} = {}) {
    let stdin: NodeJS.Socket

    function onData(char: string) {
      char = char + ''
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.removeListener('data', onData)
          break
        default:
          process.stdout.write(
            '\u001b[2K\u001b[200D' +
              question +
              Array(rl['line'].length + 1).join('*')
          )
          break
      }
    }

    return function(done: (err: any, answer: string) => void) {
      if (options.masked) {
        rl.close()
        stdin = process.openStdin()
        rl = readline.createInterface({
          input: stdin,
          output: process.stdout,
        })
        stdin.on('data', onData)
      }

      rl.question(question, answer => {
        if (options.masked) {
          stdin.removeListener('data', onData)
          rl.close()

          rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          })
        }

        done(null, answer)
      })
    }
  }
})()

// handle all errors that may result while creating repo
export const handleErrors = async function(body) {
  const {message, documentation_url} = await body.json()
  console.log(chalk.bold.red(`Hey! ${message}`))
  console.log(chalk.blue(`Read more: ${documentation_url}`))
  process.exit(0)
}
