const { app, BrowserWindow, Menu, shell } = require('electron')
const path = require('path')

const isDev = !app.isPackaged
const WEB_URL = isDev
  ? 'http://localhost:3000'
  : 'https://melhore-seven.vercel.app'

let autoUpdater = null
let mainWindow = null
let pendingAuthUrl = null

function findAuthUrl(argv) {
  return argv.find((value) => typeof value === 'string' && value.startsWith('melhore://auth/callback#'))
}

function handleAuthUrl(authUrl) {
  if (!authUrl) return

  try {
    const parsed = new URL(authUrl)
    if (parsed.protocol !== 'melhore:' || parsed.hostname !== 'auth' || parsed.pathname !== '/callback') return

    const fragment = parsed.hash.slice(1)
    const params = new URLSearchParams(fragment)
    if (!params.get('request') || !params.get('payload')) return

    if (!mainWindow) {
      pendingAuthUrl = authUrl
      return
    }

    const callbackUrl = `${WEB_URL}/auth/native/callback#${fragment}`
    pendingAuthUrl = null
    mainWindow.loadURL(callbackUrl)
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
  } catch (err) {
    console.error('[auth] callback invalido:', err)
  }
}

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

  mainWindow.webContents.setUserAgent(
    `${mainWindow.webContents.getUserAgent()} MelhoreDesktop/1.0.3`,
  )
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) {
      shell.openExternal(url).catch((err) => console.error('[browser]', err))
    }
    return { action: 'deny' }
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
  app.on('second-instance', (_event, argv) => {
    const authUrl = findAuthUrl(argv)
    if (authUrl) {
      handleAuthUrl(authUrl)
      return
    }

    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(() => {
    app.setAppUserModelId('com.melhore.desktop')
    if (process.defaultApp && process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('melhore', process.execPath, [path.resolve(process.argv[1])])
    } else {
      app.setAsDefaultProtocolClient('melhore')
    }
    createWindow()
    handleAuthUrl(findAuthUrl(process.argv) || pendingAuthUrl)
    setupAutoUpdater()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

  app.on('open-url', (event, url) => {
    event.preventDefault()
    handleAuthUrl(url)
  })
}
