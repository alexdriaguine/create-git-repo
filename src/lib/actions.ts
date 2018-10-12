import {execute, prompt, hasLibrary} from './utils'
import {hasNpx} from './utils'
import * as co from 'co'

/**
 * Are you here to add more libraries? Amazing!
 * Follow these steps to do so:
 * 1. Add the library to the Libraries enum.
 * 2. In the `getActions` function, create a new
 *    function following the same pattern as
 *    the `createReactApp` function.
 *      `execute(dir)(
 *        useNpx
 *          ? `install library with npx .`
 *          : `install library without npx .`
 *      )`
 * 3. Add the library to the return object of
 *    the `getActions` function. Where the key
 *    should be from the Library enum and the
 *    value should be function you created.
 *
 * Good luck!
 */
export enum Libraries {
  CreateReactApp = 'create-react-app',
}

export enum Actions {
  ReadMe = 'readme only',
  Exit = 'exit',
}

export const getActions = async ({dir, name}): Promise<any> => {
  const useNpx = await hasNpx()
  const createReadme = execute(dir)(`echo "# ${name}" >> README.md`)
  const createReactApp = execute(dir)(
    useNpx ? `npx create-react-app .` : `create-react-app .`
  )

  return {
    [Libraries.CreateReactApp]: createReactApp,
    [Actions.ReadMe]: createReadme,
    [Actions.Exit]: () => process.exit(0),
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
  const getHasLibraries = Object.values(Libraries).map(library =>
    hasLibrary(library)
  )
  const hasLibrariesResult = await Promise.all(getHasLibraries)

  return hasLibrariesResult.filter(result => result.length)
}

export const getSelection = async (): Promise<string> => {
  const npx = await hasNpx()
  const availableLibraries = npx
    ? Object.values(Libraries)
    : await getUsersAvailableLibraries()
  const list = getCombinedActionAndLibraryList(availableLibraries)
  const selectionList = await createSelectionList(list)
  const input = await co(function*() {
    return yield prompt(selectionList)
  })

  return list[input - 1]
}
