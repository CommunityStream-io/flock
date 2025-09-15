# Gemfile for Flock Documentation Jekyll Site

source "https://rubygems.org"

# Jekyll and core plugins
gem "jekyll", "~> 4.3.3"
gem "minima", "~> 2.5"

# Jekyll plugins
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.12"
  gem "jekyll-sitemap", "~> 1.4"
  gem "jekyll-seo-tag", "~> 2.8"
  gem "jekyll-relative-links", "~> 0.6.1"
  gem "jekyll-optional-front-matter", "~> 0.3.2"
  gem "jekyll-readme-index", "~> 0.3.0"
  gem "jekyll-titles-from-headings", "~> 0.5.3"
  gem "jekyll-github-metadata", "~> 2.13"
  gem "jekyll-mentions", "~> 1.6"
  gem "jekyll-redirect-from", "~> 0.16"
  gem "jekyll-avatar", "~> 0.7"
  gem "jekyll-paginate", "~> 1.1"
  gem "jekyll-coffeescript", "~> 1.1"
  gem "jekyll-default-layout", "~> 0.1"
  gem "jekyll-gist", "~> 1.5"
  gem "jemoji", "~> 0.12"
end

# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]

# Lock `http_parser.rb` gem to `v0.6.x` on JRuby builds since newer versions of the gem
# do not have a Java counterpart.
gem "http_parser.rb", "~> 0.6.0", :platforms => [:jruby]

# Additional gems for enhanced functionality
gem "html-proofer", "~> 5.0", group: :test
gem "kramdown-parser-gfm", "~> 1.1"
gem "rouge", "~> 4.2"
gem "faraday-retry", "~> 2.2"

# Note: For the docs migration script, you'll also need:
# npm install yaml (for Node.js YAML processing)