"use strict";function setOfCachedUrls(e){return e.keys().then(function(e){return e.map(function(e){return e.url})}).then(function(e){return new Set(e)})}var precacheConfig=[["/Users/ridermansb/Projects/tmp/newrelease/icons/android/icon_144x144.4eaca4ec634e5e1d693cfb61690e1fa6.png","4eaca4ec634e5e1d693cfb61690e1fa6"],["/Users/ridermansb/Projects/tmp/newrelease/icons/android/icon_192x192.306890680bd14089853d2c78fc546201.png","306890680bd14089853d2c78fc546201"],["/Users/ridermansb/Projects/tmp/newrelease/icons/android/icon_36x36.1aa390e69f821be82b55352278c5af26.png","1aa390e69f821be82b55352278c5af26"],["/Users/ridermansb/Projects/tmp/newrelease/icons/android/icon_48x48.6e3cb0b31d38343c83d6d2daf658f1c9.png","6e3cb0b31d38343c83d6d2daf658f1c9"],["/Users/ridermansb/Projects/tmp/newrelease/icons/android/icon_512x512.40052af4b0d79460730bf793ef256aac.png","40052af4b0d79460730bf793ef256aac"],["/Users/ridermansb/Projects/tmp/newrelease/icons/android/icon_72x72.fbe44439c00346bc6edffd36d03e5ed2.png","fbe44439c00346bc6edffd36d03e5ed2"],["/Users/ridermansb/Projects/tmp/newrelease/icons/android/icon_96x96.33ef01ce03dae20c49c8c6718c0f9f68.png","33ef01ce03dae20c49c8c6718c0f9f68"],["/Users/ridermansb/Projects/tmp/newrelease/icons/ios/icon_1024x1024.0c76b2f1c1d5b4e97729d56c194386bb.png","0c76b2f1c1d5b4e97729d56c194386bb"],["/Users/ridermansb/Projects/tmp/newrelease/icons/ios/icon_120x120.4c8fe2a38d1ea40c42c19bc189c90532.png","4c8fe2a38d1ea40c42c19bc189c90532"],["/Users/ridermansb/Projects/tmp/newrelease/icons/ios/icon_144x144.4eaca4ec634e5e1d693cfb61690e1fa6.png","4eaca4ec634e5e1d693cfb61690e1fa6"],["/Users/ridermansb/Projects/tmp/newrelease/icons/ios/icon_152x152.03ca35ca97f979604c9977a4a3d495e9.png","03ca35ca97f979604c9977a4a3d495e9"],["/Users/ridermansb/Projects/tmp/newrelease/icons/ios/icon_167x167.5e4d6fd0db4500d408fac8fea2c80c92.png","5e4d6fd0db4500d408fac8fea2c80c92"],["/Users/ridermansb/Projects/tmp/newrelease/icons/ios/icon_180x180.3c9a43b9a060e842aaaa5d0d0a249d25.png","3c9a43b9a060e842aaaa5d0d0a249d25"],["/assets/fonts/icons.18b02c69.svg","18b02c6988115288e32b9ec07ef20ce3"],["/assets/fonts/icons.674f50d2.eot","674f50d287a8c48dc19ba404d20fe713"],["/assets/fonts/icons.af7ae505.woff2","af7ae505a9eed503f8b8e6982036873e"],["/assets/fonts/icons.b06871f2.ttf","b06871f281fee6b241d60582ae9369b9"],["/assets/fonts/icons.fee66e71.woff","fee66e712a8a08eef5805a46892932ad"],["/assets/images/677433a0892aaed7b7d2628c313c9775.svg","677433a0892aaed7b7d2628c313c9775"],["/assets/images/9c74e172f87984c48ddf5c8108cabe67.png","9c74e172f87984c48ddf5c8108cabe67"],["/assets/images/b8fbed09ac76c06ad00b79595317529a.png","b8fbed09ac76c06ad00b79595317529a"],["/assets/images/baa771f2c1bce016217c0c3936aaa031.png","baa771f2c1bce016217c0c3936aaa031"],["/icons-646a5f15e322162261ee4067ed7f2441/.cache","589066ebae490d3b5daee561017bb2c6"],["/icons-646a5f15e322162261ee4067ed7f2441/apple-touch-startup-image-1182x2208.png","f18f4b5894c703ef0020dd2806121851"],["/icons-646a5f15e322162261ee4067ed7f2441/apple-touch-startup-image-1242x2148.png","24c9fa8eb5f61fb9c3cb510d6f975681"],["/icons-646a5f15e322162261ee4067ed7f2441/apple-touch-startup-image-1496x2048.png","f567925889c6c9afcd35e9dbf3136a14"],["/icons-646a5f15e322162261ee4067ed7f2441/apple-touch-startup-image-1536x2008.png","0c5917cb80cc716ada8c0caddf77e083"],["/icons-646a5f15e322162261ee4067ed7f2441/apple-touch-startup-image-320x460.png","5f558aa8abc8f926a6fb66a8449147c6"],["/icons-646a5f15e322162261ee4067ed7f2441/apple-touch-startup-image-640x1096.png","4510fbcefcbbbcb081b93187373883a5"],["/icons-646a5f15e322162261ee4067ed7f2441/apple-touch-startup-image-640x920.png","ee7b2f57c70b6e16d671df14cad4163e"],["/icons-646a5f15e322162261ee4067ed7f2441/apple-touch-startup-image-748x1024.png","7a7a7fa4dd0c579dbca56841ed66e670"],["/icons-646a5f15e322162261ee4067ed7f2441/apple-touch-startup-image-750x1294.png","e0cba531f41b56a922d65de8eba1ca70"],["/icons-646a5f15e322162261ee4067ed7f2441/apple-touch-startup-image-768x1004.png","28f4a640a8931bb2ae70ad59b3da55de"],["/icons-646a5f15e322162261ee4067ed7f2441/favicon-16x16.png","bca5cd9f5350f6fd86d0b5cc6c9abd5a"],["/icons-646a5f15e322162261ee4067ed7f2441/favicon-32x32.png","bb529b5ddc196bdd098b8df4ba08f0b2"],["/icons-646a5f15e322162261ee4067ed7f2441/favicon.ico","ddb67b907808446ca334988384f35bf5"],["/icons-646a5f15e322162261ee4067ed7f2441/firefox_app_128x128.png","f8b590ad7df90db5fa45fa8ed050bc99"],["/icons-646a5f15e322162261ee4067ed7f2441/firefox_app_512x512.png","5ef1360549a0bc4c172a02fd3c82c30d"],["/icons-646a5f15e322162261ee4067ed7f2441/firefox_app_60x60.png","0e200ddb16095127317beae1977b7d20"],["/icons-646a5f15e322162261ee4067ed7f2441/manifest.webapp","996d30362892232c3da0e0cd8a752ee1"],["/main.0b018fa09d9e9a2907dd.css","136393ee0eabc3f4ae9c84d93b0ae795"],["/main.ec559eebb8feb2e43cd6.js","88e81c89b5e488fe23eef44324c4729c"],["/main.ec559eebb8feb2e43cd6.js.gz","aec290d2001511ca19be450e79b897f7"],["/manifest.d7c1f8b95e2ed04775f705653abbe643.json","d7c1f8b95e2ed04775f705653abbe643"],["/node-static.js","dfab8ba4bfcf8645f3db4da423626dfe"]],cacheName="sw-precache-v3-2a9e1e69f9bd8881d809d41dc036490efb0bbeab-"+(self.registration?self.registration.scope:""),ignoreUrlParametersMatching=[/^utm_/],addDirectoryIndex=function(e,a){var c=new URL(e);return"/"===c.pathname.slice(-1)&&(c.pathname+=a),c.toString()},cleanResponse=function(e){return e.redirected?("body"in e?Promise.resolve(e.body):e.blob()).then(function(a){return new Response(a,{headers:e.headers,status:e.status,statusText:e.statusText})}):Promise.resolve(e)},createCacheKey=function(e,a,c,n){var s=new URL(e);return n&&s.pathname.match(n)||(s.search+=(s.search?"&":"")+encodeURIComponent(a)+"="+encodeURIComponent(c)),s.toString()},isPathWhitelisted=function(e,a){if(0===e.length)return!0;var c=new URL(a).pathname;return e.some(function(e){return c.match(e)})},stripIgnoredUrlParameters=function(e,a){var c=new URL(e);return c.hash="",c.search=c.search.slice(1).split("&").map(function(e){return e.split("=")}).filter(function(e){return a.every(function(a){return!a.test(e[0])})}).map(function(e){return e.join("=")}).join("&"),c.toString()},hashParamName="_sw-precache",urlsToCacheKeys=new Map(precacheConfig.map(function(e){var a=e[0],c=e[1],n=new URL(a,self.location),s=createCacheKey(n,hashParamName,c,/\.\w{8}\./);return[n.toString(),s]}));self.addEventListener("install",function(e){e.waitUntil(caches.open(cacheName).then(function(e){return setOfCachedUrls(e).then(function(a){return Promise.all(Array.from(urlsToCacheKeys.values()).map(function(c){if(!a.has(c)){var n=new Request(c,{credentials:"same-origin"});return fetch(n).then(function(a){if(!a.ok)throw new Error("Request for "+c+" returned a response with status "+a.status);return cleanResponse(a).then(function(a){return e.put(c,a)})})}}))})}).then(function(){return self.skipWaiting()}))}),self.addEventListener("activate",function(e){var a=new Set(urlsToCacheKeys.values());e.waitUntil(caches.open(cacheName).then(function(e){return e.keys().then(function(c){return Promise.all(c.map(function(c){if(!a.has(c.url))return e.delete(c)}))})}).then(function(){return self.clients.claim()}))}),self.addEventListener("fetch",function(e){if("GET"===e.request.method){var a,c=stripIgnoredUrlParameters(e.request.url,ignoreUrlParametersMatching);(a=urlsToCacheKeys.has(c))||(c=addDirectoryIndex(c,"index.html"),a=urlsToCacheKeys.has(c));!a&&"navigate"===e.request.mode&&isPathWhitelisted([],e.request.url)&&(c=new URL("/index.html",self.location).toString(),a=urlsToCacheKeys.has(c)),a&&e.respondWith(caches.open(cacheName).then(function(e){return e.match(urlsToCacheKeys.get(c)).then(function(e){if(e)return e;throw Error("The cached response that was expected is missing.")})}).catch(function(a){return console.warn('Couldn\'t serve response for "%s" from cache: %O',e.request.url,a),fetch(e.request)}))}});