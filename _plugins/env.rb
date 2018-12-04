module Jekyll
  class EnvironmentVariablesGenerator < Generator
    def generate(site)
      site.config['console_host'] = ENV["CONSOLE_HOST"]
      site.config['segment_token'] = ENV["SEGMENT_TOKEN"]
    end
  end
end
