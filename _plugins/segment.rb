module Jekyll
  class EnvironmentVariablesGenerator < Generator
    def generate(site)
      site.config['segment_token'] = ENV["SEGMENT_TOKEN"]
    end
  end
end
