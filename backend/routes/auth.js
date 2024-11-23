import cors from 'cors'
import express from 'express';
import passport from 'passport';

import isAuthenticated from '../config/middleware.js';

const router = express.Router();

router.use(cors())
router.use(express.json())
router.use(express.urlencoded({ extended: false }))

router.post("/signup", passport.authenticate("local-signup"), (req, res, next) => {
    console.log("atleast come here")
    res.status(200).send({ success: true });
})

router.post("/login", passport.authenticate("local-signin"), async (req, res) => {
    res.status(200).send({ success: true });
});

router.post("/logout", isAuthenticated, function (req, res, next) {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.status(200).send({ success: true, message: "Logged out" });
    });
});

export { router };