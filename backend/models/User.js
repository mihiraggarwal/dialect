import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    user_id: {
        type: String,
        required: true,
        unique: true
    },
    spokenLang: {
        type: String,
        required: true
    },
    learningLang: {
        type: String,
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
    words_0: {
        type: Array,
    },
    words_1: {
        type: Array,
    },
    words_2: {
        type: Array,
    },
    words_3: {
        type: Array,
    },
    words_4: {
        type: Array,
    },
    words_5: {
        type: Array,
    },
    words_6: {
        type: Array,
    }
});

const User = mongoose.model("User", UserSchema);
export { User };