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
]

let CURRENT_MONTH = 10
let CURRENT_YEAR = 2020
// const calendarInput = document.querySelector('#calendar-input');
const calendarRoot = document.querySelector('#calendar');
const monthBtn = document.querySelector('#month');
const previousBtn = document.querySelector('#previous');
const nextBtn = document.querySelector('#next');
const calendar = document.querySelector('#calendar-dates');

calendarRoot.onload = updateCalendar();

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


function updateCalendar() {
  // clear previous month displayed

  while (calendar.firstChild) {
    calendar.removeChild(calendar.firstChild);
  };

  // create new one

  month = CURRENT_MONTH;
  year = CURRENT_YEAR;

  objMonth = MONTHS[CURRENT_MONTH];

  monthBtn.textContent = `${objMonth.long}, ${year}`;

  let currentDate = new Date(year, month);
  const firstDay = (currentDate.getDay() + 6) % 7;

  while (currentDate.getMonth() === month) {
    const day = (currentDate.getDay() + 6) % 7;
    const row = document.createElement('div');
    row.setAttribute('class', 'row mb');
    for (let i = 0; i < 7; i++) {
      if (i >= day && currentDate.getMonth() === month) {
        const dayItem = document.createElement('div');
        dayItem.setAttribute('class', 'col px-1');
        dayItem.textContent = currentDate.getDate();
        row.appendChild(dayItem);
        currentDate.setDate(currentDate.getDate() + 1);
      } else {
        const emptyItem = document.createElement('div');
        emptyItem.setAttribute('class', 'col px-1');
        emptyItem.textContent = '';
        row.appendChild(emptyItem);
      };
    };
    calendar.appendChild(row)
  };

  console.log('End Date:' + currentDate);

  console.log(`Update Calendar [${objMonth.long}] ${firstDay}`);
};
