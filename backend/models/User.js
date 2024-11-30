import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    // email: {
    //     type: String,
    //     required: true,
    //     unique: true
    // },
    hashedPassword: {
        type: Buffer,
        required: true
    },
    salt: {
        type: Buffer,
        required: true
    },
    name: {
        type: String,
    },
    sourceLanguage: {
        type: String,
    },
    languageLearning: {
        type: String,
    },
    languageCode: {
        type: String,
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
            original: {
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
            original: {
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
    favoriteWords: {
        type: {
            original: {
                type: String,
            },
            translated: {
                type: String,
            },
        },
    },
    masteredWords: {
        type: {
            original: {
                type: String,
            },
            translated: {
                type: String,
            },
        },
    },
    totalWordsLeared: {
        type: Number,
    },
    quizzesTaken: {
        type: Number,
    },
    user_id: { type: String, unique: true, default: uuidv4 }
});

const User = mongoose.model("User", UserSchema);
export { User };