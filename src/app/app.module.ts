import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';


import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { LoginListComponent } from './login/login-list/login-list.component';
import { AccountComponent } from './login/login-list/account/account.component';
import { NewLoginComponent } from './login/new-login/new-login.component';


@NgModule({
  declarations: [AppComponent, LoginComponent, MainComponent, LoginListComponent, AccountComponent, NewLoginComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
