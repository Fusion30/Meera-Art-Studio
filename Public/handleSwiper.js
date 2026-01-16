const swiper = new Swiper('.swiper-1', {
    slidesPerView: 1,
    speed: 1500,
    effect: "fade",
    fadeEffect: {
        crossFade: true
    },
    autoplay: {
        delay: 3000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
    },
    loop: true,
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    pagination: {
        el: ".swiper-pagination-1",
    },
});

const swiper2 = new Swiper('.swiper-2', {
    slidesPerView: 2,
    speed:200,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
    },
    loop: true,
    navigation: {
        nextEl: ".swiper-2 .swiper-button-next",
        prevEl: ".swiper-2 .swiper-button-prev",
    },
    pagination: {
        el: ".swiper-pagination-2",
    },
});