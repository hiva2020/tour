const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  console.log(stripe);
  //2) create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${req.protocol}://${req.get('host')}/?tour=${
    //   req.params.tourId
    // }&user=${req.user.id}&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get('host')}/my-tours`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: `${tour.summary}`,
        images: [
          `https://our-tours.herokuapp.com/img/tours/${tour.imageCover}`,
        ],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  //   stripe_account: 'acct_1I429QACVO0I2rXH',

  //3) create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   // This is  only Temperory , because its unsecure : everyone  can make booking without paying
//   const { tour, user, price } = req.query;

//   if (!tour && !user && !price) return next();

//   await Booking.create({ tour, user, price });

//   res.redirect(req.originalUrl.split('?')[0]);
// });

exports.createBookingCheckout =async session =>  {
  const tour = session.client_reference_id;
  const user =(await User.findOne({email: session.customer_email})).id;
  const price =session.line_items[0].amount/100;

   await Booking.create({ tour, user, price });
  //res.redirect(req.originalUrl.split('?')[0]);
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature']; 
  let event;
  try {
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
     return res.status(400).send(`Webhook Error: ${err.message}`);
    
    }
    // Handle the event
  switch (event.type) {
    case 'checkout.session.async_payment_failed':
      const checkout = event.data.object;
      // Then define and call a function to handle the event checkout.session.async_payment_failed
      break;
    case 'checkout.session.async_payment_succeeded':
      const checkout = event.data.object;

      // Then define and call a function to handle the event checkout.session.async_payment_succeeded
      break;
    case 'checkout.session.completed':
      const checkout = event.data.object;
      this.createBookingCheckout(event.data.object);
      // Then define and call a function to handle the event checkout.session.completed
      res.status(200).json({received: true});
      break;
    case 'payment_intent.amount_capturable_updated':
      const paymentIntent = event.data.object;
      // Then define and call a function to handle the event payment_intent.amount_capturable_updated
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
 
};
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
