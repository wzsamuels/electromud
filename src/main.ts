import { app, BrowserWindow, ipcMain, IpcMainEvent, Menu} from 'electron';
import path from 'path';
import Net from "node:net";
import { CONNECT, READ, WRITE } from './constants';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}


let mainWindow: BrowserWindow = null;
let client: Net.Socket = null;

// Connect to mud
const handleConnectClient = () => {
  if(!client) {
    client = Net.createConnection({port: 4000, host: "ifmud.port4000.com"}, () => {
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
      console.log("Connected to mud"); 
      client.on('data', chunk => {
        console.log(chunk.toString());

        mainWindow.webContents.send(READ, chunk.toString())
      })
    })
    return;
  }

  if(client.readyState === 'open') {
    //TODO send message to renderer
    console.log("Error connecting")
    return;
  }
}

const handleDisconnectClient = () => {
  client.end()
}

// Write text to mud
const handleWriteClient = (event: IpcMainEvent, text: string) => {
  const data = text + '\n';
  console.log(data);
  const value = client.write(data, () => console.log("Writing text: ", text));
  console.log(value);
}

const createNewWindow = (route: string) => {
  let newWin = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Remove the menu from the new window
  newWin.setMenu(null);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    // For development: Load from Vite dev server and append the route using hash
    const devUrlWithRoute = `${MAIN_WINDOW_VITE_DEV_SERVER_URL}/#${route}`;
    newWin.loadURL(devUrlWithRoute);
  } else {
    // For production: Load the static file and append the route using hash
    const prodPathWithRoute = path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html#/${route}`);
    newWin.loadURL(`file://${prodPathWithRoute}`);
  }

  newWin.webContents.openDevTools();
}

const createMainWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Open New World',
          click: () => {
            createNewWindow("new-world");
          }
        },
        {
          label: 'Connect',
          click: () => {
            handleConnectClient();
          }
        },
        {
          label: 'Disconnect',
          click: () => {
            handleDisconnectClient();
          }
        },
        { type: 'separator' },
        {
          label: 'Settings',
          click: () => {
            createNewWindow("settings")
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete'},
        { type: 'separator'},
        { role: 'selectAll'}
      ]       
    },
    {
      label: "Tools",
      submenu: [
        { role: 'toggleDevTools'}
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            const { shell } = require('electron')
            await shell.openExternal('https://electronjs.org')
          }
        }
      ]
    }

  ])

  Menu.setApplicationMenu(menu)

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    console.log(MAIN_WINDOW_VITE_DEV_SERVER_URL)
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();


  
};

app.whenReady().then(() => {
  ipcMain.on(WRITE, handleWriteClient);
  ipcMain.on(CONNECT, handleConnectClient);
  createMainWindow();
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
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
    createMainWindow();
  }
});

