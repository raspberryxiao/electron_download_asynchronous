import { app, ipcMain, BrowserWindow} from 'electron'

// const request = require('request');
// const progress = require('request-progress');
import * as CONFIG  from'./appconfig'
import * as path from 'path'
const cp  =require('child_process');
const child = cp.fork(__dirname + '/downloader');
let windows;

ipcMain.on('ACTION_MSG', (event, payload) => {
  let option = {
    id: payload.id,
    type: payload.type,
    url: payload.data,
    path: path.join(CONFIG.RES_PATH.download_path,payload.id + '.test.zip'),
  };
  console.log(option);
  child.send(option);
})

ipcMain.on('hello', () => {
  console.log('got a hello');
})


/***
 *  发送 -> {id: process_id, url: DOWNLOAD_TYPE, path: save_path}
 *  接收 -> {id: process_id, type: MSG_TYPE, payload: {xxx}}
 */
child.on('message', function(data) {
  windows.webContents.send('ACTION_MSG', data);
});


app.on('ready', function() {
  windows = new BrowserWindow({ width: 800, height: 800 });
  windows.loadFile('index.html');
  windows.show();

  windows.on('close', (event) =>{
    console.log('closing downloader process ...');
    const exit_dailog = require('electron').dialog; 
    exit_dailog.showMessageBox({
      type: 'warning',
      title: 'WARNING!!',
      message: '将退出软件，下载将会被截止！您确定退出吗？',
      buttons: ['YES', 'NO'],
      // windows 下的关闭窗口返回值设定
      cancelId: 5,
    },(button_index) => {
      switch (button_index) {
        case 0: {
          child.kill();          
        }break;
        case 1: 
        default: event.preventDefault();
      }
    });
  });

    setTimeout(function () {
  clearInterval(i);
  console.log('end');
}, 100000);
  var i = setInterval(function () {
    console.log('ping');
  }, 1000);
});


