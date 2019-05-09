const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();

const cors = require('cors');
/*const corsOptions = {
    origins: 'http://localhost:8080',
    credentials: true,
};*/
const corsOptions = { origin : true, credentials : true };

const sequelize = require('./db/connection');
sequelize.authenticate();

const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const passport = require('./auth/passport');

const authRouter = require('./routes/auth');
const authMV = require('./middlewares/AuthMV');

app.use(logger('dev'));
app.use(cors(corsOptions));
app.use(cookieParser());

app.all("*", (req,res, next) => {
    // cookie doesn't exist redirect to login
    if(req.headers.cookie){
        console.error('@@@@@@@@@@@@@@@@@@@@@@@@@@@@-')
        console.error(req.headers.cookie)
        console.error('@@@@@@@@@@@@@@@@@@@@@@@@@@@@=')
    }
    next();
})

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.AUTH_SECRET,
    store: new SequelizeStore({
        db: sequelize
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 6000,
    }
}));
app.use(passport.initialize());
app.use(passport.session());
// app.use(authMV);

app.use('/', authRouter);

module.exports = app;
