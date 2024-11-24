import { useState, useEffect } from 'react';
import './App.css';
import {SETTINGS_ICON} from './constants.js';
// Don't like using icon library, would prefer b64 images. Maybe port over later
import {Star, ChevronRight, ChevronLeft, ArrowUpRight, Settings, HelpCircle, ArrowRight, ArrowLeft, CheckCircle, BookCheck, CircleCheck } from "lucide-react"

// README: Run npm run build and load unpacked extension from build folder to test on browser

/* eslint-disable react/prop-types */ 


// Language must be ISO 3166-1 alpha-2 code for country. For testing, assuming learning german.
// Need to prompt gemini on sign up to save this into db
// UserID required to load and store settings. routing to be implemneted
function Navbar({language, user_id, showSettings}) {

  const lang = language.toLowerCase();
  const src_url = `https://hatscripts.github.io/circle-flags/flags/${lang}.svg`;

  return (
    <div className='navbar'>
      <div className='vocab-btn-container'>
        <img src={src_url} alt='flag' className='flag-icon'/>
        <p className='vocab-btn'>Vocabulary</p>
        <ArrowUpRight />
      </div>
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


// favWord allows for the word to be favourited, generateWordContextViews will generate the context views for the word. Will require
// passing of routing function down to this component.
function WordCard({word, translation, favWord, generateWordContextViews}) {


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
          <div className='check-container'>
            <CircleCheck size={17} color='#9ca3af'/>
          </div>
          <div className='star-container' onClick={() => favWord(word)}>
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

function MainPage({fetchedData, routeSettings, routeTodayWords, routeQuiz, routeCustomQuiz}) {
  return (
    <div className='main-container'>
      <Navbar language='ES' showSettings={routeSettings} user_id={"1234"}/>
      <div className='main-content'>
        <h1 className='main-content-header'>Welcome back,  {fetchedData.name}!</h1>
        <SectionHeader textWdith={13} text="Overview" />
        <h1 className='main-content-header'>
          You have seen <strong>{fetchedData.todayNewSeen}</strong> new words today!
        </h1>
        <CardButton clickedFunc={routeTodayWords} arg={"today"}>
            <div className='card-btn-content'>
              <p className='card-btn-text'>
                View all {fetchedData.todaySeen} words
              </p>
              <ProgressBar progress={Math.round((fetchedData.todayNewSeen / fetchedData.newWordsGoal)*100)} label={`${fetchedData.todayNewSeen}/${fetchedData.newWordsGoal} to meet goal`}>
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
              34 / 50 words reviewed
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
  )
}


function TodayWordsPage({wordsToShow, setActivePage}) {

  console.log("Words to show are: ")
  console.log(wordsToShow)
  // These two will be replaced with async API calls. Maybe add a toast message to confirm
  function favouriteWord(word) {
    console.log(`Favouriting ${word}`)
  }
  function generateContextSentences(word, translation) {
    console.log("Generating context")
  }
  return (
    <div className='today-words-page'>
      <div className='back-navbar'>
        <div className='back-navbar-btn' onClick={() => setActivePage(0)}>
          <ChevronLeft />
          <p className='back-navbar-text'>
            Back
          </p>
        </div>
      </div>

      <div className='today-words-container'>
        {Object.keys(wordsToShow).map((word) => (
        <WordCard
          key={word}
          word={word}
          translation={wordsToShow[word]}
          favWord={favouriteWord}
          generateWordContextViews={generateContextSentences}
        />
      ))}
      </div>


    </div>
  )
}

function QuizPage({fetchedData, setActivePage}) {
  const [dataRecvd, setDataRecvd] = useState(false);
  const [quizData, setQuizData] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

    function constructQuiz() {
    // Api call with todays seen words here. will use await fetch
    setDataRecvd(true);
    const placeholderQuiz = {
      "questions": [
        {
          "type": "word",
          "display": "Hund",
          "options": ["Cat", "Dog", "House", "Car"],
          "correct_choice": 1,
          "context_hint": "Der <Hund> spielt im Garten."
        },
        {
          "type": "word",
          "display": "Katze",
          "options": ["Sky", "Tree", "Cat", "Friend"],
          "correct_choice": 2,
          "context_hint": "Die <Katze> schläft auf dem Sofa."
        },
        {
          "type": "word",
          "display": "Baum",
          "options": ["School", "Book", "Tree", "Street"],
          "correct_choice": 2,
          "context_hint": "Ein großer <Baum> steht im Park."
        },
        {
          "type": "word",
          "display": "Essen",
          "options": ["Family", "Water", "Flower", "Food"],
          "correct_choice": 3,
          "context_hint": "Ich liebe <Essen> wie Pizza und Pasta."
        },
        {
          "type": "word",
          "display": "Blume",
          "options": ["Food", "Flower", "City", "School"],
          "correct_choice": 1,
          "context_hint": "Eine schöne <Blume> blüht im Garten."
        },
        {
          "type": "sentence",
          "display": "Wie geht es dir?",
          "options": [],
          "correct_choice": null,
          "context_hint": null
        },
        {
          "type": "sentence",
          "display": "Ich liebe es, zu reisen.",
          "options": [],
          "correct_choice": null,
          "context_hint": null
        },
        {
          "type": "sentence",
          "display": "Das Wetter ist heute schön.",
          "options": [],
          "correct_choice": null,
          "context_hint": null
        },
        {
          "type": "sentence",
          "display": "Können Sie mir bitte helfen?",
          "options": [],
          "correct_choice": null,
          "context_hint": null
        },
        {
          "type": "sentence",
          "display": "Ich spreche nur ein bisschen Deutsch.",
          "options": [],
          "correct_choice": null,
          "context_hint": null
        }
      ]
    };

    setQuizData(placeholderQuiz);
  }

  useEffect(() => {
    constructQuiz();
  }, []);

  const handleOptionSelect = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      questionNumber: currentQuestion + 1,
      question: quizData.questions[currentQuestion].display,
      selectedAnswerIndex: optionIndex,
      selectedAnswer: quizData.questions[currentQuestion].options[optionIndex],
      isCorrect: optionIndex === quizData.questions[currentQuestion].correct_choice
    };
    setAnswers(newAnswers);
  };

  const handleSentenceInput = (e) => {
    setUserInput(e.target.value);
  };

  const handleSentenceSubmit = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = {
      questionNumber: currentQuestion + 1,
      question: quizData.questions[currentQuestion].display,
      selectedAnswer: userInput
    };
    setAnswers(newAnswers);
    setUserInput('');
  };

  const navigateQuestion = (direction) => {
    setShowHint(false);
    if (direction === 'next' && currentQuestion < quizData.questions?.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else if (direction === 'prev' && currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const submitQuiz = () => {
    setSubmitted(true);
    console.log('Quiz Results:', answers);
  };

  if (!dataRecvd || !quizData.questions) {
    return <div className="quiz-loading">Loading quiz...</div>;
  }

  const currentQuestionData = quizData.questions[currentQuestion];

  return (
    <div className="quiz-page">
      <div className='back-navbar'>
        <div className='back-navbar-btn' onClick={() => setActivePage(0)}>
          <ChevronLeft />
          <p className='back-navbar-text'>
            Back
          </p>
        </div>
      </div>
      <div className='quiz-progress-container'>
      <span className="quiz-progress-text">
          {currentQuestion + 1} / {quizData.questions.length}
        </span>
      <div className="quiz-progress">
        <div 
          className="quiz-progress-bar"
          style={{width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%`}}
        />
      </div>

      </div>

      <div className="quiz-container">
        <div className="quiz-question">
          <h2>{currentQuestionData.display}</h2>
          
          {currentQuestionData.context_hint && (
            <button 
              className={`hint-button ${showHint ? 'active' : ''}`}
              onClick={() => setShowHint(!showHint)}
            >
              <HelpCircle size={20} />
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
          )}

          {showHint && (
            <div className="context-hint">
              {currentQuestionData.context_hint}
            </div>
          )}
        </div>

        <div className="quiz-content">
          {currentQuestionData.type === 'word' ? (
            <div className="options-grid">
              {currentQuestionData.options.map((option, index) => (
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

        <div className="quiz-navigation">
          <button
            className="nav-button"
            onClick={() => navigateQuestion('prev')}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft size={20} />
            Previous
          </button>

          {currentQuestion === quizData.questions.length - 1 ? (
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

function SettingsPage({ userID, setActivePage }) {
  const [difficultyIndex, setDifficultyIndex] = useState(0);
  const [frequencyIndex, setFrequencyIndex] = useState(0);
  const [language, setLanguage] = useState('');

  const difficultyOptions = ['Words', 'Phrases', 'Sentences'];
  const frequencyOptions = [1, 5, 10, 20];

  function updateUserSettings() {
    console.log("Updating user settings");
    console.log(`Content Type: ${difficultyOptions[difficultyIndex]}, Frequency: ${frequencyOptions[frequencyIndex]}%, Language: ${language}`);
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
          <label htmlFor='language-input'>Change Language To</label>
          <input
            id='language-input'
            type='text'
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder='Enter language'
          />
        </div>
        <button
          className='settings-submit-btn'
          onClick={updateUserSettings}
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

  // Will expand as more features are implemented. Thinking this can be an xhr, dont know how async on mount will work with extensions
  const fetchedData = {
    "name": "Armaan",
    "languageLearning": "Spanish",
    "languageCode": "ES",
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
  }

  useEffect(() => {
    console.log("Settings words to show")
    setWordsToShow(fetchedData.todaySeenWords)
  }, [])

  function routeSettings() {
    setActivePage(2);
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

  return (
    <div className='viewport'>
      {(activePage === 0) && <MainPage fetchedData={fetchedData} routeSettings={routeSettings} routeTodayWords={routeTodayWords} routeQuiz={routeQuiz} />}
      {(activePage === 1)  && <TodayWordsPage wordsToShow={wordsToShow} setActivePage={setActivePage} />}
      {(activePage === 2) && <SettingsPage setActivePage={setActivePage} />}
      {(activePage === 3) && <QuizPage fetchedData={fetchedData} setActivePage={setActivePage} />}
    </div>
  )

};

export default App;

