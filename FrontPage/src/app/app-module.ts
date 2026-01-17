import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Navigation } from './navigation/navigation';
import { Home } from './home/home';
import { Footer } from './footer/footer';
import { Projects } from './PROJECT/projects/projects';

@NgModule({
  declarations: [
    App,
    Navigation,
    Home,
    Footer,
    Projects
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }
