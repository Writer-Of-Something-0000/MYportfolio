import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Navigation } from './navigation/navigation';
import { Home } from './MAIN/home/home';
import { Footer } from './footer/footer';
import { Projects } from './PROJECT/projects/projects';
import { Hero } from './hero/hero';
import { CursorInteractive } from './cursor-interactive/cursor-interactive';
import { Experience } from './MAIN/experience/experience';
import { Selectedworks } from './MAIN/selectedworks/selectedworks';
import { Education } from './MAIN/education/education';
import { Skills } from './MAIN/skills/skills';

@NgModule({
  declarations: [
    App,
    Navigation,
    Home,
    Footer,
    Projects,
    Hero,
    CursorInteractive,
    Experience,
    Selectedworks,
    Education,
    Skills,
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
