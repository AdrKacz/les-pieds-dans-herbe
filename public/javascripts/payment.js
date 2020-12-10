// https://stripe.com/docs/payments/integration-builder

// Call Stripe API and check payment
const stripe = Stripe('pk_test_TYooMQauvdEDq54NiTphI7jx');
const submitBtn = document.querySelector('button[type="submit"]');

// The reservation of the client --> Do not need, should already have a token for the dates


// Disable button until the API was fetch
submitBtn.disabled = true;

// Fetch reservation then Stripe API (only if a reservation was found)
fetch('/reservations/get-full-reservation')
.then(response => response.json())
.then(json => updateLayout(json.personal))
.then(_ => {
  // Call Stripe API (ok because a reservation was found)
  fetch('/payment/create-payment-intent', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
  })
  .then(response => response.json())
  .then(json => {
    const elements = stripe.elements({locale:'auto'}); // auto not needed, english in browser because browser preference language is english (set it to fr to force it)

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
    card.on("change", function (event) {
      // Disable the Pay button if there are no card details in the Element
      submitBtn.disabled = event.empty;
      });

    const form = document.querySelector('#payment-form'); // id not needed
    form.addEventListener('submit', event => {
      event.preventDefault(); // Do not reload the page --> Need to change the architecture for a checkout page !
      // Complete payment when the submit button is clicked
      payWithCard(stripe, card, json.clientSecret);
    });
  });
})
.catch(error => {
  console.error(error)
});

// Calls stripe.confirmCardPayment
// If the card requires authentication Stripe shows a pop-up modal to
// prompt the user to enter authentication details without leaving your page.
function payWithCard(stripe, card, clientSecret) {
  loading(true);
  stripe
    .confirmCardPayment(clientSecret, {
      payment_method: {
        card: card
      }
    })
    .then(result => {
      if (result.error) {
        // Show error to your customer
        showError(result.error.message);
      } else {
        // The payment suceeded!
        orderComplete(result.paymentIntent.id)
      };
    });
};

// ----------
// UI HELPERS
// ----------

// Shows a success message when the payment is complete
function orderComplete(paymentIntentId) {
  loading(false);
  // Get results alert and display the success one
  const alert_success = document.querySelector('div#success');
  const alert_danger = document.querySelector('div#danger');
  alert_success.classList.add('d-none');
  alert_danger.classList.add('d-none');

  alert_success.classList.remove('d-none');
  submitBtn.disabled = true;

  //Change danger text to display that the paiment had already been done in case of future error
  alert_danger.textContent = 'Le paiement a déjà été effectué.';

};

// Show the customer the error from Stripe if their card fails to charge
function showError(errorMsgText) {
  loading(false);
  // Get results alert and display the danger one
  const alert_success = document.querySelector('div#success');
  const alert_danger = document.querySelector('div#danger');
  alert_success.classList.add('d-none');
  alert_danger.classList.add('d-none');

  alert_danger.classList.remove('d-none');
  submitBtn.disabled = true;
};

// Show a spinner on payment submission
function loading(isLoading) {
  console.log('Loading Switch');
  // To be continued ...
};

// Update UI with reservation
function updateLayout(reservation) {
  // Check if there is a reservation, if not throw an error
  if (!reservation) {
    // Alert the user that there isn't any reservation
    const alert_reservation = document.querySelector('div#warning');
    alert_reservation.classList.remove('d-none');
    throw new Error('Reservation is null');
    return;
  };

  // Get element to write in
  const p_date_of_arrival = document.querySelector('#date-of-arrival');
  const p_date_of_departure = document.querySelector('#date-of-departure');
  const p_pack = document.querySelector('#pack');

  const p_first_name = document.querySelector('#first-name');
  const p_last_name = document.querySelector('#last-name');
  const p_email = document.querySelector('#email');
  const p_address = document.querySelector('#address');

  const p_zip = document.querySelector('#zip');
  const p_city = document.querySelector('#city');
  const p_country = document.querySelector('#country');

  // Fill the bill
  p_date_of_arrival.textContent = reservation.date_of_arrival;
  p_date_of_departure.textContent = reservation.date_of_departure;
  p_pack.textContent = reservation.pack;

  p_first_name.textContent = reservation.name;
  p_last_name.textContent = reservation.surname;
  p_email.textContent = reservation.email;
  p_address.textContent = reservation.address;

  p_zip.textContent = reservation.zip;
  p_city.textContent = reservation.city;
  p_country.textContent = reservation.country;
};
