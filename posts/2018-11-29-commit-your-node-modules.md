---
title: Commit your Dependencies
author: Cameron Gray
twitter: camerondgray
tags: [nodejs, npm, docker build speed, node modules]
description: It's time to start committing your Node modules to source control
---

The latest NPM dependency [fiasco](https://www.zdnet.com/article/hacker-backdoors-popular-javascript-library-to-steal-bitcoin-funds/) has got me thinking again about dependency management. While this used to be a discussion that was limited to those of us who create Node apps, these days, with popular frontend frameworks like React, it’s rare to find a modern web application that doesn’t use NPM in some capacity.

<!--more-->

For almost a decade I have stood firmly on the side that you should define your dependencies in your package.json and trust the magic of semantic versioning. I believed this was truly the best way to ensure you always had the latest security patches and performance improvements for the modules your application depends on. I fought this fight with my teams, colleagues, and peers. Even when left-pad [broke the internet](https://arstechnica.com/information-technology/2016/03/rage-quit-coder-unpublished-17-lines-of-javascript-and-broke-the-internet/) I stood my ground.

This latest issue gives me a chance to revisit my thinking and I have to admit I have changed my mind. The time has come, I give in. You should commit your Node modules to your source control repository. There I said it. I feel better.

While for a long time I felt like, in addition to the arguments I mentioned above, by taking the package.json stance, I was somehow defending a core belief of the Node community, but the truth is the Node community threw the towel in on this fight a while ago.

First there was npm [shrinkwrap](https://docs.npmjs.com/files/shrinkwrap.json), then the folks at Facebook came up with [yarn](https://yarnpkg.com/en/). Finally NPM introduced [package-lock](https://docs.npmjs.com/files/package-locks) and version locking your dependency tree became part of the Node gospel.

While the debate is definitely still raging about whether or not you should lock your dependencies, and there are a ton of people who know a lot more [package management](https://medium.com/@sdboyer/so-you-want-to-write-a-package-manager-4ae9c17d9527) than I do, I am just going to assume that ship has sailed and we now live in a world of dependency locking.

Since we are already version locking our dependencies the only question that’s left is should we keep downloading those dependencies from NPM every time we build? At this point I just don’t see the benefit.  At Convox, when we work with people to help speed up Docker builds more often than not what we see are thousands of lines, and many minutes, of NPM install messages. Why not just commit our Node modules and save that entire build step, not to mention avoiding the potential risk of an NPM outage or security breach.

Another way to look at is what’s the downside to committing our Node modules? Sure you slightly increase the size of your source code repository but is that really an issue? Unless you are operating at [Facebook scale](https://code.fb.com/web/yarn-a-new-package-manager-for-javascript/), I doubt this will have an impact on your team. Otherwise it seems like it’s all upside to me. The one warning I will give is really more about version locking. You do have to remember to periodically review and upgrade the Node modules that you are using to ensure you are gaining the benefits of security fixes etc...but you will no longer have to worry about a Node module breaking or being unpublished when you are in the middle of trying to get a production build live. One note is that [Github Security Alerts](https://blog.github.com/2017-11-16-introducing-security-alerts-on-github/) are really good at catching security issues so make sure you set them up for your repositories.  So commit away, it’s the smart thing to do!

Now that you have an application that builds super quickly we would love to help you get it into production so check out [Convox](https://{{ site.console_host }}/grid/signup) when you get the chance!
