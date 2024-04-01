const express = require('express');
const dbConnection = require('../models/database');
const mysql = require('mysql2');

const router = express.Router();

// Endpoint to add a client
router.post('/addclient', async (req, res) => {
    const { name, email, userDB } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !userDB) {
        res.status(400).send('Missing required fields');
        return;
    }

    const userDBConfig = {
        host: 'localhost',
        user: 'root',
        password: 'abid123',
        database: userDB
    };

    const userDBConnection = mysql.createConnection(userDBConfig);

    // Connect to the user's database
    userDBConnection.connect(err => {
        if (err) {
            console.error('Error connecting to user database: ' + err.stack);
            res.status(500).send('Internal Server Error');
            return;
        }

        console.log(`Connected to ${userDB} database as id ` + userDBConnection.threadId);

        // Insert client into the 'clients' table in the user's database
        const insertClientQuery = `INSERT INTO clients (name, email) VALUES (?, ?)`;
        userDBConnection.query(insertClientQuery, [name, email], (err, results) => {
            if (err) {
                console.error('Error adding client:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            console.log('Client added successfully');
            res.status(200).send('Client added successfully');
            userDBConnection.end();
        });
    });
});

module.exports = router;
