// Quiz functionality
document.addEventListener('DOMContentLoaded', function() {
    // Define correct answers for each question
    const correctAnswers = {
      '1': 'Kenyan',
      '2': 'Ethiopian',
      '3': 'Colombian',
      '4': 'Sumatran',
      '5': 'Kenyan'
    };
    
    // Get question ID from the page
    const questionIdElement = document.querySelector('.question-id');
    if (!questionIdElement) return;
    
    const questionId = questionIdElement.textContent.split(' ')[1];
    let score = parseInt(localStorage.getItem('quizScore') || '0');
    
    // Set up listeners for choice buttons
    const choiceButtons = document.querySelectorAll('.choice-button');
    choiceButtons.forEach(button => {
      button.addEventListener('click', function() {
        const selectedAnswer = this.dataset.answer;
        const correctAnswer = correctAnswers[questionId];
        
        // Hide all choice buttons
        choiceButtons.forEach(btn => btn.style.display = 'none');
        
        if (selectedAnswer === correctAnswer) {
          // Show correct feedback
          showCorrectFeedback(correctAnswer);
          score++;
          localStorage.setItem('quizScore', score);
        } else {
          // Show incorrect feedback
          showIncorrectFeedback(selectedAnswer, correctAnswer);
        }

        document.querySelector('.next-button').style.display = 'block';
      });
    });
    

    if (questionId === '1') {
      localStorage.setItem('quizScore', '0');
    }
    
    const resultsContainer = document.querySelector('.results-container');
    if (resultsContainer) {
      const finalScore = localStorage.getItem('quizScore') || '0';
      const totalQuestions = '5';
      document.querySelector('.score-number').textContent = `${finalScore}/${totalQuestions}`;
      
      const percentage = (parseInt(finalScore) / parseInt(totalQuestions) * 100).toFixed(0);
      document.querySelector('.score-percent').textContent = `${percentage}%`;

      let messageHeader = '';
      let messageText = '';
      
      if (finalScore === totalQuestions) {
        messageHeader = 'Perfect Score!';
        messageText = 'You\'re a coffee origin expert! Your knowledge of coffee flavors is exceptional.';
      } else if (parseInt(finalScore) >= parseInt(totalQuestions) * 0.8) {
        messageHeader = 'Great Job!';
        messageText = 'You have an excellent understanding of coffee origins and their flavor profiles.';
      } else if (parseInt(finalScore) >= parseInt(totalQuestions) * 0.6) {
        messageHeader = 'Well Done!';
        messageText = 'You have a good grasp of coffee origins. A little more practice and you\'ll be an expert!';
      } else if (parseInt(finalScore) >= parseInt(totalQuestions) * 0.4) {
        messageHeader = 'Not Bad!';
        messageText = 'You\'re on your way to understanding coffee origins. Keep learning!';
      } else {
        messageHeader = 'Keep Learning!';
        messageText = 'Coffee origins can be complex. Review the information and try again!';
      }
      
      document.querySelector('.results-header').textContent = messageHeader;
      document.querySelector('.results-message').textContent = messageText;
    }
  });
  
  function showCorrectFeedback(correctAnswer) {
    const feedbackContainer = document.createElement('div');
    feedbackContainer.className = 'feedback-container correct-feedback';
    feedbackContainer.innerHTML = `
      <h3>Correct! <span class="check-mark">✓</span></h3>
      <p>You identified the coffee origin correctly!</p>
    `;
    

    const correctButton = document.querySelector(`.choice-button[data-answer="${correctAnswer}"]`);
    if (correctButton) {
      correctButton.classList.add('correct-answer');
      correctButton.style.display = 'block';
    }
    
    document.querySelector('.question-container').appendChild(feedbackContainer);
  }
  
  function showIncorrectFeedback(selectedAnswer, correctAnswer) {
    const feedbackContainer = document.createElement('div');
    feedbackContainer.className = 'feedback-container incorrect-feedback';
    
    // Get the flavor descriptions for the correct answer
    const flavorDescriptions = {
      'Kenyan': 'Bright citrus notes with grapefruit and orange, wine-like with hints of black currant, and bold with bright, tangy acidity.',
      'Ethiopian': 'Fruity with blueberry and strawberry notes, floral notes of jasmine and bergamot, and high acidity with a wine-like quality.',
      'Colombian': 'Sweet caramel and chocolate notes, nutty flavors of almond and walnut, with medium acidity and balanced body.',
      'Sumatran': 'Distinctive earthy notes reminiscent of forest, herbal qualities with cedar and spice, and heavy body with smooth, low acidity.'
    };
    
    feedbackContainer.innerHTML = `
      <h3>Not quite! <span class="x-mark">✗</span></h3>
      <p>This is <strong>${correctAnswer} coffee</strong>, not ${selectedAnswer}!</p>
      <p>${correctAnswer} coffee is typically known for:</p>
      <ul>
        <li>${flavorDescriptions[correctAnswer]}</li>
      </ul>
    `;
    

    const selectedButton = document.querySelector(`.choice-button[data-answer="${selectedAnswer}"]`);
    if (selectedButton) {
      selectedButton.classList.add('incorrect-answer');
      selectedButton.style.display = 'block';
    }
    
    const correctButton = document.querySelector(`.choice-button[data-answer="${correctAnswer}"]`);
    if (correctButton) {
      correctButton.classList.add('correct-answer');
      correctButton.style.display = 'block';
    }
    
    document.querySelector('.question-container').appendChild(feedbackContainer);
  }