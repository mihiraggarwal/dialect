import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import passport from "passport";
import session from "express-session";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { User } from "./models/User.js";
import {router as auth} from "./routes/auth.js";
import isAuthenticated from "./config/middleware.js";

const app = express();
const PORT = process.env.PORT || 5000;

const db = "mongodb+srv://armaanshah2004:YkYZ8HBTthtA2bma@lang-ext-cluster.k8yr6.mongodb.net/?retryWrites=true&w=majority&appName=lang-ext-cluster";

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
    secret: "a3f5b2c9e7d1089b6f2a4c8e3d6b9f1c2e5a7d4b8f3c6e9a2d5b7f1c4e8d3b6a9",
    saveUninitialized: false,
    resave: false,
    name: "email-auth"
}))

app.use(passport.initialize());
app.use(passport.session());

import "./config/passport.js";

app.use("/auth", auth)

let quiz_results = [];

//////////////////////////////// Tester //////////////////////////////////

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
    // res.send(
    //     `Auth<br>\
    //     <form method="post" action="/auth/login">\
    //         <input type="text" name="username" id="username" placeholder="Username">\
    //         <input type="text" name="password" id="password" placeholder="Password">\
    //         <input type="submit" value="Submit" id="btn_submit">\
    //     </form>`
    // )
    res.send(`<button onclick="fetch('/graph', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({wordList: [{word: 'petite', translated: 'small', context: 'ma famille est petite'}, {word: 'grande', translated: 'big', context: 'ma famille est grande'}]})})">Click me</button>`)
})

//////////////////////////////// Getters //////////////////////////////////

app.get("/all", async (req, res) => {
    const req_user = req.user;
    console.log("id", req.headers.authorization);
    const user = await User.findOne({_id: req.headers.authorization});
    console.log(user);
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

app.post("/getWordsInRange", async (req, res) => {

    //TODO: Implementation
})

app.get("/graph", isAuthenticated, async (req, res) => {
    const req_user = req.user;
    const user = await User.findOne({id: req_user.id});

    const graph = user.graphData;
    res.json(graph);
})

//////////////////////////////// Setters //////////////////////////////////

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

app.post("/words/:id", async (req, res) => {
    const id = req.params.id;

    const user = await User.findById(id);
    const words = user.words_0.concat(user.words_1, user.words_2, user.words_3, user.words_4, user.words_5, user.words_6);

    res.json({"words": words});
})

app.post("/favorite", isAuthenticated, async (req, res) => {
    const req_user = req.user;
    const body = req.body;
    const favorites = body.favorites;

    const user = await User.findOne({id: req_user.id});
    const user_favs = user.favoriteWords;

    for (const v in favorites) {
        user_favs[v] = favorites[v];
    }

    // await User.updateOne({id: req_user.id}, {favoriteWords: user_favs});
    user.favoriteWords = user_favs;
    await user.save();

    res.status(200).send("Saved");
})

app.post("/mastered", isAuthenticated, async (req, res) => {
    const req_user = req.user;
    const body = req.body;
    const mastered = body.mastered;

    const user = await User.findOne({id: req_user.id});
    const user_mastered = user.masteredWords;

    for (const v in mastered) {
        user_mastered[v] = mastered[v];
    }

    // await User.updateOne({id: req_user.id}, {masteredWords: user_mastered});
    user.masteredWords = user_mastered;
    await user.save();

    res.status(200).send("Saved");
})

app.post("/settings", isAuthenticated, async (req, res) => {
    const req_user = req.user;
    const body = req.body;
    const settings = body.settings;

    const user = await User.findOne({id: req_user.id});

    for (const v in settings) {
        user[v] = settings[v];
    }

    await user.save();

    res.status(200).send("Saved");
})

app.post("/graph", isAuthenticated, async (req, res) => {
    const req_user = req.user;
    const body = req.body;
    const wordList = body.wordList;
    
    const user = await User.findOne({_id: req_user.id});

    let words = {}
    wordList.forEach((v, i) => {
        user.todaySeen += 1;
        if (user.todaySeenWords.includes(v.word)) {
            user.todayNewSeen += 1;
        }
        user.todaySeenWords = [...user.todaySeenWords, {
            "original": v.word,
            "translated": v.translated,
            "time": new Date(),
            "favourite": false,
            "mastered": false
        }]

        words = {...words, [v.word]: v.context}
    })
    
    const graphData = user.graphData;
    
    let clusters = []
    graphData.clusters.forEach((v, i) => {
        clusters.push(v.label)
    })

    let prompt =
    `
    I am creating a knowledge graph that clusters similar words together based on their meaning.
    Here are the clusters I current have: ${clusters}. 
    I save words as {"word": "Dog", "cluster": "Animals"}.

    Please provide clusters for the following words.
    If the cluster does not exist in the list, follow the instruction provided below.Make sure this cluster is the most specific category for the word.
    Do not provide examples.
    Instructions for if cluster does not exist: Instead of giving a cluster name, follow the below schema to create a new specific cluster, along with all the parent clusters.
    Make sure to encapsulate the new cluster schema with <NEW_CLUSTER> and </NEW_CLUSTER> tags.
    Schema Example:
    {
                    id: 'animals',
                    label: 'Animals',
                    color: '#2c3e50',
                    subclusters: [
                        {
                            id: 'mammals',
                            label: 'Mammals',
                            color: '#3498db',
                            subclusters: [
                                {
                                    id: 'dogs',
                                    label: 'Dogs',
                                    color: '#5dade2',
                                    words: [
                                        { id: 'dog', label: 'Dog' },
                                        { id: 'puppy', label: 'Puppy' },
                                        { id: 'bark', label: 'Bark' },
                                        { id: 'leash', label: 'Leash' }
                                    ]
                                },
                                {
                                    id: 'cats',
                                    label: 'Cats',
                                    color: '#5dade2',
                                    words: [
                                        { id: 'cat', label: 'Cat' },
                                        { id: 'kitten', label: 'Kitten' },
                                        { id: 'meow', label: 'Meow' },
                                        { id: 'purr', label: 'Purr' }
                                    ]
                                }
                            ]
                        }
                    ]
                }
    The words are in the format of {<word>: <context>}.:
    `

    prompt += JSON.stringify(words);

    prompt += 
    `
    Return each input from the array and its translated output using the JSON schema.
    Translated = {'word': string, 'cluster': string}
    Return: Array<Translated>
    `

    const result = await model.generateContent(prompt);
    const result_text = JSON.parse(result.response.text())

    result_text.forEach((w, j) => {
        let flag = false;
        graphData.clusters.forEach((v, i) => {
            while (v.label.toLowerCase() != w.cluster.toLowerCase()) {
                if (v.words) break;
                v = v.subclusters
            }
            if (v.label.toLowerCase() == w.cluster.toLowerCase()) {
                user.graphData.clusters[i].words.push({id: w.word.toLowerCase(), label: w.word})
                flag = true;
            }
        })
        if (!flag) {
            user.graphData.clusters = [...user.graphData.clusters, {
                id: w.cluster.toLowerCase(),
                label: w.cluster,
                color: '#2c3e50',
                words: [
                    {id: w.word, label: w.word}
                ]
            }]
        }
    })

    await user.save();
    res.status(200).send("Saved");
})

app.post("/quiz", async (req, res) => {
    const body = req.body;

    const words = body.words;
    const phrases = body.phrases;
    const sentences = body.sentences;

    const to_convert = words.concat(phrases, sentences)

    const lang = "French";

    const prompt = `
        Make an MCQ quiz of 10 questions in which each question asks the user to translate from ${lang} to English from the following words, phrases, and sentences: ${to_convert.join("\\n")}. The quiz should be in the JSON schema:
        Question = {type: string (must be either word or sentence), 'display': string (word in ${lang}), options: array[string, string, string, string] (in english), 'correct_choice': integer (index for options. if type=sentence, set null), context_hint: string (an english sentence with one word replaced by the translated word. if type=sentence, set null)}
        Return: Array<Question>
    `;

    const result = await model.generateContent(prompt);
    const result_text = JSON.parse(result.response.text())

    // result_text.forEach((v, i) => {
    //     quiz_results = [...quiz_results, {
    //         "q_num": i+1,
    //         "correct": v.correct 
    //     }]
    // })

    res.json({"questions": result_text});
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

app.post("/quiz/evalSentence", async (req, res) => {
    const body = req.body;
    const originalSentence = body.translatedSentence;
    const inputSentence = body.inputtedSentence;

    const prompt = `
        Is the sentence ${inputSentence} a correct translation of the sentence ${originalSentence}? Return a JSON object {result : true/false}.
    `;
    const result = await model.generateContent(prompt);
    const result_text = JSON.parse(result.response.text())

    res.json(result_text);
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})