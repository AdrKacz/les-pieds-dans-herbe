// Function called by calendar and pack-form to update the price

function updatePrice() {
  // Get input to look into
  const arrival = document.querySelector('#calendar-input-arrival').value;
  const departure = document.querySelector('#calendar-input-departure').value;

  const pack_family = document.querySelector('input[name="pack-family"]').checked;
  const pack_trip = document.querySelector('input[name="pack-trip"]').checked;
  const pack_all = document.querySelector('input[name="pack-all"]').checked;

  // Check if date are selected, if not, do not ask the server
  if (!new Date(arrival) || !new Date(departure)) {
    throw new Error('Dates are not set');
    return;
  };

  // Create reservation object
  const reservation = {
    date_of_arrival: arrival,
    date_of_departure: departure,
    pack: 'none'
  }

  // If pack doesn't match server definition, server will treat it as null
  if (pack_family) {
    reservation.pack = 'family';
  } else if (pack_trip) {
    reservation.pack = 'trip';
  } else if (pack_all) {
    reservation.pack = 'all';
  };

  // Send request to the server to get the price before having create a reservation
  fetch('/payment/get-price-information', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(reservation),
  })
  .then(response => response.json())
  .then(json => {
    // Get payment object and button to confirm/book
    const pPrice = document.querySelector('#price-information');
    const btnSubmit = document.querySelector('button[type="submit"]');

    // Show price and submit
    pPrice.classList.remove('d-none');
    btnSubmit.classList.remove('d-none');
    pPrice.textContent = ` ${json.amount / 100} €`; // Convert cents to €
  });
};
