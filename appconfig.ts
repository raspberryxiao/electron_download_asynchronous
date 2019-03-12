export interface EVENT_ITEM_PAYLOAD {
    id: any,
    type: EVENT_TYPE,
    url?: string,
    path?: string,
} 
export  interface EVENT_ITEM {
    state: EVENT_STATE,
    payload: EVENT_ITEM_PAYLOAD,
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

// export enum ACTION_TYPE { 
//         DOWNLOAD = 1, 
//         UNZIP = 2,
//         DELETE = 3,
//         UPDATE = 4,
//         OPENPATH = 5,
//     }
//====================================

export enum REMOTE_RES {
        latest_yml = 'http://localhost/hardware/agent/resources/latest.yml',
        latest_mac_yml = 'http://localhost/hardware/agent/resources/latest-mac.yml',
        arduino_builder_mac = 'http://localhost/hardware/agent/resources/arduino-builder.mac.zip',
        arduino_builder_win = 'http://localhost/hardware/agent/resources/arduino-builder.win.zip',

        //arduino_builder_win = 'http://172.16.5.121/resources/codemao-hardware-agent-1.3.0.deb',
    }
