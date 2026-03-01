import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './MAIN/home/home';
import { Projects } from './PROJECT/projects/projects';
import { Hero } from './hero/hero';
import { Projectsfilter } from './PROJECT/projectsfilter/projectsfilter';

const routes: Routes = [
  {path:'', component:Home},
  {path:'projects', component:Projects},
  {path:"hero", component:Hero},
  {path:"projectsfilter", component:Projectsfilter}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
