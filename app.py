from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_pymongo import PyMongo
import os, base64, datetime

app = Flask(__name__)
app.secret_key = "secret123"

# MongoDB connection
app.config["MONGO_URI"] = "mongodb+srv://aashvip25:database1@cluster0.llph3dr.mongodb.net/memoroids"
mongo = PyMongo(app)

UPLOAD_FOLDER = "uploads"
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route("/save_photo", methods=["POST"])
def save_photo():
    if "username" not in session:
        return jsonify({"success": False, "message": "Not logged in"})

    data = request.get_json()
    img_data = data["image"].split(",")[1]  # remove base64 header
    filename = f"{session['username']}_{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}.png"
    filepath = os.path.join(UPLOAD_FOLDER, filename)

    # Save to uploads folder
    with open(filepath, "wb") as f:
        f.write(base64.b64decode(img_data))

    # Save reference in MongoDB
    mongo.db.photos.insert_one({
        "username": session["username"],
        "filename": filename,
        "timestamp": datetime.datetime.now()
    })

    return jsonify({"success": True})
