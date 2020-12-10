// MAIN const

const ADDRESS = '/reservations/get-reservations';

const MONTHS = [
  {
    long:'Janvier',
    short:'Jan'
  },
  {
    long:'Février',
    short:'Fev'
  },
  {
    long:'Mars',
    short:'Mar'
  },
  {
    long:'Avril',
    short:'Jan'
  },
  {
    long:'Mai',
    short:'Jan'
  },
  {
    long:'Juin',
    short:'Jui'
  },
  {
    long:'Juillet',
    short:'Juil'
  },
  {
    long:'Août',
    short:'Aou'
  },
  {
    long:'September',
    short:'Sep'
  },
  {
    long:'Octobre',
    short:'Oct'
  },
  {
    long:'Novembre',
    short:'Nov'
  },
  {
    long:'Décembre',
    short:'Dec'
  },
];

// Helper function to compare to date
function isSameDate(d1, d2) {
  if (!d1 || !d2) {
    return false;
  };

  if (d1.getYear() !== d2.getYear()) {
    return false;
  };

  if (d1.getMonth() !== d2.getMonth()) {
    return false;
  };

  if (d1.getDate() !== d2.getDate()) {
    return false;
  };

  return true;
};

function isInRange(date, range) {
  for (let i = 0; i < range.length; i++) {
    dateA = new Date(range[i].date_of_arrival);
    dateB = new Date(range[i].date_of_departure);
    if (dateA <= date && date < dateB) {
      return true;
    };
  };
  return false;
};

function isOverRange(dateFirst, dateLate, range) {
  for (let i = 0; i < range.length; i++) {
    dateA = new Date(range[i].date_of_arrival);
    dateB = new Date(range[i].date_of_departure);
    if (dateFirst <= dateA && dateB <= dateLate) {
      return true;
    };
  };
  return false;
};

// Set up class name for item
const DATE_ITEM = 'date-item';
const CLICKABLE = 'clickeable';
const CLICKED = 'clicked';
const LAYOUT = 'col px-1 py-2';

// Set up the current date and associative variable
const NOW = new Date();
NOW.setDate(NOW.getDate() + 1); // Cannot coming the same day as booking
const NOW_DAY = NOW.getDate();
const NOW_MONTH = NOW.getMonth();
const NOW_YEAR = NOW.getFullYear();

// Set up date currently viewed
let CURRENT_MONTH = NOW_MONTH
let CURRENT_YEAR = NOW_YEAR

// Variable to store the two selected dates
let firstSelectedDate = null;
let secondSelectedDate = null;


const calendarInputArrival = document.querySelector('#calendar-input-arrival');
const calendarInputDeparture = document.querySelector('#calendar-input-departure');
const calendarButton = document.querySelector('#calendar-button');

const calendarRoot = document.querySelector('#calendar');
const monthBtn = document.querySelector('#month');
const previousBtn = document.querySelector('#previous');
const nextBtn = document.querySelector('#next');
const calendar = document.querySelector('#calendar-dates');

const alert_calendar = document.querySelector('div#calendar-error');


previousBtn.addEventListener('click', _ => {
  CURRENT_MONTH -= 1;
  if (CURRENT_MONTH < 0) {
    CURRENT_MONTH = 11;
    CURRENT_YEAR -= 1;
  };

  updateCalendarRoutine();
});

nextBtn.addEventListener('click', _ => {
  CURRENT_MONTH += 1;
  if (CURRENT_MONTH > 11) {
    CURRENT_MONTH = 0;
    CURRENT_YEAR += 1;
  };
  updateCalendarRoutine();
});

// Event listener for date item
function dateClickedOn(e) {
  const classes = [LAYOUT, DATE_ITEM, CLICKED]
  const selectedDate = new Date(CURRENT_YEAR, CURRENT_MONTH, parseInt(e.target.textContent));
  if (!firstSelectedDate) {
    firstSelectedDate = selectedDate;
    e.target.setAttribute('class', classes.join(' '));
  }
  else if (!secondSelectedDate && !isSameDate(firstSelectedDate, selectedDate)) {
    secondSelectedDate = selectedDate;
    e.target.setAttribute('class', classes.join(' '));
    // Do not close the calender but wait for click on save
    // $('#calendar').modal('hide');
  };
};

function updateCalendarRoutine() {
  fetch(ADDRESS)
  .then(response => response.json())
  .then(json => updateCalendar(json.global))
  .catch(err => console.error('Fetch error: ' + err.message));
};

function updateCalendar(JSONReservations) {
  // Clear previous month displayed
  while (calendar.firstChild) {
    calendar.removeChild(calendar.firstChild);
  };

  // Create new month
  month = CURRENT_MONTH;
  year = CURRENT_YEAR;

  objMonth = MONTHS[CURRENT_MONTH];
  // Update text displaying month name and year number
  monthBtn.textContent = `${objMonth.long}, ${year}`;

  // Set up variable to current month viewed
  let currentDate = new Date(year, month);
  const firstDay = (currentDate.getDay() + 6) % 7;

  while (currentDate.getMonth() === month) {
    const day = (currentDate.getDay() + 6) % 7;
    const row = document.createElement('div');
    row.setAttribute('class', 'row mb');
    for (let i = 0; i < 7; i++) {
      if (i >= day && currentDate.getMonth() === month) {
        // Create date item clickeable
        classes = [LAYOUT, DATE_ITEM]

        // Create item
        const dayItem = document.createElement('div');
        // Assign classes
        if (currentDate > NOW) {
          if (isSameDate(firstSelectedDate, currentDate) || isSameDate(secondSelectedDate, currentDate)) {
            classes.push(CLICKED);
          } else if (!isInRange(currentDate, JSONReservations)) {
            classes.push(CLICKABLE);
            // Assign click listener
            dayItem.addEventListener('click', dateClickedOn);
          }
        };
        dayItem.setAttribute('class', classes.join(' '));
        dayItem.textContent = currentDate.getDate();
        row.appendChild(dayItem);
        currentDate.setDate(currentDate.getDate() + 1);
      } else {
        // Create empty item to have the correct number of column
        const emptyItem = document.createElement('div');
      emptyItem.setAttribute('class', LAYOUT);
        emptyItem.textContent = '';
        row.appendChild(emptyItem);
      };
    };
    calendar.appendChild(row)
  };

  console.log(`Updated Calendar [${objMonth.long}]`);
};


// Modal event handler

// At opening
$('#calendar').on('show.bs.modal', function(e) {
  // Remove alert if displayed
  alert_calendar.classList.add('d-none');

  // Reset selected date if both were selected (else continue update of date)
  if (secondSelectedDate) {
    firstSelectedDate = null;
    secondSelectedDate = null;
  };

  updateCalendarRoutine();
});

// At closing
$('#calendar').on('hide.bs.modal', function(e) {
  // Clear previous month displayed
  while (calendar.firstChild) {
    calendar.removeChild(calendar.firstChild);
  };
  // Do not save anything on close
});

// Get save button and save function when clicked on (then close modal)
document.querySelector('#calendar-save-btn').addEventListener('click', _ => {
  // Check if both date were selected
  if (firstSelectedDate && secondSelectedDate) {
    let firstInTime = firstSelectedDate;
    let secondInTime = secondSelectedDate;
    if (firstSelectedDate > secondSelectedDate) {
      firstInTime = secondSelectedDate;
      secondInTime = firstSelectedDate;
    };
    // Check if no problem with reservation
    fetch(ADDRESS)
    .then(response => response.json())
    .then(json => {
      if (isOverRange(firstInTime, secondInTime, json.global)) {
        // Display error and throw error
        alert_calendar.classList.remove('d-none');
        // Reset calendar
        firstSelectedDate = null;
        secondSelectedDate = null;
        updateCalendarRoutine();

        throw new Error('Chosen dates are over range of already booked dates');
      } else {
        calendarInputArrival.value = firstInTime.toISOString();
        calendarInputDeparture.value =  secondInTime.toISOString();

        calendarButton.textContent = `${firstInTime.toDateString()} - ${secondInTime.toDateString()}`; // Need a language dependent text
      };
    })
    .then(_ => {
      // Clear the calendar month displayed
      while (calendar.firstChild) {
        calendar.removeChild(calendar.firstChild);
      };
      // Close calendar (withour issue)
      $('#calendar').modal('hide');
    })
    .catch(err => console.error('Fetch error: ' + err.message));
  } else {
    // If not, displayed a message saying that saving couldn't be perform
    console.error('At least one of the date wasn\'t selected');

    alert_calendar.classList.remove('d-none');
    // Reset calendar
    firstSelectedDate = null;
    secondSelectedDate = null;
    updateCalendarRoutine();
  };
});
