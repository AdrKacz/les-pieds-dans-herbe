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

// const calendarInput = document.querySelector('#calendar-input');
const calendarRoot = document.querySelector('#calendar');

calendarRoot.onload = updateCalendar(MONTHS[10]);

const startDateInput = '';
const endDateInput = '';


// calendarInput.addEventListener('click', () => {
//   // Design a static calendar in the page with modal bootstrap class
//   calendarRoot.modal('toggle');
// });


function updateCalendar(month) {
  // Calendar Root
  console.log(`Update Calendar [${month.long}]`);

}
