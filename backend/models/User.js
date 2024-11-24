import mongoose from "mongoose";

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
    user_id: {
        type: String,
        unique: true
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