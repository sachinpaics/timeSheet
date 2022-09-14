/**
 * @author [Sachin Pai]
 * @email  [sachin.pai@atmecs.com]
 * @create date 2022-09-10 13:18:26
 * @desc [Attendance TimeSheet POC]
 */
 __________
Attendance Application using Flask and React
Major Dependencies:
Frontend - antd, moment
Backend - Flask, SqlAlchemy, redis
___________
This app uses redis to manage user sessions
Please make sure redis is installed and running
>> sudo service redis-server start
____________
Please use an virual environment and install the requirements.txt
>> pip3 install -r requirements.txt
____________
____________
To run the backend:
>> source venv/bin/activate
>> python3 backend/app.py
____________

To run the frontend:
>> cd frontend/

>> yarn install

>> yarn start
____________
____________

Python API Documentation for reference:
____________
Auth API'S
The user session's userId will be used for the API calls.
The password's are base64 encoded for this demo. 
___________
Register user:

curl --request POST 'localhost:5000/register' \
--header 'Content-Type: application/json' \
--data-raw '{firstName
    "first_name" : <firstname>,
    "last_name" : <lastName>,
    "email": <email>,
    "password":"<Base64 encoded password>"
}'
____________
Login User:

curl --location --request POST 'localhost:5000/login' \
--header 'Content-Type: application/json' \
--data-raw '{firstName
    "email": <email>,
    "password":"<Base64 encoded password>"
}'
____________
Check user Session:

curl --location --request GET 'localhost:5000/@me'
____________
Log out user:

curl --location --request POST 'localhost:5000/logout' \
--header 'Content-Type: application/json' \
--data-raw '{
     "email": <email>,
    "password":"<Base64 encoded password>"
}'
__________
__________
Attendance API'S:
___________
Set/Save the attendance in the DB:

curl --location --request POST 'http://localhost:5000/setAttendance' \
--header 'Content-Type: application/json' \
--data-raw '[
{
        "date": "08/08/2022",
        "day": "MONDAY",
        "duration": "00:00",
        "punch_in": "00:00",
        "punch_out": "00:00", 
        "week_num":32
    },
    {
        "date": "09/08/2022",
    .......
]'
___________
To get the attendance for the onGoing week:

curl --location --request GET 'http://localhost:5000/getLatestAttendance' \
--header 'Cookie: session=4b09b51a-******XlZ0AtNmkwg94Q'
___________
To get the all the attendance except the one for current week:

curl --location --request GET 'http://localhost:5000/getAttendance' \
--header 'Cookie: session=4b09b51a-***********oqCXpqXlZ0AtNmkwg94Q'
