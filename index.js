

const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// MySQL database connection configuration
const masterDBConfig = {
    host: 'localhost',
    user: 'root',
    password: 'abid123',
    database: 'delta_app' // Master database name
};

const masterDBConnection = mysql.createConnection(masterDBConfig);

// Connect to the master database
masterDBConnection.connect(err => {
    if (err) {
        console.error('Error connecting to master database: ' + err.stack);
        return;
    }
    console.log('Connected to master database as id ' + masterDBConnection.threadId);

    // Create the 'users' table if it doesn't exist
    const createUsersTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            username VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            organisationName VARCHAR(255) NOT NULL
        )
    `;

    masterDBConnection.query(createUsersTableQuery, (err, results) => {
        if (err) {
            console.error('Error creating users table:', err);
            return;
        }
        console.log('Users table created in master database');
    });
});

// Create express middleware to parse JSON requests
app.use(bodyParser.json());

// Endpoint to handle user signup
app.post('/signup', async (req, res) => {
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

    masterDBConnection.query(checkUserQuery, async (err, results) => {
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

        masterDBConnection.query(createUserDBQuery, async (err, results) => {
            if (err) {
                console.error('Error creating user database:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            console.log(`Database ${dbName} created`);

            // Store user information in the master database
            const insertUserQuery = `INSERT INTO users (email, username, password, organisationName) VALUES (?, ?, ?, ?)`;
            const userValues = [email, username, hashedPassword, organisationName];

            masterDBConnection.query(insertUserQuery, userValues, (err, results) => {
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

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
