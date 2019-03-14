export  interface EVENT_ITEM {
    id: any,
    type: EVENT_TYPE,
    url?: string,
    path?: string,
}
export  enum EVENT_STATE {
    READY = 0,
    RUN = 1,
    PUSE = 2,
    DONE = 3,
  }
export enum EVENT_TYPE {
    DOWNLOAD_EVENT = 0,
    UNZIP_EVENT = 1,
    DELETE_EVENT = 3,
    UPDATE_EVENT = 4,
    OPENPATH_EVENT = 5,
  }
//====================================

export interface ACTION_ITEM_PAYLOAD {
    id: any,
    type: EVENT_TYPE,
    data?: any,
}

export interface ACTION_ITEM {
    state: EVENT_STATE,
    payload: ACTION_ITEM_PAYLOAD,
}

export enum MSG_TYPE{
    DATA = 1,
    ERROR = 2,
}

export enum RES_PATH {
        latest_yml = 'http://localhost/hardware/agent/resources/latest.yml',
        latest_mac_yml = 'http://localhost/hardware/agent/resources/latest-mac.yml',
        arduino_builder_mac = 'http://localhost/hardware/agent/resources/arduino-builder.mac.zip',
        arduino_builder_win = 'http://localhost/hardware/agent/resources/arduino-builder.win.zip',
        download_path = 'downloads',

        //arduino_builder_win = 'http://172.16.5.121/resources/codemao-hardware-agent-1.3.0.deb',
    }
    
export let platform;
if (process.platform === 'darwin') platform = 'mac';
if (process.platform === 'win32') platform = 'win';
if (process.platform === 'linux') platform = 'linux';

