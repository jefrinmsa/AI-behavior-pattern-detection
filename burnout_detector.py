import json
import os
import sys
import glob
from datetime import datetime

try:
    from sklearn.ensemble import IsolationForest
    import numpy as np
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("[!] scikit-learn is not installed. AI layer will not be available.")

LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")

def get_employee_id():
    if len(sys.argv) > 1:
        return sys.argv[1]
    
    emp_file = os.path.join(LOG_DIR, "employees.json")
    if not os.path.exists(emp_file):
        choice = input("\nNo employees.json found. Please manually enter an employee ID: ").strip()
        if not choice:
            print("Employee ID is required.")
            sys.exit(1)
        return choice
        
    with open(emp_file, "r") as f:
        employees = json.load(f)
        
    if not employees:
        print("No employees registered yet.")
        sys.exit(1)
        
    print("\nAvailable Employees:")
    for emp_id, emp in employees.items():
        print(f"  {emp_id} -> {emp['name']}")
        
    choice = input("\nEnter employee ID to check for burnout: ").strip()
    if choice not in employees:
        print("Invalid employee ID.")
        sys.exit(1)
        
    return choice

def load_reports():
    reports = []
    # Note: Currently reports are just report_YYYY-MM-DD.json 
    # If they were per-employee we would filter by emp_id.
    pattern = os.path.join(LOG_DIR, "report_*.json")
    for file_path in glob.glob(pattern):
        try:
            with open(file_path, "r") as f:
                data = json.load(f)
                reports.append(data)
        except Exception:
            pass
            
    # Sort chronologically by date
    reports.sort(key=lambda x: x.get("date", ""))
    return reports

def safe_get_break_min(report):
    bd = report.get("break_summary") or report.get("break_data") or {}
    return bd.get("total_break_min", 0)

def safe_get_goal_score(report):
    # In our upgraded report, goal score might be inside score_breakdown
    val = report.get("goal_score")
    if val is not None: return val
    sb = report.get("score_breakdown", {})
    return sb.get("goal", 0)

def get_risk_level(score):
    if score <= 30:
        return "🟢 HEALTHY"
    elif score <= 60:
        return "🟡 WATCH CLOSELY"
    elif score <= 80:
        return "🟠 AT RISK"
    else:
        return "🔴 BURNOUT DETECTED"

def check_productivity_trend(recent_reports):
    score = 0
    obs = []
    
    # Check if dropping consistently
    # Needs at least 3 days to check 3 days in a row (e.g. day1 > day2 > day3 is 2 drops, but user says "dropped 3 days in a row", meaning day1 > day2 > day3 > day4)
    # "Dropped 3 days in a row" -> implies 4 days of data where each day is lower than the last
    # Let's count consecutive drops ending on the last day.
    
    drops = 0
    for i in range(len(recent_reports) - 1, 0, -1):
        curr = recent_reports[i].get("productivity_score", 0)
        prev = recent_reports[i-1].get("productivity_score", 0)
        if curr < prev:
            drops += 1
        else:
            break
            
    if drops >= 5:
        score = 30
        first_drop = recent_reports[-1 - drops].get("productivity_score", 0)
        last_drop = recent_reports[-1].get("productivity_score", 0)
        obs.append(f"Productivity dropped from {first_drop}% to {last_drop}% over {drops} consecutive days")
    elif drops >= 3:
        score = 15
        first_drop = recent_reports[-1 - drops].get("productivity_score", 0)
        last_drop = recent_reports[-1].get("productivity_score", 0)
        obs.append(f"Productivity dropped from {first_drop}% to {last_drop}% over {drops} consecutive days")
        
    return score, obs

def check_overtime(recent_reports):
    score = 0
    obs = []
    
    days_9_10 = 0
    days_10_plus = 0
    
    for r in recent_reports:
        p_sec = r.get("productive_sec", 0)
        if p_sec >= 36000: # 10 hours
            days_10_plus += 1
        elif p_sec >= 32400: # 9 hours
            days_9_10 += 1
            
    if days_10_plus >= 3:
        score = 20
        obs.append("Employee worked 10+ hours for 3 or more days")
    elif (days_10_plus + days_9_10) >= 3:
        score = 10
        obs.append("Employee worked 9+ hours for 3 or more days")
        
    return score, obs

def check_break_skipping(recent_reports):
    score = 0
    obs = []
    
    days_under_30 = 0
    days_under_45 = 0
    
    for r in recent_reports:
        b_min = safe_get_break_min(r)
        if b_min < 30:
            days_under_30 += 1
        elif b_min < 45:
            days_under_45 += 1
            
    if days_under_30 >= 3:
        score = 20
        obs.append("Break time dropped to under 30 mins/day for 3+ days")
    elif (days_under_30 + days_under_45) >= 3:
        score = 10
        obs.append("Break time dropped to under 45 mins/day for 3+ days")
        
    return score, obs

def check_goal_drop(recent_reports):
    score = 0
    obs = []
    
    days_under_50 = 0
    days_under_70 = 0
    
    for r in recent_reports:
        g_score = safe_get_goal_score(r)
        if g_score < 50:
            days_under_50 += 1
        elif g_score < 70:
            days_under_70 += 1
            
    if days_under_50 >= 3:
        score = 20
        obs.append("Goal completion score below 50% for 3+ days")
    elif (days_under_50 + days_under_70) >= 3:
        score = 10
        obs.append("Goal completion score below 70% for 3+ days")
        
    return score, obs

def check_entertainment_spike(all_reports, recent_reports):
    score = 0
    obs = []
    
    if not all_reports:
        return score, obs
        
    all_ent = []
    for r in all_reports:
        cb = r.get("category_breakdown", {})
        all_ent.append(cb.get("Entertainment", 0))
        
    recent_ent = []
    for r in recent_reports:
        cb = r.get("category_breakdown", {})
        recent_ent.append(cb.get("Entertainment", 0))
        
    if not recent_ent:
        return score, obs
        
    all_avg = sum(all_ent) / len(all_ent) if all_ent else 0
    recent_avg = sum(recent_ent) / len(recent_ent)
    
    # If all_avg is very small, a spike is easy. Let's enforce a minimum 
    # to consider it a real spike if needed, or strictly follow rules:
    if all_avg > 0 and recent_avg >= (2 * all_avg):
        score = 10
        obs.append(f"Entertainment time this week ({int(recent_avg)}s avg) is double personal average ({int(all_avg)}s)")
        
    return score, obs

def generate_recommendations(signals):
    recs = []
    if signals["productivity_drop"] > 0 or signals["burnout_score"] >= 61:
        recs.append("Schedule a 1-on-1 conversation today")
    if signals["overtime"] > 0:
        recs.append("Ensure employee logs off on time; distribute workload if necessary")
    if signals["break_skipping"] > 0:
        recs.append("Ensure proper lunch and screen breaks are taken")
    if signals["goal_drop"] > 0:
        recs.append("Reduce sprint load by 20-30% next week")
    if signals["entertainment_spike"] > 0:
        recs.append("Discuss focus blocks or potential distractors gently")
        
    # Default fallback
    if not recs:
        recs.append("Keep monitoring normally. Everything looks okay right now.")
        
    return recs[:3] # Max 3 actionable recommendations

def run_burnout_check(emp_id):
    reports = load_reports()
    
    if len(reports) < 3:
        print("Not enough data yet. Need at least 3 days of reports to detect burnout.")
        return
        
    recent_reports = reports[-7:]
    
    # Evaluate rule-based signals
    score_prod, obs_prod = check_productivity_trend(recent_reports)
    score_ot, obs_ot = check_overtime(recent_reports)
    score_brk, obs_brk = check_break_skipping(recent_reports)
    score_goal, obs_goal = check_goal_drop(recent_reports)
    score_ent, obs_ent = check_entertainment_spike(reports, recent_reports)
    
    ai_score = 0
    ai_obs = []
    ai_active = False
    
    if len(reports) >= 14 and SKLEARN_AVAILABLE:
        ai_active = True
        
        # Prepare features for IsolationForest
        X = []
        for r in reports:
            x = [
                r.get("productivity_score", 0),
                safe_get_break_min(r),
                safe_get_goal_score(r),
                r.get("category_breakdown", {}).get("Entertainment", 0),
                r.get("productive_sec", 0)
            ]
            X.append(x)
            
        X_numpy = np.array(X)
        model = IsolationForest(contamination=0.1, random_state=42)
        model.fit(X_numpy)
        
        # Check today's data (the last element)
        prediction = model.predict([X[-1]])[0]
        if prediction == -1: # Anomaly
            ai_score = 20
            ai_obs.append("AI Anomaly detected in today's behavior pattern against historical baseline")
            
    elif len(reports) < 14:
        print("\n[!] AI layer needs 14 days of data to activate. Using rule based detection only.\n")
        
    total_score = score_prod + score_ot + score_brk + score_goal + score_ent + ai_score
    total_score = min(total_score, 100) # Cap at 100
    
    all_obs = obs_prod + obs_ot + obs_brk + obs_goal + obs_ent + ai_obs
    
    signals = {
        "productivity_drop": score_prod,
        "overtime": score_ot,
        "break_skipping": score_brk,
        "goal_drop": score_goal,
        "entertainment_spike": score_ent,
        "ai_bonus": ai_score,
        "burnout_score": total_score
    }
    
    recs = generate_recommendations(signals)
    risk_text = get_risk_level(total_score)
    today = reports[-1].get("date", datetime.now().strftime("%Y-%m-%d"))
    
    print("═══════════════════════════════════════════")
    print("  🧠 BURNOUT DETECTION REPORT")
    print(f"  Employee: {emp_id}")
    print(f"  Date: {today}")
    print("═══════════════════════════════════════════\n")
    
    print(f"  Risk Score    : {total_score}/100")
    print(f"  Risk Level    : {risk_text}\n")
    
    print("  Signal Breakdown:")
    print(f"  Productivity dropping    : +{score_prod:<2} pts  {'✓' if score_prod > 0 else '✗'}")
    print(f"  Overtime detected        : +{score_ot:<2} pts  {'✓' if score_ot > 0 else '✗'}")
    print(f"  Break skipping           : +{score_brk:<2} pts  {'✓' if score_brk > 0 else '✗'}")
    print(f"  Goal completion drop     : +{score_goal:<2} pts  {'✓' if score_goal > 0 else '✗'}")
    print(f"  Entertainment spike      : +{score_ent:<2} pts  {'✓' if score_ent > 0 else '✗'}")
    print(f"  AI anomaly bonus         : +{ai_score:<2} pts  {'✓' if ai_score > 0 else '✗'}\n")
    
    if all_obs:
        print("  Key Observations:")
        for o in all_obs:
            print(f"  → {o}")
        print()
        
    print("  Recommended Actions:")
    for r in recs:
        print(f"  → {r}")
        
    print("\n═══════════════════════════════════════════\n")
    
    # Save output
    output_dict = {
      "emp_id": emp_id,
      "date": today,
      "risk_score": total_score,
      "risk_level": risk_text[2:].strip(), # Remove emoji
      "signals": {
        "productivity_drop": score_prod,
        "overtime": score_ot,
        "break_skipping": score_brk,
        "goal_drop": score_goal,
        "entertainment_spike": score_ent,
        "ai_bonus": ai_score
      },
      "observations": all_obs,
      "recommended_actions": recs,
      "ai_layer_active": ai_active
    }
    
    out_path = os.path.join(LOG_DIR, f"burnout_{emp_id}_{today}.json")
    with open(out_path, "w") as f:
        json.dump(output_dict, f, indent=2)

if __name__ == "__main__":
    emp = get_employee_id()
    run_burnout_check(emp)
