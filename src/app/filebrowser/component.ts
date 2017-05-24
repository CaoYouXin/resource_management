import {Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild} from "@angular/core";
import {DataService} from "../DataService/data.service";
import {DaoUtil} from "../../dao/dao.util";

@Component({
  selector: 'file-browser',
  templateUrl: './component.html',
  styleUrls: ['./component.css'],
  providers: [DataService, DaoUtil]
})
export class FileBrowserComponent implements OnInit, OnChanges {

  @Input()
  data: any;

  @Input()
  outerWidth: string;

  @Input()
  outerBgColor: string;

  @Input()
  editable: boolean;

  @Input()
  selected: boolean;

  @Input()
  rootEvent: string;

  @Output()
  reloadEvent = new EventEmitter();

  @Output()
  unselectEvent = new EventEmitter();

  @Output()
  widthEvent = new EventEmitter();

  @ViewChild("line")
  line: ElementRef;

  innerWidth: string;
  innerBgColor: string;
  leaf: boolean;
  root: boolean;
  menuTop: string;
  menuLeft: string;
  menuItems: Array<any>;

  innerSelected = false;
  simplify = false;
  maxInnerWidth = 0;
  showMenu = new Promise(res => res(false));

  // ************

  constructor(private dataService: DataService) {
  }

  ngOnInit() {
    this.innerBgColor = 'rgb(' + (200 + ~~(28 * Math.random())) + ',' + (200 + ~~(28 * Math.random())) + ',' + (200 + ~~(28 * Math.random())) + ')';
    this.leaf = !this.data.contents || this.data.contents.length === 0;
    this.root = this.data.path === '/';

    let menuItems = [{key: 'fold', name: 'TOGGLE 折叠'}, {key: 'select', name: 'TOGGLE 选择'}];
    if (this.editable) {
      menuItems.push({key: 'create', name: '创建文件夹'});
      menuItems.push({key: 'delete', name: '删除文件(夹)'});
    }
    this.menuItems = menuItems;

    let width = this.line.nativeElement.offsetWidth + 50;
    let numInnerWidth = parseInt((this.innerWidth || '0').match(/\d+/)[0]);
    if (width > numInnerWidth + 20) {
      this.outerWidth = width + 'px';
      this.maxInnerWidth = width - 20;
      this.innerWidth = this.maxInnerWidth + 'px';
      this.widthEvent.emit(width);
    }
  }

  ngOnChanges(rd) {
    if (rd.outerWidth && rd.outerWidth.currentValue) {
      let numOuterWidth = parseInt(rd.outerWidth.currentValue.match(/\d+/)[0]);
      if (this.maxInnerWidth + 20 < numOuterWidth) {
        this.maxInnerWidth = numOuterWidth - 20;
        this.innerWidth = this.maxInnerWidth + 'px';
      }
    }

    if (rd.rootEvent && rd.rootEvent.currentValue) {
      if (this.editable) {
        this.selected = this.data.path === DataService.getSelectedTargetPath();
      }
    }

    if (rd.selected) {
      if (!this.editable) {
        this.innerSelected = rd.selected.currentValue;

        if (!this.data.directory) {
          if (rd.selected.currentValue) {
            DataService.selectSource(this.data.path);
          } else {
            DataService.unSelectSource(this.data.path);
          }
        }
      }
    }
  }

  // ************

  callMenu(e) {
    this.menuTop = e.pageY + 'px';
    this.menuLeft = e.pageX + 'px';
    this.showMenu = new Promise(res => res(true));
  }

  reload(contents) {
    this.reloadEvent.emit(contents);
  }

  unselect() {
    this.unselectEvent.emit();
  }

  widthResize(innerWidth) {
    if (innerWidth > this.maxInnerWidth) {
      this.maxInnerWidth = innerWidth;
      this.innerWidth = innerWidth + 'px';
      this.outerWidth = (innerWidth + 20) + 'px';
      this.widthEvent.emit(innerWidth + 20);
    }
  }

  handleMenuMsg(msg) {
    const self = this;
    switch (msg) {
      case 'fold':
        if (!this.leaf) {
          this.simplify = !this.simplify;
        }
        this.showMenu = new Promise(res => res(false));
        break;
      case 'select':
        if (this.editable) {
          if (this.data.directory) {
            DataService.selectTarget(this.data.path);
            this.unselectEvent.emit();
          }
        } else {
          this.selected = !this.selected;
          this.innerSelected = this.selected;

          if (!this.data.directory) {
            if (this.selected) {
              DataService.selectSource(this.data.path);
            } else {
              DataService.unSelectSource(this.data.path);
            }
          }
        }

        this.showMenu = new Promise(res => res(false));
        break;
      case 'create':
        let promptResult = prompt("请输入文件夹名称");

        this.dataService.mkdir(this.data.path + (this.data.name === 'root' ? '' : '\/') + promptResult)
          .subscribe(ret => {
            self.reloadEvent.emit(ret);
            self.showMenu = new Promise(res => res(false));
          });
        break;
      case 'delete':
        if (this.data.name === 'root') {
          this.showMenu = new Promise(res => res(false));
          break;
        }

        this.dataService.deleteFile(this.data.path)
          .subscribe(ret => {
            self.reloadEvent.emit(ret);
            self.showMenu = new Promise(res => res(false));
          });
        break;
      default:
        console.log('unknown msg ' + msg);
        break;
    }
  }

}
