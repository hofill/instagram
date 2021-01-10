import { Component, OnInit } from '@angular/core';
import { UserData } from "../../assets/InstagramUser";
declare let window: Window;
declare global {
  interface Window {
    process: any;
    require: any;
  }
}

@Component({
  selector: 'app-login-list',
  templateUrl: './login-list.component.html',
  styleUrls: ['./login-list.component.scss']
})
export class LoginListComponent implements OnInit {

  accounts;
  ipcRenderer = window.require('electron').ipcRenderer;

  constructor() { }

  ngOnInit(): void {
    this.getAccounts().then();
    console.log(this.accounts);
  }

  async getAccounts(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore

    this.accounts = await this.ipcRenderer.invoke('get_accounts');
  }

  async loginAccount(account: UserData): Promise<void> {
    await this.ipcRenderer.invoke('login_saved_account', account);
  }
}
