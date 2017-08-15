import {environment} from "../environments/environment";

export class API {

  static mode = environment.production ? 'prod' : 'dev';
  static api = {
    "source": {
      "prod": "http://server.caols.tech:9002/list/source",
      "dev": "http://localhost:8082/list/source"
    },
    "resource": {
      "prod": "http://server.caols.tech:9002/list/resource",
      "dev": "http://localhost:8082/list/resource"
    },
    "mkdir": {
      "prod": function (path) {
        return `http://server.caols.tech:9002/file/mkdir?path=${path}`;
      },
      "dev": function (path) {
        return `http://localhost:8082/file/mkdir?path=${path}`;
      }
    },
    "delete": {
      "prod": function (path) {
        return `http://server.caols.tech:9002/file/delete?path=${path}`;
      },
      "dev": function (path) {
        return `http://localhost:8082/file/delete?path=${path}`;
      }
    },
    "copy": {
      "prod": "http://server.caols.tech:9002/file/copy",
      "dev": "http://localhost:8082/file/copy"
    },
    "GetResourceLevel": {
      "prod": "http://server.caols.tech:9002/level/list",
      "dev": "http://localhost:8082/level/list"
    },
    "SaveResourceLevel": {
      "prod": "http://server.caols.tech:9002/level/save",
      "dev": "http://localhost:8082/level/save"
    },
    "DeleteResourceLevel": {
      "prod": "http://server.caols.tech:9002/level/delete",
      "dev": "http://localhost:8082/level/delete"
    },
    "GetLeveledResource": {
      "prod": "http://server.caols.tech:9002/leveled/resource/list",
      "dev": "http://localhost:8082/leveled/resource/list"
    },
    "SaveLeveledResource": {
      "prod": "http://server.caols.tech:9002/leveled/resource/save",
      "dev": "http://localhost:8082/leveled/resource/save"
    },
    "DeleteLeveledResource": {
      "prod": "http://server.caols.tech:9002/leveled/resource/delete",
      "dev": "http://localhost:8082/leveled/resource/delete"
    }
  };

  static getAPI(name: string) {
    return API.api[name][API.mode];
  }

}
