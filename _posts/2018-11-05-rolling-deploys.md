---
title: Rolling..Rolling..Rolling Deploys
author: Cameron Gray
twitter: camerondgray
tags: [continuous delivery, continuous integration, continuous deployment]
description: A practical guide and best practices for continuous deployment using rolling deploys
---

We all talk about [continuous integration](https://en.wikipedia.org/wiki/Continuous_integration), [continuous delivery](https://en.wikipedia.org/wiki/Continuous_delivery), and [continuous deployment](https://www.agilealliance.org/glossary/continuous-deployment/), but there is often a misconception of what these terms actually mean and what we need to do to facilitate them

<!--more-->

### Deploy early, deploy often
Continuous integration means your developers are regularly committing their code to a repository where that code is built and tested against the rest of the ecosystem that makes up your application. It is a term that was born in the days of DLLs and JAR files. It was a dark time when just getting the pieces of code developed within your team to talk to each other was not an easy task.

Continuous delivery means your code is always potentially ready to be deployed to a production environment. This is typically accomplished by pushing every code change to a test or staging environment where it is tested and validated.

Continuous deployment goes one step further by actually promoting every code change to production provided it passes all automated tests.

Most teams aren’t actually practicing continuous deployment but many are doing continuous delivery and are deploying to production several times a day. Gone are the days of planned maintenance windows and downtime related to quarterly software releases. In a modern world, users expect your application is always up and is seamlessly upgraded on a regular basis. No matter what exact practice your team is following, there are many benefits of small frequent releases:

* No downtime

* Smaller changes mean it’s much easier to find bugs.

* Rapid feedback from your end users allows you to make quicker product iterations.

### Deployment Strategies
At Convox, we have a great deal to say about continuous delivery, but for now I want to dig into one critical aspect which is deployments. If you want to deploy continuously you need to get smooth deployments working first. For simplicity throughout this post I will refer to our application hosts as “servers” understanding that in practice they may be instances or containers but you get the point.

There are many different deployment strategies but let’s dig into three popular strategies. [blue/green](https://martinfowler.com/bliki/BlueGreenDeployment.html)(AKA red/black), [canary deployment](https://martinfowler.com/bliki/CanaryRelease.html), and [rolling deployment](https://kubernetes.io/docs/tutorials/kubernetes-basics/update/update-intro/):

* There is much debate about the difference between blue/green and red/black and I am firmly in the camp that they are the same thing and the good folks at [Netflix](https://www.spinnaker.io/concepts/) just decided to rename blue/green to red/black because it matched their company logo colors. In a blue/green deployment you have a live set of servers that is handling your production traffic (green). You then spin up an identical, and equally scaled, set of servers (blue) and deploy your new code to that set. Once the blue set is up and running you test your new application, and once satisfied, you switch 100% of your production traffic to the blue set. Typically this switch is done at the load balancer level although it can also be done with DNS (not recommended). If you see any errors or unexpected behavior you immediately switch back to the original set and troubleshoot. If everything goes smoothly, you terminate the old set of servers and the new set becomes the green set because it is now handling all the production traffic.

* In a canary deployment you spin up an isolated set of servers (canaries) to handle a small portion of your production traffic. You typically need to use something like sticky sessions to ensure that your selected traffic is only going to the canary servers. Canary deployments are usually used for testing something with a small group of customers to see if it has the desired effect or has any issues before deploying that code to your entire audience.

* In a rolling deployment you incrementally spin up new servers running your latest code and allow them to check-in, one by one, as healthy and start handling production traffic. You then gradually terminate the old instances until all your traffic is running on the new instances.

### Making rolling deployments work
At Convox, we use a rolling deployment strategy to promote new releases of applications. In order for your application to support a rolling deployment the critical thing you need keep in mind is that at any given time you will have two versions of your application handling production traffic, reading and writing from your production databases, and consuming your internal or external APIs. In order for your rolling deploys to go smoothly there are a few rules you need to follow:

* Your APIs always need to be able to accept both the new and the previous set of inputs.

* Your database also needs to be able to accept the current and previous set of parameters just like your APIs.

* For single page apps, where you typically deploy your JS and CSS packages to a [CDN](https://aws.amazon.com/cloudfront/), you need to make sure you always have both the latest and previous packages available.

* Your health checks should ensure you application is fully functioning and not just simply listening on a port. In a rolling deployment, the health check is the last safeguard to prevent broken code from going live.

#### APIs:
* Have default values for any new parameters you add to your APIs. Alternatively, ensure your API validation allows null values for new parameters.

* Do not rename or remove return values as your clients are relying on those values being present and having specific names.

* Treat external API and internal API consumers the same. You wouldn’t change your API parameters out from under your external customers and you should have the same approach for your internal consumers.

* If you absolutely have to make breaking changes to your API then you should [version](https://restfulapi.net/versioning/) your API and deploy your changes to a “v2” version of your API.

#### Databases:
* Just like your API, make sure all new fields either have default values or accept null values.

* All your data and schema migrations should be written to be idempotent, meaning you can run them an infinite number of times without any harm. This is a good policy in general because sometimes long running migrations can timeout or run into data errors and need to be run multiple times.

* If you need to rename or remove a field you should follow a multi-step process. For this example let’s say we are renaming the “state” field to “state_province”.
    * With your first deploy add a field with the new name “state_province” and deploy your new code to use the new field. You can also run a data migration after this deploy to copy the values from “state” to “state_province”.
    
    * With the next deploy you can rename the old “state” field to some deprecated value (ie: “old_state”) because now both your previous and current versions of your application are using the new field. This step is not absolutely necessary as all it does is ensure you have no lingering code that is writing to the old field. In practice, particularly with hot tables, it isn’t practical to rename a field because of locking issues etc… In that case, simply searching your codebase to ensure nothing is using the old field name can be sufficient.
    
    * Finally, once you have at least two deploys that are using the new field, you can run one more data migration to copy any lingering values from the “state” field to the new “state_province” field and delete the old “state” field from the database.

#### Front end code (particularly for single page apps):
* Use a [hashing scheme](https://www.alainschlesser.com/bust-cache-content-hash/) to name CSS and JS packages deployed to a CDN as opposed to just overwriting the same files with each deploy.
    
    * Content hashing allows you to deal with CDN and browser caching issues while still publishing your latest and previous versions of your front-end code.
    
    * Bundlers such as [Webpack](https://webpack.js.org/) and [Gulp](https://gulpjs.com/) support this fairly easily.
    
    * Periodically delete old packages from your CDN origin but always keep the latest few versions around for smooth rollbacks.
    
#### Health checks:
* Create a custom endpoint for your [health check](https://docs.convox.com/deployment/health-checks) that ensures your application is initialized correctly and critical aspects, such as database connectivity, are functioning.

* Keep in mind that your health check is going to be hit likely every few seconds on every server so you also want to make sure that your health check endpoint does not cause any load on your system as a whole.

We have plenty more to say about continuous delivery but we will save that for future posts. For now, if you follow these guidelines you should be on your way to smooth and anxiety free deploys. You can learn more about rolling deploys with Convox [here](https://docs.convox.com/deployment/rolling-updates). Happy deploying!