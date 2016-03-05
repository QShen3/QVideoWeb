function Youku(vid, vformat) {
    var Base64 = require('../lib/Base64.js');
    var urllib_sync = require('urllib-sync');
    
    this.id = vid;
    this.format = vformat;
    
    var steam_types = {
        mp4hd3: { 'container': 'flv', 'video_profile': '1080P' },
        hd3: { 'container': 'flv', 'video_profile': '1080P' },
        mp4hd2: { 'container': 'flv', 'video_profile': '超清' },
        hd2: { 'container': 'flv', 'video_profile': '超清' },
        mp4hd: { 'container': 'mp4', 'video_profile': '高清' },
        mp4: { 'container': 'mp4', 'video_profile': '高清' },
        flvhd: { 'container': 'flv', 'video_profile': '标清' },
        flv: { 'container': 'flv', 'video_profile': '标清' },
        "3gphd": { 'container': '3gp', 'video_profile': '标清（3GP）' }
    }
    
    var trans_e = function (a, c) {
        var f = 0,
            h = 0,
            i, result = "",
            temp;
        var b = new Array(256);
        for (i = 0; i < 256; i++) {
            b[i] = i;
        }
        while (h < 256) {
            f = (f + b[h] + (a[h % a.length]).charCodeAt()) % 256;
            temp = b[h];
            b[h] = b[f];
            b[f] = temp;
            h += 1;
        }
        var q = 0;
        f = h = 0;
        while (q < c.length) {
            h = (h + 1) % 256;
            f = (f + b[h]) % 256;
            temp = b[h];
            b[h] = b[f];
            b[f] = temp;
            result += String.fromCharCode((c[q]).charCodeAt() ^ b[(b[h] + b[f]) % 256]);
            q += 1;
        }
        
        return result;
    }
    
    var generate_filed = function (no, streamfileds) {
        no = parseInt(no);
        var number = (no.toString(16)).toUpperCase();
        //console.log(number);
        if (number.length === 1) {
            number = "0" + number;
        }
        var filedid = streamfileds.substring(0, 8) + number + streamfileds.substring(10);
        return filedid;
    }
    
    var generate_ep = function (no, streamfileds, sid, token) {
        var base64 = new Base64();
        var ep = encodeURIComponent(base64.encode(trans_e("bf7e5f01", sid + "_" + generate_filed(no, streamfileds) + "_" + token)));
        return ep;
    }
    
    this.extractor = function extractor() {
        var result = {
            error: { code: 0, error_string: 'success' }
        }
        
        if (!this.id) {
            this.id = "XMTQzNzQ0NDc2OA==";
        }
        if (!this.format) {
            this.format = 'mp4hd3';
        }
        var options = {
            //hostname: 'play.youku.com',
            //path: '/play/get.json?ct=12&vid=' + qs.id,
            method: 'GET',
            headers: {
                'Referer': 'http://static.youku.com/',
                'Cookie': '__ysuid=' + new Date().getTime() / 1000
            }
        }
        var c12data = urllib_sync.request('http://play.youku.com/play/get.json?ct=12&vid=' + this.id, options);
        var c10data = urllib_sync.request('http://play.youku.com/play/get.json?ct=10&vid=' + this.id, options);
        
        if (c12data.status != 200 || c10data.status != 200) {
            result.error.code = (c12data.status == 200?c10data.status:c12data.status);
            result.error.error_string = 'error';
            return JSON.stringify(result);
        }
        
        c12data = JSON.parse(c12data.data);
        c10data = JSON.parse(c10data.data);
        
        if (c12data.e.code != 0 || c10data.e.code != 0) {
            result.error.code = (c12data.e.code == 0?c10data.e.code:c12data.status);
            result.error.error_string = 'error';
            return JSON.stringify(result);
        }
        
        var obj = c12data;
        var es = obj.data.security.encrypt_string;
        var ip = obj.data.security.ip;
        
        var base64 = new Base64();
        var e_code = trans_e("becaf9be", base64.decode(es));
        var sid = e_code.split('_')[0];
        var token = e_code.split('_')[1];
        
        var obj1 = c10data;
        //var segss = new Array(), fildIds = new Array();
        //var videoinfo = new Array();
        var videoinfo;
        
        for (var i in obj1.data.stream) {
            if (obj1.data.stream[i].stream_type == this.format) {
                videoinfo = new Object();
                videoinfo.height = obj1.data.stream[i].height;
                videoinfo.width = obj1.data.stream[i].width;
                videoinfo.size = obj1.data.stream[i].size;
                videoinfo.container = obj1.data.stream[i].stream_type;
                videoinfo.urls = new Array();
                
                for (var no in obj1.data.stream[i].segs) {
                    var k = obj1.data.stream[i].segs[no].key;
                    var filedId = generate_filed(no, obj1.data.stream[i].stream_fileid);
                    var ep = generate_ep(no, obj1.data.stream[i].stream_fileid, sid, token);
                    var q = "ctype=12&ev=1&K=" + k + "&ep=" + ep + "&oip=" + ip + "&token=" + token + "&yxon=1";
                    var u = "http://k.youku.com/player/getFlvPath/sid/" + sid + "_00/st/" + steam_types[obj1.data.stream[i].stream_type].container + "/fileid/" + filedId + "?" + q;
                    try {
                        videoinfo.urls[no] = JSON.parse(urllib_sync.request(u).data)[0].server;
                    }
                    catch (e) {
                        videoinfo.urls[no] = '';
                    }
                
                }
                i = 0;
                break;
            }
        }
        if (i == obj1.data.stream.length - 1) {
            //i = i - 1;
            videoinfo = new Object();
            videoinfo.height = obj1.data.stream[i].height;
            videoinfo.width = obj1.data.stream[i].width;
            videoinfo.size = obj1.data.stream[i].size;
            videoinfo.container = obj1.data.stream[i].stream_type;
            videoinfo.urls = new Array();
            
            for (var no in obj1.data.stream[i].segs) {
                var k = obj1.data.stream[i].segs[no].key;
                var filedId = generate_filed(no, obj1.data.stream[i].stream_fileid);
                var ep = generate_ep(no, obj1.data.stream[i].stream_fileid, sid, token);
                var q = "ctype=12&ev=1&K=" + k + "&ep=" + ep + "&oip=" + ip + "&token=" + token + "&yxon=1";
                var u = "http://k.youku.com/player/getFlvPath/sid/" + sid + "_00/st/" + steam_types[obj1.data.stream[i].stream_type].container + "/fileid/" + filedId + "?" + q;
                try {
                    videoinfo.urls[no] = JSON.parse(urllib_sync.request(u).data)[0].server;
                }
                    catch (e) {
                    videoinfo.urls[no] = '';
                }
                
            }
        }
                
        result.videoinfo = videoinfo;
        
        return JSON.stringify(result);
    }
}

module.exports = Youku;