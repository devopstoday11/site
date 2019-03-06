---
title: Lambda Node.js 0.10 Update Instructions
author: Noah Zoschke
twitter: nzoschke
---

Is your inbox full of messages like this?

> AWS Lambda to end-of-life Node.js v0.10 runtime on April 30, 2017. Please migrate to Node.js v4.3 or v6.10 immediately

Well I'm happy to announce that the Convox fully-automated migration to Node.js v4.3 is available in every region.

Pieces of this have been released over the past weeks and months, so many of you don't need to take additional action.

But if you're still getting those emails from AWS, you can:

1. Update Rack Lambda functions with `convox rack update`
(If you are on an older Rack version you might need to run this multiple times to step through any required releases. Continue to update until your Rack is at version **20170330004259** or later.)
2. Update App Lambda functions by promoting a new release
3. Update logging Lambda functions by re-creating syslog resources

You can do this from the command line with commands like:

```
$ convox rack update --wait
$ convox env set FOO=bar --promote --app myapp1
$ convox resources unlink syslog-1234 --app myapp
$ convox resources delete syslog-1234
$ convox resources create syslog --url tcp+tls://logs1.papertrailapp.com:12345
$ convox resources link syslog-4567 --app myapp
```

You can expect to receive a couple more updates from both AWS and Convox between now and April 30th, to make sure nobody is affected when the Lambda runtime is shut off for good.

Happy automatic infrastructure updates! 🎉🎉
