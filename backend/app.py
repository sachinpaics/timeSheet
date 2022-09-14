from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_session import Session
from config import ApplicationConfig
from models import Attendance, db, User
import datetime
import base64


### UTILS ###

app = Flask(__name__)
app.config.from_object(ApplicationConfig)

CORS(app, supports_credentials=True)
bcrypt = Bcrypt(app)
server_session = Session(app)
db.init_app(app)
with app.app_context():
    db.create_all()


######## AUTH API'S ###

@app.route("/@me")
def get_current_user():
    # This function checks if the session is valid.
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "error": "Unauthorized"
        }), 401

    user = User.query.filter_by(id=user_id).first()
    return jsonify({
        "id": user.id,
        "email": user.email,
        "name": user.first_name,
        "last_name": user.last_name
    })


@app.route("/register", methods=["POST"])
def register_user():
    # This function is used to register a new user.
    # Once registered it also creates session right away for this user.
    email = request.json["email"]
    password = base64.b64decode(request.json["password"]).decode()
    first_name = request.json["first_name"].capitalize()
    last_name = request.json["last_name"].capitalize()
    user_exists = User.query.filter_by(email=email).first() is not None
    if user_exists:
        return jsonify({
            "error": "User already exists!"
        }), 409
    hashed_password = bcrypt.generate_password_hash(email+password)
    new_user = User(email=email, password=hashed_password,
                    first_name=first_name, last_name=last_name)
    db.session.add(new_user)
    db.session.commit()

    session["user_id"] = new_user.id

    return jsonify({
        "id": new_user.id,
        "email": new_user.email
    })


@app.route("/login", methods=["POST"])
def login_user():
    # This api is used to login and create a session of an existing user.
    email = request.json["email"]
    password = base64.b64decode(request.json["password"]).decode()
    user = User.query.filter_by(email=email).first()
    if user is None:
        return jsonify({
            "error": "Unauthorized"
        }), 401
    if not bcrypt.check_password_hash(user.password, email+password):
        return jsonify({
            "error": "Unauthorized"
        }), 401
    session["user_id"] = user.id
    return jsonify({
        "id": user.id,
        "email": user.email
    })


@app.route("/logout", methods=["POST"])
def logout_user():
    # This method is responsible for killing the user session to log the user out.
    session.pop("user_id")
    return "200"


### TIME-SHEET API'S###

def get_current_week_dates():
    # This method reurns a list of array for the ongoing week.
    today = datetime.date.today()
    days = [(today + (datetime.timedelta(days=i))).strftime("%d/%m/%Y")
            for i in range(0 - today.weekday(), 7 - today.weekday())]
    return days


def get_week():
    # This method is returns the list of dict with date and its corresponding day.
    days_of_week = [
        "MONDAY", "TUESDAY", "WEDNESDAY",
        "THURSDAY", "FRIDAY", "SATURDAY",
        "SUNDAY"
    ]
    days = get_current_week_dates()
    weekly = list()
    for i in range(len(days)):
        weekly.append(
            {"day": days_of_week[i], "date": days[i]})
    return weekly


@app.route("/setAttendance", methods=['POST'])
def set_attendance():
    # This function is used for persistantly saving the timesheet for the ongoing week.
    user_id = session.get("user_id")
    email = User.query.filter_by(id=user_id).first().email
    time_list = (request.json)
    for res in time_list:
        day = res['day']
        date = res['date']
        punch_in = res['punch_in']
        punch_out = res['punch_out']
        duration = res['duration']
        week_num = res['week_num']
        record_attendance = Attendance(
            email=email, day=day, date=date, punch_in=punch_in, punch_out=punch_out, duration=duration, week_num=week_num)
        record_exists = Attendance.query.filter_by(
            email=email, date=date).first() is not None
        if record_exists:
            curr = Attendance.query.filter_by(email=email, date=date).first()
            curr.punch_in = punch_in
            curr.punch_out = punch_out
            curr.duration = duration
            curr.week_num = week_num
            db.session.commit()
        else:
            db.session.add(record_attendance)
            db.session.commit()
    return jsonify(time_list)


@app.route("/initCurrWeekAttendance", methods=['GET'])
def init_attendance():
    # This function initiates the timesheet for the current week of the logged in user or a new user.
    week_num = datetime.date.today().isocalendar()[1]
    start_time = '00:00'
    end_time = '00:00'
    curr_dates_list = get_week()
    user_id = session.get("user_id")
    email = User.query.filter_by(id=user_id).first().email
    for res in curr_dates_list:
        day = res['day']
        date = res['date']
        punch_in = start_time
        punch_out = end_time
        duration = "00:00"
        record_attendance = Attendance(
            email=email, day=day, date=date, punch_in=punch_in, punch_out=punch_out, duration=duration, week_num=week_num)
        db.session.add(record_attendance)
        db.session.commit()
    return '200'


@app.route("/getAttendance", methods=['GET'])
def get_attendance():
    # This function returns all the records from previous weeks for the logged in user, if it exists.
    week_num = datetime.date.today().isocalendar()[1]
    user_id = session.get("user_id")
    email = User.query.filter_by(id=user_id).first().email
    query = Attendance.query.filter(
        Attendance.email == email, Attendance.week_num != week_num).all()
    attendance_week = list()
    for res in query:
        attendance_week.append({
            "id": res.id,
            "day": res.day,
            "date": res.date,
            "punch_in": res.punch_in,
            "punch_out": res.punch_out,
            "duration": res.duration,
            "week_num": res.week_num
        })
    return jsonify(attendance_week)


@app.route("/getLatestAttendance", methods=['GET'])
def get_latest_attendance():
    # This method returns the attendance for the current week for the logged in user.
    week_num = datetime.date.today().isocalendar()[1]
    user_id = session.get("user_id")
    email = User.query.filter_by(id=user_id).first().email
    query = Attendance.query.filter(
        Attendance.week_num == week_num, Attendance.email == email).all()
    if len(query) == 0:
        init_attendance()
    query = Attendance.query.filter(
        Attendance.email == email, Attendance.week_num == week_num).all()
    attendance_week = list()
    for res in query:
        attendance_week.append({
            "id": res.id,
            "day": res.day,
            "date": res.date,
            "punch_in": res.punch_in,
            "punch_out": res.punch_out,
            "duration": res.duration,
            "week_num": res.week_num
        })
    return jsonify(attendance_week)


if __name__ == "__main__":
    app.debug = True
    app.run()