import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './MAIN/home/home';
import { Projects } from './PROJECT/projects/projects';
import { Hero } from './MAIN/hero-folder/hero/hero';

const routes: Routes = [
  {path:'', component:Home},
  {path:'projects', component:Projects},
  {path:"hero", component:Hero}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
