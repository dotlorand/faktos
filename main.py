from flask import Flask, render_template, request, redirect, url_for, send_from_directory, jsonify
import sqlite3
import json

app = Flask(__name__)

def init_db():
    conn = sqlite3.connect('beats.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS beats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pattern TEXT
        )
    ''')
    conn.commit()
    conn.close()

@app.route("/")
def index():
    inst = list(enumerate(["Open Hat", "Closed Hat", "Clap", "Kick"]))

    init_db()

    conn = sqlite3.connect('beats.db')
    c = conn.cursor()
    c.execute('SELECT id, pattern FROM beats')
    beats = c.fetchall()
    conn.close()

    return render_template("index.html", inst=inst, beats=beats)

@app.route("/save_beat", methods=["POST"])
def save_beat():
    pattern = request.form["pattern"]
    conn = sqlite3.connect('beats.db')
    c = conn.cursor()
    c.execute('INSERT INTO beats (pattern) VALUES (?)', (pattern,))
    conn.commit()
    conn.close()
    return redirect(url_for('index'))

@app.route('/sounds/<path:filename>')
def serve_sound(filename):
    return send_from_directory('sounds', filename)

@app.route("/load_beat/<int:beat_id>", methods=["GET"])
def load_beat(beat_id):
    conn = sqlite3.connect('beats.db')
    c = conn.cursor()
    c.execute('SELECT pattern FROM beats WHERE id = ?', (beat_id,))
    beat = c.fetchone()
    conn.close()
    if beat:
        return jsonify(pattern=json.loads(beat[0]))
    return "Beat not found", 404

@app.route("/delete_beat/<int:beat_id>", methods=["POST"])
def delete_beat(beat_id):
    conn = sqlite3.connect('beats.db')
    c = conn.cursor()
    c.execute('DELETE FROM beats WHERE id = ?', (beat_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Beat deleted successfully"})

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
