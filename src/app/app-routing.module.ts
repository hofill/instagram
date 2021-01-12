import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from "./login/login.component";
import { MainComponent } from "./main/main.component";
import { LoginListComponent } from "./login/login-list/login-list.component";
import { NewLoginComponent } from "./login/new-login/new-login.component";

const routes: Routes = [
  { path: '', redirectTo: 'stats', pathMatch: 'full' },
  { path: 'stats', component: MainComponent},
  { path: 'login-list', component: LoginListComponent},
  { path: 'new-login', component: NewLoginComponent},
  { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
