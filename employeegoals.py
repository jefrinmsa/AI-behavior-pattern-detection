import json
import os
from datetime import datetime
from db import get_db

mongo_db = get_db()
LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")
os.makedirs(LOG_DIR, exist_ok=True)

# ─────────────────────────────────────────────
#  LOAD HELPERS
# ─────────────────────────────────────────────
def goals_file(emp_id, date_str=None):
    if date_str is None:
        date_str = datetime.now().strftime("%Y-%m-%d")
    return (emp_id, date_str)

def load_goals(emp_id):
    date_str = datetime.now().strftime("%Y-%m-%d")
    return list(mongo_db.goals.find({"emp_id": emp_id, "date": date_str}, {"_id": 0}))

def save_goals(emp_id, goals):
    date_str = datetime.now().strftime("%Y-%m-%d")
    # Delete existing goals for this employee/date and re-insert
    mongo_db.goals.delete_many({"emp_id": emp_id, "date": date_str})
    for g in goals:
        g["emp_id"] = emp_id
        g["date"] = date_str
        mongo_db.goals.insert_one(g)

def load_employees():
    emps = list(mongo_db.employees.find({}, {"_id": 0}))
    return {e["emp_id"]: e for e in emps}

# ─────────────────────────────────────────────
#  FORMAT TIME
# ─────────────────────────────────────────────
def fmt(seconds):
    seconds = int(seconds)
    h = seconds // 3600
    m = (seconds % 3600) // 60
    if h > 0:
        return f"{h}h {m}m"
    return f"{m}m"

# ─────────────────────────────────────────────
#  SHOW GOALS — Employee view
# ─────────────────────────────────────────────
def show_my_goals(emp_id, emp_name):
    goals = load_goals(emp_id)
    active  = [g for g in goals if g["status"] != "dropped"]
    done    = [g for g in active if g["status"] == "completed"]
    pending = [g for g in active if g["status"] == "pending"]

    print("\n" + "=" * 55)
    print(f"  🎯 MY GOALS — {emp_name} — {datetime.now().strftime('%Y-%m-%d')}")
    print("=" * 55)

    if not active:
        print("  No goals assigned to you today yet.")
        print("  Check back later or contact your Scrum Master.")
        print("=" * 55)
        return

    for g in active:
        if g["status"] == "completed":
            icon = "✅"
            detail = f"done in {fmt(g['time_taken_min'] * 60)}"
        else:
            priority_icon = "🔴" if g["priority"] == "high" else "🟡" if g["priority"] == "medium" else "🟢"
            icon = "⬜"
            detail = f"{priority_icon} {g['priority']} priority  ~{g.get('estimated_hours', 1)}h"
        print(f"  {icon}  #{g['id']}  {g['title']:<35}  {detail}")

    print("-" * 55)

    # Progress bar
    score = round((len(done) / len(active)) * 100) if active else 0
    bar = "█" * (score // 5) + "░" * (20 - score // 5)
    print(f"  Progress  : [{bar}]  {score}%")
    print(f"  Completed : {len(done)}/{len(active)} goals")

    # Estimated time remaining
    remaining_hours = sum(g.get("estimated_hours", 1) for g in pending)
    if remaining_hours > 0:
        print(f"  Remaining : ~{remaining_hours}h of work left")

    print("=" * 55 + "\n")

# ─────────────────────────────────────────────
#  COMPLETE A GOAL
# ─────────────────────────────────────────────
def complete_goal(emp_id, emp_name, goal_id):
    goals = load_goals(emp_id)

    for g in goals:
        if g["id"] == goal_id:
            if g["status"] == "completed":
                print(f"  [!] Goal #{goal_id} is already completed!")
                return
            if g["status"] == "dropped":
                print(f"  [!] Goal #{goal_id} was dropped by Scrum Master.")
                return

            completed_at = datetime.now()
            assigned_at  = datetime.strptime(g["assigned_at"], "%Y-%m-%d %H:%M:%S")
            time_taken   = round((completed_at - assigned_at).total_seconds() / 60, 1)

            g["status"]         = "completed"
            g["completed_at"]   = completed_at.strftime("%Y-%m-%d %H:%M:%S")
            g["time_taken_min"] = time_taken

            save_goals(emp_id, goals)

            print(f"\n  🎉 Great work! Goal completed: '{g['title']}'")
            print(f"  ⏱️  Time taken: {fmt(time_taken * 60)}")

            # Check if all goals done
            check_sprint_complete(emp_id, emp_name, goals)
            return

    print(f"  [!] Goal #{goal_id} not found.")

# ─────────────────────────────────────────────
#  CHECK SPRINT COMPLETE
# ─────────────────────────────────────────────
def check_sprint_complete(emp_id, emp_name, goals):
    active    = [g for g in goals if g["status"] != "dropped"]
    completed = [g for g in active if g["status"] == "completed"]

    if not active:
        return

    if len(completed) == len(active):
        now = datetime.now()

        print("\n" + "🎉" * 18)
        print(f"  SPRINT COMPLETE, {emp_name}! 🏆")
        print(f"  All {len(active)} goals done by {now.strftime('%I:%M %p')}")
        print(f"  The rest of your day is FREE TIME. You earned it! 🙌")
        print("🎉" * 18 + "\n")

        # Save sprint complete record
        summary = {
            "emp_id": emp_id,
            "emp_name": emp_name,
            "sprint_completed": True,
            "completed_at": now.strftime("%Y-%m-%d %H:%M:%S"),
            "total_goals": len(active),
            "message": "All sprint goals completed. Remaining time is free time."
        }
        mongo_db.sprint_summaries.replace_one(
            {"emp_id": emp_id, "date": now.strftime("%Y-%m-%d")},
            summary,
            upsert=True
        )

# ─────────────────────────────────────────────
#  LOGIN — Employee identifies themselves
# ─────────────────────────────────────────────
def login():
    employees = load_employees()
    if not employees:
        print("\n  [!] No employees registered yet.")
        print("  Ask your Scrum Master to register you first.")
        return None, None

    print("\n" + "=" * 55)
    print("  👤 WorkSense — Employee Login")
    print("=" * 55)
    print("\n  Registered employees:")
    for emp_id, emp in employees.items():
        print(f"  {emp_id}  →  {emp['name']}")

    print()
    emp_id = input("  Enter your Employee ID: ").strip()

    if emp_id not in employees:
        print(f"  [!] ID '{emp_id}' not found. Contact your Scrum Master.")
        return None, None

    emp_name = employees[emp_id]["name"]
    print(f"\n  Welcome, {emp_name}! 👋\n")
    return emp_id, emp_name

# ─────────────────────────────────────────────
#  INTERACTIVE MENU
# ─────────────────────────────────────────────
def menu():
    emp_id, emp_name = login()
    if not emp_id:
        return

    while True:
        print("\n" + "=" * 55)
        print(f"  🎯 WorkSense — {emp_name}'s Goals")
        print("=" * 55)
        print("  1. View my goals")
        print("  2. Mark a goal as complete")
        print("  3. Exit")
        print("=" * 55)

        choice = input("\n  Enter choice (1-3): ").strip()

        if choice == "1":
            show_my_goals(emp_id, emp_name)

        elif choice == "2":
            show_my_goals(emp_id, emp_name)
            try:
                gid = int(input("  Enter goal number to complete: ").strip())
                complete_goal(emp_id, emp_name, gid)
            except ValueError:
                print("  [!] Please enter a valid number.")

        elif choice == "3":
            print(f"\n  Goodbye, {emp_name}! Keep up the great work 💪\n")
            break

        else:
            print("  [!] Invalid choice. Enter 1-3.")

if __name__ == "__main__":
    menu()