import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { InstagramAPI } from './instagram-api';

let win: BrowserWindow = null;
let loginWindow: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

function createWindow(): BrowserWindow {

  const electronScreen = screen;

  // Create the login window.
  loginWindow = new BrowserWindow({
    width: 315,
    height: 490,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: serve,
      contextIsolation: false,
      enableRemoteModule : true
    }
  });

  loginWindow.resizable = false;

  if (serve) {

    // win.webContents.openDevTools();

    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });

    loginWindow.loadURL('http://localhost:4200/login');

  } else {
    loginWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/login.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  // Emitted when the window is closed.
  loginWindow.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    loginWindow = null;
  });

  return loginWindow;
}

ipcMain.on('login_successful', (event, args) => {
  win = new BrowserWindow({
    width: 1120,
    height: 630,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: serve,
      contextIsolation: false,  // false if you want to run 2e2 test with Spectron
      enableRemoteModule : true // true if you want to run 2e2 test  with Spectron or use remote module in renderer context (ie. Angular)
    },
  });
  win.resizable = false;
  win.loadURL('http://localhost:4200/');
  loginWindow.close();
  const api = new InstagramAPI();
  api.login(args.email, args.password);
});

try {
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (loginWindow === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
