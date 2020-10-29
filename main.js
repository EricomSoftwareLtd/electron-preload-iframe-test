const { app, BrowserWindow, session } = require('electron')
const path = require('path')

let mainWindow

function createWindow() {
  session.defaultSession.clearCache(() => { });

  mainWindow = new BrowserWindow({
    width: 800, height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true,
      nativeWindowOpen: true,
      nodeIntegration: false,
      nodeIntegrationInSubFrames: true,
      offscreen: true,
      webSecurity: true
    }
  })


  // mainWindow.openDevTools()
  /*

   ignore the first few updates !

   expected output (what we get with electron 4):
    DIRTY  7 { x: 254, y: 254, width: 256, height: 256 }
    DIRTY  8 { x: 254, y: 254, width: 256, height: 256 }
    DIRTY  9 { x: 254, y: 254, width: 256, height: 256 }
    DIRTY  10 { x: 254, y: 254, width: 256, height: 256 }
    DIRTY  11 { x: 254, y: 254, width: 256, height: 256 }



   output with electron >=5.0.0:
    DIRTY  9 { x: 0, y: 0, width: 800, height: 575 }
    DIRTY  10 { x: 0, y: 0, width: 800, height: 575 }
    DIRTY  11 { x: 0, y: 0, width: 800, height: 575 }
    DIRTY  12 { x: 0, y: 0, width: 800, height: 575 }
    DIRTY  13 { x: 0, y: 0, width: 800, height: 575 }
    DIRTY  14 { x: 0, y: 0, width: 800, height: 575 }

*/
  mainWindow.loadURL('https://output.jsbin.com/vurotim') // the page is just a div switching between red and blue once every second

  let imgCount = 0;
  mainWindow.webContents.beginFrameSubscription(true, (nativeImage, dirtyRect) => {
    console.log('DIRTY ', imgCount++, dirtyRect)
  })


  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
