import subprocess
import os
from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.gridlayout import GridLayout
from kivy.uix.button import Button
from kivy.uix.label import Label
from kivy.uix.image import Image
from kivy.uix.dropdown import DropDown
from kivy.core.window import Window
from kivy.properties import StringProperty, NumericProperty
from kivy.uix.screenmanager import ScreenManager, Screen
from kivy.animation import Animation
from kivy.metrics import dp
from kivy.graphics import PushMatrix, PopMatrix, Scale

# Set fullscreen mode
Window.fullscreen = True

class HackerMenuButton(Button):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.dropdown = DropDown()
        actions = [
            ("Wyłącz komputer", ["shutdown", "-h", "now"]),
            ("Restart", ["reboot"]),
            ("Log out", ["swaymsg", "exit"])
        ]
        for name, cmd in actions:
            btn = Button(text=name, size_hint_y=None, height=dp(50))
            btn.bind(on_release=lambda btn, c=cmd: self.execute_action(c))
            self.dropdown.add_widget(btn)
        self.bind(on_release=self.dropdown.open)

    def execute_action(self, cmd):
        try:
            subprocess.call(cmd)
        except FileNotFoundError:
            print(f"Command {cmd} not found.")
        self.dropdown.dismiss()

class ServiceButton(Button):
    url = StringProperty('')
    scale_value = NumericProperty(1.0)  # Add scale_value property for animation

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Add Scale instruction to canvas
        with self.canvas.before:
            self.push_matrix = PushMatrix()
            self.scale_instruction = Scale(1, 1, 1)
        with self.canvas.after:
            self.pop_matrix = PopMatrix()

    def on_release(self):
        # Animate the scale_instruction
        anim = Animation(scale_value=0.95, duration=0.1) + Animation(scale_value=1.0, duration=0.1)
        anim.bind(on_progress=lambda instance, widget, progress: self.update_scale())
        anim.start(self)
        App.get_running_app().root.current = 'main'
        try:
            subprocess.Popen(["vivaldi", "--start-fullscreen", self.url])
        except FileNotFoundError:
            print(f"Vivaldi browser not found for URL: {self.url}")

    def update_scale(self):
        # Update the Scale instruction with the current scale_value
        self.scale_instruction.x = self.scale_value
        self.scale_instruction.y = self.scale_value

class SettingsButton(Button):
    cmd = StringProperty('')
    scale_value = NumericProperty(1.0)  # Add scale_value property for animation

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Add Scale instruction to canvas
        with self.canvas.before:
            self.push_matrix = PushMatrix()
            self.scale_instruction = Scale(1, 1, 1)
        with self.canvas.after:
            self.pop_matrix = PopMatrix()

    def on_release(self):
        # Animate the scale_instruction
        anim = Animation(scale_value=0.95, duration=0.1) + Animation(scale_value=1.0, duration=0.1)
        anim.bind(on_progress=lambda instance, widget, progress: self.update_scale())
        anim.start(self)
        try:
            subprocess.call(self.cmd.split())
        except FileNotFoundError:
            print(f"Command {self.cmd} not found.")

    def update_scale(self):
        # Update the Scale instruction with the current scale_value
        self.scale_instruction.x = self.scale_value
        self.scale_instruction.y = self.scale_value

class MainScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Main layout
        main_layout = BoxLayout(orientation='vertical', padding=dp(20), spacing=dp(10))
        # Top bar with logo
        top_bar = BoxLayout(orientation='horizontal', size_hint_y=0.1)
        top_bar.add_widget(Label())  # Spacer
        logo_path = "/usr/share/HackerOS/ICONS/HackerOS-TV.png"
        logo = Image(source=logo_path if os.path.exists(logo_path) else '',
                     size_hint=(None, None), size=(dp(100), dp(100)))
        top_bar.add_widget(logo)
        main_layout.add_widget(top_bar)
        # Center grid for service buttons
        grid = GridLayout(cols=3, spacing=dp(50), padding=dp(20), size_hint_y=0.7)
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
        for name, url in buttons:
            btn = ServiceButton(text=name, url=url, size_hint=(None, None), size=(dp(300), dp(150)))
            grid.add_widget(btn)
        main_layout.add_widget(grid)
        # Bottom bar with settings and menu
        bottom_bar = BoxLayout(orientation='horizontal', size_hint_y=0.1)
        settings_btn = Button(text="Ustawienia", size_hint=(None, None), size=(dp(200), dp(60)))
        settings_btn.bind(on_release=lambda x: App.get_running_app().root.switch_to(SettingsScreen(name='settings')))
        bottom_bar.add_widget(settings_btn)
        bottom_bar.add_widget(Label())  # Spacer
        menu_btn = HackerMenuButton(text="Hacker Menu", size_hint=(None, None), size=(dp(200), dp(60)))
        bottom_bar.add_widget(menu_btn)
        main_layout.add_widget(bottom_bar)
        self.add_widget(main_layout)

class SettingsScreen(Screen):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        main_layout = BoxLayout(orientation='vertical', padding=dp(50), spacing=dp(30))
        # Title
        title = Label(text="Ustawienia", size_hint_y=None, height=dp(80))
        main_layout.add_widget(title)
        # Settings options
        options = [
            ("Ustawienia Internetu", "nmcli device wifi list"),
            ("Ustawienia Bluetooth", "bluetoothctl"),
            ("Ustawienia Jasności (Zwiększ)", "brightnessctl set +10%"),
            ("Ustawienia Jasności (Zmniejsz)", "brightnessctl set 10%-"),
            ("Ustawienia Dźwięku (Głośniej)", "amixer sset Master 5%+"),
            ("Ustawienia Dźwięku (Ciszej)", "amixer sset Master 5%-")
        ]
        for name, cmd in options:
            btn = SettingsButton(text=name, cmd=cmd, size_hint_y=None, height=dp(80))
            main_layout.add_widget(btn)
        main_layout.add_widget(Label())  # Spacer
        # Back button
        back_btn = Button(text="Back", size_hint=(None, None), size=(dp(150), dp(50)))
        back_btn.bind(on_release=lambda x: App.get_running_app().root.switch_to(MainScreen(name='main')))
        back_layout = BoxLayout(orientation='horizontal')
        back_layout.add_widget(Label())
        back_layout.add_widget(back_btn)
        back_layout.add_widget(Label())
        main_layout.add_widget(back_layout)
        self.add_widget(main_layout)

class HackerOSTVApp(App):
    def build(self):
        sm = ScreenManager()
        sm.add_widget(MainScreen(name='main'))
        sm.add_widget(SettingsScreen(name='settings'))
        return sm

if __name__ == '__main__':
    HackerOSTVApp().run()
