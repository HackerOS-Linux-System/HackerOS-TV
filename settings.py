import sys
import subprocess
from PyQt6.QtWidgets import QApplication, QWidget, QPushButton, QVBoxLayout, QHBoxLayout, QLabel
from PyQt6.QtGui import QFont
from PyQt6.QtCore import Qt

class SettingsApp(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("HackerOS TV - Ustawienia")
        self.setStyleSheet(open("style.qss").read())
        self.initUI()
        self.showFullScreen()  # Fullscreen mode

    def initUI(self):
        main_layout = QVBoxLayout()
        main_layout.setContentsMargins(50, 50, 50, 50)
        main_layout.setSpacing(30)
        main_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)

        title = QLabel("Ustawienia", self)
        title.setFont(QFont("Arial", 32, QFont.Weight.Bold))
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        main_layout.addWidget(title)

        # Settings options
        options = [
            ("Ustawienia Internetu", ["nmcli", "device", "wifi", "list"]),
            ("Ustawienia Bluetooth", ["bluetoothctl"]),
            ("Ustawienia Jasności (Zwiększ)", ["brightnessctl", "set", "+10%"]),
            ("Ustawienia Jasności (Zmniejsz)", ["brightnessctl", "set", "10%-"]),
            ("Ustawienia Dźwięku (Głośniej)", ["amixer", "sset", "Master", "5%+"]),
            ("Ustawienia Dźwięku (Ciszej)", ["amixer", "sset", "Master", "5%-"])
        ]

        for name, cmd in options:
            btn = QPushButton(name, self)
            btn.setObjectName("settingsButton")
            btn.setFont(QFont("Arial", 20))
            btn.setFixedHeight(80)
            btn.clicked.connect(lambda checked, c=cmd: subprocess.call(c))
            main_layout.addWidget(btn)

        main_layout.addStretch()

        # Back button
        back_layout = QHBoxLayout()
        back_btn = QPushButton("Back", self)
        back_btn.setObjectName("backButton")
        back_btn.setFont(QFont("Arial", 18))
        back_btn.setFixedSize(150, 50)
        back_btn.clicked.connect(self.backToMain)
        back_layout.addStretch()
        back_layout.addWidget(back_btn)
        back_layout.addStretch()

        main_layout.addLayout(back_layout)

        self.setLayout(main_layout)

    def backToMain(self):
        self.close()
        subprocess.Popen(["python3", "main.py"])

if __name__ == "__main__":
    app = QApplication(sys.argv)
    ex = SettingsApp()
    sys.exit(app.exec())
