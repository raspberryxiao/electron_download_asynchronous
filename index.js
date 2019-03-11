const { app, ipcMain, BrowserWindow} = require('electron');

// const request = require('request');
// const progress = require('request-progress');
const {DOWNLOAD_TYPE, zip_remote_path, MSG_TYPE} = require('./appconfig')
const cp = require('child_process');
const child = cp.fork(__dirname + '/downloader.js');
let windows;



// function downloadFileCallback(arg, data)
// {
//     if (arg === "progress")
//     {
//       console.log(data)
//       windows.webContents.send('progress', data);
//     } else if (arg === "finished") {
//       console.log('finished')
//       console.log(data)
//     } else if (arg === 'error') {
//       console.log(data);
//       windows.webContents.send('error', data);
//     }
// }

ipcMain.on('download-zip', (event, arg) => {
    switch ( arg ) {
        case DOWNLOAD_TYPE.ARDUINO_BUILDER: {
          console.log('download-zip => 1')
          child.send({id: 1, url: zip_remote_path.arduino_builder_zip, path: 'test.mac.zip'});
        }break;
        case DOWNLOAD_TYPE.ESP_TOOLS: {
          console.log('start downloading esp-tools');
          
        }break;
        default: { console.log('url invalid');}
    }
})

ipcMain.on('hello', () => {
  console.log('got a hello');
})



/***
 *  发送 -> {id: process_id, url: DOWNLOAD_TYPE, path: save_path}
 *  接收 -> {id: process_id, type: MSG_TYPE, payload: {xxx}}
 */
child.on('message', function(data) {
  switch (data.type) {
    case MSG_TYPE.PROCESS: {
      windows.webContents.send('progress', {'id': data.id, 'progress': data.payload});
    }break;
    case MSG_TYPE.FINISHED: {
      console.log('file downloaded!! => ', data.payload);
    }break;
    case MSG_TYPE.ERROR: {
      console.log('error => ', data.payload);
    }break;
    default: break;
  }
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


