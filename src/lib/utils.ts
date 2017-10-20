import {exec} from 'child_process'
import {GithubRequestHeaders, InitRepo} from './entities'
import * as readline from 'readline'

export const GITHUB_API_BASE_URL: string = 'https://api.github.com'

export const getBasicAuthToken = (
  username: string,
  tokenOrPassword: string,
): string =>
  new Buffer(`${username}:${tokenOrPassword}`, 'ascii').toString('base64')

export const getEnvVar = (key: string): string => process.env[key] || ''

export const getHeaders = (accessToken: string): GithubRequestHeaders => {
  return {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `Basic ${accessToken}`,
  }
}

const execute = (dir: string) => (command: string) => () =>
  new Promise((resolve, reject) =>
    exec(command, {cwd: dir}, err => (err ? reject(err) : resolve())),
  )

export type InitRepoArgs = {
  dir: string
  name: string
  remoteUrl: string
}

export const hasCreateReactApp = () =>
  execute('.')('create-react-app --version')()
    .then(() => true)
    .catch(() => false)

export function initiateRepo({dir, name, remoteUrl}: InitRepoArgs): InitRepo {
  const init = execute(dir)('git init')
  const createReactApp = execute(dir)(`create-react-app .`)
  const createReadme = execute(dir)(`echo "# ${name}" >> README.md`)
  const add = execute(dir)('git add .')
  const addRemote = execute(dir)(`git remote add origin ${remoteUrl}`)
  const commit = execute(dir)('git commit -m "first commit"')

  return {
    init,
    createReactApp,
    createReadme,
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
              Array(rl['line'].length + 1).join('*'),
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
