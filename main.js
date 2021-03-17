const { app, BrowserWindow, session } = require('electron')
const path = require('path')
const CDP = require('chrome-remote-interface')

delete process.env.ELECTRON_ENABLE_SECURITY_WARNINGS;
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

app.commandLine.appendSwitch('remote-debugging-port', '9222')

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
      offscreen: false, 
      webSecurity: true,
      frame: false
    }
  })

  mainWindow.openDevTools()

  mainWindow.loadURL('https://google.com')

  mainWindow.webContents.on('console-message', (e, level, message) => {
    console.log('Console:', message)

    if(message.startsWith('got stream')) console.log('TEST PASSED')
  })

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

function timeout(duration) {
  return new Promise(resolve => setTimeout(resolve, duration))
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
