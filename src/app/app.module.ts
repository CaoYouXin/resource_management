import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";

import {AppComponent} from "./app.component";
import {FileBrowserComponent} from "./filebrowser/component";
import {FileBrowserMenuComponent} from "./filebrowser/menu/component";
import {SmartTableComponent} from "./smarttable/component";

@NgModule({
  declarations: [
    AppComponent,
    FileBrowserComponent,
    FileBrowserMenuComponent,
    SmartTableComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
