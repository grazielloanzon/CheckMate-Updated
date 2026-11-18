/**
 * CheckMate - Login & Sign Up Script (index.html, signup.html)
 * NOTE: Demo only. Accounts live in localStorage and passwords are stored
 * as plain text. A real app needs a backend with hashed passwords.
 */

const CM_USERS_KEY = 'checkmate_users';
const CM_SESSION_KEY = 'checkmate_user';

const CM_DEFAULT_ACCOUNTS = [
    { id: 1, name: 'Juan Dela Cruz', firstName: 'Juan', surname: 'Dela Cruz', email: 'citizen@example.com', password: 'citizen123', role: 'Citizen', joined: '2026-01-10' },
    { id: 2, name: 'Maria Santos', firstName: 'Maria', surname: 'Santos', email: 'maria@example.com', password: 'maria123', role: 'Citizen', joined: '2026-03-22' },
    { id: 3, name: 'System Administrator', firstName: 'System', surname: 'Administrator', email: 'admin@checkmate.com', password: 'admin123', role: 'Admin', joined: '2026-01-01' }
];

function cmGetUsers() {
    try {
        return JSON.parse(localStorage.getItem(CM_USERS_KEY)) || [];
    } catch (err) {
        return [];
    }
}

function cmSaveUsers(users) {
    localStorage.setItem(CM_USERS_KEY, JSON.stringify(users));
}

function cmEnsureSeedUsers() {
    let users = cmGetUsers();

    if (users.length === 0) {
        users = CM_DEFAULT_ACCOUNTS.map(a => ({ ...a }));
    } else {
        // Older saved accounts had no password: give the default ones theirs
        users.forEach(u => {
            if (!u.password) {
                const d = CM_DEFAULT_ACCOUNTS.find(a => a.email === u.email);
                if (d) u.password = d.password;
            }
        });
    }

    cmSaveUsers(users);
}

function cmIsValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


/* ==========================================================================
   LOGIN
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    cmEnsureSeedUsers();

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const showPasswordBtn = document.getElementById('showPassword');
    const formMessage = document.getElementById('formMessage');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');

    // Toggle Password Visibility
    if (showPasswordBtn && passwordInput) {
        showPasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            showPasswordBtn.textContent = type === 'password' ? 'Show' : 'Hide';
        });
    }

    // Signup page: toggle password visibility icon
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const pw = document.getElementById('password');
            const confirm = document.getElementById('confirmPassword');
            const show = pw.type === 'password';

            pw.type = show ? 'text' : 'password';
            if (confirm) confirm.type = show ? 'text' : 'password';

            togglePassword.classList.toggle('bx-eye-slash', !show);
            togglePassword.classList.toggle('bx-eye', show);
        });
    }

    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        formMessage.textContent = '';
        emailError.textContent = '';
        passwordError.textContent = '';

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        let hasError = false;

        if (!email) {
            emailError.textContent = 'Email address is required.';
            hasError = true;
        } else if (!cmIsValidEmail(email)) {
            emailError.textContent = 'Please enter a valid email address.';
            hasError = true;
        }

        if (!password) {
            passwordError.textContent = 'Password is required.';
            hasError = true;
        }

        if (hasError) return;

        const user = cmGetUsers().find(u =>
            (u.email || '').toLowerCase() === email && u.password === password
        );

        if (!user) {
            formMessage.textContent = 'Incorrect email or password.';
            return;
        }

        sessionStorage.setItem(CM_SESSION_KEY, JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        }));

        window.location.href = user.role === 'Admin'
            ? 'admin.html#dashboard'
            : 'citizen.html#home';
    });
});


/* ==========================================================================
   SIGN UP  (called by onsubmit="signup(event)" in signup.html)
   ========================================================================== */
window.signup = function (e) {
    e.preventDefault();

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('username').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!firstName || !lastName) {
        alert('Please enter your first and last name.');
        return;
    }

    if (!cmIsValidEmail(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    if (password.length < 4) {
        alert('Password must be at least 4 characters.');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
    }

    const users = cmGetUsers();

    if (users.some(u => (u.email || '').toLowerCase() === email)) {
        alert('An account with this email already exists.');
        return;
    }

    const newId = users.length
        ? Math.max(...users.map(u => Number(u.id) || 0)) + 1
        : 1;

    users.push({
        id: newId,
        name: `${firstName} ${lastName}`,
        firstName,
        surname: lastName,
        email,
        password,
        role: 'Citizen',
        joined: new Date().toISOString().slice(0, 10)
    });

    cmSaveUsers(users);

    // Show a custom success popup instead of the browser alert.
    const successModal = document.getElementById('signupSuccessModal');

    if (successModal && window.bootstrap) {
        bootstrap.Modal.getOrCreateInstance(successModal).show();
    } else {
        // Fallback in case the Bootstrap modal is unavailable.
        window.location.href = 'index.html';
    }
};

/* ==========================================================================
   TERMS AND CONDITIONS POPUP
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const termsModal = document.getElementById('termsModal');
    const openTerms = document.getElementById('openTerms');
    const closeTerms = document.getElementById('closeTerms');
    const acceptTerms = document.getElementById('acceptTerms');
    const termsAgreement = document.getElementById('termsAgreement');

    if (!termsModal) return;

    // Open popup
    openTerms?.addEventListener('click', (e) => {
        e.preventDefault();
        termsModal.classList.add('show');
    });

    // Close popup
    closeTerms?.addEventListener('click', () => {
        termsModal.classList.remove('show');
    });

    // Agree to terms
    acceptTerms?.addEventListener('click', () => {
    if (termsAgreement) {
        termsAgreement.checked = true;
    }

    termsModal.classList.remove('show');
});

    // Close when clicking outside the popup
    termsModal.addEventListener('click', (e) => {
        if (e.target === termsModal) {
            termsModal.classList.remove('show');
        }
    });

    // Close using Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            termsModal.classList.remove('show');
        }
    });
});