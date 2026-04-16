window.loginSelectedRole = "manager";

function switchTab(tabName) {
  const tabs = document.querySelectorAll(".auth-tab");
  const sections = document.querySelectorAll(".form-section");
  const authTabs = document.getElementById("authTabs");

  tabs.forEach((tab) => tab.classList.remove("active"));
  sections.forEach((section) => section.classList.remove("active"));

  if (tabName === "login" || tabName === "register") {
    authTabs.style.display = "flex";

    if (tabName === "login") {
      tabs[0].classList.add("active");
    } else {
      tabs[1].classList.add("active");
    }
  } else {
    authTabs.style.display = "none";
  }

  const activeSection = document.getElementById(tabName + "Section");
  if (activeSection) {
    activeSection.classList.add("active");
  }
}

function togglePass(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);

  if (!input || !icon) return;

  if (input.type === "password") {
    input.type = "text";
    icon.className = "bi bi-eye-slash input-eye";
  } else {
    input.type = "password";
    icon.className = "bi bi-eye input-eye";
  }
}

function clearFieldError(field) {
  if (!field) return;

  field.classList.remove("field-error");

  const wrapper = field.closest(".mb-3, .mb-4, .col-6");
  if (!wrapper) return;

  const label = wrapper.querySelector(".form-label");
  if (label) {
    label.classList.remove("field-error-label");
  }
}

function markFieldError(field) {
  if (!field) return;

  field.classList.add("field-error");

  const wrapper = field.closest(".mb-3, .mb-4, .col-6");
  if (!wrapper) return;

  const label = wrapper.querySelector(".form-label");
  if (label) {
    label.classList.add("field-error-label");
  }
}

function setupFieldReset(fieldIds) {
  fieldIds.forEach((id) => {
    const field = document.getElementById(id);
    if (!field) return;

    field.addEventListener("input", function () {
      clearFieldError(field);
    });

    field.addEventListener("change", function () {
      clearFieldError(field);
    });
  });
}

function clearRegisterErrors() {
  const errorBox = document.getElementById("regError");
  if (errorBox) {
    errorBox.style.display = "none";
  }

  const fields = document.querySelectorAll(
    "#registerSection .form-control, #registerSection .form-select"
  );
  fields.forEach((field) => field.classList.remove("field-error"));

  const labels = document.querySelectorAll("#registerSection .form-label");
  labels.forEach((label) => label.classList.remove("field-error-label"));
}

function showRegisterError(message, field) {
  const errorBox = document.getElementById("regError");
  const errorText = document.getElementById("regErrorMsg");
  const registerSection = document.getElementById("registerSection");

  if (errorText) {
    errorText.textContent = message;
  }

  if (errorBox) {
    errorBox.style.display = "block";
  }

  if (field) {
    markFieldError(field);
  }

  if (registerSection) {
    registerSection.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
}

function updatePasswordHint() {
  const passwordInput = document.getElementById("regPassword");
  const hint = document.getElementById("passHint");

  if (!passwordInput || !hint) return;

  const length = passwordInput.value.length;

  if (length === 0) {
    hint.style.color = "var(--muted)";
    hint.textContent = "At least 8 characters required";
  } else if (length < 8) {
    hint.style.color = "var(--danger)";
    hint.textContent = `${length}/8 characters - too short`;
  } else {
    hint.style.color = "var(--success)";
    hint.textContent = "Password length looks good";
  }
}

function doLogin() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errorBox = document.getElementById("loginError");

  if (!username || !password) {
    if (errorBox) {
      errorBox.style.display = "block";
      setTimeout(() => {
        errorBox.style.display = "none";
      }, 3000);
    }
    return;
  }

  const fullEmail = username + "@company.com";
  console.log("Login attempt:", fullEmail);

  if (window.loginSelectedRole === "staff") {
    window.location.href = "dashboard-staff.html";
  } else {
    window.location.href = "dashboard-manager.html";
  }
}

function doRegister() {
  clearRegisterErrors();

  const firstName = document.getElementById("regFirstName");
  const lastName = document.getElementById("regLastName");
  const email = document.getElementById("regEmail");
  const role = document.getElementById("regRole");
  const password = document.getElementById("regPassword");
  const confirmPassword = document.getElementById("regConfirm");
  const terms = document.getElementById("terms");

  const requiredFields = [firstName, lastName, email, role, password, confirmPassword];
  let hasEmptyField = false;

  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      markFieldError(field);
      hasEmptyField = true;
    }
  });

  if (hasEmptyField) {
    showRegisterError("Please fill in all fields before continuing.");
    return;
  }

  if (!email.value.trim().toLowerCase().endsWith("@company.com")) {
    showRegisterError("Email must end with @company.com", email);
    return;
  }

  if (!terms.checked) {
    showRegisterError("Please agree to the Terms & Conditions.");
    return;
  }

  if (password.value.length < 8) {
    showRegisterError("Password must be at least 8 characters long.", password);
    return;
  }

  if (password.value !== confirmPassword.value) {
    markFieldError(password);
    markFieldError(confirmPassword);
    showRegisterError("Passwords do not match.", confirmPassword);
    return;
  }

  const successBox = document.getElementById("regSuccess");
  const registerSection = document.getElementById("registerSection");
  const errorBox = document.getElementById("regError");

  if (errorBox) {
    errorBox.style.display = "none";
  }

  if (successBox) {
    successBox.style.display = "block";
  }

  if (registerSection) {
    registerSection.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  setTimeout(() => {
    if (successBox) {
      successBox.style.display = "none";
    }
    switchTab("login");
  }, 1800);
}

function showForgotPass() {
  switchTab("forgotPass");
}

function showVerifyCodeOnly() {
  const email = document.getElementById("forgotEmail").value.trim();

  if (!email) {
    alert("Please enter your email.");
    return;
  }

  switchTab("verifyCodeOnly");
}

function showResetPassword() {
  const code = document.getElementById("verifyCodeInput").value.trim();

  if (!code) {
    alert("Please enter the verification code.");
    return;
  }

  switchTab("resetPassword");
}

function resetPasswordAndBackToLogin() {
  const newPass = document.getElementById("newPass").value;
  const confirmNewPass = document.getElementById("confirmNewPass").value;

  if (newPass.length < 8) {
    alert("Password must be at least 8 characters.");
    return;
  }

  if (newPass !== confirmNewPass) {
    alert("Passwords do not match.");
    return;
  }

  switchTab("resetSuccess");
}

document.addEventListener("DOMContentLoaded", function () {
  setupFieldReset([
    "loginUsername",
    "regFirstName",
    "regLastName",
    "regEmail",
    "regRole",
    "regPassword",
    "regConfirm"
  ]);

  const regPassword = document.getElementById("regPassword");
  if (regPassword) {
    regPassword.addEventListener("input", updatePasswordHint);
  }
});