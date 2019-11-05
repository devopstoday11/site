---
title: Deploying a Hasura GraphQL Engine With One Command
author: Cameron Gray
twitter: camerondgray
tags: [Hasura, Convox, ECS, EKS, GraphQL, GCP, GKE]
description: Deploying a Hasure GraphQL Engine has never been easier
---

GraphQL has become an extremely popular way to create APIs that can be consumed by a wide variety of clients. With GraphQL, you are saved a lot of the boilerplate work that comes with building a standard backend application that serves up a RESTful API. One of the more popular open source GraphQL engines is [Hasura](https://hasura.io/). Hasura is an engine that sits directly on top of a Postgres Database and provides a realtime GraphQL API.

Recently we had a customer ask how hard it would be to stand up scalable Hasura engine on ECS using Convox. Having not deployed Hasura before I took a look at this very helpful [blog post](https://blog.hasura.io/instant-graphql-on-aws-rds-1edfb85b5985/) that the Hasura team published last year. 

While the blog post is fairly straightforward, there are still a lot of steps to get everything setup and I felt like given Hasura’s Docker native architecture, Convox could make the installation even easier. 

In order to deploy a Hasura Engine we need a Postgres Database and a Docker container running the engine. Fortunately with Convox we can define all of this in a single file and deploy it to ECS with one command. The core of any app deployed with Convox is the [convox.yml](https://docs.convox.com/application/convox-yml) file. Similar to a `docker-compose.yml`, `convox.yml` describes everything your application needs to run. To deploy a Hasura GraphQL Engine, all we need to do is simply create a convox.yml that looks like this:

```
resources:
  hasura_graphql_database:
    type: postgres
services:
  engine:
    image: hasura/graphql-engine:latest
    command: graphql-engine serve --enable-console
    port: 8080
    resources:
      - hasura_graphql_database
    environment:
      - HASURA_GRAPHQL_ACCESS_KEY=mylongsecretaccesskey
```
Digging into the details you can see that it’s pretty simple. First we define a Postgres resource. One of the great things about [Convox-defined resources](https://docs.convox.com/use-cases/resources) is that not only will Convox automatically provision the RDS database with the correct security groups etc, but Convox will also inject an [environment variable](https://docs.convox.com/application/resources#accessing-resources) containing the database connection URL into your running containers. Convox names the environment variable using the following pattern [RESOURCE_NAME]_URL. Hasura expects an environment variable called `HASURA_GRAPHQL_DATABASE_URL` containing the URL connection string so we named our resource `hasura_graphql_database`. 

The next thing we have defined is the service that will run the engine itself. Since Convox allows you to define a service using an external docker image we have done just that. Next we define the startup command and port for the engine. Finally, we link the Postgres resource and define the secret key environment variable. We have given the secret key a default value which is handy for testing locally, but in production we will use Convox’s built in secrets management and override the default value with `convox env set`.

Assuming we already have a Convox Rack, we can simply create a new app with `convox apps create --wait` and once the app is ready we can deploy with `convox apps deploy --wait`. 

```
$ convox deploy --wait
Packaging source... OK
Uploading source... OK
Starting build... OK
Authenticating 149765177331.dkr.ecr.us-east-1.amazonaws.com: Login Succeeded
Running: docker pull hasura/graphql-engine:latest
Running: docker tag hasura/graphql-engine:latest convox/hasura:engine.BBJKFKZTICT
Injecting: convox-env
Running: docker tag convox/hasura:engine.BBJKFKZTICT 
Running: docker push dkr.ecr.us-east-1.amazonaws.com
Promoting RWTRRDIDYUN... 
prod-demo-hasura-ServiceEngine-42CSVZV5JS2R UPDATE_COMPLETE 
prod-demo-hasura UPDATE_COMPLETE ServiceEngine 
prod-demo-hasura UPDATE_IN_PROGRESS ResourceHasuraGraphqlDatabase 
prod-demo-hasura UPDATE_COMPLETE ResourceHasuraGraphqlDatabase 
prod-demo-hasura UPDATE_COMPLETE prod-demo-hasura 
OK
$
```

Once the deployment is finished we can find the url of our Hasura Engine with `convox services`
```
$ convox services
SERVICE  DOMAIN                                                 PORTS           
engine   hasura-engine.prod-Route-123456.us-east-1.convox.site  80:8080 443:8080
```
Finally we can open a browser to the Engine URL and enter our secret key to see our fully operational Hasura GraphQL Engine!

![Hasura Dashboard](/images/blog/hasura_small.png)

Since Convox Racks are now cloud-portable you could easily deploy this service to AWS, GCP, Digital Ocean, and soon Azure. To install a Convox Rack in one of these clouds just follow the instructions [here](https://github.com/convox/installer).