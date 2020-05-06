'use strict'

import { app, Menu, BrowserWindow, ipcMain } from 'electron'
import Update from '../../static/update'
const Store = require('electron-store')
const store = new Store()

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true

ipcMain.on('min', e => mainWindow.minimize())
ipcMain.on('max', (event, arg) => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize()
    event.sender.send('isMax', false)
  } else {
    mainWindow.maximize()
    event.sender.send('isMax', true)
  }
})
ipcMain.on('close', e => mainWindow.close())

// 初始化更新类型和下载保存地址
if (!store.has('updateType')) {
  store.set('updateType', 'auto')
}
if (!store.has('downloadPath')) {
  // let appDir = path.resolve('./')
  // let default_savePath = appDir + "\\download"
  store.set('downloadPath', app.getPath('downloads'))
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 800,
    useContentSize: true,
    width: 1300,
    minHeight: 670,
    minWidth: 1100,
    titleBarStyle: 'hidden',
    frame: false,
    icon: './build/icons/icon.ico',
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true
    },
    show: false
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
  mainWindow.loadURL(winURL)
  // mainWindow.webContents.openDevTools()
  if (process.env.NODE_ENV === 'production') {
    Menu.setApplicationMenu(null)
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  /**
   * 版本更新
   */
  const update = new Update(mainWindow)
  ipcMain.on('checkForUpdate', () => {
    if (process.env.NODE_ENV !== 'development') {
      // 执行自动检查更新
      update.checkUpdate()
    }
  })

  ipcMain.on('update', (event, arg) => {
    if (arg === 'update') {
      update.autoUpdate()
    } else if (arg === 'autoCheckUpdate') {
      update.autoCheckUpdate()
    } else if (arg === 'handCheckUpdate') {
      update.handCheckUpdate()
    }
  })
}
app.on('ready', createWindow)
app.allowRendererProcessReuse = false

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
