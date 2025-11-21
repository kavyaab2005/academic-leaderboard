// flask-api/app.py
// =============================================
from flask import Flask, jsonify
app = Flask(__name__)


@app.route('/rank', methods=['GET'])
def rank():
return jsonify({ 'rank': 5, 'score': 92 })


app.run(port=6000)
