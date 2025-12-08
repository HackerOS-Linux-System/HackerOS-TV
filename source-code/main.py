import sys
import os
import json
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QMenuBar, QMenu, QDialog, QFormLayout, QComboBox,
    QLabel, QDialogButtonBox, QMessageBox
)
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtCore import QUrl, Qt, QDir
from PyQt6.QtGui import QKeyEvent
import subprocess

class SettingsDialog(QDialog):
    def __init__(self, parent=None, config=None):
        super().__init__(parent)
        self.setWindowTitle("Ustawienia HackerOS TV")
        layout = QFormLayout(self)

        self.language_combo = QComboBox()
        self.language_combo.addItems(["Polski", "English", "Deutsch"])
        if config and "language" in config:
            index = self.language_combo.findText(config["language"])
            if index >= 0:
                self.language_combo.setCurrentIndex(index)
        layout.addRow("Język:", self.language_combo)

        buttons = QDialogButtonBox(QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel)
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        layout.addRow(buttons)

    def get_settings(self):
        return {"language": self.language_combo.currentText()}

class HackerOSTV(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("HackerOS TV")
        self.setGeometry(100, 100, 800, 600)

        # Ścieżka konfiguracji
        self.config_dir = os.path.expanduser("~/.hackeros/HackerOS-TV/")
        if not os.path.exists(self.config_dir):
            os.makedirs(self.config_dir)
        self.config_file = os.path.join(self.config_dir, "config.json")
        self.load_config()

        # Menu bar
        self.menu_bar = QMenuBar(self)
        self.setMenuBar(self.menu_bar)

        # Hacker Menu
        hacker_menu = QMenu("Hacker Menu", self)
        self.menu_bar.addMenu(hacker_menu)

        shutdown_action = hacker_menu.addAction("Wyłącz komputer")
        shutdown_action.triggered.connect(self.shutdown)

        reboot_action = hacker_menu.addAction("Uruchom ponownie")
        reboot_action.triggered.connect(self.reboot)

        logout_action = hacker_menu.addAction("Wyloguj się")
        logout_action.triggered.connect(self.logout)

        settings_action = hacker_menu.addAction("Ustawienia")
        settings_action.triggered.connect(self.open_settings)

        # Central widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)

        # Buttons for services
        buttons_layout = QHBoxLayout()
        layout.addLayout(buttons_layout)

        disney_btn = QPushButton("Disney+")
        disney_btn.clicked.connect(lambda: self.open_web("https://www.disneyplus.com"))
        buttons_layout.addWidget(disney_btn)

        amazon_btn = QPushButton("Amazon Prime")
        amazon_btn.clicked.connect(lambda: self.open_web("https://www.primevideo.com"))
        buttons_layout.addWidget(amazon_btn)

        youtube_btn = QPushButton("YouTube")
        youtube_btn.clicked.connect(lambda: self.open_web("https://www.youtube.com"))
        buttons_layout.addWidget(youtube_btn)

        spotify_btn = QPushButton("Spotify")
        spotify_btn.clicked.connect(lambda: self.open_web("https://open.spotify.com"))
        buttons_layout.addWidget(spotify_btn)

        # Web view
        self.web_view = QWebEngineView()
        layout.addWidget(self.web_view)

        # Initial load
        self.web_view.load(QUrl("about:blank"))

    def load_config(self):
        if os.path.exists(self.config_file):
            with open(self.config_file, 'r') as f:
                self.config = json.load(f)
        else:
            self.config = {"language": "Polski"}

    def save_config(self):
        with open(self.config_file, 'w') as f:
            json.dump(self.config, f)

    def open_settings(self):
        dialog = SettingsDialog(self, self.config)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            self.config = dialog.get_settings()
            self.save_config()
            QMessageBox.information(self, "Ustawienia", "Ustawienia zapisane!")

    def open_web(self, url):
        self.web_view.load(QUrl(url))
        self.showFullScreen()

    def keyPressEvent(self, event: QKeyEvent):
        if event.key() == Qt.Key.Key_Escape:
            if self.isFullScreen():
                self.showNormal()
        super().keyPressEvent(event)

    def shutdown(self):
        reply = QMessageBox.question(self, 'Wyłącz', 'Czy na pewno wyłączyć komputer?', QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No)
        if reply == QMessageBox.StandardButton.Yes:
            subprocess.call(["shutdown", "-h", "now"])

    def reboot(self):
        reply = QMessageBox.question(self, 'Restart', 'Czy na pewno uruchomić ponownie?', QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No)
        if reply == QMessageBox.StandardButton.Yes:
            subprocess.call(["reboot"])

    def logout(self):
        reply = QMessageBox.question(self, 'Wyloguj', 'Czy na pewno wylogować?', QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No)
        if reply == QMessageBox.StandardButton.Yes:
            # Dla X11, wylogowanie zależy od menedżera wyświetlania, np. dla lightdm: dm-tool switch-to-greeter
            # Zakładam prosty logout dla sesji
            subprocess.call(["pkill", "-u", os.getlogin()])  # Ostrożnie, to zabija wszystkie procesy użytkownika

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = HackerOSTV()
    window.show()
    sys.exit(app.exec())
