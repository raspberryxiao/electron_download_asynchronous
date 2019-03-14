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
var unzip = require('unzip-stream');
var exec = require('child_process').exec;
var fs = require('fs');
var request = require('request');
var Controller = /** @class */ (function (_super) {
    __extends(Controller, _super);
    function Controller() {
        return _super.call(this) || this;
    }
    Controller.prototype.runEvent = function (payload, callback) {
        console.log('run ....', payload);
        if (payload != null) {
            switch (payload.type) {
                case config.EVENT_TYPE.DOWNLOAD_EVENT:
                    {
                        downloadFile(payload, callback);
                    }
                    break;
                case config.EVENT_TYPE.UNZIP_EVENT:
                    {
                        unzipFile(payload)
                            .then(function (data) {
                            callback({
                                state: config.MSG_TYPE.DATA,
                                payload: {
                                    'id': payload.id,
                                    'type': config.EVENT_TYPE.UNZIP_EVENT,
                                    'data': "解压成功"
                                }
                            });
                        })["catch"](function (error) {
                            callback({
                                state: config.MSG_TYPE.ERROR,
                                payload: {
                                    'id': payload.id,
                                    'type': config.EVENT_TYPE.UNZIP_EVENT,
                                    'data': error
                                }
                            });
                        });
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
    return Controller;
}(events_1.EventEmitter));
exports.Controller = Controller;
var download_queue = new Controller();
download_queue.on('RUN_EVENT', function (payload) {
    download_queue.runEvent(payload, download_cb);
});
process.on('message', function (data) {
    download_queue.emit('RUN_EVENT', data);
});
function download_cb(data) {
    process.send(data);
}
function downloadFile(option, callback) {
    var downloadCallback = callback;
    var receivedBytes = 0;
    var totalBytes = 0;
    var req = request({
        method: 'GET',
        uri: option.url
    });
    var out;
    try {
        out = fs.createWriteStream(option.path);
    }
    catch (error) {
        console.log(error);
    }
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
function unzipFile(payload) {
    return new Promise(function (resolve, reject) {
        if (fs.existsSync(payload.path)) {
            fs.createReadStream(payload.path)
                .on('error', function (err) {
                reject(err);
            })
                .on('end', function () {
                if (fs.existsSync(payload.id)) {
                    if (config.platform !== 'win') {
                        console.log('start chmod');
                        exec("chmod -R 755 " + payload.id, function (error) {
                            if (error)
                                console.log(error);
                            reject(error);
                        });
                    }
                    resolve('Done');
                }
                else {
                    reject('path not found!');
                }
            })
                .pipe(unzip.Extract({ path: payload.id }));
        }
        else {
            reject('resource not found!');
        }
    });
}
