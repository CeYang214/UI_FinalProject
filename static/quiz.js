//quiz functionality
document.addEventListener('DOMContentLoaded', function() {
  //define coffee icon paths
  const coffeeIcons = {
    'Ethiopian': '/static/images/coffe_cup_black.png',
    'Colombian': '/static/images/coffe_cup_blue.png',
    'Sumatran': '/static/images/coffe_cup_brown.png',
    'Kenyan': '/static/images/coffe_cup_yellow.png'
  };
  
  //if we are on the quiz page
  const questionIdElement = document.querySelector('.question-id');
  if (questionIdElement) {
    const questionId = questionIdElement.textContent;
    
   
    if (questionId === '1') {
      localStorage.setItem('quizScore', '0');
    }
    
    //coffee cup icons
    const choiceButtons = document.querySelectorAll('.choice-button');
    choiceButtons.forEach(button => {
      const coffeeOrigin = button.dataset.answer;
      //fint the img
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
  
  //if we are on the results page
  const resultsContainer = document.querySelector('.results-container');
  if (resultsContainer) {
    const finalScore = localStorage.getItem('quizScore') || '0';
    const totalQuestions = '5';
    
    //scores
    const scoreNumber = document.querySelector('.score-number');
    if (scoreNumber) {
      scoreNumber.textContent = `${finalScore}/${totalQuestions}`;
    }
    
    const scorePercent = document.querySelector('.score-percent');
    if (scorePercent) {
      const percentage = (parseInt(finalScore) / parseInt(totalQuestions) * 100).toFixed(0);
      scorePercent.textContent = `${percentage}%`;
    }
  }
  
  //if we are on the feedback page
  const feedbackContainer = document.querySelector('.feedback-container');
  if (feedbackContainer) {
    // smooth transitions!!!
    document.body.style.opacity = '1';
    feedbackContainer.style.opacity = '1';
  }
});