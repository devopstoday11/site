FROM ruby:2.6

RUN apt-get update && apt-get -y install nginx

WORKDIR /app

COPY Gemfile .
COPY Gemfile.lock .
RUN bundle install

RUN mkdir -p /var/run/nginx
COPY _config/nginx.conf /etc/nginx/nginx.conf
COPY _config/convox.conf /etc/nginx/server.d/convox.conf

COPY . .

CMD ["_bin/web"]
