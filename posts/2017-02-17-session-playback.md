---
title: Announcing Audit Logs with Session Playback
author: Luke Roberts
twitter: awsmsrc
---

One of the advantages of Convox is that it runs entirely in your own AWS account which provides many benefits around security, cost and control. Many of our users also find this advantageous when it comes to compliance and regulations. Some of our customers pointed out that in order to meet their PCI or HIPAA requirements they needed to know exactly what an intruder may or may not have seen during any periods of unauthorized access.

<!--more-->

To meet this requirement we are happy to announce Audit Logs with Session Playback. The Audit Logs feature on our Pro and Enterprise plans has now been enhanced with the ability to review the full terminal session for all one-off processes run within your app.

Terminal sessions are stored using the open TTYRec standard and encrypted at rest. All terminal transcripts are available for you to download should you ever need them to comply with an audit or for any kind of forensic analysis. 

Here is an example of Session Playback in action.

![Convox Session Playback in Action](/assets/images/sessionplayback.gif)*Convox Session Playback for Audit Logs*

If you think Audit Logs, or Session Playback might help your team or want to talk to us about Convox [join us](http://invite.convox.com/) over on our public Slack channel where you will find a friendly and helpful community.
