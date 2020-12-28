import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import { UserData } from "./src/assets/InstagramUser";
import * as path from 'path';
import * as electron from "electron";

const pup = require("puppeteer-extra");
const puppeteer_stealth = require("puppeteer-extra-plugin-stealth");

export class InstagramAPI {

  browser: any = null;
  page: any = null;
  browserOptions: any;
  loginURL = "https://www.instagram.com/accounts/login/?next=%2Flogin%2F&source=desktop_nav";
  userDataPath: any = (electron.app || electron.remote.app).getPath('userData');
  userFile: any = path.join(this.userDataPath, "users.json");


  constructor() {

    this.browserOptions = {
      headless: false,
      devtools: false,
    };
  }

  //:TODO change return type
  readUsers(): any {
    fs.readFile(this.userFile, "utf8", (err, data) => {
      if (err) {
        return false;
      } else {
        const JSONData = JSON.parse(data);
        console.log(JSONData);
      }
    });
  }

  isSavedUser(username: string): boolean {
    const allUsers = this.readUsers();
    for(const user of allUsers) {
      if(user.username == username) return false;
    }
    return true;
  }

  //:TODO change to append to JSON, then write everything to file
  writeUser(userData: UserData): boolean {
    const userJSON = JSON.stringify(userData);
    let allUsers = this.readUsers();
    fs.writeFile(this.userFile, userJSON, "utf8", () => {
      return false;
    });
    return true;
  }

  // let loginCookies = {};
  async startPuppeteer(): Promise<void> {
    pup.use(puppeteer_stealth());
    this.browserOptions.executablePath = puppeteer.executablePath();
    this.browser = await pup.launch(this.browserOptions);
    this.page = await this.browser.newPage();
  }

  // async isLoggedIn(name: string): Promise<boolean> {
  //   // const userDataPath = (electron.app || electron.remote.app).getPath('userData');
  //
  //   return true;
  // }

  async login(username: string, password: string): Promise<void> {
    // not needed, i just love objects
    const loginData = {
      username: username,
      password: password
    };

    this.readUsers();

    if (!this.page) {
      console.log("starting puppeteer");
      await this.startPuppeteer();
    }

    if (!this.page) {
      console.log("failed to load puppeteer");
      return;
    }

    await this.page.goto(this.loginURL, {
      waitUntil: "networkidle2"
    });

    // await this.page.setCookie(...cookiesGiven);
    // await this.page.reload();

    await this.page.waitForXPath("//button[.='Accept']");

    const cookieButton = await this.page.$x("//button[.='Accept']");
    cookieButton[0].click();

    await this.page.waitForTimeout(1000);

    await this.page.waitForSelector("input[name=username]");
    await this.page.type("input[name=username]", loginData.username);

    await this.page.waitForTimeout(100);
    await this.page.type("input[name=password]", loginData.password);

    const loginButton = await this.page.$x("//button[@type='submit']");
    loginButton[0].click();

    await this.page.waitForXPath("//img[@data-testid='user-avatar']");
    const pageData = await this.page.content();
    const regexUsername = /<img alt="([a-z0-9_\-.]{2,30})'s profile picture"/g;
    const pageUsername = regexUsername.exec(pageData);
    // console.log(pageUsername[1]);
    await this.page.goto("https://instagram.com/" + pageUsername[1]);


    // const userData = new UserData(pageUsername[1], await this.page.cookies(), null);

    this.page.on('response', response => {
      if (response.request.resourceType == 'xhr') {
        console.log(response.body);
      }
    });

  }


}
