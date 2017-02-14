# Web Crawler Implementation - Rishabh Nag

# Challenge
Write a simple web crawler. The crawler should be limited to one domain - so when crawling tomblomfield.com it would crawl all pages within the domain, but not follow external links, for example to the Facebook and Twitter accounts. Given a URL, it should output a site map, showing which static assets each page depends on, and the links between pages.

#Implementation
Implemented with NodeJS, using cheerio and request packages to simplify HTTP calls and parsing body, outputs sitemap as JSON file
Also attempted to partially implement with Go

#JS Steps
1) `npm install`

2) `node main http://tomblomfield.com`

3) Optional output file name argument (defaults to results.json) 

`node main http://tomblomfield.com -o tom.json`

#Go Steps
1) `cd go`

2) `go run crawl.go http://tomblomfield.com`

3) Sitemap just outputs into console
