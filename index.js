const express = require('express');
const bodyParser = require('body-parser');
const userController = require('./controllers/userController');
const clientController = require('./controllers/clientController');

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Mount routers
app.use('/users', userController);
app.use('/clients', clientController);

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
