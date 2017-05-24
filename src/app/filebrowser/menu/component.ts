import {Component, EventEmitter, Input, Output} from "@angular/core";

@Component({
  selector: 'file-browser-menu',
  templateUrl: './component.html',
  styleUrls: ['./component.css']
})
export class FileBrowserMenuComponent {

  @Input()
  menuItems: Array<any>;

  @Input()
  show: boolean;

  @Input()
  top: string;

  @Input()
  left: string;

  @Output()
  msg = new EventEmitter();

}
