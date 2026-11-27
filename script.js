/**
 * MONOMODE // Theme Toggle, Dynamic Quiz & Interactions
 */
document.addEventListener('DOMContentLoaded', () => {

    // ================= 1. Переключатель темы (Dark / Light) =================
    const themeToggleBtn = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;

    const savedTheme = localStorage.getItem('monomode-theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    } else {
        htmlElement.setAttribute('data-theme', 'dark');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme') || 'dark';
            const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            htmlElement.setAttribute('data-theme', nextTheme);
            localStorage.setItem('monomode-theme', nextTheme);
        });
    }

    // ================= 2. Плавная прокрутка к якорям =================
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId !== '#') {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    
                    const navLinks = document.querySelector('.nav__links');
                    if (navLinks && navLinks.classList.contains('open')) {
                        navLinks.classList.remove('open');
                    }

                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // ================= 3. Модальное окно с интерактивным опросом =================
    const modal = document.getElementById('quizModal');
    const modalClose = document.getElementById('modalClose');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const closeSuccessBtn = document.getElementById('closeSuccessBtn');
    const progressBar = document.getElementById('progressBar');

    const steps = document.querySelectorAll('.quiz-step');
    let currentStep = 1;

    // Данные опроса
    const quizData = {
        goal: '',
        idea: '',
        channelType: 'Telegram',
        contact: ''
    };

    function updateStepView(stepNumber) {
        steps.forEach(step => step.classList.remove('active'));
        
        const activeStep = document.querySelector(`.quiz-step[data-step="${stepNumber}"]`);
        if (activeStep) {
            activeStep.classList.add('active');
        }

        // Обновление прогресс-бара
        if (progressBar) {
            if (stepNumber === 1) progressBar.style.width = '33.33%';
            else if (stepNumber === 2) progressBar.style.width = '66.66%';
            else if (stepNumber === 3) progressBar.style.width = '100%';
            else if (stepNumber === 'success') progressBar.style.width = '100%';
        }
    }

    function openModal() {
        if (!modal) return;
        currentStep = 1;
        updateStepView(1);
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    }

    openModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', closeModal);
    }

    // Закрытие при клике по фону
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Динамическая адаптация плейсхолдера для Шага 3 (Telegram / VK / WhatsApp)
    const channelRadios = document.querySelectorAll('input[name="contactType"]');
    const contactInput = document.getElementById('contactChannel');
    const contactFieldLabel = document.getElementById('contactFieldLabel');

    channelRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const val = radio.value;
            quizData.channelType = val;

            if (val === 'Telegram') {
                if (contactInput) contactInput.placeholder = '@username в Telegram';
                if (contactFieldLabel) contactFieldLabel.textContent = 'Укажите ваш контакт в Telegram:';
            } else if (val === 'ВКонтакте') {
                if (contactInput) contactInput.placeholder = 'Ссылка на профиль или id';
                if (contactFieldLabel) contactFieldLabel.textContent = 'Укажите ссылку на страницу ВКонтакте:';
            } else if (val === 'WhatsApp') {
                if (contactInput) contactInput.placeholder = '+7 (___) ___-__-__';
                if (contactFieldLabel) contactFieldLabel.textContent = 'Укажите номер телефона для WhatsApp:';
            }
        });
    });

    // Навигация внутри квиза
    const nextBtns = document.querySelectorAll('.next-step-btn');
    const prevBtns = document.querySelectorAll('.prev-step-btn');
    const submitBtn = document.getElementById('submitQuiz');

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep === 1) {
                const selectedGoal = document.querySelector('input[name="goal"]:checked');
                if (selectedGoal) {
                    quizData.goal = selectedGoal.value;
                }
                currentStep = 2;
                updateStepView(2);
            } else if (currentStep === 2) {
                const ideaInput = document.getElementById('projectIdea');
                quizData.idea = ideaInput ? ideaInput.value.trim() : '';
                currentStep = 3;
                updateStepView(3);
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep -= 1;
                updateStepView(currentStep);
            }
        });
    });

    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const contactVal = contactInput ? contactInput.value.trim() : '';

            if (!contactVal) {
                if (contactInput) {
                    contactInput.focus();
                    contactInput.style.borderColor = '#888';
                    setTimeout(() => {
                        contactInput.style.borderColor = '';
                    }, 2000);
                }
                return;
            }

            const consentCheckbox = document.getElementById('privacyConsent');
            if (consentCheckbox && !consentCheckbox.checked) {
                alert('Пожалуйста, подтвердите согласие на обработку персональных данных (152-ФЗ)');
                return;
            }

            const selectedChannel = document.querySelector('input[name="contactType"]:checked');
            quizData.channelType = selectedChannel ? selectedChannel.value : 'Telegram';
            quizData.contact = contactVal;

            // Заполняем скрытые поля для отправки в Netlify Forms / Email
            const hiddenGoal = document.getElementById('hiddenGoal');
            const hiddenIdea = document.getElementById('hiddenIdea');
            const hiddenChannel = document.getElementById('hiddenChannel');
            const hiddenContact = document.getElementById('hiddenContact');
            if (hiddenGoal) hiddenGoal.value = quizData.goal || '';
            if (hiddenIdea) hiddenIdea.value = quizData.idea || '';
            if (hiddenChannel) hiddenChannel.value = quizData.channelType || '';
            if (hiddenContact) hiddenContact.value = quizData.contact || '';

            // Логируем заявку в консоли и сохраняем локально
            console.log('✅ Новая заявка с сайта MONOMODE:', quizData);
            try {
                const existing = JSON.parse(localStorage.getItem('monomode-leads') || '[]');
                existing.push({ ...quizData, date: new Date().toISOString() });
                localStorage.setItem('monomode-leads', JSON.stringify(existing));
            } catch(err) {}

            // Отправляем заявку на почту monomode.agency@gmail.com через Web3Forms
            const payload = {
                access_key: '17910251-e6b0-4fd5-82e5-389dd2ccc7ec',
                subject: '🔥 Новая заявка на проект MONOMODE!',
                from_name: 'Сайт MONOMODE',
                'Цель обращения': quizData.goal || 'Не указано',
                'Описание идеи': quizData.idea || 'Не указано',
                'Способ связи': quizData.channelType || 'Telegram',
                'Контакт клиента': quizData.contact || ''
            };

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            }).then(res => res.json()).then(data => {
                console.log('✅ Письмо успешно отправлено на monomode.agency@gmail.com:', data);
            }).catch(err => {
                console.warn('⚠️ Ошибка отправки на почту:', err);
            });

            // Показываем экран успеха
            updateStepView('success');
        });
    }

    // ================= 4. Политика конфиденциальности (Модальное окно) =================
    const privacyModal = document.getElementById('privacyModal');
    const privacyClose = document.getElementById('privacyClose');
    const privacyAgreeBtn = document.getElementById('privacyAgreeBtn');
    const openPrivacyBtns = document.querySelectorAll('.open-privacy-btn');

    function openPrivacy() {
        if (!privacyModal) return;
        privacyModal.classList.add('active');
        privacyModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    }

    function closePrivacy() {
        if (!privacyModal) return;
        privacyModal.classList.remove('active');
        privacyModal.setAttribute('aria-hidden', 'true');
        // Не убираем modal-open если открыт квиз
        if (!modal || !modal.classList.contains('active')) {
            document.body.classList.remove('modal-open');
        }
    }

    openPrivacyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openPrivacy();
        });
    });

    if (privacyClose) privacyClose.addEventListener('click', closePrivacy);
    if (privacyAgreeBtn) privacyAgreeBtn.addEventListener('click', closePrivacy);

    if (privacyModal) {
        privacyModal.addEventListener('click', (e) => {
            if (e.target === privacyModal) closePrivacy();
        });
    }

    // ================= 5. Баннер согласия на Cookie =================
    const cookieBanner = document.getElementById('cookieBanner');
    const acceptCookiesBtn = document.getElementById('acceptCookiesBtn');

    if (cookieBanner && acceptCookiesBtn) {
        const cookiesAccepted = localStorage.getItem('monomode-cookies-accepted');
        if (!cookiesAccepted) {
            setTimeout(() => {
                cookieBanner.classList.add('active');
            }, 1000);
        }

        acceptCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('monomode-cookies-accepted', 'true');
            cookieBanner.classList.remove('active');
        });
    }

});
