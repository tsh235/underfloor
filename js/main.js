// слайдер
new Swiper('.hero__slider', {
  loop: true,
  slidesPerView: 2,
  spaceBetween: 10,
  navigation: {
    prevEl: '.hero__slider-btn--prev',
    nextEl: '.hero__slider-btn--next',
  },
  autoplay: {
    delay: 7000,
  },
  breakpoints: {
    320: {
      slidesPerView: 1,
    },
    429: {
      spaceBetween: 8,
      slidesPerView: 2,
    }
  }
});

// калькулятор
const calcForm = document.querySelector('.js-calc-form');
const totalSquare = document.querySelector('.js-total-square');
const totalPrice = document.querySelector('.js-total-price');
const resultBlock = document.querySelector('.js-result');
const btnSubmit = document.querySelector('.js-submit');
const calcOrder = document.querySelector('.calc__order');

const tariff = {
  economy: 550,
  comfort: 1400,
  premium: 2700,
};

calcForm.addEventListener('input', () => {
  btnSubmit.disabled = !(calcForm.width.value > 0 && calcForm.length.value > 0);
});

calcForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (calcForm.width.value > 0 && calcForm.length.value > 0) {
    const square = calcForm.width.value * calcForm.length.value;
    const price = square * tariff[calcForm.tariff.value];
    
    totalSquare.textContent = `${square} кв м`;
    totalPrice.textContent = `${price} руб`;
    resultBlock.style.opacity = '1';
    
    calcOrder.style.opacity = '1';
  } 
});

// модальное окно 
const scrollController = {
  scrollPosition: 0,
  disabledScroll() {
    scrollController.scrollPosition = window.scrollY;
    document.body.style.cssText = `
      overflow: hidden;
      position: fixed;
      top: -${scrollController.scrollPosition}px;
      left: 0;
      height: 100vh;
      width: 100vw;
      padding-right: ${window.innerWidth - document.body.offsetWidth}px
    `;
    document.documentElement.style.scrollBehavior = 'unset';
  },
  enabledScroll() {
    document.body.style.cssText = '';
    window.scroll({top: scrollController.scrollPosition})
    document.documentElement.style.scrollBehavior = '';
  },
};

const modalController = ({modal, btnOpen, btnClose, time = 300}) => {
  const buttonElems = document.querySelectorAll(btnOpen);
  const modalElem = document.querySelector(modal);

  modalElem.style.cssText = `
    display: flex;
    visibility: hidden;
    opacity: 0;
    transition: opacity ${time}ms ease-in-out;
  `;

  const closeModal = event => {
    const target = event.target;

    if (
      target === modalElem ||
      (btnClose && target.closest(btnClose)) ||
      event.code === 'Escape'
      ) {
      
      modalElem.style.opacity = 0;

      setTimeout(() => {
        modalElem.style.visibility = 'hidden';
        scrollController.enabledScroll();
      }, time);

      window.removeEventListener('keydown', closeModal);
    }
  }

  const openModal = () => {
    modalElem.style.visibility = 'visible';
    modalElem.style.opacity = 1;
    window.addEventListener('keydown', closeModal);
    scrollController.disabledScroll();
  };

  buttonElems.forEach(btn => {
    btn.addEventListener('click', openModal);
  });

  modalElem.addEventListener('click', closeModal);
};

modalController({
  modal: '.modal',
  btnOpen: '.js-order',
  btnClose: '.modal__close'
});

// маска
const phone = document.querySelector('#phone');
const imPhone = new Inputmask('+7(999)999-99-99');
imPhone.mask(phone);

// валидация формы
const validator = new JustValidate('.modal__form', {
  errorLabelCssClass: 'modal__input-error',
  errorLabelStyle: {
    color: '#FFC700',
  },
});
validator
  .addField('#name', [
    {
      rule: 'required',
      errorMessage: 'Как Вас зовут?',
    },
    {
      rule: 'minLength',
      value: 2,
      errorMessage: 'Имя слишком короткое',
    }
  ])
  .addField('#phone', [
    {
      rule: 'required',
      errorMessage: 'Укажите телефон',
    },
    {
      validator: value => {
        const number = phone.inputmask.unmaskedvalue()
        return number.length === 10;
      },
      errorMessage: 'Некорректный телефон',
    }
  ]);

  validator.onSuccess((event) => {
    const form = event.currentTarget;

    fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      body: JSON.stringify({
        name: form.name.value,
        phone: form.phone.value,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const tel = form.phone.value;
        form.reset();
        alert(`Спасибо! В ближайшее время мы перезвоним Вам по указанному номеру телефона ${tel}. Номер Вашей заявки ${data.id}`);
      });
  });