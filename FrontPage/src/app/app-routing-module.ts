import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './home/home';
import { Projects } from './PROJECT/projects/projects';

const routes: Routes = [
  {path:'', component:Home},
  {path:'projects', component:Projects}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
