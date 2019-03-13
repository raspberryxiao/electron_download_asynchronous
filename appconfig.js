"use strict";
exports.__esModule = true;
var EVENT_STATE;
(function (EVENT_STATE) {
    EVENT_STATE[EVENT_STATE["READY"] = 0] = "READY";
    EVENT_STATE[EVENT_STATE["RUN"] = 1] = "RUN";
    EVENT_STATE[EVENT_STATE["PUSE"] = 2] = "PUSE";
    EVENT_STATE[EVENT_STATE["DONE"] = 3] = "DONE";
})(EVENT_STATE = exports.EVENT_STATE || (exports.EVENT_STATE = {}));
var EVENT_TYPE;
(function (EVENT_TYPE) {
    EVENT_TYPE[EVENT_TYPE["DOWNLOAD_EVENT"] = 0] = "DOWNLOAD_EVENT";
    EVENT_TYPE[EVENT_TYPE["UNZIP_EVENT"] = 1] = "UNZIP_EVENT";
    EVENT_TYPE[EVENT_TYPE["DELETE_EVENT"] = 3] = "DELETE_EVENT";
    EVENT_TYPE[EVENT_TYPE["UPDATE_EVENT"] = 4] = "UPDATE_EVENT";
    EVENT_TYPE[EVENT_TYPE["OPENPATH_EVENT"] = 5] = "OPENPATH_EVENT";
})(EVENT_TYPE = exports.EVENT_TYPE || (exports.EVENT_TYPE = {}));
var MSG_TYPE;
(function (MSG_TYPE) {
    MSG_TYPE[MSG_TYPE["DATA"] = 1] = "DATA";
    MSG_TYPE[MSG_TYPE["ERROR"] = 2] = "ERROR";
})(MSG_TYPE = exports.MSG_TYPE || (exports.MSG_TYPE = {}));
// export enum ACTION_TYPE { 
//         DOWNLOAD = 1, 
//         UNZIP = 2,
//         DELETE = 3,
//         UPDATE = 4,
//         OPENPATH = 5,
//     }
//====================================
var RES_PATH;
(function (RES_PATH) {
    RES_PATH["latest_yml"] = "http://localhost/hardware/agent/resources/latest.yml";
    RES_PATH["latest_mac_yml"] = "http://localhost/hardware/agent/resources/latest-mac.yml";
    RES_PATH["arduino_builder_mac"] = "http://localhost/hardware/agent/resources/arduino-builder.mac.zip";
    RES_PATH["arduino_builder_win"] = "http://localhost/hardware/agent/resources/arduino-builder.win.zip";
    RES_PATH["download_path"] = "downloads";
    //arduino_builder_win = 'http://172.16.5.121/resources/codemao-hardware-agent-1.3.0.deb',
})(RES_PATH = exports.RES_PATH || (exports.RES_PATH = {}));
if (process.platform === 'darwin')
    exports.platform = 'mac';
if (process.platform === 'win32')
    exports.platform = 'win';
if (process.platform === 'linux')
    exports.platform = 'linux';
