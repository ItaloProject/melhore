const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')

const isDev = !app.isPackaged
const WEB_URL = isDev
  ? 'http://localhost:3000'
  : 'https://melhore-seven.vercel.app'

let autoUpdater = null
let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Melhore',
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  mainWindow.loadURL(`${WEB_URL}/admin`)

  if (!isDev) {
    Menu.setApplicationMenu(null)
  }

  mainWindow.on('page-title-updated', (e) => e.preventDefault())
}

function setupAutoUpdater() {
  if (isDev || !app.isPackaged) return

  try {
    autoUpdater = require('electron-updater').autoUpdater
  } catch (err) {
    console.error('[update] electron-updater indisponivel:', err)
    return
  }

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.allowPrerelease = false
  autoUpdater.autoRunAppAfterInstall = true

  autoUpdater.on('update-downloaded', () => {
    setTimeout(() => {
      try {
        autoUpdater.quitAndInstall(true, true)
      } catch (err) {
        console.error('[update] falha ao instalar:', err)
      }
    }, 1500)
  })

  autoUpdater.on('error', (err) => {
    console.error('[update]', err)
  })

  const check = () => {
    autoUpdater.checkForUpdates().catch((err) => {
      console.error('[update] check:', err)
    })
  }

  setTimeout(check, 4000)
  setInterval(check, 4 * 60 * 60 * 1000)
}

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(() => {
    app.setAppUserModelId('com.melhore.desktop')
    createWindow()
    setupAutoUpdater()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
