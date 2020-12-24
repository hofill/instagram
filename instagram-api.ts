import * as puppeteer from 'puppeteer';
import fs from 'fs';
import { UserData } from "./src/assets/InstagramUser";
const pup = require("puppeteer-extra");
const puppeteer_stealth = require("puppeteer-extra-plugin-stealth");

export class InstagramAPI {

  browser: any = null;
  page: any = null;
  browserOptions: any;
  loginURL = "https://www.instagram.com/accounts/login/?next=%2Flogin%2F&source=desktop_nav";

  constructor() {

    this.browserOptions = {
      headless: false,
      devtools: false,
      ignoreHTTPSErrors: true,
      args: [
        '--no-sandbox',
        '--ignore-certificate-errors',
        '--enable-features=NetworkService',
        '--allow-running-insecure-content',
        '--disable-web-security',
      ],
    };
  }

  async readUsers(): Promise<UserData> {
    return;
  }

  async writeUser(): Promise<boolean> {
    return true;
  }

  // let loginCookies = {};
  async startPuppeteer(): Promise<void> {
    pup.use(puppeteer_stealth());
    this.browserOptions.executablePath = puppeteer.executablePath();
    this.browser = await pup.launch(this.browserOptions);
    this.page = await this.browser.newPage();
  }

  async isLoggedIn(name: string): Promise<boolean> {
    // const userDataPath = (electron.app || electron.remote.app).getPath('userData');
    await fs.readFile("/user_data/login_cookies.txt", "utf8", (err, data) => {
      if(err) {
        return false;
      } else {
        const JSONData = JSON.parse(data);
        console.log(JSONData);
      }
    });
    return true;
  }

  async login(username: string, password: string): Promise<void> {
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

    this.page.on('response', response => {
      if(response.request.resourceType == 'xhr') {
        console.log(response.body);
      }
    });

    console.log(await this.page.cookies());

  }


}
