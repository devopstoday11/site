---
title: Configuring APM on Kubernetes
author: Cameron Gray
twitter: camerondgray
tags: [Convox, Monitoring, DataDog, New Relic, Kubernetes, APM, Azure, AWS, GCP, Digital Ocean]
description: Part two of our monitoring series takes a look at APM
---


# Monitoring your apps

In our [previous post](https://convox.com/blog/k8s-monitoring-overview) we gave you a general overview of infrastructure and application monitoring for Kubernetes. In this follow up post we are going to take a deeper dive specifically into application monitoring. 

The term used by most of the industry for application monitoring is APM which is an acronym for either Application Performance Monitoring or Application Performance Management depending on who you ask. Whether the terms are actually synonymous or not is the source of [much debate](https://www.appdynamics.com/blog/product/monitoring-versus-management/) but I am not going to get into that here. Many vendors offer "APM" solutions and the feature sets of these offerings do have some variety but also a great deal of overlap. At a high level, an APM tool instruments your apps and allows you to dig into actual code performance, stack traces, crashes, etc...

Digging into the specifics, [Gartner](https://www.gartner.com/en/documents/3983892/magic-quadrant-for-application-performance-monitoring) identifies the following core components of APM:

- Front-end monitoring (page load times, browser render time, etc...)
- Application discovery, tracing and diagnostics (tracing your running applications through your code all the way down to your underlying infrastructure)
- Analytics (providing overview and analysis of the collected data)

Some of the major APM vendors you may have heard of include

- [New Relic](https://newrelic.com/products/application-monitoring)
- [Datadog](https://www.datadoghq.com/dg/apm/benefits-os/)
- [AppDynamics](https://www.appdynamics.com/)
- [Dynatrace](https://www.dynatrace.com/platform/application-performance-monitoring/)

Odds are if you have an application in production you are using one or more of these services already.  As you make the move to Kubernetes it's important to understand the core components of installing and configuring an APM solution. There are typically three pieces to implementing any APM solution for Kubernetes

- Installing and configuring a collection and reporting agent on every Node running in your cluster
- Instrumenting your applications with a tracing library or module to collect and report trace data
- Configuring your application trace component to communicate with the collection agent running on the local Node

Once you get this setup, all of your nodes should have an APM agent running on them. Your application code will then be collecting trace data and sending it to the agent running on it's node which will allow you to tie application performance to the underlying host performance. Finally your agents will be streaming all the collected data back to a central ingress endpoint for your APM provider so it can be aggregated and analyzed. Once you have all of this in place you can create dashboards, reports, alerts, etc...

## Installing a Collection Agent on Every Node

We covered this in some detail in our [previous post](https://convox.com/blog/k8s-monitoring-overview) but the short story is to use a Kubernetes DaemonSet to set this up. You can read our detailed instructions of how to do this with DataDog [here](https://docs.convox.com/integrations/monitoring/datadog). For most providers these collection agents perform many different monitoring tasks and you will need to set a [configuration option](https://docs.datadoghq.com/agent/kubernetes/apm/?tab=daemonset) to enable APM trace collection. Here are a few links to the DaemonSet configuration instructions for some of the other providers:


- [New Relic](https://docs.newrelic.com/docs/integrations/kubernetes-integration/installation/kubernetes-integration-install-configure#customized-manifest)
- [AppDynamics](https://docs.appdynamics.com/display/PRO45/Monitoring+Kubernetes+with+the+Cluster+Agent)
- [Dynatrace](https://www.dynatrace.com/support/help/technology-support/cloud-platforms/kubernetes/deploy-oneagent-k8/)


## Instrumenting Your App

Once you have your collection agents up and running the next step is to start collecting data from your running code. Most of the APM providers have libraries or modules for all the major languages and frameworks.

Let's look at the simple example of a Node.js application that we want to monitor using Datadog's APM offering. First we will need to install the Datadog tracer module and save it in a NPM requirements.txt.

```jsx
npm install --save dd-trace
```

Next we will need to add the tracer to our code and initialize it. Typically we will want to do this as part of starting up our app server.

```jsx

var host = process.env.INSTANCE_IP //we will get to this
const.trace = require('dd-trace').init({
	hostname: host,
	port: '8126'
});

```

For each provider there are several configuration options for the tracer libraries so I strongly recommend you consult the documentation for the particular provider and language/framework you are using. Here a few links to the various provider's APM libraries:

- [New Relic](https://docs.newrelic.com/docs/agents)
- [Datadog](https://docs.datadoghq.com/tracing/compatibility_requirements/)
- [AppDynamics](https://docs.appdynamics.com/display/PRO45/Application+Monitoring)
- [Dynatrace](https://www.dynatrace.com/support/help/technology-support/application-software/)

## Configuring Your Tracer to Communicate With the Local Agent

As you can see above we are using the `INSTANCE_IP` environment variable to find the IP address of the current instance that the agent is listening on. If you are used to using APM services on traditional servers, VMs, or instances you are likely using `localhost` or `127.0.0.1` to communicate with the local agent. In a Kubernetes cluster that approach is not going to work. You will need to find the actual instance IP as `localhost` would refer to the container your App is running in, rather than the underlying Node that hosts your container.

If you are deploying your application on a [Convox Rack](https://docs.convox.com/reference/primitives/rack) then every container will have the `INSTANCE_IP` environment variable automatically injected into your App’s container for your convenience. Otherwise you will need to use the Kubernetes API or another third party utility to determine the IP address. As an example you can find the Datadog documentation for this [here](https://docs.datadoghq.com/agent/kubernetes/apm/?tab=daemonset).

## Pulling it All Together

Once you have completed the steps outlined above you should have a collection agent running on every Node in your cluster. Your applications should be fully instrumented and streaming data to the collection agent on their respective Nodes. With this in place, you should be able to keep a close eye on the performance of your applications as well any impact those applications may be having on your Nodes. As an example if your infrastructure monitoring indicates that one of your Nodes is consuming all of it's available memory, your APM service should be able to pinpoint what application, and potentially even what line of code is causing the problem.

At Convox we strive to make not only [setting up a Kubernetes cluster](https://docs.convox.com/getting-started/introduction#install-a-rack) easy but we also ensure you have all the tools you need to run a production application on Kubernetes such as [auto-scaling](https://docs.convox.com/deployment/scaling) and [monitoring](https://docs.convox.com/integrations/monitoring/datadog). If you haven't already tried setting up a Kubernetes cluster with Convox it only take a few minutes and it works on all major clouds so give it a [try](https://docs.convox.com/getting-started/introduction)!
