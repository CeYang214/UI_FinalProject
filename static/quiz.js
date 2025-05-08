document.addEventListener('DOMContentLoaded', function() {
  // Define coffee icon paths
  const coffeeIcons = {
    'Ethiopian': '/static/images/coffe_cup_black.png',
    'Colombian': '/static/images/coffe_cup_blue.png',
    'Sumatran': '/static/images/coffe_cup_brown.png',
    'Kenyan': '/static/images/coffe_cup_yellow.png'
  };

  // Function to detect the current page type
  function getCurrentPageType() {
    if (document.querySelector('.question-id')) return 'quiz';
    if (document.querySelector('.results-container')) return 'results';
    if (document.querySelector('.feedback-container')) return 'feedback';
    return 'other';
  }

  const pageType = getCurrentPageType();

  // === QUIZ PAGE LOGIC ===
  if (pageType === 'quiz') {
    const questionId = document.querySelector('.question-id').textContent;
    
    // Reset wrong answers when starting a new quiz
    if (questionId === '1') {
      sessionStorage.setItem('wrongAnswers', '[]');
    }
    
    // Set up coffee cup icons for choice buttons
    const choiceButtons = document.querySelectorAll('.choice-button');
    choiceButtons.forEach(button => {
      const coffeeOrigin = button.dataset.answer;
      // Find or create the img
      let img = button.querySelector('img');
      if (!img) {
        img = document.createElement('img');
        button.prepend(img);
      }
      img.src = coffeeIcons[coffeeOrigin];
      img.alt = `${coffeeOrigin} Coffee`;
      img.style.width = '120px';
      img.style.height = 'auto';
    });
  }

  // === FEEDBACK PAGE LOGIC ===
  else if (pageType === 'feedback') {
    const feedbackContainer = document.querySelector('.feedback-container');
    
    // Set coffee icons on the feedback page
    const correctIconImg = document.getElementById('correct-coffee-icon');
    if (correctIconImg) {
      const correctType = feedbackContainer.dataset.correctAnswer;
      correctIconImg.src = coffeeIcons[correctType];
    }
    
    const selectedIconImg = document.getElementById('selected-coffee-icon');
    if (selectedIconImg) {
      const selectedType = feedbackContainer.dataset.selectedAnswer;
      selectedIconImg.src = coffeeIcons[selectedType];
    }
    
    // Track wrong answers for the results page
    const isCorrect = feedbackContainer.dataset.isCorrect === 'true';
    if (!isCorrect) {
      // Get existing wrong answers or initialize empty array
      let wrongAnswers = JSON.parse(sessionStorage.getItem('wrongAnswers') || '[]');
      
      // Add this wrong answer
      wrongAnswers.push({
        questionId: feedbackContainer.dataset.questionId,
        questionText: feedbackContainer.dataset.questionText,
        userAnswer: feedbackContainer.dataset.selectedAnswer,
        correctAnswer: feedbackContainer.dataset.correctAnswer
      });
      
      // Store back in sessionStorage
      sessionStorage.setItem('wrongAnswers', JSON.stringify(wrongAnswers));
    }
    
    // Smooth transitions
    document.body.style.opacity = '1';
    feedbackContainer.style.opacity = '1';
  }

  // === RESULTS PAGE LOGIC ===
  else if (pageType === 'results') {
    // Create a section for wrong answers if it doesn't exist yet
    if (!document.querySelector('.wrong-answers-section')) {
      const wrongAnswersData = JSON.parse(sessionStorage.getItem('wrongAnswers') || '[]');
      
      if (wrongAnswersData.length > 0) {
        // Create the wrong answers section
        const wrongAnswersSection = document.createElement('div');
        wrongAnswersSection.className = 'wrong-answers-section mt-4 mb-4';
        wrongAnswersSection.innerHTML = `
          <h3 class="text-center mb-3">Questions to Review</h3>
          <div class="wrong-answers-list"></div>
        `;
        
        // Find where to insert it (before the coffee icons collection)
        const coffeeIcons = document.querySelector('.coffee-icons-collection');
        if (coffeeIcons) {
          const resultsContainer = document.querySelector('.results-container');
          resultsContainer.insertBefore(wrongAnswersSection, coffeeIcons);
          
          // Add each wrong answer
          const wrongAnswersList = wrongAnswersSection.querySelector('.wrong-answers-list');
          wrongAnswersData.forEach(item => {
            const wrongAnswerItem = document.createElement('div');
            wrongAnswerItem.className = 'wrong-answer-item mb-3 p-3 border rounded';
            
            // Create the coffee icon comparison
            const iconComparison = `
              <div style="display: flex; justify-content: center; gap: 30px; margin-top: 10px;">
                <div>
                  <p>You selected:</p>
                  <p class="text-danger">${item.userAnswer}</p>
                </div>
                <div>
                  <p>Correct answer:</p>
                  <p class="text-success">${item.correctAnswer}</p>
                </div>
              </div>
            `;
            
            wrongAnswerItem.innerHTML = `
              <p class="question-text mb-2"><strong>Question ${item.questionId}:</strong> ${item.questionText}</p>
              ${iconComparison}
            `;
            wrongAnswersList.appendChild(wrongAnswerItem);
          });
        }
      }
    }
  }
});