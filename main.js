const { app, BrowserWindow, session } = require('electron')
const path = require('path')
const CDP = require('chrome-remote-interface')


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
      offscreen: true, // try with and without OFFSCREEN
      webSecurity: true
    }
  })


  // mainWindow.openDevTools()
  /*

   CLICK results:

   CDP = chrome devtools protocol
   SIE = webContents.sendInputEvent

   Method | Electron version | offscreen  => result
  --------------------------------------------
   CDP | 10 | false => PASS
   CDP | 10 | true => FAIL

   CDP | 5  | false => PASS
   CDP | 5  | true => FAIL

   CDP | 4  | false => PASS
   CDP | 4  | true => PASS

   SIE | 10 | false => FAIL
   SIE | 10 | true => FAIL

   SIE | 5  | false => FAIL
   SIE | 5  | true => FAIL


   SIE | 4  | false => PASS
   SIE | 4  | true => PASS

*/

  let passedClick = false;
  let passedKeydown = false;
  let passedKeyup = false;
  mainWindow.loadURL('https://output.jsbin.com/higoxaj') // the page includes an iframe (below). the iframe has a 'click' listeners that sets body background green
  // mainWindow.loadURL('https://crystal-test-site--balcauionut.repl.co/testpages/click-change-background.html');

  mainWindow.webContents.on('console-message', (e, level, message) => {
    console.log('Console:', message)
    if (message.includes('CLICKED')) passedClick = true;
    if (message.includes('KEYDOWN H')) passedKeydown = true;
    if (message.includes('KEYUP H')) passedKeyup = true;
  })

  mainWindow.webContents.on('did-finish-load', async () => {

    await timeout(500);
    await clickElectronSendInputEvent()
    // await clickCDP()

    await timeout(2000)
    if (passedClick) console.log('click PASSED')
    else console.log('click FAILED')

    pressHElectronSendInputEvent()
    await timeout(2000)
    if (passedKeydown) console.log('keydown PASSED')
    else console.log('keydown FAIL')
    if (passedKeyup) console.log('keyup PASSED')
    else console.log('keyup FAIL')
    

  })


  async function clickCDP() {

      // connect to endpoint
      let client = await CDP({
        target: (list) => { // need to return the index of which window we want to debug
          // it seems like windows are always on index 0, haven't found a different way to match them
          return list.findIndex(target => !/^devtools:/.test(target.url) && !/^chrome-devtools:/.test(target.url));
        }
      });

      let msg = {
        type: 'mousePressed', // Allowed Values: mousePressed, mouseReleased, mouseMoved, mouseWheel
        x: 200,
        y: 200,
        button: 'left', // Allowed Values: none, left, middle, right, back, forward
        buttons: 1, // A number indicating which buttons are pressed on the mouse when a mouse event is triggered. Left=1, Right=2, Middle=4, Back=8, Forward=16, None=0.
        clickCount: 1
      }

      await client.send('Input.dispatchMouseEvent', msg)
      msg.type = 'mouseReleased';
      await client.send('Input.dispatchMouseEvent', msg)
  }


  async function clickElectronSendInputEvent() {
    let event = {
      type: 'mouseDown',
      clickCount: 1,
      button: 'left',
      x: 150,
      y: 150,
      globalX: 150,
      globalY: 150,
      modifiers: ['leftButtonDown']
    };

    mainWindow.webContents.sendInputEvent(event);
    await timeout(0);
    event.type = 'mouseUp'
    mainWindow.webContents.sendInputEvent(event)
  }

  async function pressHElectronSendInputEvent() {
    mainWindow.webContents.sendInputEvent({type: 'keyDown', keyCode: 'h'})
    mainWindow.webContents.sendInputEvent({type: 'char', keyCode: 'h'});
    mainWindow.webContents.sendInputEvent({type: 'keyUp', keyCode: 'h'})
  }

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
