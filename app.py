from flask import Flask, render_template, request, redirect, url_for, session
from datetime import datetime, timezone
import json
import os
from dotenv import load_dotenv
load_dotenv()   # ← will read ./ .env into os.environ

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')  # fails fast if missing

@app.before_request
def make_session_structures():
    session.setdefault('timestamps', {})
    session.setdefault('answers', {})

@app.route('/')
def home():
    # Record time user entered home
    session['timestamps']['home'] = datetime.now(timezone.utc).isoformat()
    return render_template('home.html')

@app.route('/learn/<int:lesson_id>')
def learn(lesson_id):
    # Record entry time for this lesson
    session['timestamps'][f'learn_{lesson_id}'] = datetime.utcnow().isoformat()
    # lesson_data = COFFEE_DATA['lessons'][lesson_id-1]
    return render_template('learn.html', lesson_id=lesson_id)

@app.route('/wheel')
def wheel():
    session['timestamps']['wheel'] = datetime.utcnow().isoformat()
    return render_template('wheel.html')

@app.route('/quiz/<int:question_id>', methods=['GET', 'POST'])
def quiz(question_id):
    if request.method == 'POST':
        # Save the user's answer
        selected = request.form.get('choice')
        session['answers'][str(question_id)] = selected
        return redirect(url_for('quiz', question_id=question_id+1))
    # question = COFFEE_DATA['quiz'][question_id-1]
    return render_template('quiz.html', question_id=question_id)

@app.route('/result')
def result():
    # Compute score (placeholder logic)
    # correct_answers = COFFEE_DATA['quiz_answers']
    score = sum(1 for k,v in session['answers'].items() if v == 'PLACEHOLDER')
    total = len(session['answers'])
    return render_template('result.html', score=score, total=total)

if __name__ == '__main__':
    app.run(debug=True, port=5001)