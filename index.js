const express = require('express');
const fetch = require('node-fetch');
const cache = require('memory-cache');
var sanitizeHtml = require('sanitize-html');

const requestImageSize = require('request-image-size');
const app = express();
app.set('view engine', 'hbs');

let jsonData=cache.get('rssfeed');
const getFirstParagraph=(content)=>{
    let firstPg=content.slice(content.indexOf('<p>')+3,content.indexOf('</p>',3)+4);
   return sanitizeHtml(firstPg);
}

app.get('/', async (req, res) => {
    if(jsonData===null){
        const feed=await fetch('https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fmedium.com%2Ffeed%2Fwwwid');
        jsonData=await feed.json();
        for (let index = 0; index < jsonData.items.length; index++) {
            jsonData.items[index].firstParagraph=getFirstParagraph( jsonData.items[index].description);
            jsonData.items[index].thumbnailInfo=await requestImageSize(jsonData.items[index].thumbnail);
            jsonData.items[index].thumbnailInfo.isPortrait=jsonData.items[index].thumbnailInfo.width<jsonData.items[index].thumbnailInfo.height?true:false;
        }
        cache.put('rssfeed',jsonData);
    }

    res.render('index', { items: jsonData.items});
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));