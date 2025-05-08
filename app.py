from flask import Flask, render_template, request, redirect, url_for, session
from datetime import datetime, timezone
import json
import os
import math
# from dotenv import load_dotenv
# load_dotenv()   # ← will read ./ .env into os.environ

app = Flask(__name__)
app.jinja_env.globals.update(radians=math.radians, cos=math.cos, sin=math.sin)
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
    # if they've answered all questions, go to results
    if question_id < 1 or question_id > len(COFFEE_DATA['quiz']):
        return redirect(url_for('result'))
    
    q = COFFEE_DATA['quiz'][question_id-1]
    total_questions = len(COFFEE_DATA['quiz'])

    if request.method == 'POST':
        # Save the user's choice
        choice = request.form['choice']
        answers = session.get('answers', {})
        answers[str(question_id)] = choice
        session['answers'] = answers
        
        # Check if answer is correct and redirect to feedback page
        correct_answer = q['answer']
        is_correct = choice == correct_answer
        
        # Redirect to feedback page
        return redirect(url_for('feedback', 
                               question_id=question_id,
                               is_correct=str(is_correct).lower(),
                               selected=choice,
                               next_question=question_id+1 if question_id < total_questions else 0))

    return render_template(
        'quiz.html',
        question_id=question_id,
        total_questions=total_questions,
        question_text=q['question'],
        choices=q['choices'],
        image_url=q.get('image_url')   # ← this makes {{ image_url }} available
    )


@app.route('/feedback')
def feedback():
    """Show feedback for an answer"""
    question_id = int(request.args.get('question_id', 1))
    is_correct = request.args.get('is_correct', 'false').lower() == 'true'
    selected = request.args.get('selected', '')
    next_question = int(request.args.get('next_question', 0))
    
    #question data
    q = COFFEE_DATA['quiz'][question_id-1]
    correct_answer = q['answer']
    
    if next_question > 0 and next_question <= len(COFFEE_DATA['quiz']):
        next_url = url_for('quiz', question_id=next_question)
    else:
        next_url = url_for('result')
    
    # Coffee flavor descriptions for feedback
    flavor_descriptions = {
        'Ethiopian': 'Fruity berry notes, floral jasmine aromas, and a bright, complex acidity.',
        'Kenyan': 'Bright citrus notes, blackcurrant flavors, and bold with bright, tangy acidity.',
        'Colombian': 'Rich chocolate sweetness, nutty flavors, and a balanced smooth body.',
        'Sumatran': 'Earthy, herbal qualities with spice notes, and heavy body with low acidity.'
    }
    
    return render_template(
        'feedback.html',
        is_correct=is_correct,
        selected=selected,
        correct_answer=correct_answer,
        flavor_description=flavor_descriptions.get(correct_answer, ''),
        next_url=next_url,
        question_data=q
    )

@app.route('/debug/timestamps')
def debug_timestamps():
    """Display all timestamps recorded in the session for debugging purposes"""
    # Format the timestamps for better readability
    formatted_timestamps = {}
    
    for page, timestamp in session.get('timestamps', {}).items():
        # Convert ISO string to datetime for formatting
        try:
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            formatted_time = dt.strftime('%Y-%m-%d %H:%M:%S')
            formatted_timestamps[page] = {
                'raw': timestamp,
                'formatted': formatted_time,
                'time_ago': get_time_ago(dt)
            }
        except (ValueError, AttributeError):
            # In case the timestamp is not in the expected format
            formatted_timestamps[page] = {
                'raw': timestamp,
                'formatted': 'Invalid timestamp format',
                'time_ago': 'Unknown'
            }
    
    # Pass the data to an HTML template
    return render_template(
        'timestamp.html', 
        timestamps=formatted_timestamps,
        current_time=datetime.now(timezone.utc).isoformat()
    )

def get_time_ago(timestamp):
    """Format timestamp as a human-readable time ago string"""
    now = datetime.now(timezone.utc)
    
    if not timestamp.tzinfo:
        # If timestamp has no timezone, assume UTC
        timestamp = timestamp.replace(tzinfo=timezone.utc)
    
    delta = now - timestamp
    
    # Convert to a human-readable format
    seconds = delta.total_seconds()
    
    if seconds < 60:
        return f"{int(seconds)} seconds ago"
    elif seconds < 3600:
        return f"{int(seconds // 60)} minutes ago"
    elif seconds < 86400:
        return f"{int(seconds // 3600)} hours ago"
    else:
        return f"{int(seconds // 86400)} days ago"

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