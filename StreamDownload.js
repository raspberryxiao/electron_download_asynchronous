const fs = require('fs');
const path = require('path');
const request = require('request');

let progress, id;

function initDownloader(_id){
  id = _id;
}

// 下载进度
showProgress = function (received, total) {
  progress = (received * 100) / total;
  // 用回调显示到界面上
  downloadCallback('progress', {id, progress});
};


// 下载过程
downloadFile = async function (patchUrl, baseDir, callback) {

  downloadCallback = callback; // 注册回调函数

  let receivedBytes = 0;
  let totalBytes = 0;

  const req = request({
    method: 'GET',
    uri: patchUrl
  });

  const out = fs.createWriteStream(baseDir);//path.join(baseDir));
  req.pipe(out);

  req.on('response', (data) => {
    // 更新总文件字节大小
    totalBytes = parseInt(data.headers['content-length'], 10);
  });

  req.on('data', (chunk) => {
    // 更新下载的文件块字节大小
    receivedBytes += chunk.length;
    showProgress(receivedBytes, totalBytes);
  });

  req.on('end', () => {
    console.log('下载已完成，等待处理');
    // TODO: 检查文件，部署文件，删除文件
    downloadCallback('finished', {id, progress});
  });

  req.on('error', (error) => {
    console.log(error);
    downloadCallback('error', {id, error});
  });
}

module.exports = { initDownloader, downloadFile }