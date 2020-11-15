// MAIN const
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
// Set up class name for item
const DATE_ITEM = 'date-item';
const CLICKABLE = 'clickeable';
const CLICKED = 'clicked';
const LAYOUT = 'col px-1 py-2';

// Set up the current date and associative variable
const NOW = new Date()
const NOW_DAY = NOW.getDate();
const NOW_MONTH = NOW.getMonth();
const NOW_YEAR = NOW.getFullYear();

// Set up date currently viewed
let CURRENT_MONTH = NOW_MONTH
let CURRENT_YEAR = NOW_YEAR

// Variable to store the two selected dates
let firstSelectedDate = null;
let secondSelectedDate = null;


const calendarInput = document.querySelector('#calendar-input');
const calendarButton = document.querySelector('#calendar-button');

const calendarRoot = document.querySelector('#calendar');
const monthBtn = document.querySelector('#month');
const previousBtn = document.querySelector('#previous');
const nextBtn = document.querySelector('#next');
const calendar = document.querySelector('#calendar-dates');

const startDateInput = '';
const endDateInput = '';

previousBtn.addEventListener('click', _ => {
  CURRENT_MONTH -= 1;
  if (CURRENT_MONTH < 0) {
    CURRENT_MONTH = 11;
    CURRENT_YEAR -= 1;
  };

  updateCalendar();
});

nextBtn.addEventListener('click', _ => {
  CURRENT_MONTH += 1;
  if (CURRENT_MONTH > 11) {
    CURRENT_MONTH = 0;
    CURRENT_YEAR += 1;
  };

  updateCalendar();
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

    // Edit the form value and close the calendar

  }
}

function updateCalendar() {
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
        if (currentDate >= NOW) {
          classes.push(CLICKABLE);
        };

        // Create item
        const dayItem = document.createElement('div');
        // Assign classes
        if (currentDate >= NOW) {
          if (isSameDate(firstSelectedDate, currentDate) || isSameDate(secondSelectedDate, currentDate)) {
            classes.push(CLICKED);
          } else {
            classes.push(CLICKABLE);
          }
          // Assign click listener
          dayItem.addEventListener('click', dateClickedOn);
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

  console.log('End Date:' + currentDate);

  console.log(`Update Calendar [${objMonth.long}] ${firstDay}`);
};


// Modal event handler

// At opening
$('#calendar').on('show.bs.modal', function(e) {
  // Reset selected date
  firstSelectedDate = null;
  secondSelectedDate = null;

  updateCalendar();
});

// At closing
$('#calendar').on('hide.bs.modal', function(e) {
  // Save selected date if any and update interface
  if (firstSelectedDate && secondSelectedDate) {
    let firstInTime = firstSelectedDate;
    let secondInTime = secondSelectedDate;
    if (firstSelectedDate > secondSelectedDate) {
      firstInTime = secondSelectedDate;
      secondInTime = firstSelectedDate;
    };
    calendarInput.value = `${firstInTime.toDateString()}-${secondInTime.toDateString()}`;;
    calendarButton.textContent = `${firstInTime.toDateString()} - ${secondInTime.toDateString()}`;;;
  };
});
