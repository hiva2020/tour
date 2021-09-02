const fs = require('fs');
const http = require('http');
const url = require('url');
const { URL, URLSearchParams } = require('url');
const replaceTemplate=require('./modules/replaceTemplate');
const slugify=require('slugify');

//////////////Files////////////////////////////////////////////
// const textIn=fs.readFileSync('./txt/input.txt','utf-8');
// console.log(textIn);

// const textOut= `this is about avacado ${textIn} .\nCreated on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt',textOut);
// console.log('File written!');

// fs.readFile('./txt/input.txt','utf-8',(err,data1)=>{
//     fs.readFile(`./txt/${data1}.txt`,'utf-8',(err,data2)=>{
//        // console.log(data1);
//       //  console.log(data2);
//         fs.writeFile(`./txt/final.txt`,`${data2}-okkk`,'utf-8',err=>{
//             if(err) return console.log(`error :smile_cat`);
//             console.log(":)");
//         });

//     });

// });
// console.log("finish!");




//////////////Files////////////////////////////////////////////
///////////////server////////////


const tempOverview = fs.readFileSync(`${__dirname}/templates/overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/product.html`, 'utf-8');
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

const slugs=dataObj.map(el=>slugify(el.productName,{lower:true}));
console.log(slugs);

const server = http.createServer((req, res) => {
   // console.log(req.headers.host);
    const { searchParams,pathname} = new URL('http://'+req.headers.host+req.url);
    const newSearchParams = new URLSearchParams(searchParams);
  
  
     const pathName = pathname;  
    console.log(pathName);


//  console.log(url.parse(req.url,true));
    //overview
    if (pathName === "/" || pathName === '/overview') {
        res.writeHead(200, { 'Content-type': 'text/html', });

        const cardHtml = dataObj.map(el => replaceTemplate(tempCard,el)).join(''); 
        const ouutput=tempOverview.replace(/{%product_cards%}/g,cardHtml);
        //console.log(cardHtml);
        res.end(ouutput);
    }

    // product
    else if (pathName === '/product') {
        res.writeHead(200, { 'Content-type': "text/html", });
        const product =dataObj[newSearchParams.get('id')];
        const output = replaceTemplate(tempProduct,product); 
       // console.log(product);
        res.end(output);
    }
    else if (pathName === '/api') {
        // fs.readFile(`${__dirname}/dev-data/data.json`, 'utf-8', (err, data1) => {
        // const productData = JSON.parse(data);
        res.writeHead(200, { 'Content-type': 'application/json', });
        res.end(data);

        // });

    }
    else {

        res.writeHead(404, {
            'Content-type': 'text/html',
            'myown': 'hello',

        });
    }

    //res.end('Hello from the server!');
});

server.listen(8000, '127.0.0.1', () => {
    console.log("listening to request on port 8000!");
});