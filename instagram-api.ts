import * as puppeteer from 'puppeteer';
const fs = require('fs');
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

  readUsers(): UserData[] {
    const allUsers: UserData[] = [];
    let JSONData: JSON = null;
    let data;
    try {
      data = fs.readFileSync(this.userFile, "utf8");
    } catch (err) {
      return allUsers;
    }
    JSONData = JSON.parse(data);
    for (const user of JSONData['users']) {
      const userAdded = new UserData(null, null, null);
      userAdded.applySelf(user);
      allUsers.push(userAdded);
    }
    return allUsers;
  }

  isSavedUser(username: string): boolean {
    const allUsers = this.readUsers();
    if (!allUsers) return false;
    for (const user of allUsers) {
      if (user.username === username) return false;
    }
    return true;
  }

  writeUser(userData: UserData): boolean {
    if (this.isSavedUser(userData.username)) return false;
    let allUsers: UserData[] = this.readUsers();
    if (!allUsers) allUsers = [];
    allUsers.push(userData);
    const allUsersObject = { "users": allUsers };
    try {
      fs.writeFileSync(this.userFile, JSON.stringify(allUsersObject), "utf8");
    } catch (err) {
      return false;
    }
    return true;
  }

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

  async login(username: string, password: string, isLoggedIn = false, user = null): Promise<void> {
    // not needed, i just love objects
    const loginData = {
      username: username,
      password: password
    };

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
