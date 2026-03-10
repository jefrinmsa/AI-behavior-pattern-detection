import json
import os
import glob
from datetime import datetime, timedelta
from collections import defaultdict

LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")

# ─────────────────────────────────────────────
#  LOAD LOG
# ─────────────────────────────────────────────
def load_log(date_str=None):
    """Load log for a given date (default: today)."""
    if date_str is None:
        date_str = datetime.now().strftime("%Y-%m-%d")
    log_file = os.path.join(LOG_DIR, f"activity_{date_str}.json")
    if not os.path.exists(log_file):
        print(f"[!] No log found for {date_str}")
        return []
        
    # Re-import mapping to dynamically fix older logs that had wrong labels
    import sys
    sys.path.append(os.path.dirname(__file__))
    from tracker import APP_CATEGORIES
    
    with open(log_file, "r") as f:
        entries = json.load(f)
        
    for e in entries:
        if e.get("category") == "Other":
            e["category"] = APP_CATEGORIES.get(e.get("process"), "Neutral")
            
    return entries

def load_breaks(date_str):
    """Load break log for a given date."""
    log_file = os.path.join(LOG_DIR, f"breaks_{date_str}.json")
    if not os.path.exists(log_file):
        return []
    with open(log_file, "r") as f:
        return json.load(f)

def load_all_goals(date_str):
    """Load and combine all goals for all employees on a given date."""
    goals = []
    pattern = os.path.join(LOG_DIR, f"goals_*_{date_str}.json")
    for file_path in glob.glob(pattern):
        with open(file_path, "r") as f:
            goals.extend(json.load(f))
    return goals

# ─────────────────────────────────────────────
#  CALCULATE TIME SPENT PER ENTRY
# ─────────────────────────────────────────────
def calculate_durations(entries):
    """
    Each entry has a timestamp. Duration = time until next entry.
    Last entry gets 5 seconds (one poll interval) as default.
    """
    results = []
    for i, entry in enumerate(entries):
        start = datetime.strptime(entry["timestamp"], "%Y-%m-%d %H:%M:%S")
        if i + 1 < len(entries):
            end = datetime.strptime(entries[i + 1]["timestamp"], "%Y-%m-%d %H:%M:%S")
            duration_sec = (end - start).total_seconds()
        else:
            duration_sec = 5  # last entry default

        results.append({**entry, "duration_sec": duration_sec})
    return results

# ─────────────────────────────────────────────
#  AGGREGATE BY CATEGORY
# ─────────────────────────────────────────────
def aggregate_by_category(entries_with_duration):
    category_time = defaultdict(float)
    jiggler_flags = 0

    for i, e in enumerate(entries_with_duration):
        category_time[e["category"]] += e["duration_sec"]
        
        # Only count it as a new flag if the previous entry didn't also have it
        if e.get("jiggler_suspected"):
            if i == 0 or not entries_with_duration[i-1].get("jiggler_suspected"):
                jiggler_flags += 1

    return dict(category_time), jiggler_flags

# ─────────────────────────────────────────────
#  PRODUCTIVITY SCORE
# ─────────────────────────────────────────────
PRODUCTIVE_CATEGORIES = {"Coding", "Communication", "Productivity", "Terminal", "Design"}
UNPRODUCTIVE_CATEGORIES = {"Entertainment", "Social"}

def compute_score(category_time, goals, breaks, break_limit_mins=90):
    total = sum(category_time.values())
    
    # 1. Activity Score (50%)
    if total == 0:
        activity_score = 0
        productive_sec = 0
        unproductive_sec = 0
    else:
        productive_sec = sum(v for k, v in category_time.items() if k in PRODUCTIVE_CATEGORIES)
        unproductive_sec = sum(v for k, v in category_time.items() if k in UNPRODUCTIVE_CATEGORIES)
        activity_score = (productive_sec / total) * 100

    # 2. Goal Score (40%)
    if not goals:
        goal_score = 0
    else:
        active = [g for g in goals if g["status"] != "dropped"]
        done = [g for g in active if g["status"] == "completed"]
        goal_score = (len(done) / len(active)) * 100 if active else 0

    # 3. Break Score (10%)
    total_break_mins = sum(b.get("duration_min", 0) for b in breaks)
    if total_break_mins <= break_limit_mins:
        break_score = 100
    elif total_break_mins - break_limit_mins < 30:
        break_score = 50
    else:
        break_score = 0

    final_score = round((activity_score * 0.5) + (goal_score * 0.4) + (break_score * 0.1), 1)
    
    return {
        "final": final_score,
        "activity": round(activity_score, 1),
        "goal": round(goal_score, 1),
        "break": break_score
    }, productive_sec, unproductive_sec

# ─────────────────────────────────────────────
#  FORMAT TIME
# ─────────────────────────────────────────────
def fmt(seconds):
    seconds = int(seconds)
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    if h > 0:
        return f"{h}h {m}m"
    elif m > 0:
        return f"{m}m {s}s"
    else:
        return f"{s}s"

# ─────────────────────────────────────────────
#  SUSPICIOUS ACTIVITY DETECTOR
# ─────────────────────────────────────────────
def detect_suspicious(entries_with_duration, jiggler_flags, total_entries):
    flags = []

    # Long idle in same app (>1 hr in same window)
    streak = 0
    prev_title = None
    for e in entries_with_duration:
        if e["title"] == prev_title:
            streak += e["duration_sec"]
            if streak > 3600:
                flags.append(f"⚠️  Same window open for {fmt(streak)} with no switch: '{e['title'][:50]}'")
                streak = 0  # reset to avoid duplicate flag
        else:
            streak = e["duration_sec"]
            prev_title = e["title"]

    # Jiggler detection
    if jiggler_flags > 3:
        flags.append(f"⚠️  Mouse jiggler suspected — robotic movement detected {jiggler_flags} times")

    # Heavy entertainment
    entertainment_sec = sum(
        e["duration_sec"] for e in entries_with_duration if e["category"] in ("Entertainment", "Social")
    )
    if entertainment_sec > 1800:
        flags.append(f"⚠️  {fmt(entertainment_sec)} spent on Entertainment/Social platforms")

    return flags

# ─────────────────────────────────────────────
#  CONTRADICTION DETECTOR
# ─────────────────────────────────────────────
def detect_contradictions(entries_with_duration, goals):
    flags = []
    
    for g in goals:
        if g["status"] == "completed":
            assign_time = datetime.strptime(g["assigned_at"], "%Y-%m-%d %H:%M:%S")
            complete_time = datetime.strptime(g["completed_at"], "%Y-%m-%d %H:%M:%S")
            
            # Look for ANY productive activity in that window
            found_productive = False
            for e in entries_with_duration:
                e_time = datetime.strptime(e["timestamp"], "%Y-%m-%d %H:%M:%S")
                if assign_time <= e_time <= complete_time:
                    if e["category"] in PRODUCTIVE_CATEGORIES:
                        found_productive = True
                        break
                        
            if not found_productive:
                assign_fmt = assign_time.strftime("%I:%M %p")
                complete_fmt = complete_time.strftime("%I:%M %p")
                
                flag = (
                    f"⚠️  Contradiction detected:\n"
                    f"      Goal '{g['title']}' marked complete at {complete_fmt}\n"
                    f"      But no productive activity detected between {assign_fmt} "
                    f"and {complete_fmt}. Manual review recommended."
                )
                flags.append(flag)
                
    return flags

# ─────────────────────────────────────────────
#  TIMELINE (HOURLY BREAKDOWN)
# ─────────────────────────────────────────────
def build_hourly_timeline(entries_with_duration):
    hourly = defaultdict(lambda: defaultdict(float))
    for e in entries_with_duration:
        hour = e["timestamp"][:13]  # "YYYY-MM-DD HH"
        hourly[hour][e["category"]] += e["duration_sec"]
    return dict(hourly)

# ─────────────────────────────────────────────
#  PRINT REPORT
# ─────────────────────────────────────────────
def print_report(date_str=None):
    if date_str is None:
        date_str = datetime.now().strftime("%Y-%m-%d")

    entries = load_log(date_str)
    breaks = load_breaks(date_str)
    goals = load_all_goals(date_str)
    
    if not entries and not breaks and not goals:
        print(f"\n[!] No activity, breaks, or goals found for {date_str}.")
        return

    entries = calculate_durations(entries)
    category_time, jiggler_flags = aggregate_by_category(entries)
    scores, productive_sec, unproductive_sec = compute_score(category_time, goals, breaks)
    
    suspicious = detect_suspicious(entries, jiggler_flags, len(entries))
    contradictions = detect_contradictions(entries, goals)
    all_flags = suspicious + contradictions
    
    hourly = build_hourly_timeline(entries)

    print("\n" + "=" * 60)
    print(f"  📋 WORK REPORT — {date_str}")
    print("=" * 60)

    print(f"\n  🏆 Productivity Score: {scores['final']}%")
    print("\n  Score Breakdown:")
    print(f"  Activity Score   : {scores['activity']}%  (weight 50%)")
    print(f"  Goal Score       : {scores['goal']}%  (weight 40%)")
    print(f"  Break Score      : {scores['break']}% (weight 10%)")
    
    print(f"\n  ✅ Productive Time   : {fmt(productive_sec)}")
    print(f"  ❌ Unproductive Time : {fmt(unproductive_sec)}")

    # Break Summary
    print("\n  ☕ Break Summary:")
    print("  " + "-" * 40)
    total_break_mins = sum(b.get("duration_min", 0) for b in breaks)
    limit_mins = 90
    print(f"  Total breaks taken    : {len(breaks)}")
    print(f"  Total break time      : {fmt(total_break_mins * 60)}")
    print(f"  Break limit           : {fmt(limit_mins * 60)}")
    
    if total_break_mins <= limit_mins:
        print("  Status                : Within limit ✅")
    else:
        over = total_break_mins - limit_mins
        print(f"  Status                : Limit exceeded by {fmt(over * 60)} ⚠️")

    print("\n  📊 Time by Category:")
    print("  " + "-" * 40)
    if category_time:
        for cat, secs in sorted(category_time.items(), key=lambda x: -x[1]):
            bar_len = int((secs / max(category_time.values())) * 20)
            bar = "█" * bar_len
            print(f"  {cat:<28} {fmt(secs):>8}   {bar}")
    else:
        print("  No activity tracked.")

    print("\n  🕐 Hourly Breakdown:")
    print("  " + "-" * 40)
    for hour, cats in sorted(hourly.items()):
        top_cat = max(cats, key=cats.get)
        top_time = fmt(cats[top_cat])
        print(f"  {hour[-2:]}:00  →  {top_cat} ({top_time})")

    if all_flags:
        print("\n  🚨 Suspicious Activity Flags:")
        print("  " + "-" * 40)
        for flag in all_flags:
            print(f"  {flag}")
    else:
        print("\n  ✅ No suspicious activity detected.")

    print("\n" + "=" * 60)

    # Save JSON report for dashboard
    report = {
        "date": date_str,
        "productivity_score": scores['final'],
        "score_breakdown": scores,
        "productive_sec": productive_sec,
        "unproductive_sec": unproductive_sec,
        "category_breakdown": category_time,
        "hourly_timeline": {k: dict(v) for k, v in hourly.items()},
        "suspicious_flags": all_flags,
        "jiggler_detected": jiggler_flags > 3,
        "break_summary": {
            "total_breaks": len(breaks),
            "total_break_min": total_break_mins,
            "limit_min": limit_mins,
            "exceeded": total_break_mins > limit_mins
        }
    }
    report_path = os.path.join(LOG_DIR, f"report_{date_str}.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"  💾 Report saved to: {report_path}\n")

    return report

# ─────────────────────────────────────────────
#  ENTRY POINT
# ─────────────────────────────────────────────
if __name__ == "__main__":
    print_report()