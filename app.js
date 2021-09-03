const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const viewRouter = require('./routes/viewRoutes');

// Express
const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) Global middlewares
// Implement CORS
app.use(cors());
// Access-control-allow-origin *
//api.natours.com
// app.use(
//   cors({
//     origin: 'https://www.natours.com',
//   })
// );

// app.options('/api/v1/tours/:id', cors());
app.options('*', cors());

// serving static files
app.use(express.static(path.join(__dirname, 'public')));
// Set security http limit request from same api
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try agin in a hour',
});
app.use('/api', limiter);

app.post(
  '/webhook-checkout',
  express.raw({
    type: 'application/json',
  }),
  bookingController.webhookCheckout
);

// body parser,reading data from body intro req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization  agianst NOSQL query injection
app.use(mongoSanitize());

// Data sanitization XSS
app.use(xss());

// Prevent parameter polution
app.use(
  hpp({
    whiteList: ['duration'],
  })
);

// app.use((req, res, next) => {
//   // console.log('Hello from the middleware 👋');
//   next();
// });

app.use(compression());
// Test middlewares
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // cookie  console.log('cookies', req.cookies);

  next();
});
// 3) ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

process.on('SIGTERM', () => {
  console.log(' SIGTERM RECEIVED. Shutting down gracefully');
  Server.close(() => {
    console.log('Process terminated');
  });
});
