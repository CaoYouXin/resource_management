import {environment} from "../environments/environment";

export class API {

  static mode = environment.production ? 'prod' : 'dev';
  static api = {
    "source": {
      "prod": "/list/source",
      "dev": "http://localhost:8082/list/source"
    },
    "resource": {
      "prod": "/list/resource",
      "dev": "http://localhost:8082/list/resource"
    },
    "mkdir": {
      "prod": function (path) {
        return `/file/mkdir?path=${path}`;
      },
      "dev": function (path) {
        return `http://localhost:8082/file/mkdir?path=${path}`;
      }
    },
    "delete": {
      "prod": function (path) {
        return `/file/delete?path=${path}`;
      },
      "dev": function (path) {
        return `http://localhost:8082/file/delete?path=${path}`;
      }
    },
    "copy": {
      "prod": "/file/copy",
      "dev": "http://localhost:8082/file/copy"
    },
    "GetResourceLevel": {
      "prod": "/level/list",
      "dev": "http://localhost:8082/level/list"
    },
    "SaveResourceLevel": {
      "prod": "/level/save",
      "dev": "http://localhost:8082/level/save"
    },
    "DeleteResourceLevel": {
      "prod": "/level/delete",
      "dev": "http://localhost:8082/level/delete"
    },
    "GetLeveledResource": {
      "prod": "/leveled/resource/list",
      "dev": "http://localhost:8082/leveled/resource/list"
    },
    "SaveLeveledResource": {
      "prod": "/leveled/resource/save",
      "dev": "http://localhost:8082/leveled/resource/save"
    },
    "DeleteLeveledResource": {
      "prod": "/leveled/resource/delete",
      "dev": "http://localhost:8082/leveled/resource/delete"
    }
  };

  static getAPI(name: string) {
    return API.api[name][API.mode];
  }

}
