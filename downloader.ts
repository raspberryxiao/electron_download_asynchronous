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
const fs = require('fs');
const request = require('request')

 export class DOWNLOAD_QUEUE extends EventEmitter{
  EVENT_QUEUE: config.EVENT_ITEM[];
  QUEUE_LENGTH: number;
  MAX_LENGTH: number;
  constructor() {
    super();
    this.EVENT_QUEUE = [];
    this.QUEUE_LENGTH = 0;
    this.MAX_LENGTH = 10;
  }

  public push(payload: config.EVENT_ITEM_PAYLOAD){
    if (this.QUEUE_LENGTH < this.MAX_LENGTH) {
      let event_item:config.EVENT_ITEM = {
        state: config.EVENT_STATE.PUSE,
        payload: payload,
      }
      this.EVENT_QUEUE.push(event_item);
      this.QUEUE_LENGTH++;
      return 0;
    } else {
      return -1;
    }
  }
  
  public pop(){
    if (this.QUEUE_LENGTH == 0) {
      return null;
    } else {
      //console.log('pop out ...',this.QUEUE_LENGTH)
        this.EVENT_QUEUE[0].state = config.EVENT_STATE.READY;
        const return_item = this.EVENT_QUEUE.shift();
        this.QUEUE_LENGTH --;
        //console.log('left  length ==> ',this.QUEUE_LENGTH)
      return return_item;
    }
  }

  public length(){
    return this.QUEUE_LENGTH;
  }

  public addEvent(data: config.EVENT_ITEM_PAYLOAD){
    !this.push(data) ? this.emit('RUN_EVENT', data) : console.log('error');
  }

  public runEvent(item: config.EVENT_ITEM, callback){
    console.log('run ....',item)
    if (item != null &&
        item.state == config.EVENT_STATE.READY) {
          console.log('run into ...')
          switch ( item.payload.type ) {
            case config.EVENT_TYPE.DOWNLOAD_EVENT:{
              item.state = config.EVENT_STATE.RUN;
              console.log(item);
              downloadFile(item.payload, callback);
            }break;
            case config.EVENT_TYPE.UNZIP_EVENT:{
      
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

download_queue.on('RUN_EVENT', ()=>{
  console.log(download_queue.QUEUE_LENGTH)
  if (download_queue.QUEUE_LENGTH > 0) {
    console.log('run item ...')
    const item_run = download_queue.pop();
     if (item_run != null){
      download_queue.runEvent(item_run,download_cb);
     }
  }
})

download_queue.on('ADD_EVENT', (data)=>{
  download_queue.addEvent(data);

})

/**
 *  process_part
 *  [user_action] -> process_part()  -> add/delete_event() -> run_event()
 * 
 */
process.on('message', function(data: config.EVENT_ITEM_PAYLOAD) {
  console.log('start process .....');
  download_queue.emit('ADD_EVENT', data);
});

function download_cb(data){
  console.log('send process data ... ', data)
  process.send(data);
}

function downloadFile(option, callback) {//patchUrl, baseDir,
  console.log('start downloading .....');
  let downloadCallback = callback; 
  let receivedBytes = 0;
  let totalBytes = 0;

   const req = request({
    method: 'GET',
    uri: option.url
  });

  const out = fs.createWriteStream(option.path);
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

function unzipFile(option, callback){
  console.log('unzipFile ...');
}