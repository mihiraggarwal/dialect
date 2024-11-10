import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const PORT = process.env.PORT || 5000;

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send(`<button onclick="fetch('/translate', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({to_convert: ['hello', 'how are you']})})">Click me</button>`)
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})