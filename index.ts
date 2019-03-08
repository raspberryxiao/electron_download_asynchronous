const { app, ipcMain, BrowserWindow, webContents } = require('electron');

const request = require('request');
const progress = require('request-progress');
const { zip_remote_path, DOWNLOAD_TYPE } = require('./appconfig')
// const { downloadFile } = require('./StreamDownload')
require('./StreamDownload')
let windows;


function download_event(){
  return  
}

// 定义回调函数
function downloadFileCallback(arg, data)
{
    if (arg === "progress")
    {
      console.log(data)
      windows.webContents.send('progress', data);
        // 显示进度
    } else if (arg === "finished") {
      console.log('finished')
      console.log(data)
        // 通知完成
    } else if (arg === 'error') {
      console.log(data);
      windows.webContents.send('error', data);
    }
}


ipcMain.on('download-zip', (event, arg) => {
    switch ( arg ) {
        case DOWNLOAD_TYPE.ARDUINO_BUILDER: {
          let downloader = require('./StreamDownload');
          downloader.initDownloader(DOWNLOAD_TYPE.ARDUINO_BUILDER);
          downloader.downloadFile(zip_remote_path.arduino_builder_zip, "../arduino-build.mac.zip", downloadFileCallback);
        }break;
        case DOWNLOAD_TYPE.ESP_TOOLS: {
          console.log('start downloading esp-tools');
          let downloader = require('./StreamDownload');
          downloader.initDownloader(DOWNLOAD_TYPE.ESP_TOOLS);
          downloader.downloadFile(zip_remote_path.arduino_builder_zip, "../esp-tools.mac.zip", downloadFileCallback);
        }break;
        default: { console.log('url invalid');}
    }
})

ipcMain.on('hello', () => {
  console.log('got a hello');
})

app.on('ready', function() {
  windows = new BrowserWindow({ width: 800, height: 800 });
  windows.loadFile('index.html');
  windows.show();
});
