import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './MAIN/home/home';
import { Projectsfilter } from './PROJECT/projectsfilter/projectsfilter';

const routes: Routes = [
  {path:'', component:Home},
  {path:'projects', component:Projectsfilter},
  {path:'projectsfilter', redirectTo: 'projects'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
