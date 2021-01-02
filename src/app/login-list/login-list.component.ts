import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login-list',
  templateUrl: './login-list.component.html',
  styleUrls: ['./login-list.component.scss']
})
export class LoginListComponent implements OnInit {

  accounts;

  constructor() { }

  ngOnInit(): void {
    this.getAccounts();
    console.log(this.accounts);
  }

  async getAccounts(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const ipcRenderer = window.require('electron').ipcRenderer;
    this.accounts = await ipcRenderer.invoke('get_accounts');
  }

}
