import {Component, OnInit} from "@angular/core";
import {DataService} from "./DataService/data.service";
import {API} from "../api/api.const";
import {DaoUtil} from "../dao/dao.util";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [DataService, DaoUtil]
})
export class AppComponent implements OnInit {
  title = '资源管理';
  sources = null;
  resources = null;
  rootEventMsg = '';

  resourceLevelTemplate = {
    fetchUrl: API.getAPI("GetResourceLevel"),
    saveUrl: API.getAPI("SaveResourceLevel"),
    deleteUrl: API.getAPI("DeleteResourceLevel"),
    cols: [
      {name: 'id', text: 'ID', type: 'number', disabled: true},
      {name: 'name', text: '级别名称', type: 'text'},
      {name: 'msg', text: '级别说明', type: 'text'},
    ],
    key: 'id',
    editorId: 'ResourceLevelEditor',
    comboId: 'ResourceLevelCombo'
  };

  resourceLevelMapTemplate = {
    fetchUrl: API.getAPI("GetLeveledResource"),
    saveUrl: API.getAPI("SaveLeveledResource"),
    deleteUrl: API.getAPI("DeleteLeveledResource"),
    cols: [
      {name: 'id', text: 'ID', type: 'number', disabled: true},
      {name: 'name', text: '资源目录', type: 'text'},
      {name: 'levelId', text: '对应级别ID', type: 'number', disabled: true},
      {name: 'levelName', text: '对应级别名称', type: 'text', combo: 'levelId', key: 'id', value: 'name', url: API.getAPI("GetResourceLevel")},
    ],
    key: 'id',
    editorId: 'ResourceLevelMapEditor',
    comboId: 'ResourceLevelMapCombo'
  };

  constructor(private data: DataService) {
  }

  ngOnInit() {
    this.data.getResource(API.getAPI("source")).subscribe(ret => {
      this.sources = ret;
    });

    this.data.getResource(API.getAPI("resource")).subscribe(ret => {
      this.resources = ret;
    });
  }

  reload(resources) {
    this.resources = null;
    setTimeout(function (self) {
      self.resources = resources;
    }, 1000, this);
  }

  unselect() {
    this.rootEventMsg = Math.random() + '';
  }

  addToResource() {
    if (DataService.getSelectedSourcePaths().length === 0) {
      alert("请选择要添加的文件");
      return;
    }

    if (!Boolean(DataService.getSelectedTargetPath())) {
      alert("请选择要添加到的目录");
      return;
    }

    const self = this;
    this.data.copy(DataService.getSelectedSourcePaths(),
      DataService.getSelectedTargetPath()).subscribe(ret => {
      self.reload(ret);
    });
  }

}
