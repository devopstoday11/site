---
title: Keeping Your Kubernetes Hosting Costs Down
author: Cameron Gray
twitter: camerondgray
tags: [Convox, AWS, EKS, Google Cloud, GCP, Digital Ocean, Azure, Kubernetes, Cloud Costs, Kubernetes Cost]
description: Some strategies for keeping the cost of running your clusters in check.
---

Following up on our previous [blog post](https://convox.com/blog/cost-of-running-k8s) about understanding the true costs of running Kubernetes on the various cloud providers the next important question to answer is what can you do to manage your costs? 


## Economies of Scale
The first thing we recommend is to run as few actual clusters as possible. Every cloud has some sort of base cost associated with running a cluster whether it’s a general per cluster management fee as is the case with AWS and GCP or more specific items such as load balancers or elastic IPs. At Convox, we advise our customers to create [one k8s cluster per environment](https://docs.convox.com/installation/production-rack) (Dev, Staging, Production, etc…). You can then deploy many apps to a single cluster and share those cluster costs across all your apps. This also lets you run smaller, cheaper, clusters for less critical environments such as development or staging.

## Run What You Can in Containers
Along the same lines of running cheaper clusters for development and staging environments you can also save considerable amounts of money by running databases in containers for your non-production environments. For example, if your application requires a Postgres database, running that in a container on your cluster for your development and staging environments and using RDS for production can help keep costs down. At Convox we have implemented [resource overlays](https://docs.convox.com/reference/primitives/app/resource#overlays) to help make this possible.

## Use Only What You Need.
One of the best ways to save money, especially if you have spikey workloads, is to use [autoscaling](https://docs.convox.com/deployment/scaling#autoscaling). All the major clouds have some form of autoscaling support for their Kubernetes clusters though AWS requires you to install additional software to enable it. You can configure your application to autoscale based on simple factors such as CPU and memory utilization and configure your cluster to autoscale instance capacity to meet the needs of the applications installed on it. You can even go one step further and automate the spinning down of development and staging environments on nights and weekends to save money when the environments are not needed.

## Choose the Right Cloud
With the release of our free and open source [multi-cloud platform](https://docs.convox.com) we are enabling a new category of cost management by allowing people to seamlessly deploy their applications to multiple clouds. Because Convox managed clusters, which we call [Racks](https://docs.convox.com/reference/primitives/rack), behave identically across clouds you can safely deploy the same application on multiple clouds and expect the same behavior on any of them. This means you could, for example, save quite a bit of money by running your staging environment on DigitalOcean and your production environment on AWS without having to worry about managing two clouds. This same functionality also allows you to run specific workloads on the cloud that represents the best pricing for that workload. You might find that a specific instance type, service, or even region is lower cost on a specific cloud and you can choose to run your workloads in the place where you can get the best price. 

## Get and Use Available Free Credits
One great benefit for our fellow startups is that almost all the cloud providers have some sort of startup credits available and with seamless cloud portability you have the option of maximizing your use of those credits across providers!

* [AWS Activate](https://aws.amazon.com/activate/)
* [Google Cloud For Startups](https://cloud.google.com/developers/startups)
* [Azure for Startups](https://azure.microsoft.com/en-us/overview/startups/)
* [DigitalOcean Hatch](https://www.digitalocean.com/hatch/)

Convox is a partner with all four of these providers so if you need help gaining access to credits please [let us know](mailto:sales@convox.com)!

## Time is Money
Finally, in our experience the single largest cost to hosting in the cloud is the time and resources your team puts into learning, configuring, and managing whatever cloud you are hosting on. This is why we created Convox so you can let us worry about optimizing performance, stability, and cost on every cloud and you can focus on building your apps!

