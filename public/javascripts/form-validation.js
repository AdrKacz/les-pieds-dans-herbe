// Example starter JavaScript for disabling form submissions if there are invalid fields
// Exemple from Bootstrap
(function () {
  'use strict'

  window.addEventListener('load', function () {
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.getElementsByClassName('needs-validation')

    // Loop over them and prevent submission
    Array.prototype.filter.call(forms, function (form) {
      form.addEventListener('submit', function (event) {
        // [CUSTOM] Check if dates are set
        const is_dates_filled = !(document.querySelector('#calendar-input-arrival').value === '' || document.querySelector('#calendar-input-departure').value === '');
        // Normal flow below ...
        if (form.checkValidity() === false || is_dates_filled === false ) {
          event.preventDefault()
          event.stopPropagation()

          // Show warning
          document.querySelector('div#form-error').classList.remove('d-none');
        }

        form.classList.add('was-validated')
      }, false)
    })
  }, false)
})()
