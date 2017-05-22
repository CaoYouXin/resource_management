import {Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild} from "@angular/core";

@Component({
  selector: 'resource-file',
  templateUrl: './ResourceFile.component.html',
  styleUrls: ['./ResourceFile.component.css']
})
export class ResourceFileComponent implements OnInit, OnChanges {

  @Input()
  data: any;

  @Input()
  inputOuterWidth: number;

  @Output()
  widthEvent = new EventEmitter();

  @ViewChild("line")
  line: ElementRef;

  innerWidthed: number;
  outerWidthed: string;
  maxInnerWidth: number;

  simplify = false;
  fontSize = 16;

  ngOnInit() {
    let value = this.line.nativeElement.offsetWidth + 90;
    if (value > this.inputOuterWidth) {
      this.outerWidthed = value + 'px';
      this.widthEvent.emit(value);
    }
  }

  ngOnChanges(rd) {
    if (rd.inputOuterWidth) {
      if (this.innerWidthed + 20 < rd.inputOuterWidth.currentValue) {
        this.outerWidthed = rd.inputOuterWidth.currentValue + 'px';
        this.innerWidthed = rd.inputOuterWidth.currentValue - 20;
      }
    }
  }

  fontSized() {
    return this.fontSize + 'px';
  }

  widthResize(innerWidth) {
    if (innerWidth > this.maxInnerWidth) {
      this.maxInnerWidth = innerWidth;
      this.innerWidthed = innerWidth;
      this.outerWidthed = (innerWidth + 20) + 'px';
      this.widthEvent.emit(innerWidth + 20);
    }
  }

  toggleHeight() {
    if (this.data.contents.length === 0) {
      return;
    }

    this.simplify = !this.simplify;
  }

}
