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

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeCarousel();
    initializeModal();
    initializeForm();
    initializeNavigation();
    initializeScrollEffects();
});

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
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
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
        
        // Send to Discord webhook
        await sendToDiscordWebhook(applicationData);
        
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
                name: "🌟 Status",
                value: "✅ Aguardando Análise",
                inline: true
            }
        ]
    };
    
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
