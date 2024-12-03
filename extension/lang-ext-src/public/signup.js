// This is in public folder so it can be loaded by the background service worker on extension install

import {API_URL} from "./constants.js";

console.log("signup.js loaded");

document.addEventListener('DOMContentLoaded', function() {
  let currentScreen = 'welcome-screen';
  console.log("Dom content loaded");
  let email = "";
  let password = "";

  const languageMap = {
    "Spanish": "ES",
    "German": "DE",
    "Japanese": "JP",
    "French": "FR",
    "Italian": "IT",
    "Chinese": "CN",
    "Portuguese": "PT",
    "Russian": "RU",
    "Arabic": "AR",
    "Korean": "KR"
  };

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
    email = document.getElementById('email').value;
    password = document.getElementById('password').value;

    console.log("Submitted signup");
    if (email && password) {
      showScreen('language-screen');
    } else {
      alert('Please fill in all fields.');
    }
  }

  function submitSignin() {
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    fetch(API_URL + '/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "username": email,
            "password": password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.id) {
            const userId = data.id;
            chrome.storage.sync.set({user_id: userId});
      }})
}

function submitLanguages() {
  const languageSpeak = document.getElementById('language-speak').value; // English, disabled input
  const languageLearnSelect = document.getElementById('language-learn');
  const selectedLanguage = languageLearnSelect.options[languageLearnSelect.selectedIndex].text;
  const languageCode = languageMap[selectedLanguage]; // Get ISO 3166-1 alpha-2 code

  const userName = document.getElementById('user-name').value;

  const languageLearnJson = {
    languageLearning: selectedLanguage,
    languageCode: languageCode
  };

  fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password,
      name: userName,
      languageSpeak,
      languageLearning: languageLearnJson.languageLearning,
      languageCode: languageLearnJson.languageCode
    })
  }).then(response => response.json()).then(data => {
    if (data.success && data.id) {
      const userId = data.id;
      chrome.storage.sync.set({user_id: userId});
    }
  }).then(() => {
    alert(`You're ready to learn ${selectedLanguage} (ISO code: ${languageCode}). Email: ${email}!`);
  })

}

  document.getElementById('signupBtn').addEventListener('click', () => showScreen('signup-screen'));
  document.getElementById('signinBtn').addEventListener('click', () => showScreen('signin-screen'));
  document.getElementById('backBtn').addEventListener('click', goBack);
  document.getElementById('submitSignupBtn').addEventListener('click', submitSignup);
  document.getElementById('submitSigninBtn').addEventListener('click', submitSignin);
  document.getElementById('submitLanguagesBtn').addEventListener('click', submitLanguages);
});
