const bcrypt = require('bcrypt');

const SALTROUNDS = 10;

const registerUser = (req, res, db) => {
    const { name, email, password } = req.body;
    if(!name || !email || !password) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    const hash = bcrypt.hash(password, SALTROUNDS, (error, hash) => {
        if(error) {
            console.log(error);
            return res.status(500).json({ error: error });
        } else {
            const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)"
            db.query(sql, [name, email, hash], (error, result) => {
                if(error) {
                    console.log(error);
                    return res.status(500).json({ error: error });
                } else {
                    return res.status(200).json({ status: 'success' });
                }
            });
        }
    });
};

const loginUser = (req, res, db) => {
    const { email, password } = req.body;
    if(!email || !password) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    const sql = "SELECT * FROM users WHERE email = ?"
    db.query(sql, [email], (error, result) => {
        if(error) {
            console.log(error);
            return res.status(500).json({ error: error });
        } else {
            if(result.length > 0) {
                const hash = result[0].password;
                bcrypt.compare(password, hash, (error, result) => {
                    if(error) {
                        console.log(error);
                        return res.status(500).json({ error: error });
                    } else {
                        if(result) {
                            req.session.loggedin = true;
                            req.session.email = email;
                            return res.redirect('/home');
                        } else {
                            return res.status(401).json({ error: 'Incorrect password, please try again' });
                        }
                    }
                });
                response.end();
            } else {
                return res.status(401).json({ error: 'Email not registered' });
            }
        }
    });
}

const isAuthenticated = (req, res, next) => {
    if(req.session.loggedin) {
        return next();
    } else {
        return res.status(401).json({ error: 'Not authenticated' });
    }
}

module.exports = {
    registerUser,
    loginUser,
    isAuthenticated
}