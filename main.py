import sys
import subprocess
from PyQt6.QtWidgets import QApplication, QWidget, QPushButton, QLabel, QVBoxLayout, QHBoxLayout, QGridLayout, QMenu, QMenuBar
from PyQt6.QtGui import QPixmap, QIcon, QFont, QKeySequence, QShortcut
from PyQt6.QtCore import Qt, QCoreApplication

class HackerOSTV(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("HackerOS TV")
        self.setStyleSheet(open("style.qss").read())
        self.initUI()
        self.showFullScreen()  # Fullscreen mode for Sway/Ubuntu

    def initUI(self):
        # Main layout
        main_layout = QVBoxLayout()
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # Top bar for logo
        top_bar = QHBoxLayout()
        top_bar.setContentsMargins(20, 20, 20, 0)

        # Logo in top-right
        logo_label = QLabel(self)
        pixmap = QPixmap("/usr/share/HackerOS/ICONS/HackerOS-TV.png")
        logo_label.setPixmap(pixmap.scaled(100, 100, Qt.AspectRatioMode.KeepAspectRatio))
        logo_label.setAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignTop)
        top_bar.addStretch()
        top_bar.addWidget(logo_label)

        main_layout.addLayout(top_bar)

        # Center buttons grid
        center_layout = QGridLayout()
        center_layout.setContentsMargins(0, 0, 0, 0)
        center_layout.setSpacing(50)
        center_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)

        buttons = [
            ("Prime Video", "https://www.primevideo.com"),
            ("Disney+", "https://www.disneyplus.com"),
            ("Eleven Sports", "https://elevensports.com"),
            ("HBO", "https://www.hbomax.com"),
            ("YouTube", "https://www.youtube.com"),
            ("Spotify", "https://open.spotify.com"),
            ("Netflix", "https://www.netflix.com"),
            ("Hulu", "https://www.hulu.com"),
            ("Apple TV", "https://tv.apple.com"),
            ("Twitch", "https://www.twitch.tv")
        ]

        row, col = 0, 0
        for name, url in buttons:
            btn = QPushButton(name, self)
            btn.setObjectName("serviceButton")
            btn.setFont(QFont("Arial", 24, QFont.Weight.Bold))
            btn.setFixedSize(300, 150)
            btn.clicked.connect(lambda checked, u=url: self.openService(u))
            center_layout.addWidget(btn, row, col)
            col += 1
            if col > 2:  # 3 columns
                col = 0
                row += 1

        main_layout.addStretch()
        main_layout.addLayout(center_layout)
        main_layout.addStretch()

        # Bottom right: Hacker Menu button
        bottom_layout = QHBoxLayout()
        bottom_layout.setContentsMargins(20, 0, 20, 20)

        # Settings button
        settings_btn = QPushButton("Ustawienia", self)
        settings_btn.setObjectName("menuButton")
        settings_btn.setFont(QFont("Arial", 18))
        settings_btn.setFixedSize(200, 60)
        settings_btn.clicked.connect(self.openSettings)
        bottom_layout.addWidget(settings_btn)

        bottom_layout.addStretch()

        # Hacker Menu
        menu_btn = QPushButton("Hacker Menu", self)
        menu_btn.setObjectName("menuButton")
        menu_btn.setFont(QFont("Arial", 18))
        menu_btn.setFixedSize(200, 60)
        menu_btn.clicked.connect(self.showHackerMenu)
        bottom_layout.addWidget(menu_btn)

        main_layout.addLayout(bottom_layout)

        self.setLayout(main_layout)

    def openService(self, url):
        self.close()
        subprocess.Popen(["vivaldi", "--start-fullscreen", url])

    def openSettings(self):
        self.close()
        subprocess.Popen(["python3", "settings.py"])

    def showHackerMenu(self):
        menu = QMenu(self)
        menu.setObjectName("hackerMenu")
        menu.setStyleSheet(self.styleSheet())  # Apply same stylesheet

        shutdown_action = menu.addAction("Wyłącz komputer")
        shutdown_action.triggered.connect(lambda: subprocess.call(["shutdown", "-h", "now"]))

        reboot_action = menu.addAction("Restart")
        reboot_action.triggered.connect(lambda: subprocess.call(["reboot"]))

        logout_action = menu.addAction("Log out")
        logout_action.triggered.connect(lambda: subprocess.call(["swaymsg", "exit"]))

        # Position menu near the button
        pos = self.mapToGlobal(self.sender().pos())
        menu.exec(pos)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    ex = HackerOSTV()
    sys.exit(app.exec())
