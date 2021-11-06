const express = require('express');
const helmet = require("helmet");
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

/// Config dotenv
require('dotenv').config();

require('dotenv').config({
    path: 'backend/.env'
});
process.env.SECRET_MONGO;
///

const bodyParser = require('body-parser');
const path = require('path');

const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

mongoose
    .connect(
        process.env.SECRET_MONGO, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    )
    .then(() => console.log("Connexion à MongoDB réussie !"))
    .catch(() => console.log("Connexion à MongoDB échouée !"));


const app = express();
app.use(helmet());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(bodyParser.json());
app.use(express.json());

// Express-rate-limit

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200 // limit each IP to 200 requests per windowMs
});

app.use(limiter);

app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth', userRoutes, limiter);
app.use('/api/sauces', sauceRoutes, limiter);

module.exports = app;