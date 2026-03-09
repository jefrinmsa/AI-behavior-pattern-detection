import win32gui
import win32process
import psutil
import time
import json
import os
import keyboard
from datetime import datetime

# ─────────────────────────────────────────────
#  CATEGORY MAPPING
# ─────────────────────────────────────────────
APP_CATEGORIES = {
    # Coding
    "code.exe": "Coding",
    "pycharm64.exe": "Coding",
    "idea64.exe": "Coding",
    "devenv.exe": "Coding",
    "sublime_text.exe": "Coding",
    "atom.exe": "Coding",
    "notepad++.exe": "Coding",

    # Communication
    "slack.exe": "Communication",
    "teams.exe": "Communication",
    "zoom.exe": "Communication",
    "discord.exe": "Communication",
    "thunderbird.exe": "Communication",
    "outlook.exe": "Communication",

    # Productivity
    "notion.exe": "Productivity",
    "obsidian.exe": "Productivity",
    "onenote.exe": "Productivity",
    "excel.exe": "Productivity",
    "winword.exe": "Productivity",
    "powerpnt.exe": "Productivity",
    "trello.exe": "Productivity",

    # Terminal / Dev tools
    "cmd.exe": "Terminal",
    "powershell.exe": "Terminal",
    "windowsterminal.exe": "Terminal",
    "wt.exe": "Terminal",
    "bash.exe": "Terminal",
    "git-bash.exe": "Terminal",

    # Browsers (check title for more detail)
    "chrome.exe": "Browser",
    "firefox.exe": "Browser",
    "msedge.exe": "Browser",
    "opera.exe": "Browser",
    "brave.exe": "Browser",
}

# Keywords in browser window titles → category
BROWSER_TITLE_KEYWORDS = {
    "YouTube": "Entertainment",
    "Netflix": "Entertainment",
    "Prime Video": "Entertainment",
    "Twitch": "Entertainment",
    "Spotify": "Entertainment",
    "Reddit": "Social",
    "Facebook": "Social",
    "Instagram": "Social",
    "Twitter": "Social",
    "GitHub": "Coding",
    "Stack Overflow": "Coding",
    "MDN": "Coding",
    "localhost": "Coding",
    "Figma": "Design",
    "Canva": "Design",
    "Jira": "Productivity",
    "Confluence": "Productivity",
    "Notion": "Productivity",
    "Trello": "Productivity",
    "Gmail": "Communication",
    "Outlook": "Communication",
    "Google Meet": "Communication",
    "Zoom": "Communication",
}

# ─────────────────────────────────────────────
#  MOUSE JIGGLER DETECTION
# ─────────────────────────────────────────────
import ctypes

class POINT(ctypes.Structure):
    _fields_ = [("x", ctypes.c_long), ("y", ctypes.c_long)]

mouse_history = []  # stores (x, y) tuples

def get_mouse_pos():
    pt = POINT()
    ctypes.windll.user32.GetCursorPos(ctypes.byref(pt))
    return (pt.x, pt.y)

def detect_jiggler(history, threshold=5):
    """Returns True if movement looks robotic (jiggler detected)."""
    if len(history) < threshold:
        return False
    xs = [p[0] for p in history[-threshold:]]
    ys = [p[1] for p in history[-threshold:]]
    x_unique = len(set(xs))
    y_unique = len(set(ys))
    
    # If the mouse hasn't moved at all, it's not a jiggler, the user is just idle.
    if x_unique == 1 and y_unique == 1:
        return False
        
    # Jiggler: x or y alternates between only 2 values, but isn't perfectly still
    if x_unique <= 2 or y_unique <= 2:
        return True
    return False

# ─────────────────────────────────────────────
#  CORE TRACKER
# ─────────────────────────────────────────────

keyboard_history = []  # stores recent keystrokes

def on_key_event(event):
    if event.event_type == keyboard.KEY_DOWN:
        keyboard_history.append(event.name)
        if len(keyboard_history) > 50:
            keyboard_history.pop(0)

keyboard.hook(on_key_event)

def detect_keyboard_spammer(history, threshold=20):
    """Returns True if the last N keys are highly repetitive."""
    if len(history) < threshold:
        return False
        
    recent_keys = history[-threshold:]
    unique_keys = len(set(recent_keys))
    
    # If the user has only pressed 1 or 2 unique keys in the last N strokes, it's highly suspicious
    if unique_keys <= 2:
        return True
    return False

LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, f"activity_{datetime.now().strftime('%Y-%m-%d')}.json")

session_log = []
last_entry = None

def get_active_window():
    """Returns (process_name, window_title) of the current foreground window."""
    try:
        hwnd = win32gui.GetForegroundWindow()
        title = win32gui.GetWindowText(hwnd)
        _, pid = win32process.GetWindowThreadProcessId(hwnd)
        proc = psutil.Process(pid)
        proc_name = proc.name().lower()
        return proc_name, title
    except Exception:
        return "unknown", ""

def classify(proc_name, title):
    """Return category string."""
    # Direct app match
    if proc_name in APP_CATEGORIES:
        category = APP_CATEGORIES[proc_name]
        # Refine browser category with title keywords
        if category == "Browser":
            for keyword, kw_category in BROWSER_TITLE_KEYWORDS.items():
                if keyword.lower() in title.lower():
                    return kw_category
            return "Browsing (Uncategorized)"
        return category
    return "Other"

def save_log():
    with open(LOG_FILE, "w") as f:
        json.dump(session_log, f, indent=2)

def run_tracker(poll_interval=5):
    global last_entry
    print("=" * 55)
    print("  WorkSense Tracker — Running (Ctrl+C to stop)")
    print("=" * 55)

    while True:
        proc_name, title = get_active_window()
        category = classify(proc_name, title)
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Mouse jiggler detection
        mouse_pos = get_mouse_pos()
        mouse_history.append(mouse_pos)
        if len(mouse_history) > 20:
            mouse_history.pop(0)
        jiggler_flag = detect_jiggler(mouse_history)

        # Keyboard spammer detection
        keyboard_flag = detect_keyboard_spammer(keyboard_history)

        entry = {
            "timestamp": timestamp,
            "process": proc_name,
            "title": title[:80],  # truncate long titles
            "category": category,
            "jiggler_suspected": jiggler_flag,
            "key_spam_suspected": keyboard_flag,
        }

        # Only log if something changed OR if spam/jiggle flags trigged newly
        is_new_spam_alert = (
            last_entry is not None and 
            (last_entry.get("jiggler_suspected") != jiggler_flag or 
             last_entry.get("key_spam_suspected") != keyboard_flag)
        )

        if last_entry is None or last_entry["process"] != proc_name or last_entry["title"] != entry["title"] or is_new_spam_alert:
            session_log.append(entry)
            save_log()
            last_entry = entry

            flags = []
            if jiggler_flag: flags.append(" ⚠️  JIGGLER?")
            if keyboard_flag: flags.append(" ⚠️  KEY SPAM?")
            flag_str = "".join(flags)
            
            print(f"[{timestamp}]  {category:<28}  {proc_name}  —  {title[:50]}{flag_str}")

        time.sleep(poll_interval)

# ─────────────────────────────────────────────
#  ENTRY POINT
# ─────────────────────────────────────────────
if __name__ == "__main__":
    try:
        run_tracker(poll_interval=5)
    except KeyboardInterrupt:
        print("\n\nTracker stopped. Log saved to:", LOG_FILE)