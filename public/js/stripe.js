/* eslint-disable */
import axios from 'axios';
import {
    showAlert
} from './alert';
const stripe = Stripe('pk_test_51I429QACVO0I2rXHtIHwNTWP9l3jUsNNJkyyMSkjtnHzmLQb8pecwd08TspuGXJTAeginzv4SMhA79RO4MRFvQ4u00XQPy7EBs');

export const bookTour = async tourId => {

    try {
        //1) get checkout session from api
        const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);

        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
        //2)) create checkout session from API
        // console.log(session);
    } catch (err) {
        showAlert('error', err);
    }
}