#!/bin/bash

# Przejdź do katalogu aplikacji
cd /usr/share/HackerOS/Scripts/HackerOS-Apps/HackerOS-TV/

# Aktywuj wirtualne środowisko
source venv/bin/activate

# Uruchom aplikację Python
python app.py

# (Opcjonalnie) dezaktywuj środowisko po zakończeniu
deactivate
