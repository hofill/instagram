import * as puppeteer from 'puppeteer';

const fs = require('fs');
import { UserData } from "./src/assets/InstagramUser";
import * as path from 'path';
import * as electron from "electron";
import * as https from "https";
import { SetCookie } from "puppeteer";

const pup = require("puppeteer-extra");
const puppeteer_stealth = require("puppeteer-extra-plugin-stealth");

export class InstagramAPI {

  browser: any = null;
  page: any = null;
  browserOptions: any;
  loginURL = "https://www.instagram.com/accounts/login/?next=%2Flogin%2F&source=desktop_nav";
  profileURL = "https://www.instagram.com/";
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

  getUserData(username: string): UserData {
    for (const currentUser of this.readUsers()) {
      if (currentUser.username == username) {
        return currentUser;
      }
    }
    return null;
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

  getUserId(cookies: Record<string, unknown>[]): number {
    for (const cookie of cookies) {
      if (cookie.name == "ds_user_id") {
        return <number>cookie.value;
      }
    }
  }

  async startPuppeteer(): Promise<void> {
    pup.use(puppeteer_stealth());
    this.browserOptions.executablePath = puppeteer.executablePath();
    this.browser = await pup.launch(this.browserOptions);
    this.page = await this.browser.newPage();
  }

  hasSetFollowers(username: string): boolean {
    const userData = this.getUserData(username);
    return userData.followers != null;
  }

  cookiesInRequestForm(cookies: Record<string, unknown>[]): string {
    let cookieList = "";
    for (const cookie of cookies) {
      cookieList += cookie.name + "=" + cookie.value.toString() + "; ";
    }
    return cookieList;
  }

  async getFollowers(followers_id: number, cookies: Record<string, unknown>[]): Promise<object> {
    const cookieList = this.cookiesInRequestForm(cookies);
    let moreFollowers = true;
    let after = "";
    const followers = [];
    while (moreFollowers) {
      let pathLink = "/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables=";
      const jsonPath = {
        "id": followers_id,
        "include_reel": false,
        "fetch_mutual": false,
        "first": 49,
        "after": after
      };
      pathLink = pathLink + JSON.stringify(jsonPath);
      const browserOptionsFollowers = {
        headers: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) ' +
            'AppleWebKit/605.1.15 (KHTML, like Gecko) ' +
            'Version/14.0.2 Safari/605.1.15',
          cookie: cookieList
        },
        hostname: 'www.instagram.com',
        path: pathLink,
      };

      const getData = () => new Promise((resolve) => {
        let dt = '';
        https.get(browserOptionsFollowers, (res) => {
          res.on('data', d => {
            dt += d;
          });

          res.on('end', () => {
            resolve(dt);
          });
        });
      });
      const followersPage = JSON.parse(<string>await getData());
      if (followersPage.data.user.edge_followed_by.page_info.has_next_page == true) {
        after = followersPage.data.user.edge_followed_by.page_info.end_cursor.toString();
        console.log(after);
      } else {
        moreFollowers = false;
      }
      for (const node of followersPage.data.user.edge_followed_by.edges) {
        followers.push(node);
      }
    }
    return followers;
  }

  // TODO: regenerate login token (cookies) but don't remove follower data
  // TODO: remove puppeteer, use requests
  async login(username: string, password: string, isSavedLogin = false, user = null): Promise<boolean> {
    const loginData = {
      username: username,
      password: password
    };

    if (!this.page) {
      console.log("starting puppeteer");
      await this.startPuppeteer();
      if (!this.page) {
        console.log("failed to load puppeteer");
        return false;
      }
    }
    if (!isSavedLogin) {
      await this.page.goto(this.loginURL, {
        waitUntil: "networkidle2",
      });

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

      try {
        await this.page.waitForXPath("//img[@data-testid='user-avatar']");
      } catch (err) {
        return false;
      }
      const pageData = await this.page.content();
      const regexUsername = /<img alt="([a-z0-9_\-.]{2,30})'s profile picture"/g;
      const pageUsername = regexUsername.exec(pageData);
      await this.page.goto("https://instagram.com/" + pageUsername[1]);

    } else {
      const userData = this.getUserData(user);
      await this.page.setCookie(...userData.cookies);
      await this.page.goto(this.profileURL + userData.username, {
        waitUntil: "networkidle2",
      });

      await this.getFollowers(this.getUserId(userData.cookies), userData.cookies);
    }
  }


}
