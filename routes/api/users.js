const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const keys = require('../../config/keys');

//Load Input Validation
const validateRegisterInput = require('../../validation/registor');
const validateLoginInput = require('../../validation/login');

//Load user model
const User = require('../../models/Users');

// @route   GET /api/users/test
// @desc    Tests users route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'User works' }));

// @route   POST /api/users/register
// @desc    Register user
// @access  Public
router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    //Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email }).then(user => {
        //If user already exists
        if (user) {
            errors.email = 'Email already exists';
            res.status(400).json(errors);
        } else {
            const avatar = gravatar.url(req.body.email, {
                s: '200', //Size
                r: 'pg', //Rating
                d: 'mm' //Default
            });

            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar,
                password: req.body.password
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser
                        .save()
                        .then(user => res.json(user))
                        .catch(err => console.log(err));
                });
            });
        }
    });
});

// @route   POST /api/users/login
// @desc    Login user
// @access  Public
router.post('/login', (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    //Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    //Find user in db by email
    User.findOne({ email }).then(user => {
        //If not found
        if (!user) {
            errors.email = 'User not found';
            return res.status(404).json(errors);
        }

        //Compare password
        bcrypt.compare(password, user.password).then(onEqual => {
            if (onEqual) {
                //User Matched
                const payload = {
                    id: user.id,
                    name: user.name,
                    avatar: user.avatar
                }; //Create JWT payload

                //Sign token
                jwt.sign(
                    payload,
                    keys.secretKey,
                    { expiresIn: 3600 },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: 'Bearer ' + token
                        });
                    }
                );
            } else {
                errors.password = 'Incorrect Password';
                return res.status(400).json(errors);
            }
        });
    });
});

// @route   GET /api/users/current
// @desc    Return current user
// @access  Private
router.get(
    '/current',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        res.json({
            id: req.user.id,
            name: req.user.name,
            email: req.user.email
        });
    }
);

module.exports = router;
