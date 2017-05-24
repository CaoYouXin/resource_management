import {environment} from "../environments/environment";

export class API {

  static mode = environment.production ? 'prod' : 'dev';
  static api = {
    "source": {
      "prod": "/resources/list/source",
      "dev": "http://localhost:8080/resources/list/source"
    },
    "resource": {
      "prod": "/resources/list/resource",
      "dev": "http://localhost:8080/resources/list/resource"
    },
    "mkdir": {
      "prod": function (path) {
        return `/resources/file/mkdir?path=${path}`;
      },
      "dev": function (path) {
        return `http://localhost:8080/resources/file/mkdir?path=${path}`;
      }
    },
    "delete": {
      "prod": function (path) {
        return `/resources/file/delete?path=${path}`;
      },
      "dev": function (path) {
        return `http://localhost:8080/resources/file/delete?path=${path}`;
      }
    },
    "copy": {
      "prod": "/resources/file/copy",
      "dev": "http://localhost:8080/resources/file/copy"
    },
    "GetResourceLevel": {
      "prod": "/resources/level/list",
      "dev": "http://localhost:8080/resources/level/list"
    },
    "SaveResourceLevel": {
      "prod": "/resources/level/save",
      "dev": "http://localhost:8080/resources/level/save"
    },
    "DeleteResourceLevel": {
      "prod": "/resources/level/delete",
      "dev": "http://localhost:8080/resources/level/delete"
    },
    "GetLeveledResource": {
      "prod": "/resources/level/list",
      "dev": "http://localhost:8080/resources/leveled/resource/list"
    },
    "SaveLeveledResource": {
      "prod": "/resources/level/save",
      "dev": "http://localhost:8080/resources/leveled/resource/save"
    },
    "DeleteLeveledResource": {
      "prod": "/resources/level/delete",
      "dev": "http://localhost:8080/resources/leveled/resource/delete"
    }
  };

  static getAPI(name: string) {
    return API.api[name][API.mode];
  }

}
