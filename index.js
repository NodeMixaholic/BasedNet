const express = require('express')
var { Readability } = require('@mozilla/readability');
var { JSDOM } = require('jsdom');
const request = require('request');
const e = require('express');
const app = express()
const port = 2052
const subdomain = "localhost"
const siteName = `http://${subdomain}:${port}`
const proxying = `${siteName}/net?url=`

app.get('/', (req, res) => {
    res.send(`<html>
    <head><title>BasedNet</title></head>
    <body>
    <h1>BasedNet</h1><br>
    <form action="/net" style="algin: center;" method="get">
        <input type="text" width="100%" id="url" name="url" value="http://"><br>
        <input type="submit" value="be a chad.">
    </form> 
    <hr>
    <p>Copyright Samuel Lord. Licensed under the MIT license.
    <br>Source available on the Basednet GitHub.</p>
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

            console.log(baseurl)

            var olddom = new JSDOM(`${body}`, { url: req.query.url});
            var reader = new Readability(olddom.window.document);
            var lite = reader.parse();
            var contentLatest = lite.content.split(`href="https://www.${baseurl}`).join(`href="${proxying}https://${baseurl}`)
            var contentLatest = contentLatest.split(`href="http://www.${baseurl}`).join(`href="${proxying}http://${baseurl}`)
            var contentLatest = contentLatest.split(`href="https://${baseurl}`).join(`href="${proxying}https://${baseurl}`)
            var contentLatest = contentLatest.split(`href="http://${baseurl}`).join(`href="${proxying}http://${baseurl}`)
            //console.log(contentLatest)
            resf.send(`<html>
            <head><title>BasedNet</title></head>
            <body>
            <b>BasedNet</b>
            <form action="/net" align="center" width="100%" method="get">
                <input type="text" width="100%" id="url" name="url" value="http://"><input type="submit" value="be a chad">
            </form>
            <hr>
            <h1>${lite.siteName} - ${lite.title}</h1><br>
            ${contentLatest}
        
            </body>
            </html>`)
        } catch {
            var olddom = new JSDOM(`<h1>Error while processing.</h1>`, { url: req.query.url});
            var reader = new Readability(olddom.window.document);
            var lite = reader.parse();
            resf.send(`<html>
            <head><title>BasedNet</title></head>
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
    console.log(`Example app listening at http://localhost:${port}`)
})