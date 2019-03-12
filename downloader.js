"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
/***
 *  接收 -> {id: process_id, url: DOWNLOAD_TYPE, path: save_path}
 *  发送 -> {id: process_id, type: MSG_TYPE, payload: {xxx}}
 *  process.send({xxx})
 *
 *  add_event()
 *  delet_event()
 *
 *
 */
var events_1 = require("events");
var config = require("./appconfig");
var fs = require('fs');
var request = require('request');
var DOWNLOAD_QUEUE = /** @class */ (function (_super) {
    __extends(DOWNLOAD_QUEUE, _super);
    function DOWNLOAD_QUEUE() {
        var _this = _super.call(this) || this;
        _this.EVENT_QUEUE = [];
        _this.QUEUE_LENGTH = 0;
        _this.MAX_LENGTH = 10;
        return _this;
    }
    DOWNLOAD_QUEUE.prototype.push = function (payload) {
        if (this.QUEUE_LENGTH < this.MAX_LENGTH) {
            var event_item = {
                state: config.EVENT_STATE.PUSE,
                payload: payload
            };
            this.EVENT_QUEUE.push(event_item);
            this.QUEUE_LENGTH++;
            return 0;
        }
        else {
            return -1;
        }
    };
    DOWNLOAD_QUEUE.prototype.pop = function () {
        if (this.QUEUE_LENGTH == 0) {
            return null;
        }
        else {
            //console.log('pop out ...',this.QUEUE_LENGTH)
            this.EVENT_QUEUE[0].state = config.EVENT_STATE.READY;
            var return_item = this.EVENT_QUEUE.shift();
            this.QUEUE_LENGTH--;
            //console.log('left  length ==> ',this.QUEUE_LENGTH)
            return return_item;
        }
    };
    DOWNLOAD_QUEUE.prototype.length = function () {
        return this.QUEUE_LENGTH;
    };
    DOWNLOAD_QUEUE.prototype.addEvent = function (data) {
        !this.push(data) ? this.emit('RUN_EVENT', data) : console.log('error');
    };
    DOWNLOAD_QUEUE.prototype.runEvent = function (item, callback) {
        console.log('run ....', item);
        if (item != null &&
            item.state == config.EVENT_STATE.READY) {
            console.log('run into ...');
            switch (item.payload.type) {
                case config.EVENT_TYPE.DOWNLOAD_EVENT:
                    {
                        item.state = config.EVENT_STATE.RUN;
                        console.log(item);
                        downloadFile(item.payload, callback);
                    }
                    break;
                case config.EVENT_TYPE.UNZIP_EVENT:
                    {
                    }
                    break;
                case config.EVENT_TYPE.DELETE_EVENT:
                    {
                    }
                    break;
                case config.EVENT_TYPE.UPDATE_EVENT:
                    {
                    }
                    break;
                case config.EVENT_TYPE.OPENPATH_EVENT:
                    {
                    }
                    break;
                default: break;
            }
        }
    };
    return DOWNLOAD_QUEUE;
}(events_1.EventEmitter));
exports.DOWNLOAD_QUEUE = DOWNLOAD_QUEUE;
var download_queue = new DOWNLOAD_QUEUE();
download_queue.on('RUN_EVENT', function () {
    console.log(download_queue.QUEUE_LENGTH);
    if (download_queue.QUEUE_LENGTH > 0) {
        console.log('run item ...');
        var item_run = download_queue.pop();
        if (item_run != null) {
            download_queue.runEvent(item_run, download_cb);
        }
    }
});
download_queue.on('ADD_EVENT', function (data) {
    download_queue.addEvent(data);
});
/**
 *  process_part
 *  [user_action] -> process_part()  -> add/delete_event() -> run_event()
 *
 */
process.on('message', function (data) {
    console.log('start process .....');
    download_queue.emit('ADD_EVENT', data);
});
function download_cb(data) {
    console.log('send process data ... ', data);
    process.send(data);
}
function downloadFile(option, callback) {
    console.log('start downloading .....');
    var downloadCallback = callback;
    var receivedBytes = 0;
    var totalBytes = 0;
    var req = request({
        method: 'GET',
        uri: option.url
    });
    var out = fs.createWriteStream(option.path);
    req.pipe(out);
    req.on('response', function (data) {
        totalBytes = parseInt(data.headers['content-length'], 10);
    });
    req.on('data', function (chunk) {
        receivedBytes += chunk.length;
        var progress = (receivedBytes * 100) / totalBytes;
        downloadCallback({
            state: config.MSG_TYPE.DATA,
            payload: {
                'id': option.id,
                'type': config.EVENT_TYPE.DOWNLOAD_EVENT,
                'data': progress
            }
        });
    });
    req.on('end', function () {
        console.log('下载已完成，等待处理');
        downloadCallback({
            state: config.MSG_TYPE.DATA,
            payload: {
                'id': option.id,
                'type': config.EVENT_TYPE.DOWNLOAD_EVENT,
                'data': 100
            }
        });
    });
    req.on('error', function (error) {
        console.log(error);
        downloadCallback({
            state: config.MSG_TYPE.ERROR,
            payload: {
                'id': option.id,
                'type': config.EVENT_TYPE.DOWNLOAD_EVENT,
                'data': error
            }
        });
    });
}
function unzipFile(option, callback) {
    console.log('unzipFile ...');
}
