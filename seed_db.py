"""
WorkSense — Seed MongoDB with mock data for testing
Run: python seed_db.py
"""
from db import get_db
from datetime import datetime, timedelta
import random

db = get_db()

# Clear all existing data
print("Clearing existing data...")
for col in db.list_collection_names():
    db[col].drop()

today = datetime.now().strftime("%Y-%m-%d")

# ─────────────────────────────────
# 1. EMPLOYEES
# ─────────────────────────────────
employees = [
    {"emp_id": "emp_001", "name": "Rahul Sharma", "joined": "2025-06-15"},
    {"emp_id": "emp_002", "name": "Priya Nair", "joined": "2025-08-01"},
    {"emp_id": "emp_003", "name": "Arjun Patel", "joined": "2025-09-10"},
    {"emp_id": "emp_999", "name": "Jefrin MSA", "joined": "2026-01-01"},
]
db.employees.insert_many(employees)
print(f"  Seeded {len(employees)} employees")

# ─────────────────────────────────
# 2. ACTIVITIES (7 days of tracking)
# ─────────────────────────────────
processes = [
    ("code.exe", "Coding", "main.py - VS Code"),
    ("antigravity.exe", "Productivity", "project - Antigravity"),
    ("brave.exe", "Browsing (Uncategorized)", "dashboard - Brave"),
    ("chrome.exe", "Coding", "GitHub - Chrome"),
    ("slack.exe", "Communication", "Slack - #general"),
    ("cmd.exe", "Terminal", "Command Prompt"),
    ("excel.exe", "Productivity", "Sprint Planning.xlsx"),
    ("chrome.exe", "Entertainment", "YouTube - Chrome"),
    ("chrome.exe", "Social", "Reddit - Chrome"),
    ("figma.exe", "Design", "Figma - UI Design"),
]

activity_count = 0
for day_offset in range(7):
    d = datetime.now() - timedelta(days=day_offset)
    date_str = d.strftime("%Y-%m-%d")
    
    entries = []
    base_hour = 9
    for i in range(random.randint(40, 80)):
        proc, cat, title = random.choice(processes)
        h = base_hour + (i * 5) // 60
        m = (i * 5) % 60
        if h > 18:
            break
        entries.append({
            "date": date_str,
            "timestamp": f"{date_str} {h:02d}:{m:02d}:00",
            "process": proc,
            "title": title,
            "url": "",
            "category": cat,
            "jiggler_suspected": random.random() < 0.02,
            "key_spam_suspected": False,
        })
    
    if entries:
        db.activities.insert_many(entries)
        activity_count += len(entries)

print(f"  Seeded {activity_count} activity entries across 7 days")

# ─────────────────────────────────
# 3. REPORTS (7 days with varying scores)
# ─────────────────────────────────
scores_pattern = [72.5, 68.3, 65.1, 58.9, 55.2, 48.7, 42.1]  # declining trend for burnout testing

for day_offset in range(7):
    d = datetime.now() - timedelta(days=day_offset)
    date_str = d.strftime("%Y-%m-%d")
    score = scores_pattern[day_offset]
    
    report = {
        "date": date_str,
        "productivity_score": score,
        "score_breakdown": {
            "final": score,
            "activity": round(score * 1.1, 1),
            "goal": round(score * 0.8, 1),
            "break": 100 if day_offset < 5 else 50
        },
        "productive_sec": int(score * 300),
        "unproductive_sec": int((100 - score) * 100),
        "category_breakdown": {
            "Coding": int(score * 150),
            "Productivity": int(score * 100),
            "Communication": 1800,
            "Terminal": 600,
            "Browsing (Uncategorized)": 2400,
            "Entertainment": int((100 - score) * 50),
            "Neutral": 5000,
            "Design": 900
        },
        "hourly_timeline": {
            f"{date_str} 09": {"Coding": 2400, "Terminal": 300},
            f"{date_str} 10": {"Coding": 1800, "Communication": 600},
            f"{date_str} 11": {"Productivity": 2000, "Browsing (Uncategorized)": 1000},
            f"{date_str} 14": {"Coding": 2200, "Design": 800},
            f"{date_str} 15": {"Productivity": 1500, "Entertainment": 500},
            f"{date_str} 16": {"Coding": 1200, "Communication": 800},
        },
        "suspicious_flags": [] if score > 60 else [
            "Warning: Same window open for 2h with no switch",
            "Warning: Mouse jiggler suspected"
        ],
        "jiggler_detected": score < 50,
        "break_summary": {
            "total_breaks": random.randint(2, 5),
            "total_break_min": random.randint(20, 80),
            "limit_min": 90,
            "exceeded": False
        }
    }
    db.reports.replace_one({"date": date_str}, report, upsert=True)

print(f"  Seeded 7 daily reports (scores: {scores_pattern[6]:.0f}% -> {scores_pattern[0]:.0f}%)")

# ─────────────────────────────────
# 4. GOALS (for each employee today)
# ─────────────────────────────────
goal_templates = [
    ("Fix login bug", "high", 2.0),
    ("Write unit tests for API", "medium", 3.0),
    ("Update README documentation", "low", 1.0),
    ("Code review PR #42", "high", 1.5),
    ("Deploy staging build", "medium", 1.0),
    ("Refactor database module", "high", 4.0),
    ("Design new dashboard widget", "medium", 2.5),
]

goal_count = 0
for emp in employees:
    emp_id = emp["emp_id"]
    num_goals = random.randint(3, 5)
    selected = random.sample(goal_templates, num_goals)
    
    for i, (title, prio, est) in enumerate(selected):
        status = "completed" if i < num_goals // 2 else "pending"
        goal = {
            "emp_id": emp_id,
            "date": today,
            "id": i + 1,
            "title": title,
            "priority": prio,
            "estimated_hours": est,
            "status": status,
            "assigned_by": "Scrum Master",
            "assigned_at": f"{today} 09:{i*10:02d}:00",
            "completed_at": f"{today} 14:{i*15:02d}:00" if status == "completed" else None,
            "time_taken_min": int(est * 45) if status == "completed" else None,
        }
        db.goals.insert_one(goal)
        goal_count += 1

print(f"  Seeded {goal_count} goals across {len(employees)} employees")

# ─────────────────────────────────
# 5. BREAKS (today)
# ─────────────────────────────────
breaks = [
    {"date": today, "break_number": 1, "start_time": "10:30:00", "end_time": "10:45:00", "duration_min": 15},
    {"date": today, "break_number": 2, "start_time": "12:00:00", "end_time": "12:45:00", "duration_min": 45},
    {"date": today, "break_number": 3, "start_time": "15:30:00", "end_time": "15:40:00", "duration_min": 10},
]
db.breaks.insert_many(breaks)
print(f"  Seeded {len(breaks)} breaks (70min total)")

# ─────────────────────────────────
# 6. BREAK STATE
# ─────────────────────────────────
db.break_state.replace_one(
    {"_id": "current"},
    {"_id": "current", "on_break": False},
    upsert=True
)
print("  Seeded break_state: on_break = false")

# ─────────────────────────────────
# 7. BURNOUT (for emp_001 — high risk)
# ─────────────────────────────────
burnout_data = {
    "emp_id": "emp_001",
    "date": today,
    "risk_score": 75,
    "risk_level": "AT RISK",
    "signals": {
        "productivity_drop": 15,
        "overtime": 20,
        "break_skipping": 10,
        "goal_drop": 20,
        "entertainment_spike": 10,
        "ai_bonus": 0
    },
    "observations": [
        "Productivity dropped from 72% to 42% over 5 consecutive days",
        "Employee worked 10+ hours for 3 days",
        "Break time dropped to under 30 mins/day for 3+ days",
        "Goal completion score below 50% for 3+ days"
    ],
    "recommended_actions": [
        "Schedule a 1-on-1 conversation today",
        "Ensure employee logs off on time",
        "Reduce sprint load by 20-30% next week"
    ],
    "ai_layer_active": False
}
db.burnout.replace_one({"emp_id": "emp_001", "date": today}, burnout_data, upsert=True)

# Low risk for emp_002
db.burnout.replace_one(
    {"emp_id": "emp_002", "date": today},
    {
        "emp_id": "emp_002", "date": today,
        "risk_score": 20, "risk_level": "HEALTHY",
        "signals": {"productivity_drop": 0, "overtime": 0, "break_skipping": 0, "goal_drop": 0, "entertainment_spike": 0, "ai_bonus": 0},
        "observations": [], "recommended_actions": ["Keep monitoring normally."], "ai_layer_active": False
    },
    upsert=True
)
print("  Seeded burnout data (emp_001: AT RISK 75/100, emp_002: HEALTHY 20/100)")

# ─────────────────────────────────
# 8. RECOVERY (for emp_001)
# ─────────────────────────────────
db.recovery.replace_one(
    {"emp_id": "emp_001"},
    {
        "emp_id": "emp_001",
        "burnout_detected_date": (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d"),
        "initial_score": 85,
        "daily_scores": [
            {"date": (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d"), "score": 85 - i * 2}
            for i in range(5, -1, -1)
        ],
        "status": "stagnant",
        "recovered": False
    },
    upsert=True
)
print("  Seeded recovery tracking for emp_001 (stagnant, 5 days)")

# ─────────────────────────────────
# 9. BASH SUMMARY (today)
# ─────────────────────────────────
db.bash_summaries.replace_one(
    {"date": today},
    {
        "date": today,
        "bash_productivity_score": 82,
        "total_commands": 47,
        "productive_commands": 35,
        "neutral_commands": 10,
        "suspicious_commands": 2,
        "gaming_detected": False,
        "gaming_count": 0,
        "git_summary": {"commits": 6, "pushes": 3, "pulls": 2, "branches": 1, "merges": 1},
        "hourly_timeline": {
            "09": {"command_count": 12, "active": True},
            "10": {"command_count": 8, "active": False},
            "14": {"command_count": 15, "active": True},
            "15": {"command_count": 7, "active": False},
            "16": {"command_count": 5, "active": False},
        },
        "category_breakdown": {"Version Control": 18, "Build/Run": 12, "Navigation": 10, "Package Management": 5, "Testing": 2}
    },
    upsert=True
)
print("  Seeded bash summary (82% productivity, 47 commands)")

# ─────────────────────────────────
# DONE
# ─────────────────────────────────
print(f"\n{'='*43}")
print(f"  Mock data seeded successfully!")
print(f"  Database: worksense")
print(f"  Collections: {db.list_collection_names()}")
print(f"{'='*43}\n")
