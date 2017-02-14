"use strict"
let request = require('request');
let cheerio = require('cheerio');
let URL = require('url-parse');

let parser = require('./parse');

class Crawler {

  constructor(url) {
    if(url){
      const path = url.split('//');
      const protocol = path[0];
      const host = path[1];
      this.BASE_URL = protocol + '//' + host;

      //sitemap will be created as a tree of pages with BASE_URL as the root node
      this.sitemapRoot = { 'url' : this.BASE_URL,
        'relPath'  : '/',
        'assets'    : [],
        'childPages'   : {},
        'visited'    : false
      } //root node
    }
    this.visitedUrls = 0
  }


  crawl(output) {
    this.crawlRecursive(this.sitemapRoot, (page,err) => {
      output(this, err)
    })
  }

  crawlRecursive(page, done){
    let self = this;
    let nPromises = 0;
    let resolvedPromises = 0;

    let crawlComplete = () => {
      resolvedPromises++;

      if (resolvedPromises == nPromises){

        if(Object.keys(page.childPages).length != 0){

          for(var p in page.childPages) {

            this.crawlRecursive(page.childPages[p],(pg, err) => {
              if (self.isCrawlComplete()) {
                done(page)
              }
            })
          }
        } else {
          done(page)
        }
      }

    };

    this.crawlPage(page, (pg,err) =>{ //crawl page
      if (err){
        done(pg,err)
      } else {

        if(Object.keys(pg.childPages).length === 0) {
          done(pg)
        }

        for(var p in pg.childPages) {
          //repeat until there aren't more child pages to visit
          nPromises++
          let promise = new Promise( (resolve, reject) => { //create promise for each crawl
            this.crawlAllChildPages(pg.childPages[p], resolve())
          }) .then(() => {
            crawlComplete()
          }) .catch((err) => {
                console.log(err);
          })
        }
      }
    })
  }

  crawlPage(page, done) { //crawling logic for individual URL
    let self = this;

    if(page.visited) done(page); //check if page already exists in tree

    request(page.url, function(err, res, body) { //simple library to make HTTP calls
      page.visited = true;
      self.visitedUrls++; //tracking total visited URLs
      if(err){
        page.httpStatus = err.code;
        done(page, Error("Error occurred at: " + page.relPath + " - " + err))
      } else {
        if(res) {

          if (res.statusCode === 200) {

            let $ = cheerio.load(body); //parse response body as HTML

            page.childPages = parser.getChildPages(self, $) // get child pages in HTML

            page.assets = parser.getAssets($); //get static assets in HTML

          }
          page.httpStatus = res.statusCode;
          done(page)

        } else {
          page.httpStatus = 'ERROR';
          done(page, "Error Occurred at: " + page.url)
        }
      }
    })
  }

  crawlAllChildPages(page,done) {
    let nPromises = 0;
    let fulfilledPromises = 0;

    let hasCrawlEnded = () => {
      fulfilledPromises++;

      if (fulfilledPromises == nPromises){
        //finished crawling all the child pages
        done(page)
      }
    }

    for(var p in page.childPages) {
      nPromises++;
      let promise = new Promise( (resolve, reject) => {

        this.crawlPage(page.childPages[p], resolve)

      }).then((val) => {
        hasCrawlEnded()
      })
          .catch((err) => {
            console.log("Error:" + err);
          })
    }
  }

  sitemapContains(url, page) { //recursively checks if sitemap tree contains url
    if(page.relPath == url || ( url in Object.keys(page.childPages)) ) {
      //url found in current page
      return true
    } else {
      for(var p in page.childPages){
        if( this.sitemapContains(url,page.childPages[p]) ) {
          return true
        }
      }
      return false
    }
  }

  allCurrentChildVisited(page){ //checks if current node child pages have all been visited
    if(page.childPages){
      for( var p in page.childPages){
        if( !page.childPages[p].visited ){
          return false
        }
      }
      return true
    } else {
      return true
    }
  }

  isDeepCrawlComplete(page){ //recursively checks if all child pages have been visited
    if(!this.allCurrentChildVisited(page)) {
      return false
    } else {
      for( var p in page.childPages) {
        if(!this.isDeepCrawlComplete(page.childPages[p])){
          return false
        }
      }
      return true
    }
  }

  isCrawlComplete() { // checks if all pages have been visited
    if(this.sitemapRoot.visited){
      return this.isDeepCrawlComplete(this.sitemapRoot)
    } else {
      return false
    }
  }

}

module.exports = Crawler;
