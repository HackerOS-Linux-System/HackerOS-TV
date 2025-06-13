from flask import Flask, render_template, request, jsonify
from flask_wtf.csrf import CSRFProtect
import subprocess
import threading
import time
import logging
import os
import secrets

app = Flask(__name__, template_folder='templates')
app.config['SECRET_KEY'] = secrets.token_hex(32)  # Secure random key for CSRF
csrf = CSRFProtect(app)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.route('/')
def index():
    try:
        return render_template('index.html')
    except Exception as e:
        logger.error(f"Error rendering template: {e}")
        return jsonify({"error": "Template not found. Please ensure 'index.html' is in the 'templates' folder."}), 500

@app.route('/shutdown', methods=['POST'])
def shutdown():
    try:
        subprocess.run(['shutdown 0'], check=True)
        return jsonify({"message": "System shutting down..."})
    except subprocess.CalledProcessError as e:
        logger.error(f"Shutdown failed: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/reboot', methods=['POST'])
def reboot():
    try:
        subprocess.run(['reboot'], check=True)
        return jsonify({"message": "System rebooting..."})
    except subprocess.CalledProcessError as e:
        logger.error(f"Reboot failed: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/logout', methods=['POST'])
def logout():
    try:
        # Detect desktop environment or session manager
        if 'WAYLAND_DISPLAY' in os.environ:
            subprocess.run(['swaymsg', 'exit'], check=True)
        elif 'XDG_SESSION_DESKTOP' in os.environ and 'gnome' in os.environ.get('XDG_SESSION_DESKTOP', '').lower():
            subprocess.run(['gnome-session-quit', '--no-prompt'], check=True)
        else:
            # Fallback to systemd session termination
            session_id = os.environ.get('XDG_SESSION_ID')
            if session_id:
                subprocess.run(['loginctl', 'terminate-session', session_id], check=True)
            else:
                raise Exception("Unable to determine session ID for logout")
        return jsonify({"message": "Logging out..."})
    except subprocess.CalledProcessError as e:
        logger.error(f"Logout failed: {e}")
        return jsonify({"error": str(e)}), 500

def open_browser():
    try:
        time.sleep(1)  # Wait for server to start
        if subprocess.run(['which', 'brave-browser'], capture_output=True, text=True).returncode == 0:
            env = os.environ.copy()
            env['WAYLAND_DISPLAY'] = env.get('WAYLAND_DISPLAY', 'wayland-0')
            env['DISPLAY'] = env.get('DISPLAY', ':0')
            subprocess.run([
                'brave-browser',
                '--kiosk',
                '--enable-features=UseOzonePlatform',
                '--ozone-platform=wayland',
                'http://localhost:3939'
            ], env=env, check=True)
            logger.info("Successfully opened Brave browser in kiosk mode at http://localhost:3939")
        else:
            logger.error("Brave browser is not installed. Please install 'brave-browser'.")
    except Exception as e:
        logger.error(f"Failed to open browser: {e}")

if __name__ == '__main__':
    # Ensure templates folder exists
    template_dir = os.path.join(os.path.dirname(__file__), 'templates')
    if not os.path.exists(template_dir):
        logger.warning(f"Templates folder not found at {template_dir}. Creating it...")
        os.makedirs(template_dir)

    # Check if index.html exists
    template_path = os.path.join(template_dir, 'index.html')
    if not os.path.exists(template_path):
        logger.error(f"index.html not found at {template_path}. Creating a default one...")
        with open(template_path, 'w') as f:
            f.write('<!DOCTYPE html><html><body><h1>HackerOS TV</h1></body></html>')

    # Security warning
    if app.config.get('ENV') == 'production':
        logger.warning("Running in production mode. Ensure host is set to '127.0.0.1' for security or use a reverse proxy.")

    # Start browser in a separate thread
    threading.Thread(target=open_browser, daemon=True).start()

    # Start Flask app
    app.run(host='0.0.0.0', port=3939, debug=False)
