// Get reference to update

// Dates
const calendarInputArrivalCheck = document.querySelector('#calendar-input-arrival');
const calendarInputDepartureCheck = document.querySelector('#calendar-input-departure');
const calendarButtonCheck = document.querySelector('#calendar-button');

// Pack
const packFamilyCheck = document.querySelector('input[name="pack-family"]');
const packTripCheck = document.querySelector('input[name="pack-trip"]');
const packAllCheck = document.querySelector('input[name="pack-all"]');

// Load previous reservation if any
window.onload = function() {
  fetch(ADDRESS)
    .then(response => response.json())
    .then(json => {
      if (!json.personal) {
        return;
      };
      const dateOfArrival = new Date(json.personal.date_of_arrival);
      const dateOfDeparture = new Date(json.personal.date_of_departure);
      const chosenPack = json.personal.pack;

      // Set the date
      calendarInputArrival.value = dateOfArrival.toISOString();
      calendarInputDeparture.value =  dateOfDeparture.toISOString();

      calendarButton.textContent = `${dateOfArrival.toDateString()} - ${dateOfDeparture.toDateString()}`; // Need a language dependent text

      // Set the pack
      packFamilyCheck.checked = false;
      packTripCheck.checked = false;
      packAllCheck.checked = false;
      if (chosenPack === 'family') {
        packFamilyCheck.checked = true;
      } else if (chosenPack === 'trip') {
        packTripCheck.checked = true;
      } else if (chosenPack === 'all') {
        packAllCheck.checked = true;
      };
    });
};
