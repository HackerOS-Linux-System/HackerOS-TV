import sys
import os
import json
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QMenuBar, QMenu, QDialog, QFormLayout, QComboBox,
    QLabel, QDialogButtonBox, QMessageBox, QScrollArea, QGridLayout,
    QSizePolicy
)
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtCore import QUrl, Qt, QDir, QSize
from PyQt6.QtGui import QKeyEvent, QIcon, QFont, QColor, QPalette
import subprocess

class SettingsDialog(QDialog):
    def __init__(self, parent=None, config=None):
        super().__init__(parent)
        self.setWindowTitle("Ustawienia HackerOS TV")
        self.setStyleSheet("""
            QDialog {
                background-color: #202124;
                color: #FFFFFF;
            }
            QLabel {
                color: #FFFFFF;
            }
            QComboBox {
                background-color: #3C4043;
                color: #FFFFFF;
                border: 1px solid #5F6368;
            }
            QPushButton {
                background-color: #1A73E8;
                color: #FFFFFF;
                border: none;
                padding: 8px;
            }
        """)
        layout = QFormLayout(self)

        self.language_combo = QComboBox()
        self.language_combo.addItems(["Polski", "English", "Deutsch", "Español", "Français"])
        if config and "language" in config:
            index = self.language_combo.findText(config["language"])
            if index >= 0:
                self.language_combo.setCurrentIndex(index)
        layout.addRow("Język:", self.language_combo)

        self.theme_combo = QComboBox()
        self.theme_combo.addItems(["Ciemny", "Jasny"])
        if config and "theme" in config:
            index = self.theme_combo.findText(config["theme"])
            if index >= 0:
                self.theme_combo.setCurrentIndex(index)
        layout.addRow("Motyw:", self.theme_combo)

        buttons = QDialogButtonBox(QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel)
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        layout.addRow(buttons)

    def get_settings(self):
        return {
            "language": self.language_combo.currentText(),
            "theme": self.theme_combo.currentText()
        }

class HackerOSTV(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("HackerOS TV")
        self.setGeometry(100, 100, 1200, 800)
        self.apply_theme("Ciemny")  # Domyślny motyw

        # Ścieżka konfiguracji
        self.config_dir = os.path.expanduser("~/.hackeros/HackerOS-TV/")
        if not os.path.exists(self.config_dir):
            os.makedirs(self.config_dir)
        self.config_file = os.path.join(self.config_dir, "config.json")
        self.load_config()
        self.apply_theme(self.config.get("theme", "Ciemny"))

        # Menu bar (Hacker Menu)
        self.menu_bar = QMenuBar(self)
        self.setMenuBar(self.menu_bar)
        self.menu_bar.setStyleSheet("""
            QMenuBar {
                background-color: #202124;
                color: #FFFFFF;
            }
            QMenuBar::item {
                background-color: #202124;
                color: #FFFFFF;
            }
            QMenu {
                background-color: #3C4043;
                color: #FFFFFF;
            }
            QMenu::item:selected {
                background-color: #5F6368;
            }
        """)

        hacker_menu = QMenu("Hacker Menu", self)
        self.menu_bar.addMenu(hacker_menu)

        shutdown_action = hacker_menu.addAction("Wyłącz komputer")
        shutdown_action.triggered.connect(self.shutdown)

        reboot_action = hacker_menu.addAction("Uruchom ponownie")
        reboot_action.triggered.connect(self.reboot)

        logout_action = hacker_menu.addAction("Wyloguj się")
        logout_action.triggered.connect(self.logout)

        # Central widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(20, 20, 20, 20)
        main_layout.setSpacing(20)

        # Nagłówek jak w Google TV (np. wyszukiwanie, ustawienia)
        header_layout = QHBoxLayout()
        header_layout.setSpacing(10)

        search_label = QLabel("HackerOS TV")
        search_label.setFont(QFont("Arial", 24, QFont.Weight.Bold))
        header_layout.addWidget(search_label)
        header_layout.addStretch()

        settings_btn = QPushButton("Ustawienia")
        settings_btn.setIcon(QIcon.fromTheme("preferences-system"))  # Ikona systemowa, jeśli dostępna
        settings_btn.setStyleSheet("""
            QPushButton {
                background-color: #1A73E8;
                color: #FFFFFF;
                border: none;
                padding: 10px 20px;
                border-radius: 20px;
                font-size: 16px;
            }
            QPushButton:hover {
                background-color: #4285F4;
            }
        """)
        settings_btn.clicked.connect(self.open_settings)
        header_layout.addWidget(settings_btn)

        main_layout.addLayout(header_layout)

        # Sekcja z aplikacjami (kafelki jak w Google TV)
        apps_scroll = QScrollArea()
        apps_scroll.setWidgetResizable(True)
        apps_scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        apps_scroll.setVerticalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOn)
        apps_widget = QWidget()
        apps_layout = QGridLayout(apps_widget)
        apps_layout.setSpacing(15)
        apps_scroll.setWidget(apps_widget)
        main_layout.addWidget(apps_scroll)

        # Dodaj przyciski dla usług (rozbudowane, z większymi kafelkami)
        services = [
            ("Disney+", "https://www.disneyplus.com"),
            ("Amazon Prime", "https://www.primevideo.com"),
            ("YouTube", "https://www.youtube.com"),
            ("Spotify", "https://open.spotify.com"),
            ("Netflix", "https://www.netflix.com"),
            ("HBO Max", "https://www.max.com"),
            ("Apple TV", "https://tv.apple.com"),
            ("Twitch", "https://www.twitch.tv"),
            ("Plex", "https://www.plex.tv"),
            ("Hulu", "https://www.hulu.com")
        ]

        row, col = 0, 0
        for name, url in services:
            btn = QPushButton(name)
            btn.setFixedSize(200, 150)
            btn.setStyleSheet("""
                QPushButton {
                    background-color: #3C4043;
                    color: #FFFFFF;
                    border: none;
                    border-radius: 10px;
                    font-size: 18px;
                    font-weight: bold;
                }
                QPushButton:hover {
                    background-color: #5F6368;
                }
            """)
            btn.clicked.connect(lambda checked, u=url: self.open_web(u))
            apps_layout.addWidget(btn, row, col)
            col += 1
            if col >= 5:  # 5 kolumn
                col = 0
                row += 1

        # Web view (ukryty początkowo)
        self.web_view = QWebEngineView()
        self.web_view.setVisible(False)
        main_layout.addWidget(self.web_view, stretch=1)

        # Initial load
        self.web_view.load(QUrl("about:blank"))

    def apply_theme(self, theme):
        if theme == "Jasny":
            palette = QPalette()
            palette.setColor(QPalette.ColorRole.Window, QColor(245, 245, 245))
            palette.setColor(QPalette.ColorRole.WindowText, QColor(0, 0, 0))
            palette.setColor(QPalette.ColorRole.Base, QColor(255, 255, 255))
            palette.setColor(QPalette.ColorRole.AlternateBase, QColor(240, 240, 240))
            palette.setColor(QPalette.ColorRole.Text, QColor(0, 0, 0))
            self.setPalette(palette)
            self.setStyleSheet("""
                QWidget {
                    background-color: #F0F0F0;
                    color: #000000;
                }
                QPushButton {
                    background-color: #4285F4;
                    color: #FFFFFF;
                }
            """)
        else:  # Ciemny
            palette = QPalette()
            palette.setColor(QPalette.ColorRole.Window, QColor(32, 33, 36))
            palette.setColor(QPalette.ColorRole.WindowText, QColor(255, 255, 255))
            palette.setColor(QPalette.ColorRole.Base, QColor(60, 64, 67))
            palette.setColor(QPalette.ColorRole.AlternateBase, QColor(45, 48, 51))
            palette.setColor(QPalette.ColorRole.Text, QColor(255, 255, 255))
            self.setPalette(palette)
            self.setStyleSheet("""
                QWidget {
                    background-color: #202124;
                    color: #FFFFFF;
                }
                QPushButton {
                    background-color: #1A73E8;
                    color: #FFFFFF;
                }
            """)

    def load_config(self):
        if os.path.exists(self.config_file):
            with open(self.config_file, 'r') as f:
                self.config = json.load(f)
        else:
            self.config = {"language": "Polski", "theme": "Ciemny"}

    def save_config(self):
        with open(self.config_file, 'w') as f:
            json.dump(self.config, f)

    def open_settings(self):
        dialog = SettingsDialog(self, self.config)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            new_config = dialog.get_settings()
            if new_config["theme"] != self.config.get("theme"):
                self.apply_theme(new_config["theme"])
            self.config = new_config
            self.save_config()
            QMessageBox.information(self, "Ustawienia", "Ustawienia zapisane! Aplikacja może wymagać restartu dla pełnych zmian.")

    def open_web(self, url):
        self.web_view.load(QUrl(url))
        self.web_view.setVisible(True)
        self.showFullScreen()

    def keyPressEvent(self, event: QKeyEvent):
        if event.key() == Qt.Key.Key_Escape:
            if self.isFullScreen():
                self.showNormal()
                self.web_view.setVisible(False)
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
            # Dla X11, wylogowanie zależy od menedżera, np. pkill dla sesji
            subprocess.call(["pkill", "-u", os.getlogin()])

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = HackerOSTV()
    window.show()
    sys.exit(app.exec())
