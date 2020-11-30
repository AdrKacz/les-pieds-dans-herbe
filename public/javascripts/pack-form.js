// Control the switch of checkboxes

const checkboxes = document.querySelectorAll("input[type='checkbox']");

for (var i = 0; i < checkboxes.length; i++) {
  checkboxes[i].addEventListener('change', switchCheck);
};


function  switchCheck (e) {
  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i] !== this) {
      checkboxes[i].checked = false;
    };
  };
};
