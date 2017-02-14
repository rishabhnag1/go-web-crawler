function getAssets(body){

  let assets = [];
  //body is already passed in
  //add icons and css files
  Array.from(body("link")).forEach( obj => {
    let rel = obj.attribs.rel;
    let href = obj.attribs.href;

    if(href && rel && (rel.indexOf('stylesheet') > -1 || rel.indexOf('icon') > -1)){
      assets.push(href)
    }
  });

  //add js files
  Array.from(body("script")).forEach( (obj) => {
    let src = obj.attribs.src;
    if(src){
      assets.push(src)
    }
  });

  //add all image files
  Array.from(body("img")).forEach( (obj) => {
    var src = obj.attribs.src;
    if(src){
      assets.push(src)
    }
  })

  return assets
}

function isValidHref(crawler, href) {
  return  href.length > 1 &&
      href.indexOf('//') != 0 &&
      href[0] != '?' &&
      href[1] != '?' &&
      href.indexOf('javascript:') == -1 &&
      href[0]!= '#' &&
      href.indexOf('http://') == -1 &&
      href.indexOf('https://') == -1 &&
      !crawler.sitemapContains(href, crawler.sitemapRoot)
} //testing that href is valid url and doesn't already exist in the sitemap

function getChildPages(crawler, body){
  let childPages = {};
  Array.from(body("a[href]")).forEach( (obj) => {

    let href = obj.attribs.href;

    //remove BASE_URL from href to just get relative link
    if (href.indexOf(crawler.BASE_URL) > -1) {
      href = href.substr(crawler.BASE_URL.length, href.length)
    }

    //if anchor tag exists, remove
    const aux = href.lastIndexOf('#');
    if (aux > -1) {
      href = href.substr(0, aux)
    }

    if (isValidHref(crawler, href) ){

      if (href[0] != '/') {
        href = '/' + href
      }

      childPages[href] = //create child object for each valid link
      {
        'url' : crawler.BASE_URL + href,
        'relPath' : href,
        'assets' : [],
        'childPages' : {},
        'visited' : false
      }
    }
  });

  return childPages;
}

module.exports = {getAssets, getChildPages}