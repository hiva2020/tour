const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNHANDLER REJECTION! shutting down ...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
let DB = '';
if (process.env.NODE_ENV === 'development') DB = process.env.DATABASE;
//replace('',new)
else DB = process.env.DATABASE_LOCAL;

console.log(process.env.NODE_ENV);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    //  console.log(con.connection);
    console.log('DB Connection Successful');
  });
mongoose.set('debug', (collection, method, query) => {
  // console.log('===============begin query========================');
  // console.log(collection, method, query);
  // console.log('===============end query==========================');
});
// const testTour = new Tour({
//   name: 'The Park Camper',
//   rating: 4.7,
//   price: 497,
// });

// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('خطايي رخ داده است:', err);
//   });
const app = require('./app');

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLER REJECTION! shutting down ...');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
//console.log(x);
