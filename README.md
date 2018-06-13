It's tiny google function server on nodejs for facebook webhooks

First install firebase tools with `npm install -g firebase-tools`
You'll need to edit .firebaserc to set your project

then `firebase login`

Do not forget to execute `npm install` in folder functions

use command `sudo firebase serve --only functions,hosting` to run locally
use command `firebase deploy` to deploy it
