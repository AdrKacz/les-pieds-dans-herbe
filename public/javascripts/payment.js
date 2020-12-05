// Call Stripe API and check payment

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
  form.addEventListener('submit', // to continue ...) (https://stripe.com/docs/payments/integration-builder)
});
