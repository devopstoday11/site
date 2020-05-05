---
title: Flipside Crypto runs on Convox
author: Cameron Gray
twitter: camerondgray
tags: [Convox, AWS, EKS, Kubernetes, Flipside Crypto]
description: A discussion with Jim Myers CTO/Co-founder of Flipside Crypto
---
<table>
    <tr>
        <td>
            <img src="/images/blog/jim_myers.png" style="border-radius: 50%;" alt="flipside" width="100">
        </td>
        <td colspan="2">&nbsp;</td>
        <td colspan="3"> <blockquote><p><strong><i>"At Flipside I knew I wanted dev-ops responsibility to be shared by all, and I wanted the engineers that wrote their own code to be held responsible for the performance of that code in production. Convox provided a simple way for us to do that while abstracting away the complexity of Kubernetes."</i></p></blockquote>
        </td>
    </tr>
    <tr>
        <td colspan="2" style="text-align: center; vertical-align: middle;">
            Jim Myers
        </td>
    </tr>
    <tr>
        <td>
            <img src="/images/logos/fs-logo-black.png" alt="flipside" width="200" style="margin:-20% 0;">
        </td>
    </tr>
</table>

[Flipside Crypto](https://flipsidecrypto.com/) is a fast growing startup that provides a business intelligence platform for blockchain organizations. In the rapidly growing cryptocurrency space, scaling your infrastructure is a challenge and downtime is not an option. Flipside relies on Convox to provide a stable Kubernetes platform for their services that autoscales for their needs. The following is a conversation with [Jim Myers](https://twitter.com/jfmyers01) the CTO and Co-founder of Flipside.


## Can you tell me a little bit about Flipside’s business and history?
Dave Balter, Eric Stone and I founded Flipside in 2017. With Bitcoin soaring to an all-time high, the ICO markets booming, and the crypto-markets crashing down in spectacular fashion, 2017 was a wild time to launch a blockchain business. However a few things were clear about this market, zero infrastructure or tools existed, data was difficult to acquire and, even if you managed to get your hands on it, making sense of it was nearly impossible. Fast forward a few years, and several product iterations later, and our analytics suite provides business intelligence to the world’s leading blockchain organizations. Our customers leverage our solutions to identify how their users are behaving to make data driven decisions on how to grow and advance the networks they’re building.

## Can you give me a little background on yourself, your role at Flipside, and your team?
As the CTO & Co-Founder of Flipside, I lead our engineering team across several disciplines including data engineering, data infrastructure and general product development (backend API and frontend development). Prior to Flipside, I helped build several other tech companies in various engineering roles, working on everything from enterprise product development, to data infrastructure, and data science R&D. 

At Flipside the technology we’re building is split into two camps, Chainwalkers and BI Analytics.
Chainwalkers is a tool for rapidly decoding blockchain data into an analytics ready format that was born out of many years of frustration parsing, indexing, and accessing blockchain data. Our analytics business requires reliable access to blockchain data in a variety of formats depending on the analysis being done and the team leveraging it.

The team behind this technology is an eclectic group of engineers, hackers, statisticians, and mathematicians. Our skills are rooted in data pipelines, distributed computing and predictive analytics, with experience building technology at scale across a number of high growth tech companies and government agencies.


## Can you give me an overview of your tech stack?
Our tech stack can be divided into three camps, data engineering, data science and product engineering. Within Data Engineering we rely on tools such as Kafka, Spark, Redshift and Airflow to service the needs of product and data science. Data Science uses a mix of Python, R, and various ML frameworks depending on the task at hand. Finally our API-layer is written in Go and serves up millions of requests a day to our core product, partners, and direct to api consumers.

## Are there any unique technical requirements or constraints that Flipside has?
Flipside currently integrates with over 40 different blockchain protocols via our Chainwalker technology. Developers from these protocols have the ability to write direct integrations to Chainwalkers in any language of their choosing. This flexibility allows our customers to integrate with the tools they’re most comfortable. The tradeoff, however, is that Flipside has to run dozens of different languages in production each with specific resource allocation requirements depending on the language, historical size of a blockchain and rate at which blockchains produce new blocks.

## What is your infrastructure history?
Early in our business our technology stack was far less complex. We had fewer products, a fraction of the traffic and only a handful of data pipelines. At this early stage we had a fairly basic setup that consisted of terraform, pre-configured ec2-instances along with a number of other AWS services such as RDS and CodePipeline for CI/CD. This setup served us well for a while. It was simple enough to keep all the pieces in our head, easy to debug and allowed us to stay heads down on our product / customers. 

Unfortunately nothing stays that simple forever. Over the course of several years more products were added, the scale and demand for our data has grown by many orders of magnitude. Not to mention, blockchains are relying on our data to make business critical decisions, which means the integrity of that data is of the utmost importance. 

By the Fall of 2019, what had started off as a few simple boxes had morphed into a hairy mess of dozens of ec2 instances. This was hard enough to draw on the back of a napkin let alone keep straight in one’s head. At that point we began exploring alternative deployments.

## What were your considerations and goals in upgrading your infrastructure?

We had three goals we wanted to tackle in moving away from our prior setup.

1. Fine grained control of resource allocation which in turn would allow us to better control our compute cost.
2. Empower individual engineers with the proper tools to maintain and tune their own code in production.
3. And most important, Keep it simple. Minimize time spent on ops and maximize time spent on solving customer pain.

## Did you decide to go with Kubernetes first and then choose Convox or the other way around?

I had some prior experience with Kubernetes at a previous company. From this I knew managing Kubernetes ourselves wouldn’t be simple. That said, I knew it would give us the fine-grained control over resource allocation and orchestration that we needed. Up until this point I had also been the keeper of the keys on everything dev-ops. A sub-goal was to empower every engineer at Flipside with the tools to handle their own deployments, monitor the performance of their own work and tune accordingly. Convox makes that possible for individual engineers on our team without the low-level overhead of Kubernetes.

## Did you try and manage your own Kubernetes clusters previously? If so, what was that experience like?

In a previous organization I was one of two people that ended up managing Kubernetes. It was fantastic when it worked and a nightmare when it failed. Due to the complexity of it, most engineers didn’t want to touch it and I had become a bottleneck for managing it within the org. At Flipside I knew I wanted dev-ops responsibility to be shared by all, and I wanted the engineers that wrote their own code to be held responsible for the performance of that code in production. Convox provided a simple way for us to do that while abstracting away the complexity of Kubernetes. 

## Can you give me an overview of your current Convox setup?

We currently run our core platform services and Chainwalker infrastructure atop Convox. What we call our “core platform”, is really an umbrella term for several smaller services, including a rest api, Kafka consumers, and graphql api. Continuous integration and deployment of these services is managed via Convox workflows. These services power our core product, and also internally, enable teams to easily share and transfer data. 

Similarly the Chainwalker’s stack consists of many different sub-services, responsible for orchestrating syncs, as well as dozens of different blockchain integrations that run as their own separate applications. 

We maintain two sets of Convox racks, one for production and one for staging, with each rack residing in their own VPC. We also maintain a number of databases as part of our data infrastructure in separate VPCs that join to Convox via AWS’s vpc peering.

## What is your overall experience with Convox?

I believe there is a high corollary between the attention a team can devote to solving customer pain, and the tools they choose to adopt. When adopting the wrong tool you’ll find yourself fixing problems that really shouldn’t be the problem you’re solving. This risk is always top of mind when we adopt a new piece of technology at Flipside. Early on in the process, the team at Convox was incredibly generous with their time and advice as we prototyped a potential deployment. They helped us navigate everything from the nuances of our chainwalker infrastructure on Convox to bringing engineers up-to speed with Kubernetes. Post launch, they continue to go above and beyond serving as a trusted extension of the team whenever an ops-related issue arises. Their product and their support has been nothing short of world-class.

## What are your future plans for your infrastructure?

Convox has allowed us to accomplish the goals we sought out to tackle, all while reducing complexity. As we build out our core product we’ll undoubtedly reach for Convox to power our infrastructure and services. However, more importantly, Convox will continue to serve as the right tool that allows our team to stay focused on the main goal, how to best solve customer pain.

## If people want to learn more about engineering at Flipside where should they go?

If you’re passionate about solving challenges at the intersection of data engineering, data science and product explore our [open roles](https://angel.co/company/flipside-crypto/jobs)!

## Follow in Flipside's footsteps

If you are interesting in getting your own Convox Kubernetes cluster up and running on the cloud of your choice Convox is free and you can get started [here](https://console.convox.com/signup).