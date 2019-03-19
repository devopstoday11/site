---
title: Deploying to AWS ECS using CircleCI and Convox
author: Cameron Gray
twitter: camerondgray
tags: [CircleCI, Convox, CI/CD, AWS, ECS, CircleCI orb, EKS]
description: AWS deployments made easy with Convox and CircleCI
---

![CircleCI workflow](/assets/images/circle_deployment.png){: .center }*Deploying with Convox*

<!--more-->

At Convox we are obsessed with great dev tools. Like many of our users, we have been big fans of CircleCI for a long time. In fact, we use CircleCI to build and test many of the components of the Convox platform. While we have always offered the ability for Convox users to create their own integrations with CircleCI using [deploy keys](https://docs.convox.com/console/deploy-keys), today we are announcing our official CircleCI integration which makes deploying to Convox from CircleCI easier than ever.

Recently CircleCI has introduced orbs which are shareable packages that can be integrated into workflows. The [Convox Orb](https://circleci.com/orbs/registry/orb/convox/orb) allows CircleCI users to easily deploy their application to AWS ECS, and soon [AWS EKS](https://convox.com/k8s), via Convox, with a single command, as part of their CircleCI workflow.

In addition to creating a [CircleCI Orb](https://circleci.com/docs/2.0/creating-orbs/) for seamless integration into CircleCI workflows, we have also officially joined the [CircleCI Technology Partner Program](https://circleci.com/blog/announcing-orbs-technology-partner-program/) which means you can have the confidence that our integration has been reviewed and certified by the team at CircleCI to ensure the integration is sound.

You can find our Orb in the [CircleCI Orb registry](https://circleci.com/orbs/registry/) and our official documentation can be found [here](https://docs.convox.com/external-services/circleci), but let’s take a look at how it all works.

In order to make use of the Convox Orb you must first have a [Convox account](https://console.convox.com/signup) at the [Basic](https://convox.com/pricing) level or above and a [CircleCI](https://circleci.com/) account.

Once you have your accounts in order the first thing you will want to do is get your application deployed to Convox. You can follow our [getting started guide](https://docs.convox.com/introduction/getting-started) and you should have your first app deployed in just a few minutes! Now that everything is working it’s time to start using the [Convox Orb](https://circleci.com/orbs/registry/orb/convox/orb) as part of your CircleCI workflow. First go to the settings section in your Convox account and generate a new [deploy key](https://docs.convox.com/console/deploy-keys) for CircleCI to use and copy it to your clipboard. Next go back to CircleCI and add a new [environment variable](https://circleci.com/docs/2.0/env-vars/#section=projects) to your project named `CONVOX_DEPLOY_KEY` and paste the copied deploy key as the value.

Once you have everything setup it’s easy to use the Convox Orb and add the Convox Deploy command to your CircleCI workflows. As an example if you have a Convox rack named “production” and a Convox app named “example” you can deploy with the following config.yml

```
version: 2.1
orbs:
  convox: convox/orb@1.4.1
workflows:
  deploy:
    jobs:
      - deploy
jobs:
  deploy:
    executor: convox/cli
    steps:
      - checkout
      - run: make test
      - convox/deploy:
          rack: production
```

 A few important notes. First you need to specify `version: 2.1` in your config.yml in order to use orbs on CircleCI. Second if you want to use the Convox Orb deploy command you need to make sure it’s preceded by a `checkout` command otherwise Convox won’t have any code to deploy! Go ahead and check out the Convox Orb. We think there is no easier way to build, test, and deploy your app to AWS ECS than CircleCI + Convox.