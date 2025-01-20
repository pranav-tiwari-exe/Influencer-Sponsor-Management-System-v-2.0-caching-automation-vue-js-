from flask import current_app as app, render_template, request, jsonify,send_file
from flask_security import auth_required, roles_required, login_user, logout_user
from .datastore import datastore
from werkzeug.security import check_password_hash, generate_password_hash
from .model import db
from .tasks import create_campaign_csv,status_email
from celery.result import AsyncResult
import os
from flask_login import current_user

@app.get('/')
def home():
    return render_template("index.html")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return render_template('index.html')

@app.post("/user_login")
def user_login():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"message": "E-mail not provided"}), 400
    
    user = datastore.find_user(email=email)
    password = data.get("password")
    if not user or not password:
        return jsonify({"message": "Incorrect E-mail or Password"}), 400
    
    if check_password_hash(user.password, password):
        if not user.active:
            return { "message": "You have not been approved yet!!"},400
        login_user(user)
        return jsonify({"token": user.get_auth_token(), "email": email, "role": user.roles[0].name,"id": user.id})
    else:
        return jsonify({"message": "Wrong Password"}), 401
    

@app.post("/create_user")
def create_user():
    data = request.get_json()
    email = data.get('email')
    if not email:
        print("email")
        return jsonify({"message": "E-mail not provided"}), 400
    
    if not datastore.find_user(email=email):
        role = data.get('role')
        if not role:
            return jsonify({"message": "Role not provided"}), 400
        username = data.get('username')
        if not username:
            return jsonify({"message": "Username not provided"}), 404
        password = data.get('password')
        if not password:
            return jsonify({"message": "Password not provided"}), 401
        
        hashed_password = generate_password_hash(password)
        if (role=="influencer"):
            user = datastore.create_user(email=email, password=hashed_password, roles=[role], username=username, category=data.get("category"),niche=data.get("niche"),platform=data.get('platform'))
        else:
            user = datastore.create_user(email=email, password=hashed_password, roles=[role], username=username, type=data.get('type'), address=data.get('address'),active=False)
        
        db.session.commit()
        login_user(user)
        return jsonify({"token": user.get_auth_token(), "email": email, "role": user.roles[0].name ,"id":user.id,"active":user.active})
    
    else:
        return jsonify({"message": "E-mail already registered"}), 400

@app.get("/logout")
@auth_required("token")
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"})

@app.get("/approvesponsor/<int:sponsor_id>")
@auth_required("token")
@roles_required("admin")
def approvesponsor(sponsor_id):
    user=datastore.find_user(id=sponsor_id)
    if not user:
        return {"message": "User Not Found"},400
    if user.active:
        return {"message": "User Already Approved"},400
    status_email.delay(user.email,user.active,"approve")
    user.active=True
    db.session.commit()
    return {"message": "User Approved"}

@app.delete("/deleteuser/<int:user_id>")
@auth_required("token")
def deleteuser(user_id):
    user=datastore.find_user(id=user_id)
    if not user:
        return {"message":"User Not Found"}
    status_email.delay(user.email,user.active,"delete")
    db.session.delete(user)
    db.session.commit()
    return {"message":"User Successfully Deleted!!!"}


@auth_required('token')
@app.route("/download_campaign_csv/<int:sponsor_id>")
def download_csv(sponsor_id):
    task = create_campaign_csv.delay(sponsor_id)
    return jsonify({"task-id": task.id})

@app.get('/get-csv/<task_id>')
def get_csv(task_id):
    task_result = AsyncResult(task_id)
    
    if task_result.failed():
        return jsonify({"message": "Task failed", "error": str(task_result.result)}), 500

    if task_result.ready():
        filename = task_result.result
        if not filename:
            return jsonify({"message": "Task completed but no file was generated"}), 404
        return send_file(filename, as_attachment=True)

    return jsonify({"message": "Task is still in progress"}), 202


    
#For saving profile photos
@auth_required("token")
@app.route ('/uploadProfile/<int:user_id>', methods=['POST'])
def upload_file(user_id):
    if 'file' not in request.files:
        return {"message": "No file part"}, 400
    upload_dir = 'static/uploads'
    if not os.path.exists(upload_dir):
        print(1)
        os.makedirs(upload_dir)
    
    file = request.files['file']
    filename = f"{user_id}_{file.filename}"  
    file_path = os.path.join('static/uploads', filename)
    file.save(file_path)

    user=datastore.find_user(id=user_id)
    user.profile='/static/uploads/'+filename
    db.session.commit()

    return {"message":'File uploaded successfully!'}