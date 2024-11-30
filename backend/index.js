import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import session from "express-session";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { User } from "./models/User.js";
import {router as auth} from "./routes/auth.js";
import { isAuthorized } from "./config/middleware.js";

const app = express();
const PORT = process.env.PORT || 5000;

const db = process.env.MONGO_URI;

process.env.NODE_TLS_MIN_VERSION = 'TLSv1.2';

async function connectDB() {
    try {
        console.log("Initiating MongoDB connection...");
        await mongoose.connect(db, {
            ssl: true,
            tlsAllowInvalidCertificates: false,
            retryWrites: true,
            serverSelectionTimeoutMS: 5000,
        });
        console.log("Successfully connected to MongoDB Atlas");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}
connectDB()

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: {"response_mime_type": "application/json"} })
app.use(cors());
app.use(express.json());

app.use(session({
    secret: `${process.env.SESSION_SECRET}`,
    saveUninitialized: false,
    resave: false,
    name: "email-auth"
}))

app.use(passport.initialize());
app.use(passport.session());

import "./config/passport.js";

app.use("/auth", auth)

let quiz_results = [];

app.get("/", (req, res) => {
    // res.send(`<button onclick="fetch('/translate', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({to_convert: ['hello', 'how are you']})})">Click me</button>`)
    // res.send(`<button onclick="fetch('/new', {method: 'POST', headers: {'Content-Type': 'application/json'}})">Click me</button>`)
    // res.send(`<button onclick="fetch('/quiz', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({words: ['bonjour', 'comment tu t appeles?']})})">Click me</button>`)
    // res.send(`<button onclick="fetch('/quiz', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({words: ['bonjour', 'comment tu t appeles?']})})">Click me</button>`)
    // res.send(
    //     `Auth<br>\
    //     <form method="post" action="/auth/signup">\
    //         <input type="text" name="username" id="username" placeholder="Username">\
    //         <input type="text" name="password" id="password" placeholder="Password">\
    //         <input type="submit" value="Submit" id="btn_submit">\
    //     </form>`
    // )
    res.send(
        `Auth<br>\
        <form method="post" action="/auth/login">\
            <input type="text" name="username" id="username" placeholder="Username">\
            <input type="text" name="password" id="password" placeholder="Password">\
            <input type="submit" value="Submit" id="btn_submit">\
        </form>`
    )
})

app.post("/translate", async (req, res) => {
    const body = req.body;
    const to_convert = body.to_convert;

    const lang = "French";

    const prompt = `
        Translate the following English text to ${lang}: \n${to_convert.join("\\n")}. Return each input from the array and its translated output using the JSON schema:
        Translated = {'original': string, 'translated': string}
        Return: Array<Translated>
    `;

    const result = await model.generateContent(prompt);
    res.json({"result": result.response.text()});
})

app.get("/all", isAuthorized, async (req, res) => {
    const req_user = req.user;
    const user = await User.findOne({id: req_user.id});

    const todaySeenWords = {}
    user.todaySeenWords.forEach((v, i) => {
        todaySeenWords = {...todaySeenWords, [v.original]: [v.translated]}
    });

    const todaySeenSentences = {}
    user.todaySeenSentences.forEach((v, i) => {
        todaySeenSentences = {...todaySeenSentences, [v.original]: [v.translated]}
    });

    const favoriteWords = {}
    user.favoriteWords.forEach((v, i) => {
        favoriteWords = {...favoriteWords, [v.original]: [v.translated]}
    });

    const masteredWords = {}
    user.masteredWords.forEach((v, i) => {
        masteredWords = {...masteredWords, [v.original]: [v.translated]}
    });

    const fetchedData = {
        "name": user.name,
        "languageLearning": user.languageLearning,
        "languageCode": user.languageCode,
        "totalWordsLearned": user.totalWordsLearned,
        "quizzesTaken": user.quizzesTaken,
        "sourceLanguage": user.sourceLanguage,
        "todaySeen": user.todaySeen,
        "todayNewSeen": user.todayNewSeen,
        "newWordsGoal": user.newWordsGoal,
        "todaySeenWords": todaySeenWords,
        "todaySeenSentences": todaySeenSentences,
        "favoriteWords" : favoriteWords,
        "masteredWords" : masteredWords
    }

    res.json(fetchedData);
})

app.post("/new", async (req, res) => {
    const user = new User({
        username: "mhr",
        user_id: "123",
        spokenLang: "English",
        learningLang: "French"
    })

    await user.save();
    console.log("Saved");
    res.send("Sort scene");
})

app.post("/words/:id", async (req, res) => {
    const id = req.params.id;

    const user = await User.findById(id);
    const words = user.words_0.concat(user.words_1, user.words_2, user.words_3, user.words_4, user.words_5, user.words_6);

    res.json({"words": words});
})

app.post("/quiz", async (req, res) => {
    const body = req.body;

    const words = body.words;
    const phrases = body.phrases;
    const sentences = body.sentences;

    const to_convert = words.concat(phrases, sentences)

    const lang = "French";

    const prompt = `
        Make an MCQ quiz of 10 questions in which each question asks the user to translate from either English to ${lang} or ${lang} to English from the following words, phrases, and sentences: ${to_convert.join("\\n")}. The quiz should be in the JSON schema:
        Question = {'original': string, 'translated': string, 'option_a': string, 'option_b': string, 'option_c': string, 'option_d': string, 'correct': string}
        Return: Array<Question>
    `;

    const result = await model.generateContent(prompt);
    const result_text = JSON.parse(result.response.text())

    result_text.forEach((v, i) => {
        quiz_results = [...quiz_results, {
            "q_num": i+1,
            "correct": v.correct 
        }]
    })

    res.json({"result": result_text});
})

app.post("/quiz/evaluate", async (req, res) => {
    const body = req.body;
    const answers = body.answers;

    let tracker = []

    c = 0
    for (const answer in answers) {
        if (answer == quiz_results[c].correct) {
            tracker = [...tracker, {
                "q_num": c+1,
                "result": true
            }]
        }
        else {
            tracker = [...tracker, {
                "q_num": c+1,
                "result": false
            }]
        }
        c++;
    }

    res.json({"tracker": tracker})
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})