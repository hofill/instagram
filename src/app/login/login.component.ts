import { Component, OnInit } from '@angular/core';
import { NgForm } from "@angular/forms";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
  }

  onSubmit(form: NgForm) {
    const email = form.value.email;
    const password = form.value.pass;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const ipcRenderer = window.require('electron').ipcRenderer;
    ipcRenderer.send('login_successful', { email: email, password: password });
  }
}
