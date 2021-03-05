import Swiper from 'swiper/bundle';
const slider = document.querySelector('.sliderOne');
const sliderTwo = document.querySelector('.sliderTwo')

const swiper = new Swiper(slider, {
  loop: true,
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
});

const swiper2 = new Swiper(sliderTwo, {
  loop: true,
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
});