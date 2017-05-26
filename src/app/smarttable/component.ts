import {Component, ElementRef, Input, OnInit, ViewChild} from "@angular/core";
import {DaoUtil} from "../../dao/dao.util";
import "rxjs/add/operator/map";

@Component({
  selector: 'smart-table',
  templateUrl: './component.html',
  styleUrls: ['./component.css'],
  providers: [DaoUtil]
})
export class SmartTableComponent implements OnInit {

  @Input()
  template: any;

  editorId: string;
  comboId: string;

  data: Array<any>;
  combos: Array<any>;

  editorVisibility: string;
  editorTop: string;
  editorLeft: string;

  comboVisibility: string;
  comboTop: string;
  comboLeft: string;

  selectAll: boolean;
  comboKey: string;
  comboValue: string;
  comboTarget: string;
  comboCol: string;

  dataCheck = [];
  editor = [];
  editing = false;
  comboing = false;

  constructor(private dao: DaoUtil) {
  }

  ngOnInit() {
    this.editorId = this.template.editorId;
    this.comboId  = this.template.comboId;

    const self = this;
    this.dao.get(this.template.fetchUrl)
      .map(res => res.json())
      .subscribe(ret => {
        if (ret.code !== 20000) {
          alert(ret.body);
          return;
        }

        self.data = ret.body;
      });
  }

  callEditor() {
    this.editorVisibility = 'hidden';
    this.editing = true;
    setTimeout(function (self) {
      let elementById = document.getElementById(self.editorId);
      self.editorLeft = 'calc(50% - ' + (elementById.offsetWidth / 2) +  'px)';
      self.editorTop = 'calc(50% - ' + (elementById.offsetHeight / 2) +  'px)';
      self.editorVisibility = 'visible';
    }, 200, this);
  }

  callCombo() {
    this.comboVisibility = 'hidden';
    this.comboing = true;
    setTimeout(function (self) {
      let elementById = document.getElementById(self.comboId);
      self.comboLeft = 'calc(50% - ' + (elementById.offsetWidth / 2) +  'px)';
      self.comboTop = 'calc(50% - ' + (elementById.offsetHeight / 2) +  'px)';
      self.comboVisibility = 'visible';
    }, 200, this);
  }

  add(e) {
    this.editor = [];
    this.callEditor();
  }

  modify(e) {
    let rowId = this.dataCheck.reduce((p, v, i) => {
      if (p < 0 && v) {
        return i;
      }
      return p;
    }, -1);

    if (rowId < 0) {
      return;
    }

    this.template.cols.forEach((col, index) => {
      this.editor[index] = this.data[rowId][col.name];
    });

    this.callEditor();
  }

  deleteA() {
    const deleteIds = [];
    this.dataCheck.forEach((check, index) => {
      if (check) {
        deleteIds.push(this.data[index][this.template.key]);
      }
    });

    const self = this;
    this.dao.post(this.template.deleteUrl, {
      ids: deleteIds
    }).map(res => res.json())
      .subscribe(ret => {
        if (ret.code !== 20000) {
          alert(ret.body);
          return;
        }

        self.data = ret.body;
      });
  }

  submit() {
    const self = this;
    const postData = {};
    this.template.cols.forEach((col, index) => {
      if (!!col.combo) {
        return;
      }
      postData[col.name] = this.editor[index] === undefined ? null : this.editor[index];
    });

    self.dao.post(self.template.saveUrl, postData)
      .map(res => res.json())
      .subscribe(ret => {
        if (ret.code !== 20000) {
          alert(ret.body);
          self.editing = false;
          return;
        }

        self.data = ret.body;
        self.editing = false;
      });
  }

  cancel() {
    this.editing = false;
  }

  dataCheckChange(e) {
    for (let i = 0; i < this.data.length; i++) {
      this.dataCheck[i] = e.target.checked;
    }
  }

  dataCheckInRowChange(e) {
    if (!e.target.checked) {
      this.selectAll = false;
    }
  }

  editorFocus(col) {
    if (!col.combo) {
      return;
    }

    this.comboKey = col.key;
    this.comboValue = col.value;
    this.comboTarget = col.combo;
    this.comboCol = col.name;

    const self = this;
    this.dao.get(col.url)
      .map(res => res.json())
      .subscribe(ret => {
        if (ret.code !== 20000) {
          alert(ret.body);
          return;
        }

        self.combos = ret.body;
        self.callCombo();
      });
  }

  comboClick(combo) {
    const self = this;
    this.template.cols.forEach((col, index) => {
      if (col.name === self.comboTarget) {
        this.editor[index] = combo[self.comboKey];
      }

      if (col.name === self.comboCol) {
        this.editor[index] = combo[self.comboValue];
      }
    });

    this.comboing = false;
  }

}
