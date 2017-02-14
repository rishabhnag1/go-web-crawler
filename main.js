let commandLineArgs = require('command-line-args');
let fs = require('fs');
let crawler = require('./src/crawl');

let DEFAULT_URL = 'http://tomblomfield.com';
let DEFAULT_OUTPUT = 'results.json';

const clOptions = [
  { name: 'url', alias: 'u', type: String, defaultOption: true },
  { name: 'output', alias: 'o', type: String }
];

const options = commandLineArgs(clOptions);

var Crawler = new crawler((options.url || DEFAULT_URL));

console.log("Starting to crawl at: " + (options.url || DEFAULT_URL));

let createSiteMap = (result, err) => {
  if (err) console.log(err);

  fs.writeFile((options.output || DEFAULT_OUTPUT), JSON.stringify(result, null, 2), function (err) {
    if (err) return console.log(err);

    console.log("Crawling Complete. " + result.visitedUrls + " URLs visited from " + (options.url || DEFAULT_URL));
    console.log('Sitemap written to: ' + (options.output || DEFAULT_OUTPUT));

  });
};

Crawler.crawl(createSiteMap);


