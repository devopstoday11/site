---
title: Introducing Convox Multi-Cloud
author: Cameron Gray
twitter: camerondgray
tags: [Convox, ECS, EKS, Google Cloud, GCP, Digital Ocean, Azure, Kubernetes, Cloud portability, multi-cloud]
description: Introducing Convox Multi-Cloud with support for AWS, Google Cloud, Digital Ocean, and Microsoft Azure
---

Convox has always been the easiest way to deploy and manage a containerized application on AWS, but today we are proud to announce the public release of Convox Multi-Cloud support. Convox now supports [AWS](https://docs.convox.com/installation/production-rack/aws) as well as [Google Cloud](https://docs.convox.com/installation/production-rack/gcp), [Digital Ocean](https://docs.convox.com/installation/production-rack/do) and [Microsoft Azure](https://docs.convox.com/installation/production-rack/azure). With Convox Multi-Cloud support you can manage Racks in multiple clouds from a single Convox Console and even move your apps between different clouds. Now Convox apps are truly “Describe once, run anywhere!”

![multi-cloud Racks](/images/blog/racks.png)

## Why?
We built our Multi-Cloud platform in response to a strong demand from our customers. The three major reasons we heard for wanting multi-cloud support were:

1. Cost optimization
2. Cloud specific workloads
3. Redundancy

### Cost Optimization
It’s no secret that depending on the types of resources your application uses, cloud infrastructure pricing can vary significantly from provider to provider. While generally cloud providers are much cheaper than running your own data center, and the prices get better every year, there can still be some significant variations depending on the cloud you are using. For a given workload or set of specific services, one provider’s configuration may be a cheaper choice than another. For example, you may find that your specific balance of CPU vs Memory needs is better cost optimized on a specific cloud or the type of Database you wish to run has better pricing with a specific cloud. You may even find that certain regions where you want to deploy your application are cheaper with one cloud than another.

### Cloud-Specific Workloads
We find many of our customers have a wide variety of application types they want to deploy with Convox. For example a customer may have a web application backed by a Postgres database that they want to deploy on AWS or Digital Ocean because those are the platforms that their web team is most familiar with. At the same time, that same customer may also have a machine learning team that has large scale models written in TensorFlow that require very long runs to train. This team may find that GCP is the best place to run these workloads because of TPU instance types. While this is just one example, there can be many reasons why a specific workload or team is better fit for one cloud or another and now you don’t have to make a compromise. In addition to optimizing workloads there can be additional regulatory or contractual reasons why certain applications may be required to run on certain clouds.

### Redundancy
While it’s very unusual for a major cloud provider to have a multi-zone or multi-region outage it is still a possibility. Many organizations require a multi-cloud strategy as part of a greater business continuity or disaster recovery plan. Setting up and maintaining these types of configurations is historically very complex and problematic. With Convox you can move an application from one cloud to another with a single command. You can even run a development or staging Rack on one cloud provider and your production Rack on a different provider. With [Convox workflows](https://console-docs.convox.com/console/workflows) you can simultaneously deploy a single application to multiple clouds every time you merge a pull request! 

## How?
Convox Multi-Cloud is built around three main concepts

1. Kubernetes Native
2. Terraform installation
3. Containerization

### Kubernetes Native
Convox’s multi-cloud has been built from the ground up as a Kubernetes Native platform. While previous versions of Convox have made extensive use of things like CloudFormation and ECS, using these types of cloud specific services and APIs wasn’t an option if we wanted to maintain complete parity between infrastructure providers. For Convox Multi-Cloud, everything from the load balancer to the logging provider is a Kubernetes service. Not only does this make things consistent and predictable between clouds, it also gives you the option to interface directly with Kubernetes if you have custom requirements.

### Terraform Installation
Terraform has become an extremely popular way to define infrastructure as code. We have many customers who are already using Convox in conjunction with Terraform and when we started working on this iteration of the platform Terraform seemed like the natural choice. For Convox Multi-Cloud all Racks are [installed](https://docs.convox.com/installation/production-rack) using a set of open source Terraform templates. This provides a great deal of transparency around what is specifically being installed as well as allowing you to customize your installation or integrate Convox Rack creation into your broader Terraform scheme. We have also made sure that the Terraform templates are simple and modular and work great “out of the box”. This means most people will just use our installer which performs all the Terraform magic for you, but if you are a Terraform power user and you want to customize your installation, you can do so very easily. 

### Containerization
One significant change in this version of Convox is that every service or resource defined in your [convox.yml](https://docs.convox.com/configuration/convox-yml) will run in a container. This applies to Database [resources](https://docs.convox.com/reference/primitives/app/resource) such as Postgres and Redis as well as [application services](https://docs.convox.com/reference/primitives/app/service). With this change we are able to provide total portability between clouds as well as keeping everything Kubernetes Native. While Convox will give you the option of upgrading your database to use cloud-specific services such as RDS, using containers by default allows you to spin up development and staging apps orders of magnitude faster than ever before.

## Convox Multi-Cloud in Action
Of course we have included support for all the things you have come to expect from Convox on the new multi-cloud Racks. Convox deploys work just as you would expect and are faster than ever. One command [rollbacks](https://docs.convox.com/deployment/rollbacks) are lightning fast and you can still use convox run to run [one-off commands](https://docs.convox.com/management/run) for things like migrations. We think there is no easier way to launch a production ready, autoscaling Kubernetes cluster than with Convox! You can now launch a new cluster with one command and deploy your first app with another two commands.

To demonstrate how easy it is to move apps between clouds let's deploy a [simple NodeJS app](https://github.com/convox-examples/nodejs) with a Redis database to AWS and then deploy the same app to Digital Ocean.

```
$ convox racks
NAME               STATUS 
demo/aws           running
demo/azure         running
demo/digitalocean  running
demo/gcp           running

$ convox switch demo/aws
Switched to demo/aws

$ convox apps create
Creating nodejs... OK

$ convox deploy
Packaging source... OK
Uploading source... OK
Starting build... OK
Authenticating 149765177331.dkr.ecr.us-east-1.amazonaws.com/convox/nodejs: Login Succeeded
Building: .
Sending build context to Docker daemon  262.1kB
Step 1/5 : FROM node:10.16.3-alpine
10.16.3-alpine: Pulling from library/node
e7c96db7181b: Already exists
50958466d97a: Already exists
56174ae7ed1d: Already exists
284842a36c0d: Already exists
Digest: sha256:77c898d0da5e7bfb6e05c9a64de136ba4e03889a72f3c298e95df822a38f450d
Status: Downloaded newer image for node:10.16.3-alpine
 ---> b95baba1cfdb
Step 2/5 : WORKDIR /usr/src/app
 ---> Running in b78d7d6808b5
Removing intermediate container b78d7d6808b5
 ---> af2582e9de66
Step 3/5 : COPY . /usr/src/app
 ---> a1b636f05709
Step 4/5 : EXPOSE 3000
 ---> Running in 9f727e0fd869
Removing intermediate container 9f727e0fd869
 ---> dd0040511a45
Step 5/5 : CMD ["node", "app.js"]
 ---> Running in 837562d3524d
Removing intermediate container 837562d3524d
 ---> 72046acf3fdd
Successfully built 72046acf3fdd
Successfully tagged 12680be1366980bbc344877afab6da09848228e4:latest
Running: docker tag 12680be1366980bbc344877afab6da09848228e4 convox/nodejs:web.BJCCONJFZAR
Running: docker tag convox/nodejs:web.BJCCONJFZAR 149765177331.dkr.ecr.us-east-1.amazonaws.com/convox/nodejs:web.BJCCONJFZAR
Running: docker push 149765177331.dkr.ecr.us-east-1.amazonaws.com/convox/nodejs:web.BJCCONJFZAR
Promoting RQSPETTXFK... OK

$ convox services
SERVICE  DOMAIN                                    PORTS   
web      web.nodejs.e2a46cdb121a7575.convox.cloud  443:3000

$ curl https://web.nodejs.e2a46cdb121a7575.convox.cloud
Hello Convox!

$ convox switch demo/digitalocean
Switched to demo/digitalocean

$ convox apps create
Creating nodejs... OK

$ convox deploy
Packaging source... OK
Uploading source... OK
Starting build... OK
Authenticating registry.df285793f2b50912.convox.cloud/nodejs: Login Succeeded
Building: .
Sending build context to Docker daemon  262.1kB
Step 1/5 : FROM node:10.16.3-alpine
 ---> b95baba1cfdb
Step 2/5 : WORKDIR /usr/src/app
 ---> Using cache
 ---> 7087bdd8dcf0
Step 3/5 : COPY . /usr/src/app
 ---> Using cache
 ---> 13d1a18d65f0
Step 4/5 : EXPOSE 3000
 ---> Using cache
 ---> ca3d5b0edf70
Step 5/5 : CMD ["node", "app.js"]
 ---> Using cache
 ---> 87a5024128ef
Successfully built 87a5024128ef
Successfully tagged 580282604fcf04eea0679dc2cf2576045c11a714:latest
Running: docker tag 580282604fcf04eea0679dc2cf2576045c11a714 convox/nodejs:web.BDORQJUOFCW
Running: docker tag convox/nodejs:web.BDORQJUOFCW registry.df285793f2b50912.convox.cloud/nodejs:web.BDORQJUOFCW
Running: docker push registry.df285793f2b50912.convox.cloud/nodejs:web.BDORQJUOFCW
Promoting RGSNUQQIIH... OK

$ convox services
SERVICE  DOMAIN                                    PORTS   
web      web.nodejs.df285793f2b50912.convox.cloud  443:3000

$ curl https://web.nodejs.df285793f2b50912.convox.cloud
Hello Convox!
```

## Try It Out!

* [Install a Rack using the cloud of your choice](https://docs.convox.com/getting-started/introduction)
* [Deploy your first App](https://docs.convox.com/tutorials/deploying-an-application)
* [Import your Racks into your Convox Console](https://console-docs.convox.com/management/import-rack)
* [Create a Workflow](https://console-docs.convox.com/console/workflows)
* [Use a Github Action](https://github.com/convox/actions)


