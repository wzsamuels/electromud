import { app, BrowserWindow, ipcMain, IpcMainEvent, Menu} from 'electron';
import path from 'path';
import Net from "node:net";
import { CONNECT, READ, WRITE } from './constants';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const client = new Net.Socket();

// Connect to mud
const handleConnectClient = () => {
  if(client.readyState === 'open') {
    //TODO send message to renderer
    return;
  }
  client.connect({port: 4000, host: "ifmud.port4000.com"}, () => {
    console.log("Connected to mud"); 
  })
}

// Write text to mud
const handleWriteClient = (event: IpcMainEvent, text: string) => {
  const data = text + '\n';
  console.log(data);
  const value = client.write(data, () => console.log("Writing text: ", text));
  console.log(value);
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  client.on('data', chunk => {
    console.log(chunk.toString());
    mainWindow.webContents.send(READ, chunk.toString())
  })
  
};

app.whenReady().then(() => {
  ipcMain.on(WRITE, handleWriteClient);
  ipcMain.on(CONNECT, handleConnectClient);
  createWindow();
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

})

// Quit when all windows are closed, except on macOS. 
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
 
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

client.on('close', () => {
  console.log("Connection closed")
})


client.on('drain', () => {
  console.log("Write buffer drained")
})

client.on('end', () => {
  console.log("Connection ended")
})

client.on('error', () => {
  console.log("Connection error")
})