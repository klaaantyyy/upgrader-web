(function () {
    'use strict';

    var burger = document.getElementById('burger');
    var navigation = document.getElementById('navigation');

    function setMenu(open) {
        navigation.classList.toggle('active', open);
        burger.classList.toggle('active', open);
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    }

    burger.addEventListener('click', function () {
        setMenu(!navigation.classList.contains('active'));
    });

    navigation.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () { setMenu(false); });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navigation.classList.contains('active')) {
            setMenu(false);
            burger.focus();
        }
    });

    document.addEventListener('click', function (e) {
        if (navigation.classList.contains('active') && !e.target.closest('.header')) {
            setMenu(false);
        }
    });

    var spyLinks = Array.prototype.slice.call(navigation.querySelectorAll('a'));
    var spySections = spyLinks
        .map(function (link) { return document.querySelector(link.getAttribute('href')); })
        .filter(Boolean);

    var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) { return; }
            spyLinks.forEach(function (l) {
                l.classList.remove('active');
                l.removeAttribute('aria-current');
            });
            var current = spyLinks.find(function (l) {
                return l.getAttribute('href') === '#' + entry.target.id;
            });
            if (current) {
                current.classList.add('active');
                current.setAttribute('aria-current', 'true');
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    spySections.forEach(function (s) { spy.observe(s); });

    var form = document.getElementById('lead-form');
    var typeSelect = document.getElementById('type');
    var configInput = document.getElementById('config-input');
    var formSelected = document.getElementById('form-selected');
    var configName = document.getElementById('config-name');

    document.querySelectorAll('[data-config]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            typeSelect.value = btn.dataset.type || '';
            configInput.value = btn.dataset.config;
            configName.textContent = btn.dataset.config;
            formSelected.hidden = false;
        });
    });

    document.getElementById('config-reset').addEventListener('click', function () {
        configInput.value = '';
        formSelected.hidden = true;
    });

    var successBlock = document.getElementById('form-success');

    var errorMessages = {
        name: 'Укажите имя — минимум 2 символа.',
        contact: 'Укажите корректный телефон или email.',
        type: 'Выберите тип услуги из списка.'
    };

    form.querySelectorAll('input[name], select[name]').forEach(function (field) {
        field.addEventListener('invalid', function () {
            field.setCustomValidity(errorMessages[field.name] || 'Пожалуйста, заполните это поле.');
        });
        field.addEventListener('input', function () { field.setCustomValidity(''); });
        field.addEventListener('change', function () { field.setCustomValidity(''); });
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Демо-режим: данные никуда не уходят.
        // Подключение реальной отправки (пример):
        // fetch('/api/lead', { method: 'POST', body: new FormData(form) })
        //     .then(function () { /* показать успех */ })
        //     .catch(function () { /* показать ошибку */ });
        form.hidden = true;
        successBlock.hidden = false;
        successBlock.focus();
    });

    document.getElementById('form-again').addEventListener('click', function () {
        form.reset();
        configInput.value = '';
        formSelected.hidden = true;
        successBlock.hidden = true;
        form.hidden = false;
        var first = form.querySelector('input[name="name"]');
        if (first) { first.focus(); }
    });

    // ===== Config Slider =====
    var configSliders = document.querySelectorAll('[data-slider]');
    configSliders.forEach(function (slider) {
        var track = slider.querySelector('[data-slider-track]');
        var cards = track.querySelectorAll('.config-card');
        var prevBtn = slider.querySelector('[data-slider-prev]');
        var nextBtn = slider.querySelector('[data-slider-next]');
        var dotsContainer = slider.querySelector('[data-slider-dots]');

        var cardCount = cards.length;
        var currentIndex = 0;
        var cardsPerView = getCardsPerView();
        var maxIndex = Math.max(0, cardCount - cardsPerView);
        var isDragging = false;
        var startX = 0;
        var currentTranslate = 0;
        var startTranslate = 0;
        var animationId = null;

        // Create dots
        function createDots() {
            dotsContainer.innerHTML = '';
            var dotCount = maxIndex + 1;
            for (var i = 0; i < dotCount; i++) {
                var dot = document.createElement('button');
                dot.className = 'config-slider__dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('type', 'button');
                dot.setAttribute('aria-label', 'Конфигурация ' + (i + 1));
                dot.addEventListener('click', function (e) {
                    goToSlide(parseInt(e.target.dataset.index, 10));
                });
                dot.dataset.index = i;
                dotsContainer.appendChild(dot);
            }
        }

        function getCardsPerView() {
            var width = slider.offsetWidth;
            if (width >= 1050) return 3;
            if (width >= 640) return 2;
            return 1;
        }

        function getCardWidth() {
            var card = cards[0];
            if (!card) return 0;
            var style = getComputedStyle(card);
            var gap = 18; // CSS gap
            return card.offsetWidth + gap;
        }

        function updateSlider(animate) {
            cardsPerView = getCardsPerView();
            maxIndex = Math.max(0, cardCount - cardsPerView);
            if (currentIndex > maxIndex) currentIndex = maxIndex;

            var cardWidth = getCardWidth();
            currentTranslate = -currentIndex * cardWidth;

            if (animate !== false) {
                track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            } else {
                track.style.transition = 'none';
            }
            track.style.transform = 'translateX(' + currentTranslate + 'px)';

            updateButtons();
            updateDots();
        }

        function updateButtons() {
            if (prevBtn) prevBtn.disabled = currentIndex === 0;
            if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
        }

        function updateDots() {
            var dots = dotsContainer.querySelectorAll('.config-slider__dot');
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === currentIndex);
            });
        }

        function goToSlide(index) {
            if (index < 0) index = 0;
            if (index > maxIndex) index = maxIndex;
            currentIndex = index;
            updateSlider();
        }

        function nextSlide() {
            goToSlide(currentIndex + 1);
        }

        function prevSlide() {
            goToSlide(currentIndex - 1);
        }

        // Touch/Swipe support
        function onDragStart(e) {
            isDragging = true;
            startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            startTranslate = currentTranslate;
            track.classList.add('dragging');
            track.style.transition = 'none';
            cancelAnimationFrame(animationId);
        }

        function onDragMove(e) {
            if (!isDragging) return;
            var clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            var diff = clientX - startX;
            currentTranslate = startTranslate + diff;
            track.style.transform = 'translateX(' + currentTranslate + 'px)';
        }

        function onDragEnd() {
            if (!isDragging) return;
            isDragging = false;
            track.classList.remove('dragging');

            var cardWidth = getCardWidth();
            var moved = Math.round(-currentTranslate / cardWidth);
            var targetIndex = moved;

            // Snap to nearest
            if (Math.abs(currentTranslate - startTranslate) > cardWidth * 0.15) {
                if (currentTranslate < startTranslate) {
                    targetIndex = Math.min(currentIndex + 1, maxIndex);
                } else {
                    targetIndex = Math.max(currentIndex - 1, 0);
                }
            } else {
                targetIndex = currentIndex;
            }

            currentIndex = targetIndex;
            updateSlider();
        }

        // Event listeners
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);

        // Touch events
        track.addEventListener('touchstart', onDragStart, { passive: true });
        track.addEventListener('touchmove', onDragMove, { passive: true });
        track.addEventListener('touchend', onDragEnd);

        // Mouse events
        track.addEventListener('mousedown', onDragStart);
        window.addEventListener('mousemove', onDragMove);
        window.addEventListener('mouseup', onDragEnd);

        // Keyboard navigation
        track.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextSlide();
            }
        });

        // Resize handler
        var resizeTimeout;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function () {
                createDots();
                updateSlider(false);
            }, 150);
        });

        // IntersectionObserver to pause animations when not visible
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                track.style.transition = entry.isIntersecting ? 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
            });
        }, { rootMargin: '100px' });
        observer.observe(slider);

        // Initialize
        createDots();
        updateSlider(false);
    });
})();