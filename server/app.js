const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const history = require('connect-history-api-fallback');
require('dotenv').config();

const sessionMiddleware = require('./auth/session');
const passport = require('./auth/passport');

const cors = require('cors');
const corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials : true,
};

app.use(cookieParser());
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors(corsOptions));
app.use(history({
    verbose: true
}));

const authRouter = require('./routes/auth');
const productRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const orderRouter = require('./routes/order');
const usersRouter = require('./routes/users');

app.use('/', authRouter);
app.use('/products', productRouter);
app.use('/cart', cartRouter);
app.use('/order', orderRouter);
app.use('/users', usersRouter);

module.exports = app;
