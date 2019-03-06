---
title: IAM Permissions and Rack
author: Miguel Moll
twitter: radioact1ve
---

With the recently released [AWS integration](/blog/aws-integration/) for Console, we had the opportunity of taking a second look at Rack's IAM policy. At the beginning rather than trying to lock down a policy for a product that was in continuous development, Rack required administrator access to an AWS account. This wasn't ideal, but it worked. Now that Rack has stabilized and is being used in production by security-conscious companies and users, and after feedback from said users, we decided to reevaluate the permissions needed.

The goal of the new permissions model is to limit the access Rack has to your AWS account, while still keeping the seamless Convox experience.

<!--more-->

## What Changed
Rack is no longer using `AdministratorAccess` in its day-to-day operations. Permissions are now explicitly defined in our [stack template](https://github.com/convox/rack/blob/master/provider/aws/dist/rack.json). And wherever possible, Rack is restricted to accessing certain resources that are prefixed with the Rack's name, including S3 buckets, DynamoDB tables, and RDS instances, among others. This gives all users a clear picture of what's going on while limiting the scope Rack has. In time, the permissions granted will continue to be refined so that Rack has access to manage it’s own environment and nothing else unless otherwise stated.

## Tagging Limitations
Amazon's recommended method (as described [here](https://aws.amazon.com/blogs/security/resource-level-permissions-for-ec2-controlling-management-access-on-specific-instances/) and [here](https://aws.amazon.com/premiumsupport/knowledge-center/iam-ec2-resource-tags/)) of using tags to limit access to certain resources works to the extent that the tag creator is trusted. This isn't a complete or ideal solution for an automated entity like Rack. Granting Rack permission to create and/or modify resources and tag them at the same time defeats the purpose of limiting access by tags

## Feature Request: Resource Namespace
Simply put, it would be awesome if AWS had a "resource namespace" of sorts that would allow us to put resources (EC2 instance, Cloudformation stack, Lambda function, etc) in a namespace and to set permissions with a namespace in mind. That way we could set Rack up to only interact with resources in said namespace unless otherwise specified. Permissions would look something like this:

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "*",
      "Resource": "*"
      "Namespace": "Convox"
    }
  ]
}
```

The idea for resource namespaces came from the ability to use a `path` with IAM resources. With Rack, we’ve had a `/convox/` path for a while and it works by organizing IAM entities (users, groups, policies) together. But unfortunately it's not as locked down as we would like. Furthermore, not all resources support path based organization (EC2 instance, security groups, etc) so it’s use is limited.

If you know of a graceful solution, we'd love to hear from you.

## Conclusion
Security is always top of mind for us, so finding ways to improve AWS permissions will be an ongoing process. [Rack](https://github.com/convox/rack) is open source so anyone can see the permissions in the [Cloudformation template](https://github.com/convox/rack/blob/master/provider/aws/dist/rack.json). As always, we welcome any tips or improvements!
