export interface GithubRequestParams {
  accessToken: string,
  name: string,
  isPrivate: boolean,
  description?: string,
}

export interface GithubRequestHeaders {
  Authorization: string,
  Accept: string,
  [index: string]: string
}

export interface InitRepo {
  init: () => Promise<any>;
  createReadme: () => Promise<any>;
  createReactApp: () => Promise<any>;
  add: () => Promise<any>;
  commit: () => Promise<any>;
  addRemote: () => Promise<any>;
}
