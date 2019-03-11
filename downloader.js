/***
 *  接收 -> {id: process_id, url: DOWNLOAD_TYPE, path: save_path}
 *  发送 -> {id: process_id, type: MSG_TYPE, payload: {xxx}}
 *  process.send({xxx})
 */

const fs = require('fs');
const path = require('path');
const request = require('request');
const {MSG_TYPE} = require('./appconfig')




// const MSG_TYPE = {
//   PROCESS: 1,
//   FINISHED: 2,
//   ERROR: 3
// }

function download_cb(data){
  console.log('send process data ... ', data)
  process.send(data);
}

process.on('message', function(data) {
  console.log('start process .....');
  id = data.id;
  downloadFile(data.url, data.path, download_cb)
});

downloadFile =  function (patchUrl, baseDir, callback) {
  console.log('start downloading .....');
  downloadCallback = callback; 
  receivedBytes = 0;
  totalBytes = 0;
  //let progress;

   const req = request({
    method: 'GET',
    uri: patchUrl
  });

  const out = fs.createWriteStream(baseDir);
  req.pipe(out);

  req.on('response', (data) => {
    totalBytes = parseInt(data.headers['content-length'], 10);
  });

  req.on('data', (chunk) => {
    receivedBytes += chunk.length;
    let progress = (receivedBytes * 100) / totalBytes;
    downloadCallback({
      'id': id, 
      'type': MSG_TYPE.PROCESS, 
      'payload': progress
    });
  });

  req.on('end', () => {
    console.log('下载已完成，等待处理');
    downloadCallback({
      'id': id, 
      'type': MSG_TYPE.FINISHED, 
      'payload': 100
    });
  });

  req.on('error', (error) => {
    console.log(error);
    downloadCallback({
      'id': id, 
      'type': MSG_TYPE.ERROR, 
      'payload': error
    });
  });
}