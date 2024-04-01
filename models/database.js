const mysql = require('mysql2');

// MySQL database connection configuration
const masterDBConfig = {
    host: 'localhost',
    user: 'root',
    password: 'abid123',
    database: 'delta_app' // Master database name
};

const masterDBConnection = mysql.createConnection(masterDBConfig);

masterDBConnection.connect(err => {
    if (err) {
        console.error('Error connecting to master database: ' + err.stack);
        return;
    }
    console.log('Connected to master database as id ' + masterDBConnection.threadId);
});

module.exports = masterDBConnection;
