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

    // ===== Config Comparison =====
    var compareConfigData = {
        'Start Basic': {
            category: 'Учёба и офис',
            price: 'от 35 000 ₽',
            cpu: 'Ryzen 5 5600G',
            gpu: 'Встроенная',
            ram: '16 ГБ DDR4',
            storage: 'SSD 500 ГБ'
        },
        'Game Starter': {
            category: 'Игры Full HD',
            price: 'от 72 000 ₽',
            cpu: 'Ryzen 5 5600',
            gpu: 'RTX 4060',
            ram: '16 ГБ DDR4',
            storage: 'SSD 1 ТБ'
        },
        'Game Pro': {
            category: 'Игры 1440p',
            price: 'от 125 000 ₽',
            cpu: 'Ryzen 5 7600',
            gpu: 'RTX 4070 Super',
            ram: '32 ГБ DDR5',
            storage: 'SSD 1 ТБ'
        },
        'Creator Studio': {
            category: 'Монтаж и дизайн',
            price: 'от 145 000 ₽',
            cpu: 'Core i7-14700F',
            gpu: 'RTX 4070',
            ram: '32 ГБ DDR5',
            storage: 'SSD 2 ТБ'
        },
        'Ultimate X': {
            category: 'Максимальная мощность',
            price: 'от 220 000 ₽',
            cpu: 'Ryzen 7 7800X3D',
            gpu: 'RTX 4080 Super',
            ram: '64 ГБ DDR5',
            storage: 'SSD 2 ТБ'
        },
        'Office Expert': {
            category: 'Работа и многозадачность',
            price: 'от 42 000 ₽',
            cpu: 'Core i5-12400',
            gpu: 'Intel UHD',
            ram: '16 ГБ DDR4',
            storage: 'SSD 1 ТБ'
        }
    };

    var compareState = {
        selected: [],
        maxSelect: 3
    };

    var compareBar = document.getElementById('compare-bar');
    var compareCount = document.getElementById('compare-count');
    var compareItems = document.getElementById('compare-items');
    var compareClear = document.getElementById('compare-clear');
    var compareOpen = document.getElementById('compare-open');
    var compareModal = document.getElementById('compare-modal');
    var compareTable = document.getElementById('compare-table');

    function updateCompareBar() {
        compareCount.textContent = compareState.selected.length;
        compareItems.innerHTML = '';

        compareState.selected.forEach(function (configName) {
            var item = document.createElement('span');
            item.className = 'config-compare-bar__item';
            item.innerHTML = configName + ' <button type="button" aria-label="Удалить ' + configName + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
            item.querySelector('button').addEventListener('click', function () {
                removeFromCompare(configName);
            });
            compareItems.appendChild(item);
        });

        var hasSelection = compareState.selected.length > 0;
        compareBar.hidden = !hasSelection;
        compareOpen.disabled = compareState.selected.length < 2;
    }

    function addToCompare(configName) {
        if (compareState.selected.includes(configName)) return;
        if (compareState.selected.length >= compareState.maxSelect) {
            alert('Можно сравнивать не более ' + compareState.maxSelect + ' конфигураций одновременно');
            return;
        }
        compareState.selected.push(configName);
        updateCompareBar();
        updateCheckboxes();
    }

    function removeFromCompare(configName) {
        compareState.selected = compareState.selected.filter(function (name) { return name !== configName; });
        updateCompareBar();
        updateCheckboxes();
    }

    function clearCompare() {
        compareState.selected = [];
        updateCompareBar();
        updateCheckboxes();
    }

    function updateCheckboxes() {
        document.querySelectorAll('.config-compare input[name="compare"]').forEach(function (checkbox) {
            checkbox.checked = compareState.selected.includes(checkbox.dataset.config);
            checkbox.disabled = !checkbox.checked && compareState.selected.length >= compareState.maxSelect;
        });
    }

    function openCompareModal() {
        if (compareState.selected.length < 2) return;
        renderCompareTable();
        compareModal.hidden = false;
        document.body.style.overflow = 'hidden';
        var firstFocusable = compareModal.querySelector('button, a');
        if (firstFocusable) firstFocusable.focus();
    }

    function closeCompareModal() {
        compareModal.hidden = true;
        document.body.style.overflow = '';
    }

    function renderCompareTable() {
        var configs = compareState.selected.map(function (name) { return compareConfigData[name]; });
        var headers = ['category', 'price', 'cpu', 'gpu', 'ram', 'storage'];
        var labels = {
            category: 'Категория',
            price: 'Цена',
            cpu: 'Процессор',
            gpu: 'Видеокарта',
            ram: 'ОЗУ',
            storage: 'Накопитель'
        };

        var thead = compareTable.querySelector('thead tr');
        thead.innerHTML = '<th class="compare-table__param">Параметр</th>';
        configs.forEach(function (cfg) {
            var th = document.createElement('th');
            th.className = 'compare-table__name';
            th.textContent = getConfigName(cfg);
            thead.appendChild(th);
        });

        var tbody = compareTable.querySelector('tbody');
        tbody.innerHTML = '';

        headers.forEach(function (key) {
            var tr = document.createElement('tr');
            var th = document.createElement('th');
            th.className = 'compare-table__param';
            th.textContent = labels[key];
            tr.appendChild(th);

            var values = configs.map(function (cfg) { return cfg[key]; });
            var uniqueValues = new Set(values);

            configs.forEach(function (cfg) {
                var td = document.createElement('td');
                td.textContent = cfg[key];
                if (key !== 'category' && key !== 'price' && uniqueValues.size > 1) {
                    td.classList.add('compare-table__value--diff');
                }
                if (key === 'price') td.classList.add('compare-table__price');
                if (key === 'category') td.classList.add('compare-table__category');
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });
    }

    function getConfigName(cfg) {
        for (var name in compareConfigData) {
            if (compareConfigData[name] === cfg) return name;
        }
        return '';
    }

    // Event listeners for compare checkboxes
    document.querySelectorAll('.config-compare input[name="compare"]').forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                addToCompare(this.dataset.config);
            } else {
                removeFromCompare(this.dataset.config);
            }
        });
    });

    compareClear.addEventListener('click', clearCompare);
    compareOpen.addEventListener('click', openCompareModal);

    // Modal close handlers
    compareModal.querySelectorAll('[data-modal-close]').forEach(function (el) {
        el.addEventListener('click', closeCompareModal);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !compareModal.hidden) {
            closeCompareModal();
        }
    });

    // Initialize checkboxes state
    updateCheckboxes();
})();