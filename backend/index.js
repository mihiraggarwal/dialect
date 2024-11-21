import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { User } from "./models/User.js";

const app = express();
const PORT = process.env.PORT || 5000;

const db = process.env.MONGO_URI;
mongoose.connect(db)

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: {"response_mime_type": "application/json"} })

app.use(cors());
app.use(express.json());

let quiz_results = [];

app.get("/", (req, res) => {
    // res.send(`<button onclick="fetch('/translate', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({to_convert: ['hello', 'how are you']})})">Click me</button>`)
    // res.send(`<button onclick="fetch('/new', {method: 'POST', headers: {'Content-Type': 'application/json'}})">Click me</button>`)
    // res.send(`<button onclick="fetch('/quiz', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({to_convert: ['bonjour', 'comment tu t'apelles?']})})">Click me</button>`)
    res.send(`<button onclick="fetch('/quiz', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({words: ['bonjour', 'comment tu t appeles?']})})">Click me</button>`)
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