>  WIP

[![Deploy to Docker Cloud](https://files.cloud.docker.com/images/deploy-to-dockercloud.svg)](https://cloud.docker.com/stack/deploy/?repo=ridermansb/newrelease)

 * **Create new WebTask**  
 First create a new file `.env.auth0` with all secrets (Check the `webtask/github`).
   
> *Create a profile*
   
    wt init -p "newrelease"    
   
> *Create/update proxy to Github*    
   
    wt create webtasks/github.js -p "newrelease" --secrets-file .env.auth0 --name github -d express-boom -d auth0
    wt update github webtasks/github.js -p newrelease

> *Run locally*

    wt serve webtasks/github.js --secrets-file .env.auth0 --hostname localhost --port 3001

[1]: https://github.com/settings/developers
