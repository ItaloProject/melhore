const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')

// The web app URL — in production this is the Vercel URL
const WEB_URL = isDev
  ? 'http://localhost:3000'
  : 'https://melhore.vercel.app'

function createWindow() {
  const win = new BrowserWindow({
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

  // Load the Next.js web app
  win.loadURL(`${WEB_URL}/admin`)

  // Remove default menu in production
  if (!isDev) {
    Menu.setApplicationMenu(null)
  }

  win.on('page-title-updated', (e) => e.preventDefault())
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
