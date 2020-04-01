---
title: The True Cost of Running Kubernetes in the Cloud
author: Cameron Gray
twitter: camerondgray
tags: [Convox, AWS, EKS, Google Cloud, GCP, Digital Ocean, Azure, Kubernetes, Cloud Costs, Kubernetes Cost]
description: What does it really cost to run a kubernetes cluster on different clouds.
---

Those of you who use Google's Kubernetes Engine have likely received a notice recently about GCP adding a $0.10 per hour [management fee](https://devclass.com/2020/03/05/google-slaps-management-charge-on-gke-clusters/) for all GKE clusters. While this does not represent a significant amount of money for most deployments, it has triggered a bit of a discussion around what it really costs to run a Kubernetes cluster on the various popular cloud providers.

With the recent release of our [multi-cloud Kubernetes platform](https://convox.com/blog/convox-multi-cloud) we have been running many clusters on many clouds and have been thinking a lot about how to measure and manage costs. 


## The Theory
In theory the set of services required to run a web app on Kubernetes is relatively simple. You will need:

* A Kubernetes master (manager)
* Some nodes (instances/VMs)
* A load balancer
* Some block storage

Putting storage aside because it is so variable, and ultimately not that expensive, let's take a look at the "list" cost of these other three items on the various clouds. 

_A few notes: 
We tried to select the the most comparable instances across clouds but there is some variation.
The load balancer costs are approximate because they depend on rule count, data processed, etc... and that pricing varies by cloud._

### AWS

* Kubernetes master				$2.40 per day
* Nodes (3) x (2 vCPU 4GB RAM)	$3.01 per day
* Load balancer					~$1.00 per day 

total **$6.41** per day

### GCP

* *Kubernetes master 				$2.40 per day
* Nodes (3) x (1 vCPU 3.75GB RAM) 	$3.42 per day
* Load balancer 					~$0.60 per day 

total **$6.42** per day

_* GCP will not be charging its hourly cluster management fee until June 6th 2020. If you are running a cluster before then, or you are running a cluster in only a single zone, you will not incur this fee._

### Azure

* Kubernetes master 				(free)
* Nodes (3) x (1 vCPU 3.75GB RAM) 	$5.04 per day
* Load balancer 					~$0.75 per day

total **$5.79** per day

### DigitalOcean

* Kubernetes master 			(free)
* Nodes (3) x (2 vCPU 4GB RAM) 	$2.16 per day
* Load balancer					$0.33 per day

total **$2.49** per day

Most likely you are going to want to run larger instances with memory being the major need for most applications. If we normalize the instance cost around available memory the costs break down as follows:

* AWS 				$0.25 per GB per day
* GCP				$0.30 per GB per day
* Azure 			$0.44 per GB per day
* DigitalOcean 		$0.14 per GB per day

So this all seems pretty straightforward. AWS and GCP are rather close in price, Azure is a litte cheaper and DigitalOcean is a real bargain, but the story isn't quite that simple.

## The Practice
You can use a pricing calcuator from each cloud to do the math above but somehow that never seems to match your actual bill once you are in production. The first trick is understanding what combination of services you are using to host your application(s). In the early days of cloud hosting it was quite simple as most people hosted on AWS and you really only had to pay attention to the price of your EC2 instances and perhaps some EBS, S3, and ELB services. Running a production grade Kubernetes cluster is a bit more complex.

To look at a concrete example, let’s see what it takes to run a default [Kubernetes-based Convox Rack](https://docs.convox.com/installation/production-rack) that’s ready to host a simple web application on AWS. In our case, Convox will automatically provision for you:

* 1 VPC
* 1 EKS cluster
* 6 Subnets
* 5 Route tables
* 1 Internet gateway
* 3 NAT gateways
* 1 Network ACL
* 3 Elastic IPs
* 1 Network Load Balancer
* 3 Security groups
* 3 EC2 instances
* 3 EBS volumes
* 1 S3 bucket

By default we use t3.small instances which have 2 vCPUs and 2GB of memory. As of this writing, the cost of running this cluster in us-east-1 is **$5.92** per day with the top three charges being:

1. EC2 Instances $2.12 per day
2. Network Load Balancer $1.19 per day
3. Elastic Block Store $0.81 per day

Once you start scaling, or needing services like RDS these costs will change significantly but this is a good baseline for a simple production ready cluster.


### What About The Other Clouds?
So now let's look at the cost of running the same Convox cluster on the other clouds:

#### GCP
Using their Preemptible N1-standard-1 instances (1 vCPU and 3.75GB of memory) will run **$4.13** per day with the top three charges being:

* GKE management fee 			$2.40 per day
* Compute Engine (Ram + CPU) 	$0.72 per day
* Network Load Balancing 		$0.60 per day

_We found with GCP we are able to get away with running [preemptible instances](https://cloud.google.com/compute/docs/instances/preemptible) which are much cheaper than regular instances. Non preemptible N1-standard-1 instances would bring the total cost to *$6.67* per day for the same 3 instance cluster_

#### Azure

For Azure to achieve a stable and reliable cluster we found we needed to run their Standard_D2_v3 instances (2 vCPU and 8GB of memory) which drives the daily cost of a cluster to **$9.97** per day
With the top three charges being:

* Instances 			$7.41 per day
* Container Registry: 	$1.16 per day
* Log Analytics 		$1.14 per day

#### DigitalOcean

Using their s-2vcpu-4gb droplet (2 vCPU and 4GB of memory) will run **$2.22** per day with the top three charges being:

* Instances 		$1.70 per day
* Load balancer 	$0.33 per day
* Spaces Storage 	$0.19 per day

## Choosing The Right Cloud Matters
As you can see the costs for equivalent clusters can vary pretty significantly across clouds. One thing you might notice right away is that underlying instance specs (vCPU/Ram) are a bit different between clouds. The default instance sizes that we selected are the smallest instances that we were able to use and still have reliable performance for the specific provider and we run three instances per cluster by default. 

This highlights one of the reasons we built our [multi-cloud Racks](https://docs.convox.com/getting-started/introduction) which is that different workloads can have noticeable cost differences across clouds depending on the specific resources or underlying services they require. If your workload is more CPU intensive than RAM intensive, or if you require large quantities of block storage, your costs could really vary across providers. Of course these differences can be significantly magnified as you scale. Depending on the specific needs of your application choosing the cost-optimized cloud provider for your requirements can mean big savings.

There are a number of cost management and savings strategies for each of the cloud providers which we have learned, and several that we have built into our platform, but I will save those for an upcoming post.

If you would like to save yourself the headache of provisioning, managing, and cost-optimizing all this infrastructure yourself, I encourage you to check out our free and open source [Convox multi-cloud Racks](https://docs.convox.com/getting-started/introduction). With support for AWS, GCP, DigitalOcean and Azure we allow you to run on the cloud that is the best fit for you!


## Try It Out!

* [Install a Rack using the cloud of your choice](https://docs.convox.com/getting-started/introduction)
* [Deploy your first App](https://docs.convox.com/tutorials/deploying-an-application)


