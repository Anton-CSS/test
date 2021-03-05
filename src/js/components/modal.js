const message = document.querySelector('.message');
const email = document.querySelector('.fix__link--email');
const tel = document.querySelector('.fix__link--tel');
const modal = document.querySelector('.modal');
const closeBtn = document.querySelector('.modal__close');
const searchSelect = document.querySelector('.search__select');
const selectOption = document.querySelector('.select__option');
const portfolioContent = document.querySelector('.portfolio__content')
const link = document.getElementById('link');

document.body.addEventListener('click', (e) => {
  const target = e.target;
  e.preventDefault();
  if (target === email) {
    message.classList.add('active');
    setTimeout(() => message.classList.remove('active'), 1500);
  } else if (target === tel) {
    modal.classList.add('active');
    document.body.classList.add('active-body');
  } else if (target === closeBtn || target === document.body) {
    modal.classList.remove('active');
    document.body.classList.remove('active-body');
  } else if (target === searchSelect || target === searchSelect.children[0]) {
    selectOption.classList.toggle('active');
  } else if (target === link || target === link.children[0]) {
    let memory = link.children[0].src;
    if (link.children[0].src = '../img/+.png') {
      link.children[0].src = link.children[0].dataset.img;;
      link.children[0].dataset.img = memory;
    } else {
      link.children[0].dataset.img = link.children[0].src;
      link.children[0].src = memory;
    }
    portfolioContent.classList.toggle('active')
  }
})

const elems = [...selectOption.children[0].children];
elems.forEach(item => {
  item.addEventListener('click', () => {
    searchSelect.children[0].textContent = item.children[0].textContent;
    selectOption.classList.remove('active');
  })
})