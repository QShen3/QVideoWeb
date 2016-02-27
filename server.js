'use strict';
var http = require('http'),
	path = require('path'),
	url = require('url'),
    querystring = require('querystring');

var Youku = require('./extractor/Youku.js');

var Temp = require('./temp.js');

var port = process.env.port || 1337;
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
        default:
            //var youku = new Youku('XMTQzNzQ0NDc2OA==', 'mp4hd3');
            //res.end(youku.extractor());
            res.end('Hello world');
            break;
    }

	/*var qs = querystring.parse(url.parse(req.url).query);
    if (!qs.id) {
        qs.id = 'XMTQzNzQ0NDc2OA==';
        //res.end('Erro');        
		//return false;
	}
	var ct12data = '',
        ct10data = '';

    var reqhttp = http.request( {
        hostname: 'play.youku.com',
        path: '/play/get.json?ct=12&vid=' + qs.id,
        method: 'GET',
        headers: {
            'Referer': 'http://static.youku.com/',
            'Cookie': '__ysuid=' + new Date().getTime() / 1000
		}
	},
    function (reshttp) {
		reshttp.on('data',
        function (d) {
			ct12data += d;
		});
		reshttp.on('end',
        function () {
			reqhttp = http.request({
				hostname: 'play.youku.com',
				path: '/play/get.json?ct=10&vid=' + qs.id,
				method: 'GET',
				headers: {
					'Referer': 'http://static.youku.com/',
					'Cookie': '__ysuid=' + new Date().getTime() / 1000
				}
			},
            function (reshttp) {
				reshttp.on('data',
                function (d) {
					ct10data += d;
				});
				reshttp.on('end',
                function () {
					
					var result = extractor(JSON.parse(ct12data), JSON.parse(ct10data));
					res.end(JSON.stringify(result));
				});
			});
			reqhttp.end();
		});
	});
	reqhttp.end();*/
}).listen(port);
console.log('server start');