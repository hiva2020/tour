// This is test for stripe
const stripe = require('stripe')(
  'sk_test_51JUxBWJ14q5yQER3oCXkgvqpPzavujStTyUalgkdTS2fnLpKluJiSAMXe1B6LJxZj4J4rNLaD9fqeHtlA3LPm0yO00QYJQJBz9'
);
const express = require('express');

const app = express();
app.use(express.static('public'));

const YOUR_DOMAIN = 'http://localhost:4242';

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: 'price_1JUxNwJ14q5yQER3KDF28UOf',
        quantity: 1,
      },
    ],
    payment_method_types: ['card', 'bancontact', 'sofort'],
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}/success.html`,
    cancel_url: `${YOUR_DOMAIN}/cancel.html`,
  });

  res.redirect(303, session.url);
});

app.listen(4242, () => console.log('Running on port 4242'));
