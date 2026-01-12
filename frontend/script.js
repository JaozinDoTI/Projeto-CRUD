// --- ESTADO E CONFIGURAÇÃO ---
const API_URL = "http://127.0.0.1:8000"; // Correção feita aqui

const state = {
    // users: removido pois agora usamos o backend
    currentUser: null,
    loginAttempts: 0,
    lockedUntil: null,
    captchaResult: 0
};

// --- FUNÇÕES DE SEGURANÇA ---

function sanitizeInput(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function checkLockout() {
    if (state.lockedUntil && new Date() < new Date(state.lockedUntil)) {
        const remaining = Math.ceil((new Date(state.lockedUntil) - new Date()) / 1000);
        showError('login-error', `Muitas tentativas. Tente em ${remaining}s.`);
        return true; 
    }
    if (state.lockedUntil && new Date() > new Date(state.lockedUntil)) {
        state.lockedUntil = null; 
        state.loginAttempts = 0;
    }
    return false; 
}

function registerFailedAttempt() {
    state.loginAttempts++;
    if (state.loginAttempts >= 3) {
        state.lockedUntil = new Date(new Date().getTime() + 30000); 
        showError('login-error', 'Sistema bloqueado temporariamente (30s).');
    }
}

function generateCaptcha() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    state.captchaResult = a + b;
    const captchaElement = document.getElementById('captcha-question');
    if (captchaElement) {
        captchaElement.textContent = `${a} + ${b} = ?`;
    }
    const captchaInput = document.getElementById('captcha-input');
    if (captchaInput) {
        captchaInput.value = '';
    }
}

// --- NAVEGAÇÃO ENTRE TELAS ---
function showScreen(screenId) {
    document.querySelectorAll('.card').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('active');
    });
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
    }
    
    document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
}

// --- UTILITÁRIOS ---
function showError(elementId, msg) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = msg;
}

// --- LÓGICA DE REGISTRO (CONECTADA AO PYTHON) ---
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-pass').value;

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Conta criada com sucesso!");
                showScreen('login-screen');
            } else {
                showError('reg-error', data.detail || 'Erro ao registrar.');
            }
        } catch (error) {
            console.error(error);
            showError('reg-error', 'Erro de conexão com o servidor.');
        }
    });
}

// --- LÓGICA DE LOGIN (CONECTADA AO PYTHON) ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (checkLockout()) return; 

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-pass').value;
        const captchaInput = parseInt(document.getElementById('captcha-input').value);

        // Validar Captcha no Front
        if (captchaInput !== state.captchaResult) {
            showError('login-error', 'Captcha incorreto.');
            generateCaptcha();
            return;
        }

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Sucesso
                state.loginAttempts = 0;
                document.getElementById('user-display-name').textContent = data.user_name;
                showScreen('dashboard-screen');
            } else {
                registerFailedAttempt();
                showError('login-error', 'E-mail ou senha incorretos.');
                generateCaptcha();
            }
        } catch (error) {
            console.error(error);
            showError('login-error', 'Erro ao conectar com o servidor.');
        }
    });
}

// Listeners de navegação
const linkRegister = document.getElementById('link-register');
if (linkRegister) linkRegister.addEventListener('click', () => showScreen('register-screen'));

const linkLogin = document.getElementById('link-login');
if (linkLogin) linkLogin.addEventListener('click', () => showScreen('login-screen'));

const btnLogout = document.getElementById('btn-logout');
if (btnLogout) btnLogout.addEventListener('click', () => {
    state.currentUser = null;
    generateCaptcha();
    showScreen('login-screen');
});

// Inicialização
window.onload = function() {
    generateCaptcha();
};