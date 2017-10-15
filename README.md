# create-git-repo
Create github repositories with ease.

## Installation

### Using NPM
* Clone the repository
* CD into directory
* `npm install` to install dependencies
* `npm run build && npm link` to build

### Using Yarn
* Clone the repository
* CD into directory
* `yarn`
* `yarn build && yarn link`


## Usage
* `create-git-repo Hello`  


If you don't want to be prompted for password all the time, create an access token on github
with the right to create repositories
and export it as an enviroment variable aswell as your github username.

```sh
# In .bashrc or equivalent
export GITHUB_USERNAME="xxxxxxx"
export GITHUB_CREATE_REPO_ACCESS_TOKEN=xxxxx
```

To be able to push to github without being prompted for username/password, set up git to use SSH
