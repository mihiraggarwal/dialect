import { useState, useEffect } from 'react';
import './App.css';
import {SETTINGS_ICON} from './constants.js';
// Don't like using icon library, would prefer b64 images. Maybe port over later
import {Star, ChevronRight, ChevronLeft, ArrowUpRight, Settings, HelpCircle, ArrowRight, ArrowLeft, CheckCircle, BookCheck, CircleCheck } from "lucide-react"


const API_URL = "http://localhost:5000";
// README: Run npm run build and load unpacked extension from build folder to test on browser

/* eslint-disable react/prop-types */ 


// Language must be ISO 3166-1 alpha-2 code for country. For testing, assuming learning german.
// Need to prompt gemini on sign up to save this into db
// UserID required to load and store settings. routing to be implemneted

function makePost(url, data) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['user_id'], (result) => {
      const auth = result.user_id;

      fetch(API_URL + url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": auth
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        console.error('Error:', error);
        reject(error);
      });
    });
  });
}

function Navbar({language, user_id, showSettings}) {

  const lang = language.toLowerCase();
  const src_url = `https://hatscripts.github.io/circle-flags/flags/${lang}.svg`;

  return (
    <div className='navbar'>
      <p className='logo'>dialect.</p>
      <Settings onClick={() => showSettings()} className='settings-icon' />
    </div>
  )
}

function Space({height}) {

  return (
    <div style={{height: height+"px"}}></div>
  )
}

function SectionHeader({textWdith, text}) {
  let borderWidth = 50 - Math.round(textWdith/2);
  return (
    <div className='section-header-container'>
      <div className='section-header-container-border-l' style={{"width" : `${borderWidth}%`}}>

      </div>
      <div className='section-header-container-border-r' style={{"width" : `${borderWidth}%`}}>

      </div>
      <h2 className='section-header' >{text}</h2>
    </div>
  )
}


function CardButton({clickedFunc,arg,  children}) {
  return (
    <div className='card-btn-container' onClick={()=> clickedFunc(arg)}>
      <span className='card-shadow'></span>
      <span className='card-edge'></span>
      <div className='card-btn-left'>
        {children}
      </div>
      <div className='card-btn-right'>
        <ChevronRight />
      </div>
    </div>
  )
}

// Havent tested on all percentage values. Could mess up
function ProgressBar({ progress, label }) {
  return (
    <div className='progress-bar-container'>
      <div className='progress-bar-label'>
        {label}
      </div>
      <div className="progress-bar">
      <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
    </div>
    </div>
  );
};

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.user_id) {
        chrome.storage.sync.set({ 'user_id': data.user_id }, () => {
          onLogin(data.user_id);
        });
      } else {
        setError('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="logo">dialect.</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}



// favWord allows for the word to be favourited, generateWordContextViews will generate the context views for the word. Will require
// passing of routing function down to this component.
function WordCard({translation, word, favWord,masterWord, generateWordContextViews}) {


  return (
    <div className='word-card-container'>
      <div className='word-card-upper'>
        <div className='word-card-texts'>
          <p className='word-card-header'>
            {word}
          </p>
          <p className='word-card-subheader'>
            {translation}
          </p>
        </div>
        <div className='word-card-btns'>
          <div className='check-container' onClick={() => masterWord({translation : word})}>
            <CircleCheck size={17} color='#9ca3af'/>
          </div>
          <div className='star-container' onClick={() => favWord({translation: word})}>
            <Star size={17} color='#9ca3af' />
          </div>
        </div>
      </div>

      <div className='word-card-lower' onClick={() => generateWordContextViews(word, translation)}>
        <p className='word-card-text'>
          View word in context
        </p>
        <ChevronRight />
      </div>
    </div>
  )
}

function SmallButton({clickedFunc, children}) {

  return (
    <div className='small-btn-container' onClick={()=> clickedFunc()}>
      <span className='shadow'></span>
      <span className='edge'></span>
      <div className='small-btn-front'>
        <div className='small-btn-container-left'>
          {children}
        </div>
        <div className='small-btn-container-right'>
          <ChevronRight />
        </div>
      </div>
    </div>
  )
}

function BigButton({clickedFunc, children}) {
  return (
    <div className='small-btn-container big' onClick={()=> clickedFunc()}>
      <span className='shadow'></span>
      <span className='edge'></span>
      <div className='small-btn-front'>
        <div className='small-btn-container-left'>
          {children}
        </div>
        <div className='small-btn-container-right'>
          <ArrowUpRight />
        </div>
      </div>
    </div>
  )
}

function MainInfoCard({ title, content }) {
  return (
    <div className="main-info-card">
      <div className="card-content">
        <h1 className="card-content-value">{content}</h1>
        <p className="card-title">{title}</p>
      </div>
    </div>
  );
}

function MainPage({fetchedData, routeSettings, routeTodayWords, routeQuiz, routeCustomQuiz}) {

  const lang = fetchedData.languageCode.toLowerCase();
  const flagSrc = `https://hatscripts.github.io/circle-flags/flags/${lang}.svg`;

  function openKnowledgeGraph() {
    const newTabUrl = chrome.runtime.getURL('knowledge.html');
    chrome.tabs.create({ url: newTabUrl });
  }
  
  return (
    <div className='main-container'>
      <Navbar language='ES' showSettings={routeSettings} user_id={"1234"}/>
      <div className='main-content'>
        <h1 className='main-content-header'>Welcome back,  {fetchedData.name}!</h1>
        <div className='main-info-cards'>
          <MainInfoCard title="New Words" content={fetchedData.todayNewSeen} />
          <MainInfoCard title="Total Words Learned" content={fetchedData.totalWordsLearned} />
          <MainInfoCard title="Quizzes Attempted" content={(fetchedData.quizzesTaken)} />
        </div>
        <SectionHeader textWdith={13} text="Overview" />
        <CardButton clickedFunc={routeTodayWords} arg={"today"}>
            <div className='card-btn-content'>
              <p className='card-btn-text'>
                View today's {fetchedData.todaySeen} words
              </p>
              <ProgressBar progress={Math.round((fetchedData.todayNewSeen / fetchedData.newWordsGoal)*100)} label={`${fetchedData.todayNewSeen}/${fetchedData.newWordsGoal} new words to meet goal`}>
              </ProgressBar>
            </div>
        </CardButton>
        <Space height={20}/>
        <SectionHeader textWdith={11} text="Review"/>
        <CardButton clickedFunc={routeQuiz}>
          <div className='card-btn-content'>
            <p className='card-btn-text'>
              Take a quiz on today&apos;s words
            </p>
            <p className='card-btn-subtext'>
              {fetchedData.quizzesTaken} / {fetchedData.todayNewSeen} words reviewed today
            </p>
          </div>
        </CardButton>
        <Space height={20}/>
        <SectionHeader textWdith={14} text="Practice" />
        <CardButton clickedFunc={routeCustomQuiz}>
          <div className='card-btn-content'>
            <p className='card-btn-text'>
              Take a custom quiz
            </p>
            <p className='card-btn-subtext'>
              Practice with random words, or set a time range
            </p>
          </div>
        </CardButton>
        <Space height={15} />
        <div className='footer-btns'>
        <BigButton clickedFunc={openKnowledgeGraph}>
          <img src={flagSrc} alt='flag' className='flag-icon'/>
          <p className='small-btn-text'>
            View Vocabulary Graph
          </p>
        </BigButton>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: "100%",}}>
        <SmallButton clickedFunc={() => routeTodayWords("favorites")}>
          <Star />
          <p className='small-btn-text'>
            Favorites
          </p>
        </SmallButton>
        <SmallButton clickedFunc={() => routeTodayWords("mastered")}>
          <BookCheck />
          <p className='small-btn-text'>
            Mastered
          </p>
        </SmallButton>
        </div>
        </div>
        
      </div>
    </div>
  )
}

const ViewWordInContext = ({ word, translation, sentences, setActivePage }) => {
  return (
    <div className="context-page">
      <div className="back-navbar" onClick={() => setActivePage(null)}>
        <div className="back-navbar-btn">
          <ChevronLeft />
          <p className="back-navbar-text">Back</p>
        </div>
      </div>

      <div className="context-card">
        <h2 className="context-word">{word}</h2>
        <p className="context-translation">{translation}</p>
        <div className="context-sentences">
          {sentences.map((sentence, index) => (
            <p key={index} className="context-sentence">
              {sentence}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

function TodayWordsPage({ wordsToShow, setActivePage }) {
  const [currentContext, setCurrentContext] = useState(null);

  function favouriteWord(word) {
    makePost("/favourite", {"favorites": word})
  }

  function masterWord(word) {
    makePost("/master", {"mastered" : word})
  }

  async function generateContextSentences(word, translation) {
    // Retrieve language from storage
    const lang = await new Promise((resolve, reject) => {
      chrome.storage.sync.get(['language'], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result.language);
        }
      });
    });
  
    // Get sentences from the server
    const results = await makePost("/genContext", {
      word: word,
      lang: lang,
      translated: translation,
    });
  
    // Update state with the fetched data
    setCurrentContext({ word, translation, sentences: results.sentences });
  }

  return currentContext ? (
    <ViewWordInContext
      word={currentContext.word}
      translation={currentContext.translation}
      sentences={currentContext.sentences}
      setActivePage={setCurrentContext}
    />
  ) : (
    <div className="today-words-page">
      <div className="back-navbar">
        <div className="back-navbar-btn" onClick={() => setActivePage(0)}>
          <ChevronLeft />
          <p className="back-navbar-text">Back</p>
        </div>
      </div>

      <div className="today-words-container">
        {Object.keys(wordsToShow).map((word) => (
          <WordCard
            key={word}
            word={word}
            translation={wordsToShow[word]}
            favWord={favouriteWord}
            masterWord={masterWord}
            generateWordContextViews={generateContextSentences}
          />
        ))}
      </div>
    </div>
  );
}

function evalSentence(originalSentence, inputSentence) {
  return new Promise(async (resolve, reject) => {
    try {
      const { available } = await ai.languageModel.capabilities();

      if (available === "no") {
        throw new Error("Language model is not available.");
      }

      const session = await ai.languageModel.create();

      const prompt = `
        Is the sentence "${inputSentence}" a correct translation of the sentence "${originalSentence}"? Return a JSON object {result : true/false}.
      `;

      const result = await session.prompt(prompt);

      const resultText = JSON.parse(result.text);
      
      resolve(resultText);
    } catch (error) {
      console.error("Error evaluating sentence:", error);
      reject(error);
    }
  });
}

function generateQuiz(words, sentences, lang) {
  return new Promise(async (resolve, reject) => {
    try {
      const { available } = await ai.languageModel.capabilities();

      if (available === "no") {
        throw new Error("Language model is not available.");
      }

      const session = await ai.languageModel.create();

      const validWords = words.filter((word) => isNaN(word));

      let toConvert = [...validWords, ...sentences];

      // Shuffle and take the first 10 items
      toConvert = toConvert.sort(() => Math.random() - 0.5).slice(0, 10);

      // Build the prompt
      const prompt = `
        Make an MCQ quiz of 10 questions in which each question asks the user to translate from ${lang} to English from the following words, phrases, and sentences: ${toConvert.join(
        "\\n"
      )}. Avoid using proper nouns like names. The quiz should be in the JSON schema:
        Question = {
          type: string (must be either word or sentence),
          'display': string (word in ${lang}),
          options: array[string, string, string, string] (in English),
          'correct_choice': integer (index for options. if type=sentence, set null),
          context_hint: string (an English sentence with one word replaced by the original word (in ${lang}). if type=sentence, set null)
        }
        Return: Array<Question>
      `;

      // Prompt the model and get the result
      const result = await session.prompt(prompt);

      // Parse and return the quiz questions
      const quizQuestions = JSON.parse(result.text);
      resolve(quizQuestions);
    } catch (error) {
      // Handle errors
      console.error("Error generating quiz:", error);
      reject(error);
    }
  });
}
function QuizPage({ fetchedData, setActivePage, dateRange }) {
  const [dataRecvd, setDataRecvd] = useState(false);
  const [quizData, setQuizData] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const lang = fetchedData.languageLearning.toLowerCase();
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        let quiz;
        if (dateRange == null) {
          const words = Object.keys(fetchedData?.todaySeenWords || {});
          const sentences = Object.keys(fetchedData?.todaySeenSentences || {});
          const allWords = words.concat(sentences);
          // Gemini flash
          quiz = await makePost('/quiz', { words: allWords, language: lang });

          //Gemini Nano
          // quiz = await generateQuiz(words, sentences, lang);
        } else {
          const response = await makePost("/getWordsInRange", {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          });
          const fetchedWords = response?.words || [];
          quiz = await makePost('/quiz', { words: fetchedWords, language: lang });
        }
        setQuizData(quiz || {});
      } catch (error) {
        console.error("Error fetching quiz data:", error);
        setQuizData({});
      } finally {
        setDataRecvd(true);
      }
    };
  
    fetchQuizData();
  }, [fetchedData, dateRange]);

  if (!dataRecvd) {
    return <div className="loader">Loading...</div>;
  }

  const handleOptionSelect = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      questionNumber: currentQuestion + 1,
      question: quizData.questions?.[currentQuestion]?.display || '',
      selectedAnswerIndex: optionIndex,
      selectedAnswer: quizData.questions?.[currentQuestion]?.options?.[optionIndex] || '',
      isCorrect: optionIndex === quizData.questions?.[currentQuestion]?.correct_choice,
    };
    setAnswers(newAnswers);
  };

  const handleSentenceInput = (e) => {
    setUserInput(e.target.value);
  };

  const handleSentenceSubmit = async () => {
    const currentQuestionData = quizData.questions?.[currentQuestion];
    if (currentQuestionData?.type === 'sentence') {
      try {
        // Can switch to backend API based on need
        //Gemini Flash
        const response = await makePost('/quiz/evalSentence', {
          translatedSentence: currentQuestionData.display,
          inputtedSentence: userInput,
        });
        // Gemini Nano
        // const response = await evalSentence(currentQuestionData.display, userInput);
        const isCorrect = response.result;
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = {
          questionNumber: currentQuestion + 1,
          question: currentQuestionData?.display || '',
          selectedAnswer: userInput,
          isCorrect: isCorrect,
        };
        setAnswers(newAnswers);
      } catch (error) {
        console.error("Error evaluating sentence:", error);
      }
    }
    setUserInput('');
  };
  if (!dataRecvd) {
    return <div className="loader">Loading...</div>;
  }
  if (submitted) {
    const totalCorrect = answers.filter(answer => answer.isCorrect).length;
    const totalQuestions = quizData.questions?.length || 0;

    return (
      <div className="quiz-results">
        <div className='back-navbar'>
        <div className='back-navbar-btn' onClick={() => setActivePage(0)}>
          <ChevronLeft />
          <p className='back-navbar-text'>Back</p>
        </div>
      </div>
        <h2>Quiz Results</h2>
        <p>You answered {totalCorrect} out of {totalQuestions} questions correctly.</p>
        <div className="results-list">
          {answers.map((answer, index) => (
            <div key={index} className="result-item">
              <h3>Question {answer.questionNumber}</h3>
              <p><strong>Question:</strong> {answer.question}</p>
              <p><strong>Your Answer:</strong> {answer.selectedAnswer || 'No answer provided'}</p>
              {answer.isCorrect ? (
                <p className="correct">Correct!</p>
              ) : (
                <p className="incorrect">Incorrect.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const navigateQuestion = (direction) => {
    setShowHint(false);
    if (direction === 'next' && currentQuestion < (quizData.questions?.length || 0) - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else if (direction === 'prev' && currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const submitQuiz = async () => {
    setSubmitted(true);
    try {
      await makePost('/quizComplete', { answers });
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };

  const currentQuestionData = quizData.questions?.[currentQuestion];

  return (
    <div className="quiz-page">
      <div className='back-navbar'>
        <div className='back-navbar-btn' onClick={() => setActivePage(0)}>
          <ChevronLeft />
          <p className='back-navbar-text'>Back</p>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className='quiz-progress-container'>
        <span className="quiz-progress-text">{currentQuestion + 1} / {quizData.questions?.length || 0}</span>
        <div className="quiz-progress">
          <div className="quiz-progress-bar" style={{ width: `${((currentQuestion + 1) / (quizData.questions?.length || 1)) * 100}%` }} />
        </div>
      </div>

      {/* Quiz Content */}
      <div className="quiz-container">
        <div className="quiz-question">
          <h2>{currentQuestionData?.display || 'No Question Available'}</h2>

          {currentQuestionData?.context_hint && (
            <button 
              className={`hint-button ${showHint ? 'active' : ''}`}
              onClick={() => setShowHint(!showHint)}
            >
              <HelpCircle size={20} />
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
          )}

          {showHint && (
            <div className="context-hint">{currentQuestionData.context_hint}</div>
          )}
        </div>

        <div className="quiz-content">
          {currentQuestionData?.type === 'word' ? (
            <div className="options-grid">
              {currentQuestionData.options?.map((option, index) => (
                <button
                  key={index}
                  className={`option-button ${
                    answers[currentQuestion]?.selectedAnswerIndex === index ? 'selected' : ''
                  }`}
                  onClick={() => handleOptionSelect(index)}
                >
                  {option}
                  {answers[currentQuestion]?.selectedAnswerIndex === index && (
                    <CheckCircle className="check-icon" size={16} />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="sentence-input">
              <input
                type="text"
                value={userInput}
                onChange={handleSentenceInput}
                placeholder="Type your answer..."
              />
              <button 
                className="submit-answer"
                onClick={handleSentenceSubmit}
              >
                Submit Answer
              </button>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="quiz-navigation">
          <button
            className="nav-button"
            onClick={() => navigateQuestion('prev')}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft size={20} />
            Previous
          </button>

          {currentQuestion === (quizData.questions?.length || 0) - 1 ? (
            <button
              className="submit-button"
              onClick={submitQuiz}
              disabled={submitted}
            >
              Submit Quiz
            </button>
          ) : (
            <button
              className="nav-button"
              onClick={() => navigateQuestion('next')}
            >
              Next
              <ArrowRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DateRangePage({ setActivePage, setFetchedData }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    try {
      // Need to send data to quizpage somehow. Maybe use a state object passed to both?
      setActivePage(3); 
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      alert("Failed to fetch quiz data. Please try again.");
    }
  };

  return (
    <div className="date-range-page">
       <div className="back-navbar">
       <div className='back-navbar-btn' onClick={() => setActivePage(0)}>
          <ChevronLeft />
          <p className='back-navbar-text'>
            Back
          </p>
        </div>
       </div>
      <h2>Select Date Range</h2>
      <div className="date-inputs">
        <label>
          Start Date:
          <input type="date" value={startDate} onChange={handleStartDateChange} />
        </label>
        <label>
          End Date:
          <input type="date" value={endDate} onChange={handleEndDateChange} />
        </label>
      </div>
      <button className="nav-button" onClick={handleSubmit}>
        Start Quiz
      </button>
    </div>
  );
}

function SettingsPage({ userID, setActivePage }) {
  const [difficultyIndex, setDifficultyIndex] = useState(0);
  const [frequencyIndex, setFrequencyIndex] = useState(0);
  const [language, setLanguage] = useState('');
  const [goal, setGoal] = useState('');

  const difficultyOptions = ['Words', 'Phrases', 'Sentences'];
  const frequencyOptions = [1, 5, 10, 20];

  function updateUserSettings() {
    chrome.storage.sync.set({
      "difficulty": difficultyIndex,
      "frequency": frequencyOptions[frequencyIndex],
      "newWordsGoal": goal
    });
    console.log(`Content Type: ${difficultyOptions[difficultyIndex]}, Frequency: ${frequencyOptions[frequencyIndex]}%, Goal: ${goal}`);

    makePost("/settings", {"settings": {
      "difficulty": difficultyIndex,
      "frequency": frequencyOptions[frequencyIndex],
      "newWordsGoal": goal
    }});
  }

  return (
    <div className='settings-page'>
      <div className='back-navbar'>
        <div className='back-navbar-btn' onClick={() => setActivePage(0)}>
          <ChevronLeft />
          <p className='back-navbar-text'>Back</p>
        </div>
      </div>

      <div className='settings-container'>
        <div className='setting-item'>
          <label htmlFor='difficulty-type-slider' className='settings-header'>Difficulty</label>
          <input
            type='range'
            id='content-type-slider'
            min={0}
            max={difficultyOptions.length - 1}
            value={difficultyIndex}
            onChange={(e) => setDifficultyIndex(parseInt(e.target.value))}
            className='slider'
          />
          <div className='slider-label'>{difficultyOptions[difficultyIndex]}</div>
        </div>
        <div className='setting-item'>
          <label htmlFor='frequency-slider' className='settings-header'>Frequency</label>
          <input
            type='range'
            id='frequency-slider'
            min={0}
            max={frequencyOptions.length - 1}
            value={frequencyIndex}
            onChange={(e) => setFrequencyIndex(parseInt(e.target.value))}
            className='slider'
          />
          <div className='slider-label'>{frequencyOptions[frequencyIndex]}%</div>
        </div>
        <div className='setting-item'>
          <label htmlFor='goal-input'type="number" className='settings-header'>Set Goal</label>
          <input
            type='text'
            id='goal-input'
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className='input-field'
          />
        </div>
        <button
          className='nav-button'
          onClick={updateUserSettings}
          style={{justifyContent: 'center', fontSize:"16px", fontWeight: "bold"}}
        >
          Update Settings
        </button>
      </div>
    </div>
  );
}





function App() {

  const [activePage, setActivePage] = useState(0);
  const [wordsToShow, setWordsToShow] = useState({});
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [fetchedData, setFetchedData] = useState({
    "name": "Armaan",
    "languageLearning": "Spanish",
    "languageCode": "ES",
    "totalWordsLearned": 2521,
    "quizzesTaken": 24,
    "sourceLanguage": "English",
    "todaySeen": 15,
    "todayNewSeen": 7,
    "newWordsGoal": 10,
    "todaySeenWords": {
                        "Hund": "Dog",
                        "Katze": "Cat",
                        "Haus": "House",
                        "Baum": "Tree",
                        "Auto": "Car",
                        "Buch": "Book",
                        "Stadt": "City",
                        "Freund": "Friend",
                        "Familie": "Family",
                        "Essen": "Food",
                        "Schule": "School",
                        "Wasser": "Water",
                        "Himmel": "Sky",
                        "Straße": "Street",
                        "Blume": "Flower"
                      },
    "todaySeenSentences": {
      "Wie geht es dir?": "How are you?",
      "Ich liebe es, zu reisen.": "I love to travel.",
      "Das Wetter ist heute schön.": "The weather is nice today.",
      "Können Sie mir bitte helfen?": "Can you please help me?",
      "Ich spreche nur ein bisschen Deutsch.": "I only speak a little German."
    },
    "favoriteWords" : {
      "Auto": "Car",
      "Buch": "Book",
      "Stadt": "City",
      "Freund": "Friend",
      "Familie": "Family"
    },
    "masteredWords" : {
      "Auto": "Car",
      "Buch": "Book",
      "Stadt": "City",
    }
  });
  // Will expand as more features are implemented. Thinking this can be an xhr, dont know how async on mount will work with extensions

  useEffect(() => {
    chrome.storage.sync.get(['user_id'], (result) => {
      const storedUserId = result.user_id;
      console.log('Stored User ID:', storedUserId);
      if (storedUserId) {
        setUserId(storedUserId);
        fetch(`${API_URL}/all`, {
          method: 'GET',
          headers: {
            'Authorization': storedUserId
          }
        })
          .then(response => response.json())
          .then(data => {
            setFetchedData(data);
            setIsLoading(false);  
            // So content.js works
            if (data.difficulty !== undefined) {
              chrome.storage.sync.set({"difficulty": data.difficulty});
            }

            if (data.frequency !== undefined) {
              chrome.storage.sync.set({"frequency": data.frequency});
            }
            if (data.languageLearning !== undefined) {
              chrome.storage.sync.set({"language": data.languageLearning});
            }
            if (data.languageCode !== undefined) {
              chrome.storage.sync.set({"language": data.languageCode.toLowerCase()});
            }
          })
          .catch(error => console.error('Error fetching data:', error));
          setIsLoading(false);
      } else {
        setActivePage(-1);
        setIsLoading(false)
      }
    });
    setWordsToShow(fetchedData.todaySeenWords)
  }, [userId])

  function routeSettings() {
    setActivePage(2);
  }

  function handleLogin(id) {
    setUserId(id);
  }

  function routeTodayWords(selection) {
    if (selection === "today") {
      setWordsToShow(fetchedData.todaySeenWords);
    } else if (selection === "favorites") {
      setWordsToShow(fetchedData.favoriteWords);
    } else if (selection === "mastered") {
      setWordsToShow(fetchedData.masteredWords)
    }
    setActivePage(1);

  }

  function routeQuiz() {
    setActivePage(3)
  }

  function routeCustomQuiz() {
    setActivePage(4);
  }
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className='viewport'>
      {(activePage === -1) && <LoginPage onLogin={handleLogin} />}
      {(activePage === 0) && <MainPage fetchedData={fetchedData} routeSettings={routeSettings} routeTodayWords={routeTodayWords} routeQuiz={routeQuiz} routeCustomQuiz={routeCustomQuiz}/>}
      {(activePage === 1)  && <TodayWordsPage wordsToShow={wordsToShow} setActivePage={setActivePage} />}
      {(activePage === 2) && <SettingsPage setActivePage={setActivePage} />}
      {(activePage === 3) && <QuizPage fetchedData={fetchedData} setActivePage={setActivePage} />}
      {(activePage === 4) && <DateRangePage setActivePage={setActivePage} setFetchedData={setWordsToShow} />}
    </div>
  )

};

export default App;

