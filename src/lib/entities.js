export type GithubRequestParams = {
  accessToken: string;
  name: string;
  isPrivate: string;
  description?: string;
}

export type GithubRequestHeaders = {
  Authorization: string;
  Accept: string;
}

export interface InitRepo {
  init: () => Promise<any>;
  createReadme: () => Promise<any>;
  add: () => Promise<any>;
  commit: () => Promise<any>;
  addRemote: () => Promise<any>;
}
