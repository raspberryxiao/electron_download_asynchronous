"use strict";

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

import { EventEmitter } from "events";
import * as config from './appconfig';
const unzip = require('unzip-stream');
const { exec } = require('child_process');
const fs = require('fs');
const request = require('request')

 export class DOWNLOAD_QUEUE extends EventEmitter{

  constructor() {
    super();
  }

  public runEvent(payload: config.EVENT_ITEM, callback){
    console.log('run ....',payload)
    if (payload != null) {
          switch ( payload.type ) {
            case config.EVENT_TYPE.DOWNLOAD_EVENT:{
              downloadFile(payload, callback);
            }break;
            case config.EVENT_TYPE.UNZIP_EVENT:{
              unzipFile(payload)
              .then((data)=>{
                callback({
                  state: config.MSG_TYPE.DATA,
                  payload: {
                    'id': payload.id, 
                    'type': config.EVENT_TYPE.UNZIP_EVENT, 
                    'data': "解压成功"
                  }
                })
              })
              .catch((error)=>{
                callback({
                  state: config.MSG_TYPE.ERROR,
                  payload: {
                    'id': payload.id, 
                    'type': config.EVENT_TYPE.UNZIP_EVENT, 
                    'data': error
                  }
                })
              })
            }break;
            case config.EVENT_TYPE.DELETE_EVENT:{
      
            }break;
            case config.EVENT_TYPE.UPDATE_EVENT:{
      
            }break;
            case config.EVENT_TYPE.OPENPATH_EVENT:{
      
            }break;
            default: break;
      }
    }
  }
 }

let download_queue = new DOWNLOAD_QUEUE();

download_queue.on('RUN_EVENT', (payload)=>{
  download_queue.runEvent(payload,download_cb);
})

process.on('message', function(data: config.EVENT_ITEM) {
  download_queue.emit('RUN_EVENT', data);
});

function download_cb(data){
  process.send(data);
}

function downloadFile(option, callback) {//patchUrl, baseDir,
  let downloadCallback = callback; 
  let receivedBytes = 0;
  let totalBytes = 0;

   const req = request({
    method: 'GET',
    uri: option.url
  });

  let out;
  try {
    out = fs.createWriteStream(option.path);
  } catch (error) {
    console.log(error);
  }
  req.pipe(out);

  req.on('response', (data) => {
    totalBytes = parseInt(data.headers['content-length'], 10);
  });

  req.on('data', (chunk) => {
    receivedBytes += chunk.length;
    let progress = (receivedBytes * 100) / totalBytes;
    downloadCallback({
      state: config.MSG_TYPE.DATA,
      payload: {
        'id': option.id, 
        'type': config.EVENT_TYPE.DOWNLOAD_EVENT, 
        'data': progress
      }
    });
  });

  req.on('end', () => {
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

  req.on('error', (error) => {
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

function unzipFile(payload){
  return new Promise((resolve, reject) => {
    if (fs.existsSync(payload.path)){
      fs.createReadStream(payload.path)
        .on('error', (err) => {
          reject(err);
        })
        .on('end', () => {
          if (fs.existsSync(payload.id)) {
            if (config.platform !== 'win') {
              console.log('start chmod');
              exec(`chmod -R 755 ${payload.id}`, (error) => {
                if (error) console.log(error);
                reject(error);
              });
            }
            resolve('Done');
          } else {
            reject('path not found!');
          }
        })
        .pipe(unzip.Extract({ path: payload.id }))
    } else {
      reject('resource not found!');
    }
    
  })
}