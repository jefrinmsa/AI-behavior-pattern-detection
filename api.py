import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
from db import get_db

app = Flask(__name__)
CORS(app)

db = get_db()

@app.errorhandler(Exception)
def handle_exception(e):
    return jsonify({
        "error": "Something went wrong",
        "details": str(e)
    }), 500

@app.errorhandler(404)
def handle_404(e):
    return jsonify({
        "error": "Not found",
        "details": "The requested endpoint does not exist."
    }), 404

# ───────────────────────────────────────────
# ENDPOINT 1 — GET ALL EMPLOYEES
# ───────────────────────────────────────────
@app.route('/api/employees', methods=['GET'])
def get_employees():
    emps = list(db.employees.find({}, {"_id": 0}))
    emp_list = [{"id": e.get("emp_id", ""), "name": e.get("name", "")} for e in emps]
    return jsonify({"employees": emp_list})

# ───────────────────────────────────────────
# ENDPOINT 2 — GET EMPLOYEE DAILY REPORT
# ───────────────────────────────────────────
@app.route('/api/employee/<emp_id>/report', methods=['GET'])
def get_daily_report(emp_id):
    date_str = request.args.get('date', datetime.now().strftime("%Y-%m-%d"))
    
    report = db.reports.find_one({"date": date_str}, {"_id": 0})
    if not report:
        return jsonify({
            "error": "No report found",
            "date": date_str,
            "emp_id": emp_id
        }), 404
        
    bash_summary = db.bash_summaries.find_one({"date": date_str}, {"_id": 0})
    if bash_summary:
        report["bash_summary"] = bash_summary
        
    report["emp_id"] = emp_id
    report["date"] = date_str
    
    return jsonify(report)

# ───────────────────────────────────────────
# ENDPOINT 3 — GET EMPLOYEE GOALS
# ───────────────────────────────────────────
@app.route('/api/employee/<emp_id>/goals', methods=['GET'])
def get_goals(emp_id):
    date_str = request.args.get('date', datetime.now().strftime("%Y-%m-%d"))
    
    goals = list(db.goals.find({"emp_id": emp_id, "date": date_str}, {"_id": 0}))
    
    tot = len(goals)
    comp = sum(1 for g in goals if g.get("status") == "completed")
    pend = sum(1 for g in goals if g.get("status") == "pending")
    drop = sum(1 for g in goals if g.get("status") == "dropped")
    rate = int((comp / tot) * 100) if tot > 0 else 0
    sprint_complete = (tot > 0 and pend == 0 and drop == 0)
    
    return jsonify({
        "emp_id": emp_id,
        "date": date_str,
        "goals": goals,
        "summary": {
            "total": tot,
            "completed": comp,
            "pending": pend,
            "dropped": drop,
            "completion_rate": rate,
            "sprint_complete": sprint_complete
        }
    })

# ───────────────────────────────────────────
# ENDPOINT 4 — COMPLETE A GOAL
# ───────────────────────────────────────────
@app.route('/api/employee/<emp_id>/goals/<goal_id>/complete', methods=['POST'])
def complete_goal(emp_id, goal_id):
    date_str = request.args.get('date', datetime.now().strftime("%Y-%m-%d"))
    
    try:
        gid = int(goal_id)
    except ValueError:
        gid = goal_id
    
    target = db.goals.find_one({"emp_id": emp_id, "date": date_str, "id": gid})
    if not target:
        return jsonify({"error": "Not found", "details": "Goal ID not located"}), 404
        
    now = datetime.now()
    est = target.get("estimated_hours", 1)
    
    db.goals.update_one(
        {"_id": target["_id"]},
        {"$set": {
            "status": "completed",
            "completed_at": now.strftime("%Y-%m-%d %H:%M:%S"),
            "time_taken_min": int(est * 60)
        }}
    )
    
    pend = db.goals.count_documents({"emp_id": emp_id, "date": date_str, "status": "pending"})
    sprint_complete = (pend == 0)
    
    return jsonify({
        "success": True,
        "message": "Goal completed successfully",
        "goal_title": target.get("title", ""),
        "time_taken_min": int(est * 60),
        "sprint_complete": sprint_complete
    })

# ───────────────────────────────────────────
# ENDPOINT 5 — GET BREAK DATA
# ───────────────────────────────────────────
@app.route('/api/employee/<emp_id>/breaks', methods=['GET'])
def get_breaks(emp_id):
    date_str = request.args.get('date', datetime.now().strftime("%Y-%m-%d"))
    
    breaks = list(db.breaks.find({"date": date_str}, {"_id": 0}))
    state = db.break_state.find_one({"_id": "current"}) or {"on_break": False}
    limit = 90
    used = sum(b.get("duration_min", 0) for b in breaks)
    
    return jsonify({
        "date": date_str,
        "breaks": breaks,
        "summary": {
            "total_breaks": len([b for b in breaks if b.get("end_time")]),
            "total_break_min": used,
            "break_limit_min": limit,
            "remaining_min": max(0, limit - used),
            "exceeded": used > limit,
            "on_break_now": state.get("on_break", False)
        }
    })

# ───────────────────────────────────────────
# ENDPOINT 6 — START BREAK
# ───────────────────────────────────────────
@app.route('/api/employee/<emp_id>/breaks/start', methods=['POST'])
def start_break(emp_id):
    # Set boolean state FIRST
    db.break_state.update_one(
        {"_id": "current"},
        {"$set": {"on_break": True}},
        upsert=True
    )
    
    date_str = request.args.get('date', datetime.now().strftime("%Y-%m-%d"))
    now = datetime.now()
    
    # Count existing breaks today
    count = db.breaks.count_documents({"date": date_str})
    
    db.breaks.insert_one({
        "date": date_str,
        "break_number": count + 1,
        "start_time": now.strftime("%H:%M:%S")
    })
    
    # Calculate used break time
    breaks = list(db.breaks.find({"date": date_str}, {"_id": 0}))
    used = sum(b.get("duration_min", 0) for b in breaks)
    
    return jsonify({
        "success": True,
        "message": "Break started",
        "on_break": True,
        "start_time": now.strftime("%H:%M:%S"),
        "break_limit_remaining_min": max(0, 90 - used)
    })

# ───────────────────────────────────────────
# ENDPOINT 7 — END BREAK
# ───────────────────────────────────────────
@app.route('/api/employee/<emp_id>/breaks/end', methods=['POST'])
def end_break(emp_id):
    # Set boolean state FIRST
    db.break_state.update_one(
        {"_id": "current"},
        {"$set": {"on_break": False}},
        upsert=True
    )
    
    date_str = request.args.get('date', datetime.now().strftime("%Y-%m-%d"))
    now = datetime.now()
    
    # Close all open breaks
    closed_duration = 0
    open_breaks = list(db.breaks.find({"date": date_str, "end_time": {"$exists": False}}))
    for b in open_breaks:
        try:
            start_dt = datetime.strptime(b["start_time"], "%H:%M:%S")
            end_dt = datetime.strptime(now.strftime("%H:%M:%S"), "%H:%M:%S")
            dur = round(abs((end_dt - start_dt).total_seconds()) / 60, 1)
        except Exception:
            dur = 0
        
        db.breaks.update_one(
            {"_id": b["_id"]},
            {"$set": {"end_time": now.strftime("%H:%M:%S"), "duration_min": dur}}
        )
        closed_duration = dur
    
    breaks = list(db.breaks.find({"date": date_str}, {"_id": 0}))
    used = sum(b.get("duration_min", 0) for b in breaks)
    
    return jsonify({
        "success": True,
        "message": "Break ended",
        "on_break": False,
        "duration_min": closed_duration,
        "total_break_today_min": used,
        "limit_exceeded": used > 90
    })

# ───────────────────────────────────────────
# ENDPOINT 8 — GET BURNOUT DATA
# ───────────────────────────────────────────
@app.route('/api/employee/<emp_id>/burnout', methods=['GET'])
def get_burnout(emp_id):
    role = request.args.get('role', '')
    if role.lower() != 'manager':
        return jsonify({
            "error": "Access denied",
            "message": "Burnout data is manager only"
        }), 403
        
    date_str = request.args.get('date', datetime.now().strftime("%Y-%m-%d"))
    
    data = db.burnout.find_one({"emp_id": emp_id, "date": date_str}, {"_id": 0})
    if not data:
        return jsonify({"error": "Not found", "details": "No burnout report found"}), 404
        
    rec = db.recovery.find_one({"emp_id": emp_id}, {"_id": 0})
    if rec:
        try:
            detected = datetime.strptime(rec.get("burnout_detected_date", date_str), "%Y-%m-%d")
            today = datetime.strptime(date_str, "%Y-%m-%d")
            days = (today - detected).days
        except Exception:
            days = 0
            
        data["recovery"] = {
            "status": rec.get("status", "unknown"),
            "initial_score": rec.get("initial_score", 0),
            "current_score": data.get("risk_score", 0),
            "days_since_detected": max(0, days)
        }
        
    return jsonify(data)

# ───────────────────────────────────────────
# ENDPOINT 9 — GET TEAM PROGRESS
# ───────────────────────────────────────────
@app.route('/api/team/progress', methods=['GET'])
def get_team_progress():
    date_str = request.args.get('date', datetime.now().strftime("%Y-%m-%d"))
    emps = list(db.employees.find({}, {"_id": 0}))
    
    team_list = []
    total_prod = 0
    sprints_complete = 0
    at_risk = 0
    
    state = db.break_state.find_one({"_id": "current"}) or {"on_break": False}
    
    for edata in emps:
        eid = edata.get("emp_id", "")
        name = edata.get("name", eid)
        
        report = db.reports.find_one({"date": date_str}, {"_id": 0}) or {}
        pscore = report.get("productivity_score", 0)
        
        goals = list(db.goals.find({"emp_id": eid, "date": date_str}, {"_id": 0}))
        gtot = len(goals)
        gcomp = sum(1 for g in goals if g.get("status") == "completed")
        gpend = sum(1 for g in goals if g.get("status") == "pending")
        gdrop = sum(1 for g in goals if g.get("status") == "dropped")
        grate = int((gcomp / gtot) * 100) if gtot > 0 else 0
        sprint_done = (gtot > 0 and gpend == 0 and gdrop == 0)
        
        burnout = db.burnout.find_one({"emp_id": eid, "date": date_str}, {"_id": 0}) or {}
        brisk = burnout.get("risk_level", "HEALTHY")
        
        team_list.append({
            "emp_id": eid,
            "name": name,
            "productivity_score": pscore,
            "goals_completed": gcomp,
            "goals_total": gtot,
            "goal_completion_rate": grate,
            "sprint_complete": sprint_done,
            "burnout_risk": brisk,
            "on_break": state.get("on_break", False)
        })
        
        total_prod += pscore
        if sprint_done: sprints_complete += 1
        if brisk != "HEALTHY": at_risk += 1
        
    avg_prod = int(total_prod / len(team_list)) if team_list else 0
    
    return jsonify({
        "date": date_str,
        "team": team_list,
        "summary": {
            "total_employees": len(team_list),
            "sprints_complete": sprints_complete,
            "at_risk_employees": at_risk,
            "average_productivity": avg_prod
        }
    })

# ───────────────────────────────────────────
# ENDPOINT 10 — ASSIGN GOAL
# ───────────────────────────────────────────
@app.route('/api/employee/<emp_id>/goals', methods=['POST'])
def assign_goal(emp_id):
    data = request.json or {}
    title = data.get("title", "New Goal")
    prio = data.get("priority", "medium")
    est = float(data.get("estimated_hours", 2))
    
    date_str = request.args.get('date', datetime.now().strftime("%Y-%m-%d"))
    
    count = db.goals.count_documents({"emp_id": emp_id, "date": date_str})
    new_id = count + 1
    
    db.goals.insert_one({
        "emp_id": emp_id,
        "date": date_str,
        "id": new_id,
        "title": title,
        "priority": prio,
        "estimated_hours": est,
        "status": "pending",
        "assigned_by": "Scrum Master",
        "assigned_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "completed_at": None,
        "time_taken_min": None
    })
    
    pipeline = [
        {"$match": {"emp_id": emp_id, "date": date_str, "status": "pending"}},
        {"$group": {"_id": None, "total": {"$sum": "$estimated_hours"}}}
    ]
    result = list(db.goals.aggregate(pipeline))
    tot_est = result[0]["total"] if result else 0
    overload = tot_est > 8
    
    emp = db.employees.find_one({"emp_id": emp_id}, {"_id": 0}) or {}
    name = emp.get("name", emp_id)
    
    return jsonify({
        "success": True,
        "message": f"Goal assigned to {name}",
        "goal_id": new_id,
        "overload_warning": overload,
        "total_estimated_hours": tot_est
    })

# ───────────────────────────────────────────
# ENDPOINT 11 — GET EMPLOYEE HISTORY
# ───────────────────────────────────────────
@app.route('/api/employee/<emp_id>/history', methods=['GET'])
def get_employee_history(emp_id):
    history = []
    base_dt = datetime.now()
    for i in range(6, -1, -1):
        d = base_dt - timedelta(days=i)
        d_str = d.strftime("%Y-%m-%d")
        report = db.reports.find_one({"date": d_str}, {"_id": 0}) or {}
        score = report.get("productivity_score", 0)
        history.append({"name": d.strftime("%a"), "score": score, "date": d_str})
    return jsonify({"history": history})

# ───────────────────────────────────────────
# ENDPOINT 12 — GET TEAM HISTORY
# ───────────────────────────────────────────
@app.route('/api/team/history', methods=['GET'])
def get_team_history():
    history = []
    base_dt = datetime.now()
    emp_count = db.employees.count_documents({})
    
    for i in range(6, -1, -1):
        d = base_dt - timedelta(days=i)
        d_str = d.strftime("%Y-%m-%d")
        
        report = db.reports.find_one({"date": d_str}, {"_id": 0}) or {}
        score = report.get("productivity_score", 0)
        
        history.append({"name": f"Day {7-i}", "activity": score, "date": d_str})
        
    return jsonify({"history": history})

# ───────────────────────────────────────────
# ENDPOINT 13 — HEALTH CHECK
# ───────────────────────────────────────────
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "running",
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "version": "WorkSense API v2.0 (MongoDB)"
    })

def print_startup():
    print("\n" + "=" * 43)
    print("  WorkSense API Server v2.0 (MongoDB)")
    print("  Running on http://localhost:5000")
    print("  ")
    print("  Available endpoints:")
    print("  GET  /api/employees")
    print("  GET  /api/employee/<id>/report")
    print("  GET  /api/employee/<id>/goals")
    print("  POST /api/employee/<id>/goals/<id>/complete")
    print("  GET  /api/employee/<id>/breaks")
    print("  POST /api/employee/<id>/breaks/start")
    print("  POST /api/employee/<id>/breaks/end")
    print("  GET  /api/employee/<id>/burnout")
    print("  GET  /api/team/progress")
    print("  POST /api/employee/<id>/goals")
    print("  GET  /api/health")
    print("  GET  /api/employee/<id>/history")
    print("  GET  /api/team/history")
    print("=" * 43 + "\n")

if __name__ == '__main__':
    print_startup()
    app.run(port=5000, debug=True, use_reloader=False)
