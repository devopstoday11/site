---
title: Configuring Logging on Kubernetes
author: Cameron Gray
twitter: camerondgray
tags: [Convox, DataDog, LogDNA, Kubernetes, Logging, Fluentd, Azure, AWS, GCP, Digital Ocean]
description: Part two of our monitoring series takes a look at APM
---

In our previous posts we gave [an overview of Kubernetes monitoring](https://convox.com/blog/k8s-monitoring-overview) as well as a deeper dive into [application monitoring](https://convox.com/blog/k8s-monitoring-APM). In this post we are going to dig into the final piece of the monitoring puzzle which is log consolidation. To get a complete picture it's important to consolidate the logs from your applications and infrastructure into a single stream so you can get a detailed view, in real time if necessary, of everything that is happening in your cluster.

## Consolidating Your logs

At Convox we allow you to easily tail and search your application logs with the `convox logs` CLI command, and we provide the same for your infrastructure with `convox rack logs`.  While this works great for many situations we also recognize that sometimes you need a more robust solution. Seeing all your logs in one place can definitely help you gain a better understanding of what's happening in your environment. In addition, if you are using a third party service such as Datadog or New Relic, having your logs collected in the same platform can allow you to correlate changes in application performance or uptime to specific events in your logs. To this end, having a complete cluster-level logging solution can be extremely helpful.

## Kubernetes Logging Overview

By default the logs from your containers will be written to `stdout` and `stderr` and Kubernetes will write these logs to the local file system on the Pods running your containers. You can retrieve the logs from a given Pod with the [`kubectl logs`](https://kubectl.docs.kubernetes.io/pages/container_debugging/container_logs.html)  command. While this can be useful for troubleshooting the initial configuration of your cluster or troubleshooting a new app, it doesn't provide the cluster-wide view you often need to manage apps in production. In addition, if a Pod or Node fails or is replaced the logs are lost.

While Kubernetes does not provide a built-in method for cluster-level logging, the [official documentation](https://kubernetes.io/docs/concepts/cluster-administration/logging/) does provide a few options for systems you can set up yourself:

- [run a dedicated sidecar container in your application pod](https://kubernetes.io/docs/concepts/cluster-administration/logging/#using-a-sidecar-container-with-the-logging-agent)
- [run a logging agent on every node](https://kubernetes.io/docs/concepts/cluster-administration/logging/#using-a-node-logging-agent)
- [push logs directly from your application to a custom backend application or third party service](https://kubernetes.io/docs/concepts/cluster-administration/logging/#exposing-logs-directly-from-the-application)

### Sidecar Logging
We find that the sidecar approach is a bit cumbersome and generally difficult to set up and maintain, so I wont go into the details too much on this option. One benefit of the sidecar approach that is worth mentioning is because the sidecar container runs within each application's Pod, if you have multiple apps with logs in different formats you can use this per app sidecar to either reformat the logs to a common format or send different types of logs to different locations. You can even use the sidecar in conjunction with the logging agent approach if you want to pre-process your logs before sending them to a Node level agent. This option is definitely the most complex but also the most flexible.

### Per Node Logging Agents
Running a logging agent on every node is a great starting point. Once again we find using a [DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/) is the right approach for this. At Convox we even offer this as a built-in solution using a Fluentd DaemonSet installed by default with every Rack. Fluentd provides three major functions. First it can gather all your logs from stdout or from an application specific stream. Secondly, it can store those logs in a cloud specific storage endpoint such as Elasticsearch or Stackdriver. Finally, it can stream those logs to an outside collector such as a syslog endpoint or even an S3 bucket. At Convox we also offer the option of enabling a [syslog forwarder](https://docs.convox.com/installation/production-rack/aws#install-rack) on your cluster so you can easily send all these logs to a 3rd party provider like Papertrail. If you are not running on Convox and you want to deploy a Fluentd DaemonSet you can consult their official documentation [here](https://docs.fluentd.org/container-deployment/kubernetes).

### Using a 3rd Party Service

One of the shortcomings of solely using the logging agent approach is that it will only collect application logs from `stdout` and `stderr`. While this is fine for most applications, sometimes you will want to push logs directly from your application to a third party service. While there are some specific use cases for this we have found most of the third party services you would use for this also provide a DaemonSet based logging agent which you can deploy to serve as both a per Node logging agent and a [custom logging endpoint](https://docs.datadoghq.com/agent/logs/?tab=tailfiles#custom-log-collection). With this approach, much like we previously outlined with [APM](https://convox.com/blog/k8s-monitoring-APM), you can push your custom application logs directly to the Agent running on the local Node and gain the benefits of tying Node and Application logs together.

 If you are using a service such as [Datadog](https://docs.datadoghq.com/agent/kubernetes/log/?tab=daemonset) or [LogDNA](https://docs.logdna.com/docs/logdna-agent-kubernetes) their logging agents will collect all the Node and Application logs from `stdout` and `stderr`. Also, in the case of Datadog if you are already using an Agent for infrastructure monitoring and/or APM you can enable logging with a simple [configuration option](https://docs.datadoghq.com/agent/logs/?tab=tailfiles#activate-log-collection).

## Conclusion

Hopefully, this has given you a good overview of the various options for collecting logs for both your Kubernetes cluster and the applications you are hosting on it. As always if you don't want to worry about all this stuff you can just use [Convox](https://docs.convox.com/getting-started/introduction) and we will take care of it for you!
