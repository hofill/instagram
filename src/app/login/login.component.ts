import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  ipcRenderer = window.require('electron').ipcRenderer;
  successfulLogin = null;

  constructor() {
  }

  ngOnInit(): void {
  }

  async onSubmit(form: NgForm): Promise<void> {
    const email = form.value.email;
    const password = form.value.pass;
    this.successfulLogin = await this.ipcRenderer.invoke('login_attempt', { email: email, password: password });
  }
}
