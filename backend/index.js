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
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    // res.send(`<button onclick="fetch('/translate', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({to_convert: ['hello', 'how are you']})})">Click me</button>`)
    res.send(`<button onclick="fetch('/new', {method: 'POST', headers: {'Content-Type': 'application/json'}})">Click me</button>`)
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})