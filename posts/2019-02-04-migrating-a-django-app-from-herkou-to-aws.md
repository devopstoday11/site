---
title: Migrating a Django application from Heroku to AWS ECS using Convox
author: Cameron Gray
twitter: camerondgray
tags: [Heroku, Convox, Django, AWS, ECS, Migrate from heroku to AWS, Django AWS]
description: How to migrate a Django application from Heroku to AWS ECS using Convox
---

At Convox we have had many customers make the switch from Heroku. Some want to significantly lower their hosting costs. Some want more control over their environment. Some want to make use of the greater AWS ecosystem. Many of our Enterprise clients make the switch because the Convox [Self-hosted Console](https://convox.com/enterprise) which makes it much easier for them to achieve PCI or HIPAA compliance. Whatever the reason, we hope to make the process as easy as possible. We have a [Heroku Migration Guide](https://docs.convox.com/migration/heroku) that you can refer to, but for this post I will walk you through migrating a simple Django application from Heroku to the Convox platform running on ECS.

<!--more-->

First things first, let’s get our Django application running locally using Convox’s [local development environment](https://docs.convox.com/development/running-locally). In order to do this we are going to need a couple of prerequisites:
- [Install Docker with Kubernetes support](https://blog.docker.com/2018/01/docker-mac-kubernetes/)
- [Signup for a Convox account](https://console.convox.com/signup)
- [Install the Convox CLI on our local computer](https://docs.convox.com/introduction/installation)
- [Install a local rack](https://docs.convox.com/development/running-locally)

Assuming we have completed all of the above we now need to containerize our Django application. This assumes we are currently deploying using Heroku’s build packs and not their container registry. If we have already containerized our app we can of course skip this step. The Dockerfile defines a container image that will be spun up to run our application. For our simple Django app the Dockerfile looks like:
```
FROM python:3
ENV PYTHONUNBUFFERED 1
WORKDIR /mysite
ADD requirements.txt /mysite/
RUN pip install -r requirements.txt
ADD . /mysite/
```

As you can see it’s quite simple but let’s walk through it. First we are building from a public base image. In this case it’s the public [Python 3 image](https://hub.docker.com/_/python/) which simply gives us a base container running linux with Python 3 installed. If we were running an older version of Django running on Python 2.7 then we could use the Python 2.7 base image. Next we update the environment to be unbuffered which is just a good practice for running python applications because it ensures stdin, stdout, and stderr are unbuffered. Then we define a work directory on the container for our Django app and we copy our requirements.txt from our local machine into the container. Now we run `pip install` to install all the requirements on our container and finally we copy over the rest of our app into the work directory.

You might ask why we copy requirements.txt and run pip install as a separate step instead of copying the entire app and then running pip install. The reason we do this is to take advantage of [Docker layer caching](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/) to speed up our builds. We know that we don’t change our requirements.txt all that often but we change our application source code constantly. By moving the pip install step first Docker will cache that step and only run it if something in requirements.txt changes.

Alright, so now we have a Dockerfile that defines an image to run our Django app. The next thing we need to do is create a [convox.yml](https://docs.convox.com/application/convox-yml) file which describes our application and all supporting infrastructure so Convox knows how to run our application both locally and on AWS. For our example Django app the convox.yml file looks like this
```
resources:
  database:
    type: postgres
services:
  web:
    build: .
    command: gunicorn mysite.wsgi --bind=0.0.0.0:8000
    port: 8000
    resources:
      - database
    environment:
      - SECRET_KEY=foo
```
Again this is pretty simple but let’s walk through it. First we define a database [resource](https://docs.convox.com/application/resources). In our case we are going to use Postgres as our primary datastore. With this defined, Convox will automatically start up a docker container running postgres when we run locally and Convox will automatically configure an RDS cluster running Postgres when we deploy to production. Next we define our Django service which we are calling web. We instruct Convox to build using the Dockerfile we just created and we define a startup command to run the Gunicorn web server listening on port 8000. You will notice that this command is almost identical to what is in a typical Heroku procfile. Now we just need to tell Convox that the web server needs to be able to talk to the database by listing the database as a resource for the web service. This step will automatically create a `DATABASE_URL` environment variable on the Django container and configure all the correct security groups for RDS. Finally we define any necessary default [environment variables](https://docs.convox.com/application/environment) in this case we only need the Django secret key.

Now we should have everything we need to run locally. Making sure we are in the root directory for our application we simply run

```shell
$ convox start
```

You may see some errors at this point and that’s ok. The issue is we haven’t migrated our database yet. Convox allows you to run [one-off commands](https://docs.convox.com/management/one-off-commands) against your local and production racks. So let’s go ahead and migrate by opening a second terminal window and running

 ```shell
$ convox switch local
 ```

to ensure we are running commands against our local rack and now we can run
```shell
$ convox run web python manage.py migrate
```
to run our migrations. Once our migrations have run we should see the errors clear up in our other terminal window and we should be ready to test. Now we can run
```shell
$ convox services
```
to get the hostname for our local app. Finally we can put that hostname in our browser and make sure our app works. If we want to run any other management commands we can do the same as we did with migrations ex:
```shell
$ convox run web python mange.py createsuperuser
```

So awesome, we have our Django app running locally on Convox we are ready to deploy to AWS!  The first thing we need to do is connect Convox to our AWS account following the instructions [here](https://docs.convox.com/console/aws-integration). Once we have done this we can [create a production rack](https://docs.convox.com/introduction/getting-started#install-an-aws-rack) to deploy to . This entire process should take 15-20 minutes but you only need to do it once. Once our production rack is ready to go we need to switch our Convox CLI from our local rack to our production rack. We run
```shell
$ convox racks
```
to grab the name of our production rack. If you don’t see your production rack make sure it is done being created and that your CLI is [logged in](https://docs.convox.com/introduction/installation#logging-in-to-the-cli) to your Convox account. Once we have our production rack name we switch to it with
```shell
$ convox switch [rack name]
```
Now we create an application with
```shell
$ convox apps create --wait
```
and finally we can deploy our application with
```shell
$ convox deploy --wait
```

The very first time we run a deployment it might take 15-20 minutes, as RDS instances, Elastic Load Balancers,  etc… are created, but subsequent deploys will be much faster. When our deployment is complete we need to run our migrations with same command as before
```shell
$ convox run web python manage.py migrate
```
Once the migrations are complete we can grab the hostname for our app with
```shell
$ convox services
```
and open it in a browser. So now have successfully deployed our application to ECS! All we need to do now is migrate our data and make the final switch.

We will typically perform the data migration twice. Initially as a test to make sure everything works smoothly and finally when we actually make the switch. Before we begin this process we need to make sure we have [Postgres Installed on our local computer](https://www.postgresql.org/download/), we don’t need to have a local postgres database running but we do need the postgres client installed. The first step in migrating our data is to download a snapshot of our Heroku Postgres Database. We do this by running
```shell
$ heroku pg:backups:capture
```
followed by
```shell
$ heroku pg:backups:download
```
taking note of the dumpfile name (typically “latest.dump”).

Now that we have our database snapshot we need to open up a proxy connection to our Convox Postgres Database running on RDS so we can import the data. Convox resources are not externally accessible for security reasons but it is possible to open a [local proxy](https://docs.convox.com/management/resources) to the resource provided you are logged into your Convox account. In order to do this we first grab our resource name and URL with

```shell
$ convox resources
```

In this example our name is `database` so we can open a proxy connection with

```shell
$ convox resources proxy database
```
We might receive an error stating that the port is already in use which will happen if we already have a postgres database running on our local computer. We can mitigate this by either shutting down our local postgres server or specifying a different port for our proxy with `--port`.

Now that we have our proxy open we can load our data into RDS (please note this will overwrite any data that is present in our Convox RDS instance). We will want to open a new terminal window (leaving the window running the proxy open). We will need to parse the URL we got from `convox resources` so we can get the username, password and database name for the import command. The format of the URL is
```
postgres://[username]:[password]@[hostname]:[port]/[database]
```
Once we have everything we need, we restore our data with
```shell
$ pg_restore --verbose --clean --no-acl --no-owner -h localhost -U [username] -d [database] [dumpfile name]
```
If you receive an error like `pg_restore: [archiver] unsupported version` you may need to upgrade your local postgres to the latest version. Once our restore is complete we can test our app again and we should see all our data from Heroku is now present. Once we are satisfied that everything restored correctly and the app is working properly we are ready to flip the switch and move our production traffic from Heroku to Convox.

The first few steps in preparing for the move we can do a few days ahead of time. The first thing we want to do is make sure that our DNS record for the domain we are migrating has a low TTL (Time To Live) so that our DNS changes propagate quickly. Typically a TTL of 60 seconds is reasonable. You can find more information on this [here](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-values-basic.html#rrsets-values-basic-ttl). Next we will want to issue a certificate for that domain on Convox with
```shell
$ convox certs generate [domain]
```
If there is not already a certificate in our AWS account for that domain AWS will generate one so we need to have our AWS administrator looking out for an approval request email. The last piece of preparation is to add a [domain parameter](https://docs.convox.com/deployment/custom-domains) to our convox.yml,set it to the domain we are migrating, and redeploy our Convox app.

No it’s time to flip the switch! This move will involve some small amount of downtime, so if your Heroku app is serving production traffic you may want to do this during off hours. First we will want to disable any [Heroku scheduler jobs](https://devcenter.heroku.com/articles/scheduler) we have enabled to ensure that nothing is writing to our Heroku database once we put the app in maintenance mode. If you do have Heroku scheduler jobs you can recreate them with [timers](https://docs.convox.com/application/timers) in Convox. Next we want to put the Heroku app in [maintenance mode](https://devcenter.heroku.com/articles/maintenance-mode). At this point our Heroku application will be offline. Finally if we have any [worker dynos](https://devcenter.heroku.com/articles/background-jobs-queueing) for things like celery tasks we will want to give them a few seconds to finish their current tasks and then scale them down to zero. At this point nothing should be writing to our Heroku Database and it is safe to repeat our Data migration steps from above to get the latest data into RDS.

Once our data migration is complete we want to make our DNS switch. We can grab the router value for our convox rack using
```shell
$ convox rack
```
and update the CNAME record for our domain to [point to that location](https://docs.convox.com/deployment/custom-domains#configuring-dns). Now we just wait a few minutes for DNS to update (we might need to flush our local DNS cache) and we can see that our site is live on Convox with the latest data!

### Advanced Topics


#### Celery tasks:
It is very popular for Django apps to use [Celery workers](http://docs.celeryproject.org/en/latest/django/first-steps-with-django.html) to handle asynchronous tasks. With Heroku we would handle this with a worker Dyno and with Convox the process is very similar. We simply add a data store for our Celery broker (like Redis) and add a new service for our Celery worker. A typical convox.yml for this scenario would look like:
```
  resources:
  database:
    type: postgres
  redis:
    type: redis
services:
  web:
    build: .
    command: gunicorn mysite.wsgi --bind=0.0.0.0:8000
    port: 8000
    resources:
      - database
      - redis
    environment:
      - SECRET_KEY=foo
  worker:
    build: .
    command: celery -A web worker -l warning
    resources:
      - database
      - redis
```

#### Timers:

In Heroku it’s popular to use the scheduler to run periodic tasks. Convox supports the same thing with [timers](https://docs.convox.com/application/timers) which are defined in the convox.yml. For example if we want to trigger a task to send emails every five minutes we might modify our convox.yml from above to look like

```
resources:
  database:
    type: postgres
  redis:
    type: redis
services:
  web:
    build: .
    command: gunicorn mysite.wsgi --bind=0.0.0.0:8000
    port: 8000
    resources:
      - database
      - redis
    environment:
      - SECRET_KEY=foo
  worker:
    build: .
    command: celery -A web worker -l warning
    resources:
      - database
      - redis
timers:
  sendemails:
    schedule: "*/5 * * * ?"
    command: python manage.py sendemails
    service: worker
```

Hopefully this answers all your questions about migrating a Django app from Heroku to AWS using Convox. If you would like to try out Django on Convox you can grab our [sample Django app](https://github.com/convox-examples/django). This just scratches the surface of what you can do with Convox though. In addition to helping you get up and running on AWS easily, Convox also provides:

- [CI/CD with workflows](https://docs.convox.com/console/workflows)
- [Autoscaling](https://docs.convox.com/deployment/scaling)
- [Zero downtime deploys](https://docs.convox.com/deployment/rolling-updates)
- [One click rollbacks](https://docs.convox.com/deployment/rolling-back)
