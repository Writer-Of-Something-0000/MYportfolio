import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './MAIN/home/home';
import { Projectsfilter } from './PROJECT/projectsfilter/projectsfilter';

const routes: Routes = [
  {path:'', component:Home, title:'Luka Gengashvili — Video Editor'},
  {path:'projects', component:Projectsfilter, title:'Projects — Luka Gengashvili'},
  {path:'projectsfilter', redirectTo: 'projects'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
