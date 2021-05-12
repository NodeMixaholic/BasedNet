const express = require('express')
var { Readability } = require('@mozilla/readability');
var { JSDOM } = require('jsdom');
const request = require('request');
const e = require('express');
const { head } = require('request');
const app = express()
const port = 2052
const subdomain = "www.sparksammy.com"
const siteName = `http://${subdomain}:${port}`
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
    <p>Copyright Samuel Lord. Licensed under the MIT license.
    <br>Source available on the <a href="https://github.com/sparksammy/BasedNet" target="_blank">BasedNet GitHub.</a></p>
    </body>
    </html>`)
})

app.get('/net', (req, res) => {
    const reqf = req;
    const resf = res;
    var baseurl = ""
    
    request(req.query.url, { json: false }, (err, res, body) => {
        if (err) { return console.log(err); }
        //console.log(body)
        try { 
            
            if (req.query.url.startsWith("http://")) {
                baseurl = req.query.url.replace("http://","")
            } else {
                baseurl = req.query.url.replace("https://","")
            }

            var olddom = new JSDOM(`${body}`, { url: req.query.url});
            var newbody = body
            var arrOfTags = []
            newbody = newbody.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            newbody = newbody.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
            newbody = newbody.replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, "")
            newbody = newbody.replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, "")
            newbody = newbody.replace(`href="${req.query.url}`, `href="${proxying}${req.query.url}`)
            newbody = newbody.replace(`href='${req.query.url}`, `href='${proxying}${req.query.url}`)
            newbody = newbody.replace(`src="`, `src="${req.query.url}/`)
            newbody = newbody.replace(`src='`, `src='${req.query.url}/`)
            resf.send(`<html>
            ${headHTML}
            <body>
            <b>BasedNet</b>
            <form action="/net" align="center" width="100%" method="get">
                <input type="text" width="100%" id="url" name="url" value="http://"><input type="submit" value="be a chad">
            </form>
            <hr>
            
            ${newbody}
        
            </body>
            </html>`)
        } catch {
            var olddom = new JSDOM(`<h1>Error while processing.</h1>`, { url: req.query.url});
            var reader = new Readability(olddom.window.document);
            var lite = reader.parse();
            resf.send(`<html>
            ${headHTML}
            <body>
            <b>BasedNet</b>
            <form action="/net" align="center" width="100%" method="get">
                <input type="text" width="100%" id="url" name="url" value="http://"><input type="submit" value="be a chad">
            </form>
            <hr>
            <h1>${lite.title}</h1><br>
            ${lite.content}
        
            </body>
            </html>`)
        }

    });
    
})

app.listen(port, () => {
    console.log(`BasedNet listening at http://localhost:${port}`)
})
