import { app, BrowserWindow, ipcMain } from 'electron';
// import { screen } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { InstagramAPI } from './instagram-api';

let win: BrowserWindow = null;
let loginWindow: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

function createWindow(): BrowserWindow {

  // const electronScreen = screen;

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

  win = new BrowserWindow({
    width: 1120,
    height: 630,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: serve,
      contextIsolation: false,  // false if you want to run 2e2 test with Spectron
      enableRemoteModule : true // true if you want to run 2e2 test  with Spectron or use remote module in renderer context (ie. Angular)
    },
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

const api = new InstagramAPI();

ipcMain.handle('login_attempt', async (event, args) => {
  win.resizable = false;
  win.show();
  win.loadURL('http://localhost:4200/');
  loginWindow.close();
  return await api.login(args.email, args.password, false, null);
});

ipcMain.handle('login_saved_account', async (event, args) => {
  await api.login(null, null, true, args.username);
  win.show();
  loginWindow.close();
});

ipcMain.handle('get_accounts',  () => {
  return api.readUsers();
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
    if (loginWindow === null && win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
