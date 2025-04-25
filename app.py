from flask import Flask, render_template, request, redirect, url_for, session
from datetime import datetime, timezone
import json
import os
#from dotenv import load_dotenv
#load_dotenv()   # ← will read ./ .env into os.environ

app = Flask(__name__)
#app.secret_key = os.getenv('SECRET_KEY')  # fails fast if missing
app.secret_key = 'random-key'

# load 10-question bank once at startup
with open('questions.json') as f:
    COFFEE_DATA = json.load(f)


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

@app.route('/quiz/<int:question_id>', methods=['GET','POST'])
def quiz(question_id):
    # if they’ve answered all questions, go to results
    if question_id < 1 or question_id > len(COFFEE_DATA['quiz']):
        return redirect(url_for('result'))

    q = COFFEE_DATA['quiz'][question_id-1]

    if request.method == 'POST':
        session['answers'][str(question_id)] = request.form['choice']
        return redirect(url_for('quiz', question_id=question_id+1))

    return render_template(
        'quiz.html',
        question_id=question_id,
        question_text=q['question'],
        choices=q['choices']
    )


@app.route('/result')
def result():
    score = 0
    for qid, ans in session['answers'].items():
        correct = COFFEE_DATA['quiz'][int(qid)-1]['answer']
        if ans == correct:
            score += 1

    total = len(COFFEE_DATA['quiz'])
    return render_template('result.html', score=score, total=total)

if __name__ == '__main__':
    app.run(debug=True, port=5001)