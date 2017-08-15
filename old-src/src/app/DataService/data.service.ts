import {Injectable} from "@angular/core";
import {DaoUtil} from "../../dao/dao.util";
import {API} from "../../api/api.const";
import "rxjs/add/operator/map";
import {Observable} from "rxjs/Observable";

@Injectable()
export class DataService {

  constructor(private dao: DaoUtil) {
  }

  getResource(url): Observable<any> {
    let source = this.dao.get(url)
      .map(res => res.json());

    return this.toObservable(source);
  }

  mkdir(path: string): Observable<any> {
    let source = this.dao.get(API.getAPI("mkdir")(path))
      .map(res => res.json());

    return this.toObservable(source);
  }

  deleteFile(path: string): Observable<any> {
    let source = this.dao.get(API.getAPI("delete")(path))
      .map(res => res.json());

    return this.toObservable(source);
  }

  private static processSource(path, contents) {
    contents.forEach(content => {
      content.path = path + '/' + content.name;
      if (content.contents !== null) {
        DataService.processSource(content.path, content.contents);
      }
    });
  }

  toObservable(source): Observable<any> {
    return new Observable<any>(observer => {
      source.subscribe(ret => {
        if (ret.code !== 20000) {
          alert(ret.body);
        } else {
          DataService.processSource('', ret.body);
          observer.next({
            name: 'root',
            path: '/',
            contents: ret.body,
            directory: true
          });
          observer.complete();
        }
      });
    });
  };

  private static selectedSourcePaths = [];

  static selectSource(sourcePath) {
    DataService.selectedSourcePaths.push(sourcePath);
  }

  static unSelectSource(sourcePath) {
    DataService.selectedSourcePaths = DataService.selectedSourcePaths.filter(path => {
      return path !== sourcePath;
    });
  }

  static getSelectedSourcePaths() {
    return DataService.selectedSourcePaths;
  }

  private static target = null;

  static selectTarget(selected: string) {
    DataService.target = selected;
  }

  static getSelectedTargetPath(): string {
    return DataService.target;
  }

  copy(srcPaths: Array<string>, destPath: string) {
    let map = this.dao.post(API.getAPI("copy"), {
      srcPaths: srcPaths,
      destPath: destPath
    }).map(res => res.json());

    return this.toObservable(map);
  }
}
