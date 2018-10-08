# create-git-repo
Create github repositories with ease.

## Installation

### Using Yarn
`yarn global add git-repo-create`

### Using NPM
`npm install --global git-repo-create`


## Usage
* `git-repo-create Hello`  


If you don't want to be prompted for password all the time, create an access token on github
with the right to create repositories
and export it as an enviroment variable aswell as your github username.

```sh
# In .bashrc or equivalent
export GITHUB_USERNAME="xxxxxxx"
export GITHUB_CREATE_REPO_ACCESS_TOKEN=xxxxx
```

To be able to push to github without being prompted for username/password, set up git to use SSH
[set up git to use SSH](https://help.github.com/articles/connecting-to-github-with-ssh/)

