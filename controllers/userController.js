const express = require('express');
const bcrypt = require('bcrypt');
const dbConnection = require('../models/database');

const router = express.Router();

// Endpoint to handle user signup
router.post('/signup', async (req, res) => {
    const { email, password, username, organisationName } = req.body;

    // Check if all required fields are provided
    if (!email || !password || !username || !organisationName) {
        res.status(400).send('Missing required fields');
        return;
    }

    // Hash the password
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 10);
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).send('Internal Server Error');
        return;
    }

    // Check if the user already exists in the master database
    const checkUserQuery = `SELECT COUNT(*) AS userCount FROM users WHERE email = '${email}'`;

    dbConnection.query(checkUserQuery, async (err, results) => {
        if (err) {
            console.error('Error checking user:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        const userCount = results[0].userCount;

        if (userCount > 0) {
            console.log("User already exists");
            res.status(400).send('User already exists');
            return;
        }

        // If the user doesn't exist, proceed with signup
        // Create a new database for the user
        const dbName = email.split("@")[0];
        const createUserDBQuery = `CREATE DATABASE IF NOT EXISTS ${dbName}`;

        dbConnection.query(createUserDBQuery, async (err, results) => {
            if (err) {
                console.error('Error creating user database:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            console.log(`Database ${dbName} created`);

            // Store user information in the master database
            const insertUserQuery = `INSERT INTO users (email, username, password, organisationName) VALUES (?, ?, ?, ?)`;
            const userValues = [email, username, hashedPassword, organisationName];

            dbConnection.query(insertUserQuery, userValues, (err, results) => {
                if (err) {
                    console.error('Error inserting user information:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }

                console.log('User information stored in master database');
                res.status(200).send('User signed up successfully');
            });
        });
    });
});

module.exports = router;
