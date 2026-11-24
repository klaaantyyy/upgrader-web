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
})();