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
        default: 0,
    },
    todayNewSeen: {
        type: Number,
        default: 0,
    },
    newWordsGoal: {
        type: Number,
        default: 10,
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
    favoriteWords: [
        {
            type: {
                original: {
                    type: String,
                },
                translated: {
                    type: String,
                },
            },
        }
    ],
    masteredWords: [
        {
            type: {
                original: {
                    type: String,
                },
                translated: {
                    type: String,
                },
            },
        }
    ],
    totalWordsLearned: {
        type: Number,
    },
    quizzesTaken: {
        type: Number,
        default: 0,
    },
    user_id: { type: String, unique: true, default: uuidv4 },
    graphData: {
        type: {
            clusters: [
                {
                    id: {
                        type: String,
                    },
                    label: {
                        type: String,
                    },
                    color: {
                        type: String,
                    },
                    subclusters: {
                        type: Array
                    },
                    words: {
                        type: Array
                    },
                }
            ]
        }
    }
});

const User = mongoose.model("User", UserSchema);
export { User };