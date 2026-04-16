window.loginSelectedRole = 'manager';

/* ── Tab switching ── */
function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
  
  if (tab === 'login' || tab === 'register') {
    document.getElementById('authTabs').style.display = 'flex';
    document.querySelectorAll('.auth-tab').forEach((t, i) => {
      t.classList.toggle('active', (tab === 'login' && i === 0) || (tab === 'register' && i === 1));
    });
    document.getElementById(tab + 'Section').classList.add('active');
  } else {
    document.getElementById('authTabs').style.display = 'none';
    document.getElementById(tab + 'Section').classList.add('active');
  }
}

/* ── Password visibility toggle ── */
function togglePass(id, iconId) {
  const inp = document.getElementById(id);
  const icon = document.getElementById(iconId);
  if (inp.type === 'password') { inp.type = 'text'; icon.className = 'bi bi-eye-slash input-eye'; }
  else { inp.type = 'password'; icon.className = 'bi bi-eye input-eye'; }
}

/* ── Clear red state as soon as the user starts typing in a field ── */
['loginUsername','regFirstName','regLastName','regEmail','regRole','regPassword','regConfirm'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', () => {
    el.classList.remove('field-error');
    const wrapper = el.closest('.mb-3, .mb-4, .col-6');
    if (wrapper) {
      const lbl = wrapper.querySelector('.form-label');
      if (lbl) lbl.classList.remove('field-error-label');
    }
  });
  el.addEventListener('change', () => {
    el.classList.remove('field-error');
    const wrapper = el.closest('.mb-3, .mb-4, .col-6');
    if (wrapper) {
      const lbl = wrapper.querySelector('.form-label');
      if (lbl) lbl.classList.remove('field-error-label');
    }
  });
});

/* ── Live password hint colour ── */
document.getElementById('regPassword').addEventListener('input', function () {
  const hint = document.getElementById('passHint');
  if (this.value.length === 0) {
    hint.style.color = 'var(--muted)';
    hint.textContent = 'At least 8 characters required';
  } else if (this.value.length < 8) {
    hint.style.color = 'var(--danger)';
    hint.textContent = `${this.value.length}/8 characters — too short`;
  } else {
    hint.style.color = 'var(--success)';
    hint.textContent = 'Password length looks good ✓';
  }
});

/* ── Helper: clear all field error states in register form ── */
function clearRegErrors() {
  document.getElementById('regError').style.display = 'none';

  document.querySelectorAll('#registerSection .form-control, #registerSection .form-select').forEach(el => {
    el.classList.remove('field-error');
  });
  document.querySelectorAll('#registerSection .form-label').forEach(el => {
    el.classList.remove('field-error-label');
  });
}

/* ── Helper: mark a field as invalid (red underline + label) ── */
function markFieldError(fieldEl) {
  fieldEl.classList.add('field-error');
  const wrapper = fieldEl.closest('.mb-3, .mb-4, .col-6');
  if (wrapper) {
    const lbl = wrapper.querySelector('.form-label');
    if (lbl) lbl.classList.add('field-error-label');
  }
}

/* ── Helper: show registration error and scroll to it ── */
function showRegError(msg, fieldEl) {
  const errEl = document.getElementById('regError');
  document.getElementById('regErrorMsg').textContent = msg;
  errEl.style.display = 'block';
  
  const section = document.getElementById('registerSection');
  section.scrollTo({ top: 0, behavior: 'smooth' });
  
  if (fieldEl) markFieldError(fieldEl);
}

/* ── Login ── */
function doLogin() {
  const username = document.getElementById('loginUsername').value.trim();
  const pass  = document.getElementById('loginPassword').value;
  
  if (!username || !pass) {
    const err = document.getElementById('loginError');
    err.style.display = 'block';
    setTimeout(() => err.style.display = 'none', 3000);
    return;
  }

  const fullEmailToDatabase = username + "@company.com";
  
  console.log("Logging in with: ", fullEmailToDatabase); 
  
  if (window.loginSelectedRole === 'staff') {
    window.location.href = 'dashboard-staff.html';
  } else {
    window.location.href = 'dashboard-manager.html';
  }
}

/* ── Register ── */
function doRegister() {
  clearRegErrors();

  const firstName = document.getElementById('regFirstName');
  const lastName  = document.getElementById('regLastName');
  const emailEl   = document.getElementById('regEmail');
  const roleEl    = document.getElementById('regRole');
  const passEl    = document.getElementById('regPassword');
  const confirmEl = document.getElementById('regConfirm');
  const termsEl   = document.getElementById('terms');

  const emptyFields = [];
  if (!firstName.value.trim()) emptyFields.push(firstName);
  if (!lastName.value.trim())  emptyFields.push(lastName);
  if (!emailEl.value.trim())   emptyFields.push(emailEl);
  if (!roleEl.value)           emptyFields.push(roleEl);
  if (!passEl.value)           emptyFields.push(passEl);
  if (!confirmEl.value)        emptyFields.push(confirmEl);

  if (emptyFields.length > 0) {
    emptyFields.forEach(f => markFieldError(f));
    showRegError('Please fill in all fields before continuing.', null);
    return;
  }

  if (!emailEl.value.trim().toLowerCase().endsWith('@company.com')) {
    showRegError('Email must be a company address ending with @company.com', emailEl);
    return;
  }

  if (!termsEl.checked) {
    showRegError('Please agree to the Terms & Conditions to continue.', null);
    return;
  }

  if (passEl.value.length < 8) {
    showRegError('Password must be at least 8 characters long.', passEl);
    return;
  }

  if (passEl.value !== confirmEl.value) {
    markFieldError(passEl);
    showRegError('Passwords do not match. Please try again.', confirmEl);
    return;
  }

  document.getElementById('regError').style.display = 'none';
  
  const s = document.getElementById('regSuccess');
  s.style.display = 'block';
  
  const section = document.getElementById('registerSection');
  section.scrollTo({ top: 0, behavior: 'smooth' });

  setTimeout(() => { switchTab('login'); s.style.display = 'none'; }, 1800);
}

/* ── Forgot password flow ── */
function showForgotPass() {
  switchTab('forgotPass');
}

function showVerifyCodeOnly() {
  const email = document.getElementById('forgotEmail').value;
  if (!email && document.getElementById('forgotPassSection').classList.contains('active')) {
    alert('Please enter your email.');
    return;
  }
  switchTab('verifyCodeOnly');
}

function showResetPassword() {
  const code = document.getElementById('verifyCodeInput').value;
  if (!code) {
    alert('Please enter the verification code.');
    return;
  }
  switchTab('resetPassword');
}

function resetPasswordAndBackToLogin() {
  const newPass     = document.getElementById('newPass').value;
  const confirmPass = document.getElementById('confirmNewPass').value;
  if (newPass.length < 8) { alert('Password must be at least 8 characters.'); return; }
  if (newPass !== confirmPass) { alert('Passwords do not match.'); return; }
  switchTab('resetSuccess');
}
