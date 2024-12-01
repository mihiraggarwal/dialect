import crypto from "crypto";
import passport from "passport";
import { Strategy } from "passport-local";

import { User } from "../models/User.js";

passport.use('local-signin', new Strategy(async (username, password, done) => {
    const user = await User.findOne({username: username})

    if (!user) {
        return done(null, false, {message: "User not found"})
    }

    crypto.pbkdf2(password, user.salt, 31000, 32, 'sha512', (err, hashedPassword) => {
        if (err) return done(err);
        if (!crypto.timingSafeEqual(user.hashedPassword, hashedPassword)) {
            return done(null, false, {message: "Incorrect password"})
        }
        return done(null, user)
    });
}));

passport.use('local-signup', new Strategy(
    { usernameField: 'email', passwordField: 'password', passReqToCallback: true },
    async (req, username, password, done) => {
        const { name, languageCode, languageLearning, languageSpeak } = req.body; 

        const user = await User.findOne({ username: username });
        if (user) {
            return done(null, false, { message: "Username already exists" });
        }

        const salt = crypto.randomBytes(16);
        crypto.pbkdf2(password, salt, 31000, 32, 'sha512', async (err, hashedPassword) => {
            if (err) return done(err);

            const newUser = new User({
                username: username,
                name: name,
                languageCode: languageCode,
                languageLearning: languageLearning,
                languageSpeak: languageSpeak,
                hashedPassword: hashedPassword,
                salt: salt,
            });

            try {
                await newUser.save();
                return done(null, newUser);
            } catch (err) {
                return done(err);
            }
        });
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id)
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id)
        done(null, user)
    } catch (err) {
        done(err, null)
    }
}); 