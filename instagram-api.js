"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramAPI = void 0;
var puppeteer = require("puppeteer");
var fs = require('fs');
var InstagramUser_1 = require("./src/assets/InstagramUser");
var path = require("path");
var electron = require("electron");
var https = require("https");
var pup = require("puppeteer-extra");
var puppeteer_stealth = require("puppeteer-extra-plugin-stealth");
var InstagramAPI = /** @class */ (function () {
    function InstagramAPI() {
        this.browser = null;
        this.page = null;
        this.loginURL = "https://www.instagram.com/accounts/login/?next=%2Flogin%2F&source=desktop_nav";
        this.profileURL = "https://www.instagram.com/";
        this.userDataPath = (electron.app || electron.remote.app).getPath('userData');
        this.userFile = path.join(this.userDataPath, "users.json");
        this.browserOptions = {
            headless: false,
            devtools: false,
        };
    }
    InstagramAPI.prototype.readUsers = function () {
        var allUsers = [];
        var JSONData = null;
        var data;
        try {
            data = fs.readFileSync(this.userFile, "utf8");
        }
        catch (err) {
            return allUsers;
        }
        JSONData = JSON.parse(data);
        for (var _i = 0, _a = JSONData['users']; _i < _a.length; _i++) {
            var user = _a[_i];
            var userAdded = new InstagramUser_1.UserData(null, null, null);
            userAdded.applySelf(user);
            allUsers.push(userAdded);
        }
        return allUsers;
    };
    InstagramAPI.prototype.isSavedUser = function (username) {
        var allUsers = this.readUsers();
        if (!allUsers)
            return false;
        for (var _i = 0, allUsers_1 = allUsers; _i < allUsers_1.length; _i++) {
            var user = allUsers_1[_i];
            if (user.username === username)
                return false;
        }
        return true;
    };
    InstagramAPI.prototype.getUserData = function (username) {
        for (var _i = 0, _a = this.readUsers(); _i < _a.length; _i++) {
            var currentUser = _a[_i];
            if (currentUser.username == username) {
                return currentUser;
            }
        }
        return null;
    };
    InstagramAPI.prototype.writeUser = function (userData) {
        if (this.isSavedUser(userData.username))
            return false;
        var allUsers = this.readUsers();
        if (!allUsers)
            allUsers = [];
        allUsers.push(userData);
        var allUsersObject = { "users": allUsers };
        try {
            fs.writeFileSync(this.userFile, JSON.stringify(allUsersObject), "utf8");
        }
        catch (err) {
            return false;
        }
        return true;
    };
    InstagramAPI.prototype.getUserId = function (cookies) {
        for (var _i = 0, cookies_1 = cookies; _i < cookies_1.length; _i++) {
            var cookie = cookies_1[_i];
            if (cookie.name == "ds_user_id") {
                return cookie.value;
            }
        }
    };
    InstagramAPI.prototype.startPuppeteer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        pup.use(puppeteer_stealth());
                        this.browserOptions.executablePath = puppeteer.executablePath();
                        _a = this;
                        return [4 /*yield*/, pup.launch(this.browserOptions)];
                    case 1:
                        _a.browser = _c.sent();
                        _b = this;
                        return [4 /*yield*/, this.browser.newPage()];
                    case 2:
                        _b.page = _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    InstagramAPI.prototype.hasSetFollowers = function (username) {
        var userData = this.getUserData(username);
        return userData.followers != null;
    };
    InstagramAPI.prototype.cookiesInRequestForm = function (cookies) {
        var cookieList = "";
        for (var _i = 0, cookies_2 = cookies; _i < cookies_2.length; _i++) {
            var cookie = cookies_2[_i];
            cookieList += cookie.name + "=" + cookie.value.toString() + "; ";
        }
        return cookieList;
    };
    InstagramAPI.prototype.getFollowers = function (followers_id, cookies) {
        return __awaiter(this, void 0, void 0, function () {
            var cookieList, moreFollowers, after, followers, _loop_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cookieList = this.cookiesInRequestForm(cookies);
                        moreFollowers = true;
                        after = "";
                        followers = [];
                        _loop_1 = function () {
                            var pathLink, jsonPath, browserOptionsFollowers, getData, followersPage, _a, _b, _i, _c, node;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        pathLink = "/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables=";
                                        jsonPath = {
                                            "id": followers_id,
                                            "include_reel": false,
                                            "fetch_mutual": false,
                                            "first": 49,
                                            "after": after
                                        };
                                        pathLink = pathLink + JSON.stringify(jsonPath);
                                        browserOptionsFollowers = {
                                            headers: {
                                                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) ' +
                                                    'AppleWebKit/605.1.15 (KHTML, like Gecko) ' +
                                                    'Version/14.0.2 Safari/605.1.15',
                                                cookie: cookieList
                                            },
                                            hostname: 'www.instagram.com',
                                            path: pathLink,
                                        };
                                        getData = function () { return new Promise(function (resolve) {
                                            var dt = '';
                                            https.get(browserOptionsFollowers, function (res) {
                                                res.on('data', function (d) {
                                                    dt += d;
                                                });
                                                res.on('end', function () {
                                                    resolve(dt);
                                                });
                                            });
                                        }); };
                                        _b = (_a = JSON).parse;
                                        return [4 /*yield*/, getData()];
                                    case 1:
                                        followersPage = _b.apply(_a, [_d.sent()]);
                                        if (followersPage.data.user.edge_followed_by.page_info.has_next_page == true) {
                                            after = followersPage.data.user.edge_followed_by.page_info.end_cursor.toString();
                                            console.log(after);
                                        }
                                        else {
                                            moreFollowers = false;
                                        }
                                        for (_i = 0, _c = followersPage.data.user.edge_followed_by.edges; _i < _c.length; _i++) {
                                            node = _c[_i];
                                            followers.push(node);
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        };
                        _a.label = 1;
                    case 1:
                        if (!moreFollowers) return [3 /*break*/, 3];
                        return [5 /*yield**/, _loop_1()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/, followers];
                }
            });
        });
    };
    // TODO: regenerate login token (cookies) but don't remove follower data
    // TODO: remove puppeteer, use instagram login
    InstagramAPI.prototype.login = function (username, password) {
        return __awaiter(this, void 0, void 0, function () {
            var loginData, cookieButton, loginButton, err_1, pageData, regexUsername, pageUsername;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        loginData = {
                            username: username,
                            password: password
                        };
                        if (!!this.page) return [3 /*break*/, 2];
                        console.log("starting puppeteer");
                        return [4 /*yield*/, this.startPuppeteer()];
                    case 1:
                        _a.sent();
                        if (!this.page) {
                            console.log("failed to load puppeteer");
                            return [2 /*return*/, false];
                        }
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.page.goto(this.loginURL, {
                            waitUntil: "networkidle2",
                        })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.page.waitForXPath("//button[.='Accept']")];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.page.$x("//button[.='Accept']")];
                    case 5:
                        cookieButton = _a.sent();
                        cookieButton[0].click();
                        return [4 /*yield*/, this.page.waitForTimeout(1000)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.page.waitForSelector("input[name=username]")];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, this.page.type("input[name=username]", loginData.username)];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, this.page.waitForTimeout(100)];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, this.page.type("input[name=password]", loginData.password)];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, this.page.$x("//button[@type='submit']")];
                    case 11:
                        loginButton = _a.sent();
                        loginButton[0].click();
                        _a.label = 12;
                    case 12:
                        _a.trys.push([12, 14, , 15]);
                        return [4 /*yield*/, this.page.waitForXPath("//img[@data-testid='user-avatar']")];
                    case 13:
                        _a.sent();
                        return [3 /*break*/, 15];
                    case 14:
                        err_1 = _a.sent();
                        return [2 /*return*/, false];
                    case 15: return [4 /*yield*/, this.page.content()];
                    case 16:
                        pageData = _a.sent();
                        regexUsername = /<img alt="([a-z0-9_\-.]{2,30})'s profile picture"/g;
                        pageUsername = regexUsername.exec(pageData);
                        return [4 /*yield*/, this.page.goto("https://instagram.com/" + pageUsername[1])];
                    case 17:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return InstagramAPI;
}());
exports.InstagramAPI = InstagramAPI;
//# sourceMappingURL=instagram-api.js.map