// This is in public folder so it can be loaded by the background service worker on extension install

document.addEventListener('DOMContentLoaded', function() {
  let currentScreen = 'welcome-screen';
  
  function showScreen(screenId) {
    document.getElementById(currentScreen).classList.remove('active');
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;
    
    document.querySelector('.back-btn').style.display = 
      screenId === 'welcome-screen' ? 'none' : 'block';
  }

  function goBack() {
    showScreen('welcome-screen');
  }

  function submitSignup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email && password) {
      showScreen('language-screen');
    } else {
      alert('Please fill in all fields.');
    }
  }

  function submitSignin() {
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    if (email && password) {
      showScreen('language-screen');
    } else {
      alert('Please fill in all fields.');
    }
  }

  function submitLanguages() {
    // Need to implement API calls here instead of alert
    const languageSpeak = document.getElementById('language-speak').value;
    const languageLearn = document.getElementById('language-learn').value;

    alert(`You're ready to learn ${languageLearn}!`);
  }
  document.getElementById('signupBtn').addEventListener('click', () => showScreen('signup-screen'));
  document.getElementById('signinBtn').addEventListener('click', () => showScreen('signin-screen'));
  document.getElementById('backBtn').addEventListener('click', goBack);
  document.getElementById('submitSignupBtn').addEventListener('click', submitSignup);
  document.getElementById('submitSigninBtn').addEventListener('click', submitSignin);
  document.getElementById('submitLanguagesBtn').addEventListener('click', submitLanguages);
});