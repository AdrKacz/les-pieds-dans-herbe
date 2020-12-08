// Call Stripe API and check payment
const stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
const submitBtn = document.querySelector('button[type="submit"]');

// The reservation of the client --> Do not need, should already have a token for the dates


// Disable button until the API was fetch
submitBtn.disabled = true;

// Fetch Stripe API
fetch('/payment/create-payment-intent', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json"
  },
})
.then(response => response.json())
.then(json => {
  const elements = stripe.elements();

  const style = {
    base: {
      color: '#32325d',
      '::placeholder': {
        color: '#32325d',
      },

      fontFamily: 'Arial, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',

      fontFamily: 'Arial, sans-serif',
    }
  };

  const card = elements.create('card', {style: style});

  // Stripe injects an iframe into the DOM
  card.mount('#payment-card-element');

  // Optional: card.on 'change' (to surface card error)

  const form = document.querySelector('#payment-form'); // id not needed
  form.addEventListener('submit', event => { // https://stripe.com/docs/payments/integration-builder
    // event.preventDefault();
    // Complete payment when the submit button is clicked
    payWithCard(stripe, card, json.clientSecret);
  });
});


// Calls stripe.confirmCardPayment
// If the card requires authentication Stripe shows a pop-up modal to
// prompt the user to enter authentication details without leaving your page.
function payWithCard(stripe, card, clientSecret) {
  // To be continued ...
  console.log('Pay With Card');
};
