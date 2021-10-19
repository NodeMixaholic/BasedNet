const express = require('express')
var { Readability } = require('@mozilla/readability');
var { JSDOM } = require('jsdom');
const request = require('request');
const e = require('express');
const { head } = require('request');
const DDG = require('duck-duck-scrape');
const app = express()
const port = 3001 //which port?
const noPortInDomain = true //is there a port visible in the domain?
const httpOrHttps = "https" //is set to http when changed to anything besides the default (http)
const subdomain = "server.sparksammy.com" //subdomain where your basednet instance resides.
var siteName;
// code below.
if (httpOrHttps == "https") {
  if (noPortInDomain == false) {
    siteName = `https://${subdomain}:${port}`
  } else {
    siteName = `https://${subdomain}`
  }
} else {
  if (noPortInDomain == false) {
    siteName = `http://${subdomain}:${port}`
  } else {
    siteName = `http://${subdomain}`
  }
}
const proxying = `${siteName}/net?url=`
var headHTML = `<head>
<title>BasedNet</title>
<style>
/* Media Queries: Tablet Landscape */
@media screen and (max-width: 1060px) {
    #primary { width:67%; }
    #secondary { width:30%; margin-left:3%;}  
}

/* Media Queries: Tabled Portrait */
@media screen and (max-width: 768px) {
    #primary { width:100%; }
    #secondary { width:100%; margin:0; border:none; }
}
html { font-size:1rem; }
p {font-size:1rem;}
b {font-size:1.2rem;}
a {font-size:1.23rem;} 
input {font-size:1.23rem;} 
h6 {font-size:1.23rem;}
h5 {font-size:1.35rem;}
h4 {font-size:1.5rem;}
h3 {font-size:1.6rem;}
h2 {font-size:1.8rem;}
h1 {font-size:2rem;}

body { font-family: Arial, Helvetica, sans-serif; }

</style>
</head>`

app.get('/', (req, res) => {
    res.send(`<html>
    ${headHTML}
    <body>
    <h1>BasedNet</h1><br>
    <form action="/net" style="algin: center;" method="get">
        <input type="text" width="100%" id="url" name="url" value="http://"><br>
        <input type="submit" value="be a chad.">
    </form> 
    <hr>
    <a href="/basedfind">Check out the other project, BasedFind!</a>
    <hr>
    <p>Copyright Samuel Lord. Licensed under the MIT license.
    <br>Source available on the <a href="https://github.com/sparksammy/BasedNet" target="_blank">BasedNet GitHub.</a></p>
    </body>
    </html>`)
})


app.get('/find', (req, res) => {
const search = DDG.search(req.query.q)
let thtml;
search.results.forEach(function(e,i) {
    thtml = `${thtml} <br> <a href="${search.results[i].url}">$search.results[i].title}</a>`
});
res.send(thtml);
})


app.get('/basedfind', (req, res) => {
    let dp;
    if (noPortInDomain == false) {
    dp = port
    } else {
    dp = 80
    }
    res.send(`<html>
    ${headHTML}
    <body>
    <h1>BasedFind *early build*</h1><br>
    <script>
    function find() {
      const q = document.getElementById('query').value;
      window.location.href = '/net?url=${httpOrHttps}://${subdomain}:${dp}/find?q=' + String(q)
    }
    </script>
    <input type="text" id="query" width="100%" id="url" name="url" value="somewhat broken"><br>
    <input type="button" onclick="find()" value="search like a chad."></button>
    <hr>
    <a href="/">Back to BasedNet.</a>
    <hr>
    <p>Copyright Samuel Lord. Licensed under the MIT license. Powered by DuckDuckGo Lite.
    <br>Source available on the <a href="https://github.com/sparksammy/BasedNet" target="_blank">BasedNet GitHub.</a></p>
    </body>
    </html>`)
})

app.get('/net', (req, res) => {
    const reqf = req;
    const resf = res;
    var baseurl = ""
    let dp;
    if (noPortInDomain == false) {
    dp = port
    } else {
    dp = 80
    }
    
    request(req.query.url, { json: false }, (err, res, body) => {
        if (err) { return console.log(err); }
        //console.log(body)
        try { 
            
            if (req.query.url.startsWith("http://")) {
                baseurl = req.query.url.replace("http://","")
            } else {
                baseurl = req.query.url.replace("https://","")
            }
            
            var arrOfURL = req.query.url.split("/")
            var urlNoDoc = req.query.url
            for (let i = 0; i < arrOfURL.length; i++) {
                if (String(arrOfURL[i]).includes("html")) {
                    arrOfURL.pop(i)
                    urlNoDoc = arrOfURL.join("/")
                    break;
                }
            }
            var arrOfURL2 = req.query.url.split("/")
            const domain = arrOfURL2[2]

            var olddom = new JSDOM(`${body}`, { url: req.query.url});
            var newbody = body
            var arrOfTags = []
            newbody = newbody.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            newbody = newbody.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
            newbody = newbody.replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, "")
            newbody = newbody.replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, "")
            newbody = newbody.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
            newbody = newbody.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "")
            newbody = newbody.replace(/href="\//g, `href="${proxying}http://${domain}/`)
            newbody = newbody.replace(/href='\//g, `href='${proxying}http://${domain}/`)
            newbody = newbody.replace(/href="/g, `href="${proxying}/`)
            newbody = newbody.replace(/href='/g, `href='${proxying}/`)
            var newdom = new JSDOM(`${newbody}`, { url: req.query.url});
            
            var reader = new Readability(newdom.window.document);
            var liteRead = reader.parse();
            var contentLatest = liteRead.content.split(`href="https://www.${baseurl}`).join(`href="${proxying}https://${baseurl}`)
            contentLatest = contentLatest.split(`href="https://www.${baseurl}`).join(`href="${proxying}https://${baseurl}`)
            contentLatest = contentLatest.split(`href="http://www.${baseurl}`).join(`href="${proxying}http://${baseurl}`)
            contentLatest = contentLatest.split(`href='https://${baseurl}`).join(`href='${proxying}https://${baseurl}`)
            contentLatest = contentLatest.split(`href='http://${baseurl}`).join(`href='${proxying}http://${baseurl}`)
            contentLatest = contentLatest.split(`${urlNoDoc}/http://`).join(`http://`)
            contentLatest = contentLatest.split(`${urlNoDoc}/https://`).join(`https://`)
            contentLatest = contentLatest.split(`${proxying}//`).join(`${proxying}https://`)
            contentLatest = contentLatest.split(`${proxying}${req.query.url}///`).join(`${proxying}https://`)
            contentLatest = contentLatest.split('based.sparksammy.com/net?url=/').join('based.sparksammy.com/net?url=')
            contentLatest = contentLatest.split('https://based.sparksammy.com/net?url=https://based.sparksammy.com/net?url=').join('https://based.sparksammy.com/net?url=')
            contentLatest = contentLatest.split('http://based.sparksammy.com/net?url=http://based.sparksammy.com/net?url=').join('http://based.sparksammy.com/net?url=')
            resf.send(`<html>
            ${headHTML}
            <script>
            function find() {
            const q = document.getElementById('query').value;
            window.location.href = '/net?url=${httpOrHttps}://${subdomain}:${dp}/find?q=' + String(q)
            }
            </script>
            <body>
            <b>BasedNet</b>
            <form action="/net" align="center" width="100%" method="get">
                <input type="text" width="100%" id="url" name="url" value="http://"><input type="submit" value="be a chad">
            </form>
            <hr>
            <b>BasedFind *early build*</b>
            <input type="text" id="query" width="100%" id="url" name="url" value="somewhat broken"><input type="button" onclick="find()" value="search like a chad."></button>
            <hr>
            <h1>${liteRead.title}</h1>
            <hr>
            
            ${contentLatest}
        
            </body>
            </html>`)
        } catch (error) {
            console.log(error);
            if (req.query.url.startsWith("http://")) {
                baseurl = req.query.url.replace("http://","")
            } else {
                baseurl = req.query.url.replace("https://","")
            }

            var arrOfURL = req.query.url.split("/")
            var urlNoDoc = req.query.url
            for (let i = 0; i < arrOfURL.length; i++) {
                if (String(arrOfURL[i]).includes("html")) {
                    arrOfURL.pop(i)
                    urlNoDoc = arrOfURL.join("/")
                    break;
                }
            }

            var olddom = new JSDOM(`${body}`, { url: req.query.url});
            var newbody = body
            var arrOfTags = []
            newbody = newbody.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            newbody = newbody.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
            newbody = newbody.replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, "")
            newbody = newbody.replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, "")
            newbody = newbody.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
            newbody = newbody.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "")
            newbody = newbody.replace(/href="/g, `href="${proxying}/`)
            newbody = newbody.replace(/href='/g, `href='${proxying}/`)
            newbody = newbody.replace(/href="/g, `href="${proxying}/`)
            newbody = newbody.replace(/href='/g, `href='${proxying}/`)
            newbody = newbody.split(`href="https://www.${baseurl}`).join(`href="${proxying}https://${baseurl}`)
            newbody = newbody.split(`href="http://www.${baseurl}`).join(`href="${proxying}http://${baseurl}`)
            newbody = newbody.split(`href='https://${baseurl}`).join(`href='${proxying}https://${baseurl}`)
            newbody = newbody.split(`href='http://${baseurl}`).join(`href='${proxying}http://${baseurl}`)
            newbody = newbody.split(`${urlNoDoc}/http://`).join(`http://`)
            newbody = newbody.split(`${urlNoDoc}/https://`).join(`https://`)
            newbody = newbody.split(`${proxying}//`).join(`${proxying}https://`)
            newbody = newbody.split(`${proxying}${req.query.url}///`).join(`${proxying}https://`)
            newbody = newbody.split('based.sparksammy.com/net?url=/').join('based.sparksammy.com/net?url=')
            newbody = newbody.split('https://based.sparksammy.com/net?url=https://based.sparksammy.com/net?url=').join('https://based.sparksammy.com/net?url=')
            newbody = newbody.split('http://based.sparksammy.com/net?url=http://based.sparksammy.com/net?url=').join('http://based.sparksammy.com/net?url=')
            resf.send(`<html>
            ${headHTML}
            <script>
            function find() {
            const q = document.getElementById('query').value;
            window.location.href = '/net?url=${httpOrHttps}://${subdomain}:${dp}/find?q=' + String(q)
            }
            </script>
            <body>
            <b>BasedNet</b>
            <form action="/net" align="center" width="100%" method="get">
                <input type="text" width="100%" id="url" name="url" value="http://"><input type="submit" value="be a chad">
            </form>
            <hr>
            <b>BasedFind *early build*</b>
            <input type="text" id="query" width="100%" id="url" name="url" value="somewhat broken"><input type="button" onclick="find()" value="search like a chad."></button>
            <hr>
            
            ${newbody}
        
            </body>
            </html>`)
        }

    });
    
})

app.listen(port, () => {
    console.log(`BasedNet listening at http://localhost:${port}`)
})
