// Main JavaScript file for Detroit Police Training Division website

// DOM Elements
const modal = document.getElementById('applicationModal');
const enrollBtn = document.getElementById('enrollBtn');
const ctaBtn = document.getElementById('ctaBtn');
const instructorApplyBtn = document.getElementById('instructorApplyBtn');
const closeBtn = document.querySelector('.close');
const applicationForm = document.getElementById('applicationForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const progressFill = document.querySelector('.progress-fill');
const progressText = document.querySelector('.progress-text');

// Carousel elements
const carouselSlides = document.querySelectorAll('.carousel-slide');
const indicators = document.querySelectorAll('.indicator');
const prevCarouselBtn = document.querySelector('.prev-btn');
const nextCarouselBtn = document.querySelector('.next-btn');

// Form state
let currentSection = 1;
const totalSections = 8;
let currentSlide = 0;
const totalSlides = carouselSlides.length;

// Anti-cheat system
let pasteAttempts = 0;
let copyAttempts = 0;
let suspiciousActivity = [];
let fullscreenLockActive = false;
let testInProgress = false;

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeCarousel();
    initializeModal();
    initializeForm();
    initializeNavigation();
    initializeScrollEffects();
    initializeAntiCheat();
    initializeFullscreenLock();
});

// Fullscreen lock system
function initializeFullscreenLock() {
    // Detect beforeunload (user trying to leave page)
    window.addEventListener('beforeunload', function(e) {
        if (testInProgress) {
            logSuspiciousActivity('Tentativa de sair da página', 'page_exit');
            const message = 'ATENÇÃO: Você está no meio de um teste! Sair da página invalidará seu formulário.';
            e.preventDefault();
            e.returnValue = message;
            return message;
        }
    });

    // Detect page focus/blur (clicking outside)
    window.addEventListener('blur', function() {
        if (testInProgress) {
            logSuspiciousActivity('Foco perdido - clicou fora da página', 'focus_lost');
            showAntiCheatWarning('Não clique fora da página durante o teste!');
        }
    });

    // Detect fullscreen changes
    document.addEventListener('fullscreenchange', function() {
        if (testInProgress && fullscreenLockActive) {
            if (!document.fullscreenElement) {
                logSuspiciousActivity('Saiu do modo fullscreen', 'fullscreen_exit');
                forceFullscreen();
                showAntiCheatWarning('Modo fullscreen é obrigatório durante o teste!');
            }
        }
    });

    // Detect ESC key (commonly used to exit fullscreen)
    document.addEventListener('keydown', function(e) {
        if (testInProgress && e.key === 'Escape') {
            e.preventDefault();
            logSuspiciousActivity('Tentativa de pressionar ESC', 'escape_key');
            showAntiCheatWarning('Tecla ESC é bloqueada durante o teste!');
            return false;
        }
        
        // Block Alt+Tab
        if (testInProgress && e.altKey && e.key === 'Tab') {
            e.preventDefault();
            logSuspiciousActivity('Tentativa de Alt+Tab', 'alt_tab');
            showAntiCheatWarning('Alt+Tab é bloqueado durante o teste!');
            return false;
        }
        
        // Block Windows key
        if (testInProgress && (e.key === 'Meta' || e.key === 'OS')) {
            e.preventDefault();
            logSuspiciousActivity('Tentativa de usar tecla Windows', 'windows_key');
            showAntiCheatWarning('Tecla Windows é bloqueada durante o teste!');
            return false;
        }
    });

    // Force focus back to page if lost
    setInterval(function() {
        if (testInProgress && !document.hasFocus()) {
            window.focus();
        }
    }, 1000);
}

function forceFullscreen() {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
            console.warn('Erro ao entrar em fullscreen:', err);
        });
    } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
    }
}

function startTestMode() {
    testInProgress = true;
    fullscreenLockActive = true;
    
    // Force fullscreen
    forceFullscreen();
    
    // Show test mode warning
    showTestModeWarning();
    
    // Disable context menu more aggressively
    document.addEventListener('contextmenu', preventDefaultAction, true);
    document.addEventListener('selectstart', preventDefaultAction, true);
    document.addEventListener('dragstart', preventDefaultAction, true);
}

function endTestMode() {
    testInProgress = false;
    fullscreenLockActive = false;
    
    // Exit fullscreen
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
    
    // Re-enable normal interactions
    document.removeEventListener('contextmenu', preventDefaultAction, true);
    document.removeEventListener('selectstart', preventDefaultAction, true);
    document.removeEventListener('dragstart', preventDefaultAction, true);
}

function preventDefaultAction(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
}

function showTestModeWarning() {
    const warning = document.createElement('div');
    warning.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        padding: 15px;
        z-index: 10000;
        font-weight: bold;
        text-align: center;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        border-bottom: 3px solid #b91c1c;
    `;
    warning.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="margin-right: 10px;"></i>
        <strong>MODO TESTE ATIVO:</strong> Tela cheia obrigatória • Não saia da página • Todas as ações são monitoradas
        <i class="fas fa-shield-alt" style="margin-left: 10px;"></i>
    `;
    
    document.body.appendChild(warning);
    
    setTimeout(() => {
        warning.remove();
    }, 5000);
}

// Anti-cheat initialization
function initializeAntiCheat() {
    // Disable paste events in form fields
    const formInputs = document.querySelectorAll('.no-paste');
    formInputs.forEach(input => {
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            pasteAttempts++;
            logSuspiciousActivity('Tentativa de colar texto', input.name || input.id);
            showAntiCheatWarning('Colar texto não é permitido durante o teste!');
            return false;
        });

        input.addEventListener('copy', function(e) {
            e.preventDefault();
            copyAttempts++;
            logSuspiciousActivity('Tentativa de copiar texto', input.name || input.id);
            showAntiCheatWarning('Copiar texto não é permitido durante o teste!');
            return false;
        });

        input.addEventListener('cut', function(e) {
            e.preventDefault();
            logSuspiciousActivity('Tentativa de recortar texto', input.name || input.id);
            showAntiCheatWarning('Recortar texto não é permitido durante o teste!');
            return false;
        });
    });

    // Disable additional keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Disable Ctrl+A (select all) outside form fields
        if (e.ctrlKey && e.key === 'a' && !isFormField(e.target)) {
            e.preventDefault();
            logSuspiciousActivity('Tentativa de selecionar tudo', 'keyboard');
            return false;
        }

        // Disable F-keys
        if (e.key.startsWith('F') && e.key.length > 1) {
            e.preventDefault();
            logSuspiciousActivity('Tentativa de usar tecla F', e.key);
            return false;
        }
    });

    // Detect tab switching
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && modal.style.display === 'block') {
            logSuspiciousActivity('Mudança de aba durante o teste', 'tab_switch');
            showAntiCheatWarning('Não mude de aba durante o teste!');
        }
    });
}

function isFormField(element) {
    return element.tagName === 'INPUT' || element.tagName === 'TEXTAREA';
}

function logSuspiciousActivity(activity, details) {
    const timestamp = new Date().toISOString();
    suspiciousActivity.push({
        timestamp,
        activity,
        details,
        section: currentSection
    });
    console.warn(`Atividade suspeita detectada: ${activity} - ${details}`);
}

function showAntiCheatWarning(message) {
    // Create warning overlay
    const warning = document.createElement('div');
    warning.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        padding: 20px 30px;
        border-radius: 15px;
        z-index: 9999;
        font-weight: bold;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        animation: shake 0.5s ease-in-out;
    `;
    warning.innerHTML = `
        <i class="fas fa-exclamation-triangle" style="margin-right: 10px; font-size: 1.2rem;"></i>
        ${message}
    `;
    
    document.body.appendChild(warning);
    
    setTimeout(() => {
        warning.remove();
    }, 3000);
}

// Navigation functionality
function initializeNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize scroll-triggered animations
function initializeScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Add fade-in animations to elements
    const animatedElements = document.querySelectorAll('.about-card, .program-card');
    animatedElements.forEach(element => {
        element.classList.add('fade-in');
        observer.observe(element);
    });
}

// Initialize general animations
function initializeAnimations() {
    // Add animation delays to about cards
    const aboutCards = document.querySelectorAll('.about-card');
    aboutCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
    });
    
    // Add animation delays to program cards
    const programCards = document.querySelectorAll('.program-card');
    programCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.15}s`;
    });
}

// Carousel functionality
function initializeCarousel() {
    // Auto-play carousel
    setInterval(() => {
        nextSlide();
    }, 5000);
    
    // Navigation buttons
    nextCarouselBtn.addEventListener('click', nextSlide);
    prevCarouselBtn.addEventListener('click', prevSlide);
    
    // Indicator clicks
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            goToSlide(index);
        });
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

function updateCarousel() {
    // Update slides
    carouselSlides.forEach((slide, index) => {
        slide.classList.remove('active');
        if (index === currentSlide) {
            slide.classList.add('active');
        }
    });
    
    // Update indicators
    indicators.forEach((indicator, index) => {
        indicator.classList.remove('active');
        if (index === currentSlide) {
            indicator.classList.add('active');
        }
    });
}

// Modal functionality
function initializeModal() {
    // Open modal
    enrollBtn.addEventListener('click', openModal);
    ctaBtn.addEventListener('click', openModal);
    
    // Open modal for instructor application
    if (instructorApplyBtn) {
        instructorApplyBtn.addEventListener('click', openModal);
    }
    
    // Close modal
    closeBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Prevent modal close when clicking inside modal content
    document.querySelector('.modal-content').addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

function openModal() {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    resetForm();
    
    // Start test mode with fullscreen lock
    startTestMode();
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // End test mode
    endTestMode();
}

// Form functionality
function initializeForm() {
    // Navigation buttons
    nextBtn.addEventListener('click', nextFormSection);
    prevBtn.addEventListener('click', prevFormSection);
    
    // Form submission
    applicationForm.addEventListener('submit', handleFormSubmit);
    
    // Real-time validation
    const inputs = applicationForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', validateField);
        input.addEventListener('blur', validateField);
    });
    
    // Initialize first section
    updateFormSection();
}

function nextFormSection() {
    if (validateCurrentSection()) {
        if (currentSection < totalSections) {
            currentSection++;
            updateFormSection();
        }
    }
}

function prevFormSection() {
    if (currentSection > 1) {
        currentSection--;
        updateFormSection();
    }
}

function updateFormSection() {
    // Hide all sections
    const sections = document.querySelectorAll('.form-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show current section
    const currentSectionElement = document.querySelector(`[data-section="${currentSection}"]`);
    if (currentSectionElement) {
        currentSectionElement.classList.add('active');
    }
    
    // Update navigation buttons
    prevBtn.style.display = currentSection === 1 ? 'none' : 'inline-block';
    
    if (currentSection === totalSections) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    }
    
    // Update progress
    updateProgress();
}

function updateProgress() {
    const progress = (currentSection / totalSections) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${Math.round(progress)}% Completo`;
}

function validateCurrentSection() {
    const currentSectionElement = document.querySelector(`[data-section="${currentSection}"]`);
    const requiredFields = currentSectionElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    let isValid = true;
    
    // Remove existing error styling
    field.classList.remove('error');
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        showFieldError(field, 'This field is required');
    }
    
    // Specific validations
    if (value) {
        switch (field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    showFieldError(field, 'Please enter a valid email address');
                }
                break;
                
            case 'number':
                if (isNaN(value) || value < 0) {
                    isValid = false;
                    showFieldError(field, 'Please enter a valid number');
                }
                break;
        }
        
        // Text length validation for textareas
        if (field.tagName === 'TEXTAREA' && value.length < 10) {
            isValid = false;
            showFieldError(field, 'Please provide a more detailed response (at least 10 characters)');
        }
    }
    
    if (isValid) {
        clearFieldError(field);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = '#ef4444';
    errorElement.style.fontSize = '0.875rem';
    errorElement.style.marginTop = '5px';
    
    field.parentNode.appendChild(errorElement);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateCurrentSection()) {
        return;
    }
    
    // Show loading state
    submitBtn.innerHTML = '<span class="loading"></span> Enviando...';
    submitBtn.disabled = true;
    
    try {
        // Collect form data
        const formData = new FormData(applicationForm);
        const applicationData = {};
        
        for (let [key, value] of formData.entries()) {
            applicationData[key] = value;
        }
        
        // Add security data
        const submissionData = {
            ...applicationData,
            security: {
                pasteAttempts,
                copyAttempts,
                suspiciousActivity,
                completionIntegrity: suspiciousActivity.length === 0 ? 'CLEAN' : 'SUSPICIOUS'
            }
        };
        
        console.log('Application submitted:', submissionData);
        
        // Send to Discord webhook
        await sendToDiscordWebhook(submissionData);
        
        // Show success message
        showSuccessMessage();
        
        // Reset form
        setTimeout(() => {
            closeModal();
            resetForm();
        }, 3000);
        
    } catch (error) {
        console.error('Erro ao enviar formulário:', error);
        
        // Show error message
        showErrorMessage();
        
        // Reset button
        submitBtn.innerHTML = 'Enviar Formulário';
        submitBtn.disabled = false;
    }
}

async function sendToDiscordWebhook(data) {
    const webhookUrl = 'https://discord.com/api/webhooks/1406684833253691534/G46StuWH5Ut6c-z4RKebJ-QWgOEbrdG22rhPbsUG5kEIbltslroFFb2IkcMCzpKi0fBI';
    
    const currentDate = new Date().toLocaleString('pt-BR');
    
    // Create security status
    const securityStatus = data.security.completionIntegrity === 'CLEAN' ? 
        '✅ Limpo' : 
        `⚠️ Suspeito (${data.security.pasteAttempts + data.security.copyAttempts} tentativas)`;
    
    const embed = {
        title: "🚔 Nova Inscrição T.R.D - Training Recruit Division",
        description: "**Formulário de Recrutamento Recebido**\n\nUm novo candidato se inscreveu para o processo de recrutamento da T.R.D.",
        color: 12377626, // Cor verde #BBDE1A convertida para decimal
        timestamp: new Date().toISOString(),
        footer: {
            text: "T.R.D - Espinha Dorsal da Corporação",
            icon_url: "https://cdn.discordapp.com/emojis/1234567890/shield.png"
        },
        thumbnail: {
            url: "https://images.unsplash.com/photo-1591506670460-5704776d4780?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
        },
        fields: [
            {
                name: "👤 Informações Pessoais",
                value: `**QRA:** ${data.qra}\n**Disponibilidade:** ${data.availability}`,
                inline: false
            },
            {
                name: "📻 Comunicação por Rádio",
                value: `**Ação em Prioridade/QRX:** ${data.radio_priority}`,
                inline: false
            },
            {
                name: "🚗 Abordagem Veicular",
                value: `**Função P2:** ${data.p2_function}`,
                inline: false
            },
            {
                name: "📸 Procedimentos de Prisão",
                value: `**Itens a retirar na foto:** ${data.photo_items}\n**Pena máxima (meses):** ${data.max_sentence}`,
                inline: false
            },
            {
                name: "📋 Procedimentos & Protocolos",
                value: `**Procedimento pós-QRU:** ${data.qru_procedure}\n**Ação teste positivo:** ${data.positive_test}`,
                inline: false
            },
            {
                name: "💬 Protocolos de Comunicação",
                value: `**Uso do /cp:** ${data.cp_usage}\n**Formato QTX:** ${data.qtx_format}`,
                inline: false
            },
            {
                name: "⚖️ Procedimentos Legais",
                value: `**Revista de rotina:** ${data.routine_search}\n**Sem passaporte:** ${data.no_passport}`,
                inline: false
            },
            {
                name: "💡 Sugestões de Melhoria",
                value: `**Mudanças no recrutamento:** ${data.change_recruitment.substring(0, 200)}${data.change_recruitment.length > 200 ? '...' : ''}\n**Melhoria dos cursos:** ${data.improve_courses.substring(0, 200)}${data.improve_courses.length > 200 ? '...' : ''}\n**Recrutamento perfeito:** ${data.perfect_recruitment.substring(0, 200)}${data.perfect_recruitment.length > 200 ? '...' : ''}`,
                inline: false
            },
            {
                name: "📅 Data de Envio",
                value: currentDate,
                inline: true
            },
            {
                name: "🛡️ Status de Segurança",
                value: securityStatus,
                inline: true
            },
            {
                name: "🌟 Status",
                value: "✅ Aguardando Análise",
                inline: true
            }
        ]
    };
    
    // Add suspicious activity details if any
    if (data.security.suspiciousActivity.length > 0) {
        embed.fields.push({
            name: "⚠️ Atividades Suspeitas Detectadas",
            value: data.security.suspiciousActivity.slice(0, 3).map(activity => 
                `• ${activity.activity} (Seção ${activity.section})`
            ).join('\n') + (data.security.suspiciousActivity.length > 3 ? '\n• ...' : ''),
            inline: false
        });
    }
    
    const payload = {
        username: "T.R.D Recruitment System",
        avatar_url: "https://images.unsplash.com/photo-1591506670460-5704776d4780?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
        embeds: [embed]
    };
    
    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
    }
    
    return response;
}

function showSuccessMessage() {
    const modalContent = document.querySelector('.modal-content');
    modalContent.innerHTML = `
        <div class="success-message" style="text-align: center; padding: 60px 40px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #BBDE1A 0%, #9BC215 100%); 
                        border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                        margin: 0 auto 30px; animation: pulse 2s infinite;">
                <i class="fas fa-check" style="font-size: 2rem; color: white;"></i>
            </div>
            <h2 style="color: #BBDE1A; margin-bottom: 20px; font-family: 'Orbitron', monospace;">
                Formulário Enviado com Sucesso!
            </h2>
            <p style="color: #64748b; font-size: 1.1rem; line-height: 1.6;">
                Obrigado pelo seu interesse em ingressar na T.R.D - Training Recruit Division. 
                Recebemos sua inscrição e ela será analisada cuidadosamente pela nossa equipe. 
                Aguarde contato em breve para os próximos passos do processo.
            </p>
            <div style="margin-top: 30px; padding: 20px; background: #f0fdf4; border-radius: 12px; border-left: 4px solid #BBDE1A;">
                <p style="color: #101210; font-weight: 600; margin: 0;">
                    <i class="fas fa-info-circle" style="margin-right: 10px;"></i>
                    Próximos Passos: Sua inscrição foi enviada para a equipe da T.R.D e será avaliada conforme nossos critérios de excelência.
                </p>
            </div>
        </div>
    `;
}

function showErrorMessage() {
    const modalContent = document.querySelector('.modal-content');
    modalContent.innerHTML = `
        <div class="error-message" style="text-align: center; padding: 60px 40px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); 
                        border-radius: 50%; display: flex; align-items: center; justify-content: center; 
                        margin: 0 auto 30px; animation: pulse 2s infinite;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: white;"></i>
            </div>
            <h2 style="color: #ef4444; margin-bottom: 20px; font-family: 'Orbitron', monospace;">
                Erro no Envio
            </h2>
            <p style="color: #64748b; font-size: 1.1rem; line-height: 1.6;">
                Ocorreu um erro ao enviar seu formulário. Por favor, verifique sua conexão com a internet 
                e tente novamente. Se o problema persistir, entre em contato com a equipe da T.R.D.
            </p>
            <div style="margin-top: 30px;">
                <button onclick="location.reload()" class="btn-primary" style="padding: 15px 30px; border-radius: 50px; font-weight: 700; cursor: pointer; border: none; text-transform: uppercase; letter-spacing: 1px;">
                    Tentar Novamente
                </button>
            </div>
        </div>
    `;
}

function resetForm() {
    currentSection = 1;
    applicationForm.reset();
    
    // Clear all error messages
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
    
    // Remove error styling
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(field => field.classList.remove('error'));
    
    // Reset submit button
    submitBtn.innerHTML = 'Enviar Formulário';
    submitBtn.disabled = false;
    
    // Reset anti-cheat counters
    pasteAttempts = 0;
    copyAttempts = 0;
    suspiciousActivity = [];
    
    // Reset test mode variables
    testInProgress = false;
    fullscreenLockActive = false;
    
    // Reset modal content if it was changed
    if (document.querySelector('.success-message')) {
        location.reload(); // Simple way to reset the modal content
    }
    
    updateFormSection();
}

// Additional utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add loading animation to buttons on click
document.addEventListener('click', (e) => {
    if (e.target.matches('.btn-primary, .enroll-btn, .cta-button')) {
        e.target.style.transform = 'scale(0.98)';
        setTimeout(() => {
            e.target.style.transform = '';
        }, 150);
    }
});

// Keyboard accessibility
document.addEventListener('keydown', (e) => {
    // Close modal with Escape key
    if (e.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
    }
    
    // Navigate form with Arrow keys
    if (modal.style.display === 'block') {
        if (e.key === 'ArrowRight' && currentSection < totalSections) {
            nextFormSection();
        } else if (e.key === 'ArrowLeft' && currentSection > 1) {
            prevFormSection();
        }
    }
});

// Smooth animations for page elements
function animateOnScroll() {
    const elements = document.querySelectorAll('.fade-in, .slide-left, .slide-right');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('visible');
        }
    });
}

window.addEventListener('scroll', debounce(animateOnScroll, 50));

// Add CSS error styles dynamically
const style = document.createElement('style');
style.textContent = `
    .error {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
    
    .success-message {
        animation: successSlideIn 0.5s ease;
    }
    
    @keyframes successSlideIn {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Performance optimization: Preload images
function preloadImages() {
    const imageUrls = [
        'https://images.unsplash.com/photo-1591506670460-5704776d4780?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582125451463-3c7b7de846bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ];
    
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Initialize image preloading
preloadImages();

console.log('T.R.D - Training Recruit Division website loaded successfully!');
console.warn('Sistema anti-cola ativo. Tentativas de trapacear serão registradas e reportadas.');
