import json
import os
from datetime import datetime

LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")
os.makedirs(LOG_DIR, exist_ok=True)

# ─────────────────────────────────────────────
#  EMPLOYEE REGISTRY
#  In real app this would be a database
#  For hackathon demo we use a simple JSON file
# ─────────────────────────────────────────────
EMPLOYEES_FILE = os.path.join(LOG_DIR, "employees.json")

def load_employees():
    if not os.path.exists(EMPLOYEES_FILE):
        return {}
    with open(EMPLOYEES_FILE, "r") as f:
        return json.load(f)

def save_employees(employees):
    with open(EMPLOYEES_FILE, "w") as f:
        json.dump(employees, f, indent=2)

def add_employee(name):
    employees = load_employees()
    emp_id = f"emp_{len(employees) + 1:03d}"
    if any(e["name"].lower() == name.lower() for e in employees.values()):
        print(f"  [!] Employee '{name}' already exists.")
        return
    employees[emp_id] = {
        "id": emp_id,
        "name": name,
        "joined": datetime.now().strftime("%Y-%m-%d"),
    }
    save_employees(employees)
    print(f"  ✅ Employee added: {name} (ID: {emp_id})")

def list_employees():
    employees = load_employees()
    if not employees:
        print("  [!] No employees registered yet.")
        return {}
    print("\n  Registered Employees:")
    print("  " + "-" * 35)
    for emp_id, emp in employees.items():
        print(f"  {emp_id}  →  {emp['name']}")
    print()
    return employees

# ─────────────────────────────────────────────
#  GOALS FILE PER EMPLOYEE PER DAY
# ─────────────────────────────────────────────
def goals_file(emp_id, date_str=None):
    if date_str is None:
        date_str = datetime.now().strftime("%Y-%m-%d")
    return os.path.join(LOG_DIR, f"goals_{emp_id}_{date_str}.json")

def load_goals(emp_id, date_str=None):
    path = goals_file(emp_id, date_str)
    if not os.path.exists(path):
        return []
    with open(path, "r") as f:
        return json.load(f)

def save_goals(emp_id, goals, date_str=None):
    path = goals_file(emp_id, date_str)
    with open(path, "w") as f:
        json.dump(goals, f, indent=2)

# ─────────────────────────────────────────────
#  ASSIGN GOAL TO EMPLOYEE
# ─────────────────────────────────────────────
def assign_goal(emp_id, title, priority="medium", estimated_hours=1.0):
    employees = load_employees()
    if emp_id not in employees:
        print(f"  [!] Employee ID '{emp_id}' not found.")
        return

    goals = load_goals(emp_id)

    # Check overload — warn if too many hours assigned
    total_estimated = sum(g.get("estimated_hours", 1) for g in goals if g["status"] == "pending")
    if total_estimated + estimated_hours > 8:
        print(f"  ⚠️  Warning: {employees[emp_id]['name']} already has {total_estimated}h assigned today.")
        print(f"      Adding this goal brings total to {total_estimated + estimated_hours}h — over 8h limit!")
        confirm = input("      Assign anyway? (y/n): ").strip().lower()
        if confirm != "y":
            print("  Goal not assigned.")
            return

    goal = {
        "id": len(goals) + 1,
        "title": title,
        "priority": priority,             # low / medium / high
        "estimated_hours": estimated_hours,
        "status": "pending",              # pending / completed / dropped
        "assigned_by": "Scrum Master",
        "assigned_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "completed_at": None,
        "time_taken_min": None,
    }

    goals.append(goal)
    save_goals(emp_id, goals)

    emp_name = employees[emp_id]["name"]
    print(f"  ✅ Goal assigned to {emp_name}: '{title}' [{priority} priority, ~{estimated_hours}h]")

# ─────────────────────────────────────────────
#  DROP A GOAL
# ─────────────────────────────────────────────
def drop_goal(emp_id, goal_id):
    goals = load_goals(emp_id)
    for g in goals:
        if g["id"] == goal_id:
            g["status"] = "dropped"
            save_goals(emp_id, goals)
            print(f"  🗑️  Goal #{goal_id} dropped: '{g['title']}'")
            return
    print(f"  [!] Goal #{goal_id} not found for this employee.")

# ─────────────────────────────────────────────
#  VIEW ALL EMPLOYEES PROGRESS
# ─────────────────────────────────────────────
def view_team_progress():
    employees = load_employees()
    if not employees:
        print("  [!] No employees registered.")
        return

    print("\n" + "=" * 60)
    print(f"  📊 TEAM PROGRESS — {datetime.now().strftime('%Y-%m-%d')}")
    print("=" * 60)

    for emp_id, emp in employees.items():
        goals = load_goals(emp_id)
        active = [g for g in goals if g["status"] != "dropped"]
        done   = [g for g in active if g["status"] == "completed"]
        pending = [g for g in active if g["status"] == "pending"]

        if not active:
            print(f"\n  👤 {emp['name']:<20}  No goals assigned today")
            continue

        score = round((len(done) / len(active)) * 100) if active else 0
        bar = "█" * (score // 10) + "░" * (10 - score // 10)

        status_icon = "✅" if score == 100 else "⚠️ " if score < 50 else "🟡"
        print(f"\n  {status_icon} {emp['name']:<20}  [{bar}]  {score}%  ({len(done)}/{len(active)} goals)")

        if pending:
            for g in pending:
                priority_icon = "🔴" if g["priority"] == "high" else "🟡" if g["priority"] == "medium" else "🟢"
                print(f"      {priority_icon} #{g['id']} {g['title']}")

    print("\n" + "=" * 60)

# ─────────────────────────────────────────────
#  VIEW GOALS FOR ONE EMPLOYEE
# ─────────────────────────────────────────────
def view_employee_goals(emp_id):
    employees = load_employees()
    if emp_id not in employees:
        print(f"  [!] Employee '{emp_id}' not found.")
        return

    goals = load_goals(emp_id)
    emp_name = employees[emp_id]["name"]

    print(f"\n  Goals for {emp_name}:")
    print("  " + "-" * 50)

    if not goals:
        print("  No goals assigned yet.")
        return

    for g in goals:
        if g["status"] == "completed":
            icon = "✅"
            detail = f"done in {fmt(g['time_taken_min'] * 60)}"
        elif g["status"] == "dropped":
            icon = "🗑️ "
            detail = "dropped"
        else:
            priority_icon = "🔴" if g["priority"] == "high" else "🟡"
            icon = "⬜"
            detail = f"pending  {priority_icon} {g['priority']}"
        print(f"  {icon}  #{g['id']}  {g['title']:<35}  {detail}")
    print()

# ─────────────────────────────────────────────
#  FORMAT TIME HELPER
# ─────────────────────────────────────────────
def fmt(seconds):
    seconds = int(seconds)
    h = seconds // 3600
    m = (seconds % 3600) // 60
    if h > 0:
        return f"{h}h {m}m"
    return f"{m}m"

# ─────────────────────────────────────────────
#  INTERACTIVE MENU
# ─────────────────────────────────────────────
def menu():
    while True:
        print("\n" + "=" * 55)
        print("  🧑‍💼 WorkSense — Scrum Master Panel")
        print("=" * 55)
        print("  1. Add employee")
        print("  2. Assign goal to employee")
        print("  3. Drop a goal")
        print("  4. View one employee's goals")
        print("  5. View whole team progress")
        print("  6. Exit")
        print("=" * 55)

        choice = input("\n  Enter choice (1-6): ").strip()

        if choice == "1":
            name = input("  Employee name: ").strip()
            if name:
                add_employee(name)

        elif choice == "2":
            employees = list_employees()
            if not employees:
                continue
            emp_id = input("  Enter employee ID: ").strip()
            title = input("  Goal title: ").strip()
            priority = input("  Priority (low/medium/high) [default medium]: ").strip() or "medium"
            try:
                hours = float(input("  Estimated hours [default 1]: ").strip() or "1")
            except ValueError:
                hours = 1.0
            if emp_id and title:
                assign_goal(emp_id, title, priority, hours)

        elif choice == "3":
            employees = list_employees()
            if not employees:
                continue
            emp_id = input("  Enter employee ID: ").strip()
            view_employee_goals(emp_id)
            try:
                gid = int(input("  Goal number to drop: ").strip())
                drop_goal(emp_id, gid)
            except ValueError:
                print("  [!] Enter a valid number.")

        elif choice == "4":
            employees = list_employees()
            if not employees:
                continue
            emp_id = input("  Enter employee ID: ").strip()
            view_employee_goals(emp_id)

        elif choice == "5":
            view_team_progress()

        elif choice == "6":
            print("\n  Goodbye! 👋\n")
            break

        else:
            print("  [!] Invalid choice. Enter 1-6.")

if __name__ == "__main__":
    menu()