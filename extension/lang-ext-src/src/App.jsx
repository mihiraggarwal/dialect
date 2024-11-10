import { useState, useEffect } from 'react';
import './App.css';
import {SETTINGS_ICON} from './constants.js';
// Don't like using icon library, would prefer b64 images. Maybe port over later
import {Star, ChevronRight, ChevronLeft, ArrowUpRight, Settings } from "lucide-react"

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
      <Settings />
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


function CardButton({clickedFunc, children}) {
  return (
    <div className='card-btn-container' onClick={()=> clickedFunc()}>
      <span></span>
      <span></span>
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


function MainPage({fetchedData, routeSettings, routeTodayWords}) {
  return (
    <div className='main-container'>
      <Navbar language='DE' showSettings={routeSettings} user_id={"1234"}/>
      <div className='main-content'>
        <h1 className='main-content-header'>Welcome back,  {fetchedData.name}!</h1>
        <SectionHeader textWdith={13} text="Overview" />
        <h1 className='main-content-header'>
          You have seen <strong>{fetchedData.todayNewSeen}</strong> new words today!
        </h1>
        <CardButton clickedFunc={routeTodayWords}>
            <div className='card-btn-content'>
              <p className='card-btn-text'>
                View all {fetchedData.todaySeen} words
              </p>
              <ProgressBar progress={Math.round((fetchedData.todayNewSeen / fetchedData.newWordsGoal)*100)} label={`${fetchedData.todayNewSeen}/${fetchedData.newWordsGoal} New`}>
              </ProgressBar>
            </div>
        </CardButton>
        <Space height={20}/>
        <SectionHeader textWdith={11} text="Review"/>
        <div className="quiz-btn">
          <p className="quiz-btn-text">
            Take a quiz on today&apos;s words
            <span className="quiz-btn-arrow"></span>
          </p>
        </div>

      </div>
    </div>
  )
}


function TodayWordsPage({fetchedData, setActivePage}) {


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
        {Object.keys(fetchedData.todaySeenWords).map((word) => (
        <WordCard
          key={word}
          word={word}
          translation={fetchedData.todaySeenWords[word]}
          favWord={favouriteWord}
          generateWordContextViews={generateContextSentences}
        />
      ))}
      </div>


    </div>
  )
}



function App() {

  const [activePage, setActivePage] = useState(0);

  // Will expand as more features are implemented. Thinking this can be an xhr, dont know how async on mount will work with extensions
  const fetchedData = {
    "name": "Armaan",
    "languageLearning": "German",
    "languageCode": "DE",
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
                      }

  }

  function routeSettings() {
    setActivePage(2);
  }

  function routeTodayWords() {
    setActivePage(1);
  }

  // Need to move out after implementing 
  function SettingsPage() {
    return (
      <div className='settings-container'>
        <p>Settings</p>
      </div>
    )
  }

  return (
    <div className='viewport'>
      {(activePage === 0) && <MainPage fetchedData={fetchedData} routeSettings={routeSettings} routeTodayWords={routeTodayWords} />}
      {(activePage === 1)  && <TodayWordsPage fetchedData={fetchedData} setActivePage={setActivePage} />}
      {(activePage === 2) && <SettingsPage />}
    </div>
  )

};

export default App;

