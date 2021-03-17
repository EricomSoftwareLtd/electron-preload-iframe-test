
const { desktopCapturer } = require('electron')

if (window === top) {
    (async () => { 
    let constraints = {
        audio: {
            mandatory: {
                chromeMediaSource: 'desktop'
            }
        },
        video: {
            mandatory: {
                chromeMediaSource: 'desktop'
            }
        }
    };

    console.log('calling getUserMedia')
    let stream = await window.navigator.mediaDevices.getUserMedia(constraints)
    console.log('got stream ', stream)

})();


}