const { app, BrowserWindow, shell } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

let server;
let mainWindow;

function startLocalServer() {
  return new Promise((resolve) => {
    const htmlPath = path.join(__dirname, 'index.html');
    server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(htmlPath).pipe(res);
    });
    server.listen(0, 'localhost', () => {
      const port = server.address().port;
      resolve(`http://localhost:${port}`);
    });
  });
}

async function createWindow() {
  const url = await startLocalServer();
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    title: 'TLCM POS PRO',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL(url);

  // Allow Firebase Google Auth popups inside Electron, open WhatsApp links externally
  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    if (targetUrl.startsWith('https://wa.me/')) {
      shell.openExternal(targetUrl);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (server) server.close();
  if (process.platform !== 'darwin') app.quit();
});
