const { app, BrowserWindow, Menu, powerSaveBlocker, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
    WINDOW_WIDTH: 1200,
    WINDOW_HEIGHT: 800,
    BACKGROUND_COLOR: '#1c2526',
    VIVALDI_FLATPAK_ID: 'com.vivaldi.Vivaldi',
    FALLBACK_TIMEOUT: 300000, // 5 minutes in milliseconds
    LOG_FILE: path.join(__dirname, 'hackeros-tv.log'),
};

// Logging function
function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${level}: ${message}\n`;
    fs.appendFileSync(CONFIG.LOG_FILE, logMessage, { encoding: 'utf8' });
    console.log(logMessage.trim());
}

let mainWindow;
let powerSaveId;

// Create the main application window
function createWindow() {
    log('Creating new HackerOS TV window');
    mainWindow = new BrowserWindow({
        width: CONFIG.WINDOW_WIDTH,
        height: CONFIG.WINDOW_HEIGHT,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        frame: false,
        backgroundColor: CONFIG.BACKGROUND_COLOR,
    });

    mainWindow.loadFile('index.html');
    mainWindow.setFullScreen(true);

    powerSaveId = powerSaveBlocker.start('prevent-display-sleep');
    log(`Power save blocker started with ID: ${powerSaveId}`);

    mainWindow.on('closed', () => {
        log('Main window closed');
        mainWindow = null;
        if (powerSaveBlocker.isStarted(powerSaveId)) {
            powerSaveBlocker.stop(powerSaveId);
            log(`Power save blocker stopped for ID: ${powerSaveId}`);
        }
    });

    mainWindow.on('ready-to-show', () => {
        log('Main window is ready to show');
        mainWindow.show();
    });
}

// Launch Vivaldi and monitor its process
function launchStreamingPlatform(platformUrl) {
    if (!mainWindow) {
        log('No main window to close, creating new one after launch', 'WARN');
        createWindow();
        return;
    }

    log(`Launching Vivaldi with URL: ${platformUrl}`);
    mainWindow.close();

    const vivaldi = spawn('flatpak', ['run', CONFIG.VIVALDI_FLATPAK_ID, platformUrl, '--fullscreen']);

    vivaldi.on('spawn', () => {
        log('Vivaldi process spawned successfully');
    });

    vivaldi.on('error', (error) => {
        log(`Failed to launch Vivaldi: ${error.message}`, 'ERROR');
        createWindow();
    });

    vivaldi.on('exit', (code, signal) => {
        log(`Vivaldi exited with code ${code} and signal ${signal || 'none'}`);
        if (!mainWindow) {
            createWindow();
        }
    });

    setTimeout(() => {
        if (!mainWindow) {
            log('Fallback triggered: Reopening HackerOS TV after timeout');
            createWindow();
        }
    }, CONFIG.FALLBACK_TIMEOUT);
}

// Hacker Menu configuration
const hackerMenuTemplate = [
    {
        label: 'Hacker Menu',
        submenu: [
            {
                label: 'Wyłącz komputer',
                click: () => {
                    log('Initiating system shutdown');
                    const { exec } = require('child_process');
                    exec('systemctl poweroff', (error) => {
                        if (error) {
                            log(`Shutdown failed: ${error.message}`, 'ERROR');
                        } else {
                            log('Shutdown command executed successfully');
                        }
                    });
                },
            },
            {
                label: 'Uruchom ponownie komputer',
                click: () => {
                    log('Initiating system reboot');
                    const { exec } = require('child_process');
                    exec('systemctl reboot', (error) => {
                        if (error) {
                            log(`Reboot failed: ${error.message}`, 'ERROR');
                        } else {
                            log('Reboot command executed successfully');
                        }
                    });
                },
            },
            {
                label: 'Wyloguj się',
                click: () => {
                    log('Initiating Sway session logout');
                    const { exec } = require('child_process');
                    exec('swaymsg exit', (error) => {
                        if (error) {
                            log(`Logout failed: ${error.message}`, 'ERROR');
                        } else {
                            log('Logout command executed successfully');
                        }
                    });
                },
            },
        ],
    },
];

// Initialize app
app.whenReady().then(() => {
    log('HackerOS TV application starting');
    createWindow();
    const hackerMenu = Menu.buildFromTemplate(hackerMenuTemplate);
    Menu.setApplicationMenu(null);

    ipcMain.on('show-hacker-menu', (event, x, y) => {
        if (!mainWindow) {
            log('Cannot show Hacker Menu: main window is null', 'ERROR');
            createWindow();
            return;
        }
        try {
            const safeX = Math.round(x);
            const safeY = Math.round(y);
            log(`Showing Hacker Menu at position (${safeX}, ${safeY})`);
            hackerMenu.popup({ window: mainWindow, x: safeX, y: safeY });
        } catch (error) {
            log(`Failed to show Hacker Menu: ${error.message}`, 'ERROR');
        }
    });

    ipcMain.on('launch-streaming', (event, platformUrl) => {
        log(`Received request to launch streaming platform: ${platformUrl}`);
        launchStreamingPlatform(platformUrl);
    });

    process.on('uncaughtException', (error) => {
        log(`Uncaught exception: ${error.message}`, 'ERROR');
    });
});

app.on('window-all-closed', () => {
    log('All windows closed');
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        log('App activated, creating new window');
        createWindow();
    }
});

app.on('quit', () => {
    log('HackerOS TV application quitting');
    if (powerSaveBlocker.isStarted(powerSaveId)) {
        powerSaveBlocker.stop(powerSaveId);
        log(`Power save blocker stopped on quit for ID: ${powerSaveId}`);
    }
});
