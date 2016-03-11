'use strict';
var http = require('http'),
	path = require('path'),
	url = require('url'),
    querystring = require('querystring');

var Youku = require('./extractor/Youku.js');

//var Temp = require('./temp.js');

var port = process.env.port || 18080;
http.createServer(function (req, res) {
    var obj = url.parse(req.url);
    switch (obj.pathname) {
        case '/youku':
            var qs = querystring.parse(obj.query);
            if (!qs.id) {
                qs.id = 'XMTQzNzQ0NDc2OA==';
            }
            if (!qs.format) {
                qs.format = 'mp4hd3';
            }
            var youku = new Youku(qs.id, qs.format);           
            res.end(youku.extractor());
            break;
        case '/exec':
            var result = "";
            var spawn = require("child_process").spawn;
            
            var test = spawn("python", ["--version"]);
            
            test.stdout.on("data", function (data) { result += data });
            test.stdout.on("end", function (data) { res.end(result) });
            test.stdout.on("exit", function (code) { if (code != 0) { res.end(code) } });
            break;
        default:
            //var youku = new Youku('XMTQzNzQ0NDc2OA==', 'mp4hd3');
            //res.end(youku.extractor());
            res.end('Hello world');
            break;
    }

}).listen(port);

console.log('server start');