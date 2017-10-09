>  WIP

[![Deploy to Docker Cloud](https://files.cloud.docker.com/images/deploy-to-dockercloud.svg)](https://cloud.docker.com/stack/deploy/?repo=ridermansb/newrelease)

 * **Create new WebTask**  
 First create a new file `.env.auth0` with all secrets (Check the `webtask/github`).
   
> *Create a profile*
   
    wt init -p "newrelease"    
   
> *Create/update proxy to Github*    
   
    wt create dist/github.js -p "newrelease" --secrets-file .env.auth0 --name github -d es6-promise -d express-boom -d auth0 -d memory-cache -d web-push -d babel-runtime -d babel-core
    wt update github webtasks/github.js -p newrelease -d express-boom -d auth0 -d memory-cache

> *Run locally*

    wt serve webtasks/github.js --secrets-file .env.auth0 --storage-file ./storage.json --hostname localhost --port 3001

## Design

 * [Black][2] and [White][3] icons based on Twitter UI


[1]: https://github.com/settings/developers
[2]: https://www.iconfinder.com/iconsets/twitter-ui
[3]: https://www.iconfinder.com/iconsets/twitter-ui-glyph
