import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Navigation } from './navigation/navigation';
import { Home } from './MAIN/home/home';
import { Footer } from './footer/footer';
import { Projects } from './PROJECT/projects/projects';
import { Hero } from './MAIN/hero-folder/hero/hero';

@NgModule({
  declarations: [
    App,
    Navigation,
    Home,
    Footer,
    Projects,
    Hero,
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
