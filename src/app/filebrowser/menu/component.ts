import {
  AfterContentInit, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit,
  Output, ViewChild
} from "@angular/core";

@Component({
  selector: 'file-browser-menu',
  templateUrl: './component.html',
  styleUrls: ['./component.css']
})
export class FileBrowserMenuComponent implements OnChanges, OnDestroy {

  @Input()
  menuItems: Array<any>;

  @Input()
  show: boolean;

  @Input()
  top: string;

  @Input()
  left: string;

  @Input()
  clipboard: string;

  @Output()
  msg = new EventEmitter();

  @ViewChild('clip')
  clipElem: ElementRef;

  private clipboardObj = null;

  ngOnChanges(cr): void {
    if (cr.show && cr.show.currentValue && null === this.clipboardObj) {
      setTimeout(function (self) {
        self.clipElem.nativeElement.setAttribute('data-clipboard-text', self.clipboard);
        self.clipboardObj = new window['Clipboard']('.clip');

        self.clipboardObj.on('success', function(e) {
          e.clearSelection();
          self.msg.emit('exit');
        });
      }, 1, this);
    }
  }

  ngOnDestroy(): void {
    this.clipboardObj.destroy();
  }

}
