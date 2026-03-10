import os
import time
import json
import statistics
from datetime import datetime
from collections import defaultdict
from db import get_db

mongo_db = get_db()

LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")
os.makedirs(LOG_DIR, exist_ok=True)

# Path to standard PSReadLine History for PowerShell
PS_HISTORY_PATH = os.path.expanduser("~\\AppData\\Roaming\\Microsoft\\Windows\\PowerShell\\PSReadLine\\ConsoleHost_history.txt")

# Define Categories
CATEGORIES = {
    # Version Control
    "git": "Version Control", "gh": "Version Control", "hub": "Version Control", 
    "svn": "Version Control", "hg": "Version Control",
    
    # Build/Run
    "python": "Build/Run", "node": "Build/Run", "go": "Build/Run", 
    "make": "Build/Run", "docker": "Build/Run",
    
    # DevOps
    "vagrant": "DevOps", "helm": "DevOps", "minikube": "DevOps", 
    "k8s": "DevOps", "aws": "DevOps", "gcloud": "DevOps", 
    "az": "DevOps", "heroku": "DevOps",
    
    # Testing
    "pytest": "Testing", "unittest": "Testing", "jest": "Testing", 
    "mocha": "Testing", "karma": "Testing", "cypress": "Testing", 
    "selenium": "Testing", "test": "Testing", "spec": "Testing",
    
    # Database
    "mysql": "Database", "psql": "Database", "mongo": "Database", 
    "redis-cli": "Database", "sqlite3": "Database", "pg": "Database", 
    "mongodump": "Database",
    
    # Package Management
    "pip": "Package Management", "npm": "Package Management", "yarn": "Package Management",
    "apt-get": "Package Management", "brew": "Package Management", "choco": "Package Management", 
    "winget": "Package Management",
    
    # Navigation
    "cd": "Navigation", "ls": "Navigation", "dir": "Navigation", 
    "cat": "Navigation", "echo": "Navigation", "mkdir": "Navigation", 
    "rm": "Navigation", "mv": "Navigation", "cp": "Navigation", 
    "vi": "Navigation", "nano": "Navigation", "code": "Navigation"
}

SUSPICIOUS_COMMANDS = ["loop", "while", "for", "timeout", "sleep", "ping"]

PRODUCTIVE_CATEGORIES = ["Version Control", "Build/Run", "DevOps", "Coding", "Testing", "Database"]
NEUTRAL_CATEGORIES = ["Navigation", "Package Management", "Unknown"]

session_commands = []
git_metrics = {"commits": 0, "pushes": 0, "pulls": 0, "branches": 0, "merges": 0}

# Bot detection states
command_history = []  # tuple: (command, timestamp)

def classify_command(base_cmd):
    if base_cmd in SUSPICIOUS_COMMANDS:
        return "Suspicious"
    return CATEGORIES.get(base_cmd, "Unknown")

def check_window_crossref(timestamp):
    """Returns True if the user was in a Coding/Terminal window, False if Entertainment/Social, None otherwise."""
    dt_str = datetime.fromtimestamp(timestamp).strftime("%Y-%m-%d")
    log_file = os.path.join(LOG_DIR, f"activity_{dt_str}.json")
    
    if not os.path.exists(log_file):
        return None
        
    try:
        with open(log_file, "r") as f:
            activities = json.load(f)
            
        target_fmt = datetime.fromtimestamp(timestamp).strftime("%Y-%m-%d %H:%M:%S")
        target_time = datetime.strptime(target_fmt, "%Y-%m-%d %H:%M:%S")
        
        # Find the most recent activity before or near the timestamp
        closest_act = None
        min_diff = float("inf")
        
        for act in activities:
            act_time = datetime.strptime(act["timestamp"], "%Y-%m-%d %H:%M:%S")
            diff = abs((target_time - act_time).total_seconds())
            if diff < min_diff:
                min_diff = diff
                closest_act = act
                
        if closest_act and min_diff <= 300: # Within 5 mins
            cat = closest_act.get("category", "")
            if cat in ["Entertainment", "Social"]:
                return False
            elif cat in ["Coding", "Terminal", "Productivity"]:
                return True
                
    except Exception:
        pass
        
    return None

def check_gaming(cmd, ts):
    flagged = False
    reasons = []
    
    # 1. Volume Check (>50 in 10 mins)
    ten_mins_ago = ts - 600
    recent_cmds = [c for c in command_history if c[1] >= ten_mins_ago]
    if len(recent_cmds) > 50:
        flagged = True
        reasons.append("⚠️ Unusually high command volume detected")
        
    # 2. Time Pattern Check (Same command 5+ times, perfect intervals)
    same_cmds = [c for c in command_history if c[0] == cmd]
    if len(same_cmds) >= 5:
        last_five = same_cmds[-5:]
        intervals = [last_five[i][1] - last_five[i-1][1] for i in range(1, 5)]
        
        if len(intervals) >= 2:
            std_dev = statistics.stdev(intervals) if sum(intervals) > 0 else 0.0
            if std_dev < 1.0: # Identical intervals within 1s tolerance
                cross_ref = check_window_crossref(ts)
                if cross_ref is False:
                    # They are in Entertainment!
                    flagged = True
                    reasons.append("🚨 Confirm gaming with HIGH confidence")
                elif cross_ref is True:
                    # They are coding/testing
                    flagged = False
                    reasons = ["✅ Clear the gaming flag"]
                else:
                    # Suspended interval bot
                    flagged = True
                    reasons.append("🚨 Flag as gaming (Interval Sequence)")
                    
    return flagged, reasons

def parse_git_metrics(raw_parts):
    base = raw_parts[0]
    if base != "git" or len(raw_parts) < 2:
        return
        
    sub = raw_parts[1].lower()
    if sub in ["commit"]:
        git_metrics["commits"] += 1
    elif sub in ["push"]:
        git_metrics["pushes"] += 1
    elif sub in ["pull"]:
        git_metrics["pulls"] += 1
    elif sub in ["branch", "checkout"]: 
        if "branch" in raw_parts or "-b" in raw_parts:
            git_metrics["branches"] += 1
    elif sub in ["merge"]:
        git_metrics["merges"] += 1

def process_command(raw_line, timestamp):
    if not hasattr(process_command, "gaming_count"):
        process_command.gaming_count = 0
        process_command.gaming_detected = False
        
    raw_parts = raw_line.strip().split()
    if not raw_parts:
        return
        
    # PRIVACY FILTER: Destroy args/commits/filenames
    base_command = raw_parts[0].lower()
    if base_command == "npm" and len(raw_parts) > 1:
        base_command = f"npm {raw_parts[1].lower()}"
    elif base_command == "pip" and len(raw_parts) > 1:
        base_command = f"pip {raw_parts[1].lower()}"
    elif base_command == "yarn" and len(raw_parts) > 1:
        base_command = f"yarn {raw_parts[1].lower()}"
        
    # Categorize
    cat = classify_command(base_command)
    
    # Track internals
    parse_git_metrics(raw_parts)
    command_history.append((base_command, timestamp))
    
    # Check flags
    gaming_suspected, gaming_reasons = check_gaming(base_command, timestamp)
    if gaming_suspected and "✅" not in ",".join(gaming_reasons):
        process_command.gaming_detected = True
        process_command.gaming_count += 1
        
    entry = {
        "base_command": base_command,
        "category": cat,
        "timestamp": datetime.fromtimestamp(timestamp).strftime("%Y-%m-%d %H:%M:%S"),
        "gaming_suspected": gaming_suspected
    }
    session_commands.append(entry)
    return entry, gaming_reasons

def finalize_session():
    if not session_commands:
        print("No bash commands recorded this session.")
        return
        
    total = len(session_commands)
    pro = sum(1 for c in session_commands if c["category"] in PRODUCTIVE_CATEGORIES)
    neu = sum(1 for c in session_commands if c["category"] in NEUTRAL_CATEGORIES)
    sus = sum(1 for c in session_commands if c["category"] == "Suspicious")
    score = int((pro / total) * 100) if total > 0 else 0
    
    print(f"\nBash Productivity Score: {score}%")
    print(f"Productive commands : {pro}")
    print(f"Neutral commands    : {neu}")
    print(f"Suspicious commands : {sus}\n")
    
    print("Git Activity Summary:")
    print(f"commits  : {git_metrics['commits']:<3} {'█' * git_metrics['commits']}")
    print(f"pushes   : {git_metrics['pushes']:<3} {'█' * git_metrics['pushes']}")
    print(f"pulls    : {git_metrics['pulls']:<3} {'█' * git_metrics['pulls']}")
    print(f"branches : {git_metrics['branches']:<3} {'█' * git_metrics['branches']}")
    print(f"merges   : {git_metrics['merges']:<3} {'█' * git_metrics['merges']}\n")
    
    # Hourly Timeline
    hourly = defaultdict(lambda: {"command_count": 0, "active": False})
    
    for c in session_commands:
        h = c["timestamp"].split(" ")[1].split(":")[0] # get HH
        hourly[h]["command_count"] += 1
        
    print("Developer Activity Timeline:")
    for h, data in sorted(hourly.items()):
        ct = data["command_count"]
        active = False
        display_state = "⚪ No activity"
        if ct >= 10:
            active = True
            display_state = "🟢 Active"
        elif ct > 0:
            display_state = "🟡 Low activity"
            
        data["active"] = active
        print(f"{h}:00 - {int(h)+1:02d}:00  → {ct} commands  {display_state}")
        
    # Save Report
    date_str = session_commands[0]["timestamp"].split(" ")[0] # today
    
    # Tally breakdown
    breakdown = defaultdict(int)
    for c in session_commands:
        breakdown[c["category"]] += 1
        
    out = {
      "date": date_str,
      "bash_productivity_score": score,
      "total_commands": total,
      "productive_commands": pro,
      "neutral_commands": neu,
      "suspicious_commands": sus,
      "gaming_detected": getattr(process_command, "gaming_detected", False),
      "gaming_count": getattr(process_command, "gaming_count", 0),
      "git_summary": git_metrics,
      "hourly_timeline": dict(hourly),
      "category_breakdown": dict(breakdown)
    }
    
    mongo_db.bash_summaries.replace_one(
        {"date": date_str},
        out,
        upsert=True
    )
    
    # Also save individual commands to MongoDB
    for c in session_commands:
        c["date"] = date_str
    if session_commands:
        mongo_db.bash_commands.insert_many([{k: v for k, v in c.items()} for c in session_commands])
        
    print(f"\nSaved summary to MongoDB (bash_summaries)")

def track():
    if not os.path.exists(PS_HISTORY_PATH):
        print(f"PowerShell history not found at {PS_HISTORY_PATH}")
        print("Waiting for history file to be created...")
    
    last_size = 0
    if os.path.exists(PS_HISTORY_PATH):
        last_size = os.path.getsize(PS_HISTORY_PATH)
        
    print("=" * 55)
    print("  WorkSense Bash Tracker — Running (Ctrl+C to stop)")
    print("=" * 55)
    print("Privacy Mode ACTIVE: Tracking base commands only. All arguments ignored.")
    
    try:
        while True:
            time.sleep(3)
            
            # --- BREAK STATE CHECK (MongoDB boolean) ---
            external_break = False
            try:
                state = mongo_db.break_state.find_one({"_id": "current"})
                if state:
                    external_break = state.get("on_break", False)
            except Exception:
                pass
                
            if external_break:
                continue
            
            if not os.path.exists(PS_HISTORY_PATH):
                continue
                
            current_size = os.path.getsize(PS_HISTORY_PATH)
            if current_size > last_size:
                with open(PS_HISTORY_PATH, "r", encoding="utf-8", errors="ignore") as f:
                    f.seek(last_size)
                    new_lines = f.readlines()
                    last_size = current_size
                    
                for line in new_lines:
                    line = line.strip()
                    if line:
                        res, flags = process_command(line, time.time())
                        if flags:
                            for flag in flags:
                                print(f"[{datetime.now().strftime('%H:%M:%S')}] {flag}")
                                
            elif current_size < last_size:
                # File was truncated/cleared
                last_size = 0

    except KeyboardInterrupt:
        print("\nStopping Bash Tracker...")
        finalize_session()

if __name__ == "__main__":
    track()
