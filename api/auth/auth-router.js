const router = require('express').Router();
const {checkRequestBody} = require("./auth-middleware");
const { JWT_SECRET, BCRYPT_ROUNDS } = require("../secrets");
const Users = require("../users/users-model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

router.post('/register', checkRequestBody, (req, res, next) => {
  let newUser = req.body;

  Users.findByName(newUser.username)
    .then(user => {
      if(user.length === 0){
        const hash = bcrypt.hashSync(newUser.password, BCRYPT_ROUNDS)
        newUser.password = hash

        Users.add(newUser)
          .then(savedUser => {
            res.status(201).json(savedUser)
          })
          .catch(e => {
            res.status(500).json(`Server error: ${e}`)
          }) 
      } else {
        res.status(401).json({message:"username taken"})
      }
    })
    .catch(e => {
      res.status(500).json(`Server error: ${e}`)
    })

  
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
});

router.post('/login', checkRequestBody, (req, res) => {
  let { username, password } = req.body
  
  Users.findByName(username)
    .then(([user]) => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = makeToken(user)
        res.status(200).json({ 
          message: `welcome, ${user.username}`,
          token 
        })
      } else {
        res.status(401).json({message: 'invalid credentials' })
      }
    })
    .catch(e => {
      res.status(500).json(`Server error: ${e}`)
    })

  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
});

function makeToken(user){
  const payload = {
    subject: user.id,
    username: user.username,
    role_name: user.role_name
  }
  const options = {
    expiresIn: "1d"
  }
  return jwt.sign(payload,JWT_SECRET,options)
}

module.exports = router;
