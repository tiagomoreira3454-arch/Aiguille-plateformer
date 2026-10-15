const { app, BrowserWindow, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("node:path");
const updateConfig = require("./update-config.json");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    minWidth: 800,
    minHeight: 500,
    backgroundColor: "#11151d",
    title: "Aiguille",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html")).catch((error) => {
    dialog.showErrorBox(
      "Impossible de lancer Aiguille",
      `Le jeu n'a pas pu être chargé.\n\n${error.message}`,
    );
    app.quit();
  });
}

function checkForUpdates() {
  if (!app.isPackaged || !updateConfig.enabled) return;

  if (
    !updateConfig.owner ||
    !updateConfig.repo ||
    updateConfig.owner.includes("VOTRE_") ||
    updateConfig.repo.includes("VOTRE_")
  ) {
    dialog.showErrorBox(
      "Configuration de mise à jour invalide",
      "Renseignez le propriétaire et le dépôt GitHub dans electron/update-config.json.",
    );
    return;
  }

  autoUpdater.setFeedURL({
    provider: "github",
    owner: updateConfig.owner,
    repo: updateConfig.repo,
    private: false,
  });
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.on("update-downloaded", () => {
    // The installed version is replaced, then the game restarts automatically.
    autoUpdater.quitAndInstall(true, true);
  });

  let errorDisplayed = false;
  autoUpdater.on("error", (error) => {
    errorDisplayed = true;
    dialog.showErrorBox(
      "Vérification des mises à jour impossible",
      `Aiguille continue avec la version installée.\n\n${error.message}`,
    );
  });

  autoUpdater.checkForUpdates().catch((error) => {
    if (!errorDisplayed) {
      dialog.showErrorBox(
        "Vérification des mises à jour impossible",
        `Aiguille continue avec la version installée.\n\n${error.message}`,
      );
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  setTimeout(checkForUpdates, 1500);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
