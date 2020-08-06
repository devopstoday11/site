---
title: Monitoring Applications on Kubernetes
author: Cameron Gray
twitter: camerondgray
tags: [Convox, Monitoring, DataDog, New Relic, Kubernetes, Azure, AWS, GCP, Digital Ocean]
description: Part one of our overiew on Kubernetes application monitoring
---


As many teams make the move to Kubernetes one of the challenges is how to monitor your infrastructure and apps. Most of the same monitoring tools that people are already familiar with are available for Kubernetes but it does require a slightly different approach. In this post my hope is to give those of you who are new to Kubernetes a little bit of an overview on the core components as well as the key things to monitor. I will also cover some specific strategies for implementing a variety of third party monitoring services. This is the first of a multi-part series of posts and we will dig into specific examples in subsequent posts.


# Kubernetes Architecture

If you are new to deploying onto Kubernetes it's helpful to have a basic understanding of how a Kubernetes cluster is structured before we dive into the details of monitoring. While a complete overview of Kubernetes is definitely outside of the scope of this post, I will try and cover the basics. For the simple case of deploying an application that runs in a Docker container using the typical ["one-container-per-Pod"](https://kubernetes.io/docs/concepts/workloads/pods/#using-pods) model that is the most common for Kubernetes, you really only need to understand a few core concepts.

The biggest philosophical difference between Kubernetes and more traditional deployment options such as dedicated servers, or virtual machines like EC2 is the often mentioned pets vs cattle analogy. While pets are beloved individuals that are generally thought of as unique and irreplaceable, cattle are generally thought of as a herd. You may not give much consideration to an individual cow, what is important is the total amount of cattle you have and if one is to expire for whatever reason it can be replaced by any other cow.

In a typical server or VM based deployment, you may have a bunch of task specific instances, like the backend server or the mail server (pets). If you have ever had the one EC2 instance that's running your MySQL database suddenly fail you know exactly what I am talking about! Kubernetes takes a different approach and runs your cluster on a group of identical instances that can be terminated and replaced at any time (cattle). When you deploy onto a Kubernetes cluster you don't spend much time at all thinking about the individual instances. You are more concerned with the total capacity and load on your cluster as a whole. Kubernetes will automatically handle replacing any instances and you generally don't spend much, if any, time interacting with individual instances as an end user.

Your cluster is going to be running on a group of underlying physical or virtual hosts, such as AWS EC2 instances, and Kubernetes refers to those hosts as Nodes. Every instance of a container that you deploy (in the simple and most common use case) is referred to as a Pod. When you deploy a Pod onto a cluster the Kubernetes scheduler will attempt to find a Node with sufficient resources (typically RAM and CPU) to host that Pod.  For example if you tell Kubernetes to deploy three copies of your main web service and two copies of your backend API you are telling Kubernetes to run five Pods in total and Kubernetes will figure out which Nodes to deploy those Pods on to without you needing to worry about it. 

There are two things you do need to worry about however when it comes to the Nodes in your Kubernetes cluster. The first is how the required resources for your individual Pods align with the available resources on any one Node and the second is the total number of Nodes you will need to run to have the total capacity required to meet your demand. If a single instance of your backend web service requires 8gb of memory and your hosts have 2gb of memory each, your cluster will be unable to host your application because no single Node is able to fit your Pod. Alternatively, if your backend web service only requires 1gb of memory and your hosts have 32gb of memory each you can run almost 32 copies of your service (allow room for overhead) on each Node. 

While this seems like a very simple concept it gets a little more interesting when you are running multiple types of services (Pods) each with their own resource requirements and you start thinking about scaling up and scaling down to meet changing demand. The important concept to keep in mind is that it's much faster to find a Node with spare capacity and deploy an additional Pod there than it is to spin up a new Node to create additional capacity but it's also expensive to run more or larger Nodes than you need because you are paying for resources that you aren't using. 

Kubernetes will try and make the most efficient use possible of the available Node capacity which means if you have different types of Pods with different resource requirements (typically CPU and Memory) that need to be run they will not necessarily be evenly distributed across your Nodes. This is called Bin Packing, and is sometimes referred to as Kubernetes Tetris because of this great [talk](https://youtu.be/u_iAXzy3xBA?t=1033) given by the always awesome Kelsey Hightower.  The important thing is that you don't need to concern yourself with which Pods are running on which Nodes and if a Node should fail, Kubernetes is going to automatically find a new place to put those pods and spin up more Nodes if necessary. There is obviously a lot more to Kubernetes under the hood but as an app developer this hopefully gives you a good overview.

# What Do You Need to Monitor

Now that we have a basic understanding of how our apps run on a Kubernetes cluster, let's dig into what we need to keep an eye on once we have our apps deployed.

There are many facets to monitoring a set of web applications and their underlying infrastructure, but for the purposes of this post I am going to focus on three main elements

- Infrastructure Monitoring (monitor your Nodes)
- APM (monitor your apps)
- Log collection (consolidating your infrastructure and app logs)

## Infrastructure Monitoring

While I spent much of the previous section of this post explaining why you don't need to concern yourself with your individual Nodes, there are two important reasons to monitor the health of the Nodes in your cluster. First, only by monitoring all your individual Nodes will you be able to get a complete picture of the health and capacity of your cluster. While you don't care if one Node crashes and needs to be replaced it is important to know if all your Nodes are running at 99% CPU usage. Secondly, if you have individual Nodes that are spiking or crashing it's important to know what Pods are running on those Nodes. For example if you have a bug in your application code that consumes excessive amounts of memory you may only learn that if you see one of your Pods spiking memory usage and you have a record of which Pods are running on that Node.

One of the easiest ways to keep an eye on all your Nodes is to run a monitoring agent, such as the [Datadog Agent](https://docs.datadoghq.com/agent/kubernetes/?tab=daemonset), as a [DaemonSet](https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/) on your cluster.  In its simplest and most common form, a DaemonSet is a way to instruct Kubernetes to run exactly one copy of a given container (Pod) on each of your Nodes. This is an ideal configuration for a monitoring agent application because it ensures that each Node in your cluster will be monitored. Once you have a monitoring agent running as a DaemonSet on your cluster you can start collecting important information such as memory and CPU usage on all your Nodes and therefore your cluster as a whole.

It's important when running a monitoring agent like Datadog, to make sure that your other containers are labeled with something that will help you identify the app that is running in that container. This will ensure you can tie the load on your underlying Nodes back to what containers are running on them. At Convox we automatically name all containers with the name of the app that is running in them as well as adding labels to provide an even more granular view.

With a monitoring agent running on each of your nodes you can start to make informed decisions about how to best configure your cluster for your particular demands. Scaling decisions in Kubernetes are a little different than in a typical containerized hosting environment. You need to consider the factors we mentioned earlier such as bin packing and headroom as well as understanding how quickly you will need to scale up or down which will significantly impact whether you want to run many smaller nodes or fewer larger nodes. Of course having a smart autoscaler [(such as Convox provides)](https://docs.convox.com/deployment/scaling) can help a lot.

## Application Performance Monitoring (APM)

APM is a concept that has been around for some time and like infrastructure monitoring the major APM providers (Datadog, New Relic, etc..) have solutions for most major hosting configurations including Kubernetes. 

While Infrastructure monitoring gives you an important view into the health and capacity of your underlying physical or virtual infrastructure, APM gives you insight into the health and performance of your applications. If you introduced a new bug in your application code that is causing crashes or slow response times, APM is typically the tool that you will use to find the cause of those issues. APM can often pinpoint the performance of individual modules or even lines of code. In production this type of monitoring can also often find the dreaded "works on my machine" problem where a particular application may work just fine on an individual developer's laptop but behaves completely differently in a production environment.

Fortunately the same DaemonSet strategy that you use to deploy an infrastructure monitoring agent in your Kubernetes cluster works for APM. In fact, for many providers such as Datadog it is the same agent and you simply enable the APM features with a [configuration option](https://docs.datadoghq.com/agent/kubernetes/apm/?tab=daemonset). 

Once you have your agent Pods running on all your Nodes you have two important steps to get an APM solution up and running. First you will need to add the actual APM instrumentation code to your application which is typically a fairly lightweight code change and all the major APM providers have libraries for most popular languages and frameworks. This will allow your application to start collecting trace data and now all you need is send that data to the Agent running on the local Node.

This can be a little tricky and depends on how your Kubernetes cluster is configured and which APM service you are using. Once you have it all wired up however your application should be sending trace data to the Agent running on it's Node and in turn the Agent should be reporting that data back to your APM service. We will get into the details of configuring this in a follow up post.

## Log Collection

The final piece of the monitoring puzzle is to consolidate the logs from your applications and infrastructure into a single stream so you can get a detailed view, in real time if necessary, of everything that is happening in your cluster.

While Infrastructure and Application monitoring provides you with a real time view of what is happening, the logs provide the details and historical view of everything that has happened in your environment. While not a perfect analogy, you can think of the monitors as the instrument cluster in an airplane cockpit and the logs are the black box in the tail that is recording everything that happens. Oftentimes when something goes wrong you will find you need to pour through the logs to really figure out what happened. 

The flaw in the airplane analogy is that monitoring applications and logs each have both realtime and after the fact benefits because they provide different views of your environment and applications and often you will need to look at both to get a complete picture of what is happening or has happened. The key with logging is that every piece of your environment from individual hosts, to the Kubernetes cluster components, up to your custom applications all spit out logs and often you need a consolidated, cluster-level, view of these logs to get a complete picture of what is going on.

Kubernetes does not provide a built-in solution for cluster-level logging, although the documentation does provide some guidance on a few options for setting up cluster-level logging yourself. In what has become a common theme for this post, we once again find that leveraging a DaemonSet to run a logging agent on every node is a really good solution. If you are already running an Agent such as Datadog or [LogDNA](https://docs.logdna.com/docs/logdna-agent-kubernetes) for the purposes of Node monitoring and/or APM, typically those agents will also provide a solution for gathering logs from stdout or from a file system logging driver, such as the Docker json logging driver, and directing those logs to an outside ingest for analysis. I will also dig into some detailed implementation examples in a follow up post. 

# Conclusion

Hopefully this post has given you some insight into the important aspects of monitoring your Kubernetes clusters and the applications you deploy onto them. While it can seem daunting at first, you can generally use the same tools you are already familiar with as long as you understand some basic strategies that are unique to Kubernetes. Watch this space for some follow up posts that dig into the details. Meanwhile, if you want to spin up your first Kubernetes cluster on any cloud and deploy an application in just a few clicks and a few minutes there is no easier way than [Convox](https://docs.convox.com/getting-started/introduction) so give it a try!

