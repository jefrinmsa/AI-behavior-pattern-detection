import win32gui
import win32process
import psutil
import time
import json
import os
import sys
import pynput
import threading
import keyboard
import uiautomation as auto
from urllib.parse import urlparse
from datetime import datetime
from db import get_db

mongo_db = get_db()

# ─────────────────────────────────────────────
#  CATEGORY MAPPING
# ─────────────────────────────────────────────
APP_CATEGORIES = {
    # Coding
    "code.exe": "Coding",
    "cursor.exe": "Coding",
    "windsurf.exe": "Coding",
    "pycharm64.exe": "Coding",
    "idea64.exe": "Coding",
    "devenv.exe": "Coding",
    "sublime_text.exe": "Coding",
    "atom.exe": "Coding",
    "notepad++.exe": "Coding",
    "antigravity.exe": "Productivity",

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

PRODUCTIVE_DOMAINS = {
    "github.com": "Coding",
    "stackoverflow.com": "Coding",
    "docs.python.org": "Coding",
    "chatgpt.com": "Productivity",
}

UNPRODUCTIVE_DOMAINS = {
    "youtube.com": "Entertainment",
    "reddit.com": "Social",
    "facebook.com": "Social",
    "instagram.com": "Social",
    "netflix.com": "Entertainment",
    "twitter.com": "Social",
    "x.com": "Social",
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

last_human_activity_time = time.time()
last_jiggler_flag_time = 0

def on_human_activity(*args, **kwargs):
    global last_human_activity_time
    last_human_activity_time = time.time()

# We start these in the background to catch clicks and keystrokes 
try:
    pynput.mouse.Listener(on_click=on_human_activity).start()
    pynput.keyboard.Listener(on_press=on_human_activity).start()
except Exception:
    pass

def detect_jiggler(history, threshold=60):
    """Returns True if movement looks robotic (time-based jiggler detected)."""
    global last_jiggler_flag_time
    
    if len(history) < threshold:
        return False
        
    recent = history[-threshold:]
    
    # Check 1: Has the mouse moved at all in the last 5 minutes?
    if all(p == recent[0] for p in recent):
        return False
        
    now = time.time()
    
    # Check 2: Has it been 5 full minutes without ANY human interaction? 
    # (No clicks, no typing, no window switching)
    if (now - last_human_activity_time) < 300:
        return False
        
    # Check 3: Wait 30 minutes before flagging again 
    if (now - last_jiggler_flag_time) < 1800:
        return False
        
    # All checks passed: Mouse is moving but no human interactions are happening
    last_jiggler_flag_time = now
    return True

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

# ─────────────────────────────────────────────
#  BREAK LOGGING
# ─────────────────────────────────────────────
BREAK_LIMIT_MINUTES = 90

is_on_break = False
break_start_time = None

def load_todays_breaks():
    date_str = datetime.now().strftime('%Y-%m-%d')
    return list(mongo_db.breaks.find({"date": date_str}, {"_id": 0}))

breaks_today = load_todays_breaks()

def save_break(entry):
    entry["date"] = datetime.now().strftime('%Y-%m-%d')
    breaks_today.append(entry)
    mongo_db.breaks.insert_one(entry)

def get_used_break_minutes():
    return sum(b.get("duration_min", 0) for b in breaks_today)

def fmt_duration_break(minutes):
    minutes = int(minutes)
    h = minutes // 60
    m = minutes % 60
    if h > 0:
        return f"{h}h {m:02d}m"
    return f"{m} mins"

def toggle_break():
    global is_on_break, break_start_time
    now = datetime.now()
    
    if not is_on_break:
        # Starting a break
        used = get_used_break_minutes()
        if used >= BREAK_LIMIT_MINUTES:
            print(f"\nBreak limit reached. This break will be flagged in your report.")
        elif used >= 60:
            rem = BREAK_LIMIT_MINUTES - used
            print(f"\nHeads up: You have used {fmt_duration_break(used)} of breaks today.")
            print(f"Limit is {fmt_duration_break(BREAK_LIMIT_MINUTES)}. Remaining: {fmt_duration_break(rem)}.")
            
        is_on_break = True
        break_start_time = now
        print(f"\nBreak started at {now.strftime('%I:%M %p')}. Tracker paused.")
    else:
        # Ending a break
        duration = round((now - break_start_time).total_seconds() / 60, 1)
        used = get_used_break_minutes()
        exceeded = (used + duration) > BREAK_LIMIT_MINUTES
        
        entry = {
            "break_number": len(breaks_today) + 1,
            "start_time": break_start_time.strftime("%Y-%m-%d %H:%M:%S"),
            "end_time": now.strftime("%Y-%m-%d %H:%M:%S"),
            "duration_min": duration
        }
        if exceeded:
            entry["exceeded_limit"] = True
            
        save_break(entry)
        is_on_break = False
        print(f"\nBreak ended. Duration: {fmt_duration_break(duration)}. Tracker resumed.")

def break_listener():
    """Background thread listening for the 'b' key and enter in the terminal."""
    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break
            if line.strip().lower() == 'b':
                toggle_break()
        except Exception:
            break

def print_daily_break_summary():
    used = get_used_break_minutes()
    if not breaks_today:
        return
        
    longest = 0
    longest_time = ""
    for b in breaks_today:
        if b.get("duration_min", 0) > longest:
            longest = b["duration_min"]
            dt = datetime.strptime(b["start_time"], "%Y-%m-%d %H:%M:%S")
            longest_time = dt.strftime("%I:%M %p")
            
    status = "Within limit ✅" if used <= BREAK_LIMIT_MINUTES else "Exceeded ❌"
    
    print("\n" + "=" * 55)
    print("  Daily Break Summary")
    print("=" * 55)
    print(f"  Total breaks taken    : {len(breaks_today)}")
    print(f"  Total break time      : {fmt_duration_break(used)}")
    if longest > 0:
        print(f"  Longest break         : {fmt_duration_break(longest)} at {longest_time}")
    print(f"  Break limit (8 hours) : {fmt_duration_break(BREAK_LIMIT_MINUTES)}")
    print(f"  Status                : {status}")
    print("=" * 55)

session_log = []
last_entry = None

def get_active_window():
    """Returns (hwnd, process_name, window_title) of the current foreground window."""
    try:
        hwnd = win32gui.GetForegroundWindow()
        title = win32gui.GetWindowText(hwnd)
        _, pid = win32process.GetWindowThreadProcessId(hwnd)
        proc = psutil.Process(pid)
        proc_name = proc.name().lower()
        return hwnd, proc_name, title
    except Exception:
        return 0, "unknown", ""

def get_browser_url(hwnd):
    """Attempt to extract the URL from the active browser window using UIAutomation."""
    try:
        window = auto.WindowControl(searchDepth=1, Handle=hwnd)
        address_bar = window.EditControl()
        if address_bar.Exists(0, 0):
            url = address_bar.GetValuePattern().Value
            if url and not url.startswith('http'):
                url = 'https://' + url
            return url
    except Exception:
        pass
    return ""

def classify(hwnd, proc_name, title):
    """Return (category, url) string."""
    # Direct app match
    category = APP_CATEGORIES.get(proc_name, "Neutral")
    url = ""
    
    if category == "Browser":
        url = get_browser_url(hwnd)
        if url:
            domain = urlparse(url).netloc.lower()
            if domain.startswith("www."):
                domain = domain[4:]
            
            if domain in PRODUCTIVE_DOMAINS:
                return PRODUCTIVE_DOMAINS[domain], url
            if domain in UNPRODUCTIVE_DOMAINS:
                return UNPRODUCTIVE_DOMAINS[domain], url

        # Refine browser category with title keywords fallback
        for keyword, kw_category in BROWSER_TITLE_KEYWORDS.items():
            if keyword.lower() in title.lower():
                return kw_category, url
        return "Browsing (Uncategorized)", url
        
    return category, url

def save_log():
    """Insert the latest activity entry into MongoDB."""
    if session_log:
        entry = session_log[-1].copy()
        entry["date"] = datetime.now().strftime('%Y-%m-%d')
        mongo_db.activities.insert_one(entry)

def run_tracker(poll_interval=5):
    global last_entry
    
    # Start break listener thread
    threading.Thread(target=break_listener, daemon=True).start()
    
    print("=" * 55)
    print("  WorkSense Tracker — Running (Ctrl+C to stop, type 'b' + Enter for break)")
    print("=" * 55)

    while True:
        # --- BREAK STATE CHECK (MongoDB boolean) ---
        external_break = False
        try:
            state = mongo_db.break_state.find_one({"_id": "current"})
            if state:
                external_break = state.get("on_break", False)
        except Exception:
            pass
            
        if is_on_break or external_break:
            sys.stdout.write(f"\r[PAUSED] Tracker suspended — on break...       ")
            sys.stdout.flush()
            time.sleep(1)
            last_entry = None
            continue
            
        hwnd, proc_name, title = get_active_window()
        
        # If the active window changed, trigger human activity
        if last_entry is not None:
            if last_entry["process"] != proc_name or last_entry["title"] != title:
                on_human_activity()
                
        category, url = classify(hwnd, proc_name, title)
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Mouse jiggler detection
        mouse_pos = get_mouse_pos()
        mouse_history.append(mouse_pos)
        if len(mouse_history) > 60:
            mouse_history.pop(0)
        jiggler_flag = detect_jiggler(mouse_history, threshold=60)

        # Keyboard spammer detection
        keyboard_flag = detect_keyboard_spammer(keyboard_history)

        entry = {
            "timestamp": timestamp,
            "process": proc_name,
            "title": title[:80],  # truncate long titles
            "url": url,
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

        if last_entry is None or last_entry["process"] != proc_name or last_entry["title"] != entry["title"] or last_entry.get("url") != entry["url"] or is_new_spam_alert:
            session_log.append(entry)
            save_log()
            last_entry = entry

            flags = []
            if jiggler_flag: flags.append(" ⚠️  JIGGLER?")
            if keyboard_flag: flags.append(" ⚠️  KEY SPAM?")
            flag_str = "".join(flags)
            
            url_display = f" [{url[:30]}...]" if url else ""
            print(f"[{timestamp}]  {category:<28}  {proc_name}  —  {title[:50]}{url_display}{flag_str}")

        time.sleep(poll_interval)

# ─────────────────────────────────────────────
#  ENTRY POINT
# ─────────────────────────────────────────────
if __name__ == "__main__":
    try:
        run_tracker(poll_interval=5)
    except KeyboardInterrupt:
        print_daily_break_summary()
        print("\nTracker stopped. Log saved to MongoDB.")