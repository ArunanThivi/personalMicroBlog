const express = require('express');
const cors = require('cors');
var bodyParser = require('body-parser');
const mysql = require("mysql2")
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
})

db.connect((error) => {
    if(error) {
        console.log("database failed")
        console.log(error)
    } else {
        console.log("Database connected!")
    }
})

// let tweets = []

// // When sendTweet request is recieved, Extract message and communities from request body and send tweet
app.get('/getTweets', (req, res) => {
    const handle = 'arunanthivi'; //req.params.handle;
    console.log(handle);
    const getUserIdQuery = 'SELECT user_id FROM users WHERE handle = ?'
    db.query(getUserIdQuery, [handle], (error, result) => {
        if(error) {
            console.log(error);
            // throw new Error(error);
            return res.json({ error: error, status: 500 });
        } else {
            const user_id = result[0].user_id;
            console.log(result);
            const sql = "SELECT * FROM tweets WHERE author_id = ?"
            db.query(sql, [user_id], (error, result) => {
                if(error) {
                    console.log(error);
                    throw new Error(error);
                } else {
                    console.log(result);
                    res.send(result);
                }
            })
            // return res.json({ tweets: result, status: 200 });
        }
    })
});

app.post('/sendTweet', (req, res) => {
    const body = req.body;
    const tweet = {
        message: body.message,
        communities: body.communities || null,
        author: body.user,
        timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
        likes: 0
    }
    const sql = "INSERT INTO tweets (author_id, message, community, created_at) VALUES (?, ?, ?, ?)"
    db.query(sql, [tweet.author, tweet.message, tweet.communities, tweet.timestamp], (error, result) => {
        if(error) {
            console.log(error)
        } else {
            console.log(result)
            res.send(result)
        }
    });
    console.log(tweet);
    // Send tweet
    // res.send('Tweet Sent');
});

// app.post('/auth/login', (req, res) => {
//     const body = req.body;
//     const username = body.username;
//     const password = body.password;
//     console.log(username);
// });

// app.post('/auth/register', (req, res) => {
//     const {name, email, handle, password, password_confirm } = req.body;
//     console.log('Registering user');
// });

app.listen(3000, () => console.log('Server running on port 3000'));



// //Tweet Object
// /*
// Author:
// Message:
// Communities:
// Timestamp:
// Likes:
// */