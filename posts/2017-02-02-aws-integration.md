---
title: AWS Integration
author: Noah Zoschke
twitter: nzoschke
published: true
---

From day one, Convox has followed a philosophy of **“Integration over Invention”**. We believe that everything needed to run apps with impeccable uptime and security already exists through cloud services. The only challenge is integrating all the component services together into a simple and reliable system.

To this end, we’re happy to announce our **AWS Integration**. Deploying your apps onto modern and private AWS infrastructure services is only a few clicks away.

![Convox integrates AWS with your team collaboration services](https://cdn-images-1.medium.com/max/1600/1*dQBPgrQLFLeEFsJbrDclyw.png)*Convox integrates AWS with your team collaboration services*

<!--more-->

## Setup

[Sign up for Convox](https://console.convox.com/grid/signup). Follow the interactive setup checklist to create your first organization and to integrate your AWS account.

Copy and paste an AWS access key into the form. If you are more comfortable using the [AWS Command Line Interface](https://aws.amazon.com/cli/), you can copy and paste a few commands into your terminal and paste the resulting IAM role ID into the form.

![Amazon 1-Click Integration](https://cdn-images-1.medium.com/max/1600/1*-CmBxQjBFt6f31p7BBT9TQ.png)*Amazon 1-Click Integration*

That’s it! With one click you’ve enabled Convox to securely create and manage AWS resources on your behalf. You can now disable all those sensitive AWS access keys.

You can learn more about how it works from the [AWS Integration Doc](https://convox.com/docs/aws-integration/).

## Assembling a Private PaaS

Now Convox can use the **AWS Integration** to assemble AWS services like VPC, EC2 Container Service, and EC2 Container Registry into a easy to use platform with a few more clicks.

Click the “Add Rack” button, enter “production” in the name, then click the “Install Convox” button to launch your private PaaS. After a few minutes you have everything you need to get your first app running on AWS with the `convox deploy` command.

## Integrate Everything

A few more clicks and you can use the **AWS Integration** in combination with the **Slack Integration** to offer devops visibility for your team.

Click the “Integrations” button and enable the Slack integration to connect your team chat room.

You’ll get Slack messages for key AWS operations like instance security updates and app deploys and rollbacks.

## Conclusion

At Convox we strongly prefer to integrate cloud services together over building and operating custom infrastructure systems.

With the **AWS Integration**, Convox can automatically and reliably configure AWS to run your apps..

The result? You can focus solely on building your apps. Convox can focus on giving your team simple tools to manage apps. AWS can shoulder all the responsibility for keeping those apps running and secure.
