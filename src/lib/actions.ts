import {execute, prompt, hasLibrary} from './utils'
import {hasNpx} from './utils'
import * as co from 'co'

/**
 * Are you here to add more libraries? Amazing!
 * Follow these steps to do so:
 *
 * In the getLibraries function, add a new object
 * to the return statement. The key will be presented
 * in the cli as an option for the user to choose.
 * Whereas the value of the key will be the command
 * that will be executed if the user chooses a value.
 *
 * The value of the key is created using the
 * function `command` which takes an object with
 * the two available commands. One with npx, and
 * one command without.
 *
 * This would result in something like this:
 * create-display-name': command({
 *    withNpx: 'npx create-display-name .',
 *    withoutNpx: 'create-display-name .'
 * })
 *
 * When that has been done, everything should
 * work fine and dandy!
 *
 * Good luck!
 */

interface Command {
  withNpx: string
  withoutNpx: string
}

const getLibraries = (
  dir: string,
  useNpx: boolean
): {[commandName: string]: ({withNpx, withoutNpx}: Command) => any} => {
  const command = createCommand(dir, useNpx)

  return {
    'create-react-app': command({
      withNpx: 'npx create-react-app .',
      withoutNpx: 'create-react-app .',
    }),
  }
}

export enum Actions {
  ReadMe = 'readme only',
  None = 'none',
}

const createCommand = (dir: string, useNpx: boolean) => ({
  withNpx,
  withoutNpx,
}: Command) => execute(dir)(useNpx ? withNpx : withoutNpx)

export const getActions = async ({dir, name}): Promise<any> => {
  const useNpx = await hasNpx()
  const createReadme = execute(dir)(`echo "# ${name}" >> README.md`)
  const libraries = getLibraries(dir, useNpx)

  return {
    ...libraries,
    [Actions.ReadMe]: createReadme,
    [Actions.None]: () => process.exit(0),
  }
}

const getCombinedActionAndLibraryList = (
  availableLibraries: Array<string>
): Array<string> => [...availableLibraries, ...Object.values(Actions)]

const createSelectionList = libraries => {
  const list = libraries
    .map((library, index) => `${index + 1}. ${library}\n`)
    .join('')

  return `${list}Select: `
}

const getUsersAvailableLibraries = async (): Promise<Array<string>> => {
  const getHasLibraries = Object.keys(getLibraries('', false)).map(library =>
    hasLibrary(library)
  )
  const hasLibrariesResult = await Promise.all(getHasLibraries)

  return hasLibrariesResult.filter(result => result.length)
}

export const getSelection = async (): Promise<string> => {
  const npx = await hasNpx()
  const availableLibraries = npx
    ? Object.keys(getLibraries('', false))
    : await getUsersAvailableLibraries()
  const list = getCombinedActionAndLibraryList(availableLibraries)
  const selectionList = await createSelectionList(list)

  const input = async () =>
    await co(function*() {
      const userInput = yield prompt(selectionList)

      const TOO_HIGH =
        userInput > availableLibraries.length + Object.keys(Actions).length
      const TOO_LOW = userInput < 1
      const NOT_NUMBER = isNaN(parseInt(userInput))

      if (TOO_HIGH || TOO_LOW || NOT_NUMBER) {
        return input()
      }
      return userInput
    })

  const inputResult = await input()

  return list[inputResult - 1]
}
