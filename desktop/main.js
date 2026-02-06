const { app, BrowserWindow } = require('electron');
const WebSocket = require('ws');
const path = require('path');

let mainWindow;
let wss;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  wss = new WebSocket.Server({ port: 8080 });
  console.log('Signaling server running on port 8080');

  wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
      // Broadcast to all other clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message.toString());
        }
      });
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
