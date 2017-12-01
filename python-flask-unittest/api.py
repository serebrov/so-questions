from flask import Flask, jsonify
from flask.ext.httpauth import HTTPBasicAuth

app = Flask(__name__)
auth = HTTPBasicAuth()


@auth.verify_password
def verify_password(user, password):
    return password == 'secret'


@app.route('/')
@auth.login_required
def index():
    return jsonify({'status': 'ok'})
