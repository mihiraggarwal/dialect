import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    user_id: {
        type: String,
        required: true,
        unique: true
    },
    sourceLanguage: {
        type: String,
        required: true
    },
    languageLearning: {
        type: String,
        required: true
    },
    languageCode: {
        tyoe: String,
        required: true
    },
    difficulty: {
        type: String,
    },
    frequency: {
        type: Number,
    },
    last_date: {
        type: Date,
    },
    todaySeen: {
        type: Number,
    },
    todayNewSeen: {
        type: Number,
    },
    newWordsGoal: {
        type: Number,
    },
    todaySeenWords: [
        {
            sourceLanguage: {
                type: String,
            },
            translated: {
                type: String,
            },
            time: {
                type: Date,
            },
            favourite: {
                type: Boolean,
            },
            mastered: {
                type: Boolean,
            }
        }
    ],
    todaySeenSentences: [
        {
            sourceLanguage: {
                type: String,
            },
            translated: {
                type: String,
            },
            time: {
                type: Date,
            },
            favourite: {
                type: Boolean,
            },
            mastered: {
                type: Boolean,
            }
        }
    ],
    favouriteWords: {
        type: Array,
    },
    masteredWords: {
        type: Array,
    }
});

const User = mongoose.model("User", UserSchema);
export { User };