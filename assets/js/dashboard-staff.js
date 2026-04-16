const kpiData = [
  {
    id: 0,
    title: "Research Publications",
    subtitle: "Publish 3 journal papers",
    category: "Research",
    categoryColor: "#e8f0fe",
    categoryText: "#1a3a5c",
    target: "3 papers",
    progress: 67,
    deadline: "Dec 2025",
    status: "in-progress",
    statusLabel: "In Progress",
    progressBar: "var(--warning)",
    achievement: "2 of 3 papers published"
  },
  {
    id: 1,
    title: "Student Pass Rate",
    subtitle: "Maintain 90% pass rate",
    category: "Teaching",
    categoryColor: "#e6f9f0",
    categoryText: "#1db87a",
    target: "90%",
    progress: 100,
    deadline: "Jun 2025",
    status: "achieved",
    statusLabel: "Achieved",
    progressBar: "var(--success)",
    achievement: "Achieved: 95% pass rate"
  },
  {
    id: 2,
    title: "Community Service",
    subtitle: "5 outreach programs",
    category: "Service",
    categoryColor: "#fef3e0",
    categoryText: "#f5a623",
    target: "5 events",
    progress: 30,
    deadline: "Mar 2025",
    status: "overdue",
    statusLabel: "Overdue",
    progressBar: "var(--danger)",
    achievement: "1 of 5 events done"
  }
];

const pageTitles = {
  dashboard: "Dashboard",
  myKpis: "My KPIs",
  updateProgress: "Update Progress",
  submitEvidence: "Submit Evidence",
  profile: "My Profile",
  settings: "Settings"
};

let notifOpen = false;
let profileImageDataUrl = null;
let pendingImageDataUrl = null;
let pendingEvidenceFile = null;
let use24Hour = false;

function showPage(pageId, clickedItem) {
  const sections = document.querySelectorAll(".page-section");
  sections.forEach((section) => section.classList.remove("active"));

  const targetSection = document.getElementById("page-" + pageId);
  if (targetSection) {
    targetSection.classList.add("active");
  }

  const title = document.getElementById("pageTitle");
  if (title && pageTitles[pageId]) {
    title.textContent = pageTitles[pageId];
  }

  if (clickedItem) {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => item.classList.remove("active"));
    clickedItem.classList.add("active");
  }

  const dropdown = document.getElementById("notifDropdown");
  if (dropdown) {
    dropdown.classList.remove("open");
  }
  notifOpen = false;
}

function getStatusColor(status) {
  if (status === "achieved") return "var(--success)";
  if (status === "in-progress") return "var(--warning)";
  if (status === "overdue") return "var(--danger)";
  return "var(--muted)";
}

function updateStatCards() {
  const total = kpiData.length;
  const achieved = kpiData.filter((item) => item.status === "achieved").length;
  const inProgress = kpiData.filter((item) => item.status === "in-progress").length;
  const overdue = kpiData.filter((item) => item.status === "overdue").length;

  document.getElementById("dashTotal").textContent = total;
  document.getElementById("dashAchieved").textContent = achieved;
  document.getElementById("dashInProgress").textContent = inProgress;
  document.getElementById("dashOverdue").textContent = overdue;
}

function renderDashboardKPIs() {
  const container = document.getElementById("dashboardKpiList");
  if (!container) return;

  container.innerHTML = "";

  kpiData.forEach((kpi) => {
    const card = document.createElement("div");
    card.className = "kpi-detail-card " + kpi.status;

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
        <div>
          <div style="font-weight:700;font-size:14px;">${kpi.title}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:2px;">${kpi.category} · Due ${kpi.deadline}</div>
        </div>
        <div class="kpi-score-circle" style="border-color:${getStatusColor(kpi.status)};color:${getStatusColor(kpi.status)};">
          ${kpi.progress}%
        </div>
      </div>

      <div class="progress-wrap">
        <div class="progress-fill" style="width:${kpi.progress}%;background:${kpi.progressBar};"></div>
      </div>

      <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:12px;color:var(--muted);gap:8px;">
        <span>${kpi.achievement}</span>
        <span class="badge-status ${kpi.status}">${kpi.statusLabel}</span>
      </div>
    `;

    container.appendChild(card);
  });

  updateStatCards();
}

function renderKpiTable(filter = "all") {
  const tbody = document.getElementById("myKpiTableBody");
  if (!tbody) return;

  tbody.innerHTML = "";

  let list = kpiData;
  if (filter !== "all") {
    list = kpiData.filter((item) => item.status === filter);
  }

  list.forEach((kpi, index) => {
    const row = document.createElement("tr");
    row.setAttribute("data-status", kpi.status);

    let actionButton = "";
    if (kpi.status === "achieved") {
      actionButton = `
        <button class="btn-primary-custom" style="padding:5px 12px;font-size:12px;" onclick="showPage('submitEvidence', null)">
          <i class="bi bi-upload"></i> Evidence
        </button>
      `;
    } else {
      actionButton = `
        <button class="btn-primary-custom" style="padding:5px 12px;font-size:12px;" onclick="goToUpdateProgress(${kpi.id})">
          <i class="bi bi-pencil"></i> Update
        </button>
      `;
    }

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>
        <strong>${kpi.title}</strong><br>
        <span style="font-size:12px;color:var(--muted);">${kpi.subtitle}</span>
      </td>
      <td>
        <span style="font-size:12px;background:${kpi.categoryColor};color:${kpi.categoryText};padding:2px 8px;border-radius:10px;">
          ${kpi.category}
        </span>
      </td>
      <td>${kpi.target}</td>
      <td>
        <div style="display:flex;align-items:center;gap:6px;">
          <div class="progress-wrap" style="width:80px;">
            <div class="progress-fill" style="width:${kpi.progress}%;background:${kpi.progressBar};"></div>
          </div>
          <span style="font-size:12px;color:var(--muted);">${kpi.progress}%</span>
        </div>
      </td>
      <td style="font-size:13px;">${kpi.deadline}</td>
      <td><span class="badge-status ${kpi.status}">${kpi.statusLabel}</span></td>
      <td>${actionButton}</td>
    `;

    tbody.appendChild(row);
  });
}

function filterKpiTable() {
  const filter = document.getElementById("kpiStatusFilter").value;
  renderKpiTable(filter);
}

function goToUpdateProgress(kpiId) {
  const updateNavItem = document.querySelector(".nav-item[onclick*=updateProgress]");
  showPage("updateProgress", updateNavItem);

  const select = document.getElementById("kpiSelect");
  if (select) {
    select.value = String(kpiId);
  }

  updateSlider();
}

function updateSlider() {
  const select = document.getElementById("kpiSelect");
  const slider = document.getElementById("progressSlider");
  const progressText = document.getElementById("progressVal");
  const achievementInput = document.getElementById("achievementInput");

  if (!select || !slider || !progressText || !achievementInput) return;

  const selectedId = parseInt(select.value, 10);
  const selectedKpi = kpiData.find((item) => item.id === selectedId);

  if (!selectedKpi) return;

  slider.value = selectedKpi.progress;
  progressText.textContent = selectedKpi.progress + "%";
  achievementInput.value = selectedKpi.achievement;

  Array.from(select.options).forEach((option) => {
    const optionId = parseInt(option.value, 10);
    const optionKpi = kpiData.find((item) => item.id === optionId);
    if (optionKpi) {
      option.text = `${optionKpi.title} (currently ${optionKpi.progress}%)`;
    }
  });
}

function getDeadlineDate(deadlineText) {
  const monthMap = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11
  };

  const parts = deadlineText.split(" ");
  const month = monthMap[parts[0]];
  const year = parseInt(parts[1], 10);

  if (month === undefined || Number.isNaN(year)) {
    return null;
  }

  return new Date(year, month + 1, 0);
}

function updateKpiStatus(kpi) {
  if (kpi.progress >= 100) {
    kpi.status = "achieved";
    kpi.statusLabel = "Achieved";
    kpi.progressBar = "var(--success)";
    return;
  }

  const deadlineDate = getDeadlineDate(kpi.deadline);
  const today = new Date();

  if (deadlineDate && today > deadlineDate) {
    kpi.status = "overdue";
    kpi.statusLabel = "Overdue";
    kpi.progressBar = "var(--danger)";
  } else {
    kpi.status = "in-progress";
    kpi.statusLabel = "In Progress";
    kpi.progressBar = "var(--warning)";
  }
}

function submitProgress() {
  const select = document.getElementById("kpiSelect");
  const slider = document.getElementById("progressSlider");
  const achievementInput = document.getElementById("achievementInput");
  const noteInput = document.getElementById("progressNote");
  const dateInput = document.getElementById("updateDate");

  if (!select || !slider || !achievementInput) return;

  const selectedId = parseInt(select.value, 10);
  const kpi = kpiData.find((item) => item.id === selectedId);

  if (!kpi) return;

  const newProgress = parseInt(slider.value, 10);
  const achievementText = achievementInput.value.trim();
  const progressNote = noteInput ? noteInput.value.trim() : "";
  const selectedDate = dateInput ? dateInput.value : "";

  kpi.progress = newProgress;

  if (achievementText) {
    kpi.achievement = achievementText;
  }

  updateKpiStatus(kpi);
  addProgressHistory(kpi, newProgress, progressNote, selectedDate);

  renderDashboardKPIs();

  const activeFilter = document.getElementById("kpiStatusFilter").value;
  renderKpiTable(activeFilter);
  updateSlider();

  alert("Progress updated successfully!");

  const myKpiNavItem = document.querySelector(".nav-item[onclick*=myKpis]");
  showPage("myKpis", myKpiNavItem);
}

function addProgressHistory(kpi, progressValue, note, rawDate) {
  const historyBody = document.getElementById("progressHistoryBody");
  if (!historyBody) return;

  let dateText = "";
  if (rawDate) {
    const dateObj = new Date(rawDate);
    dateText = dateObj.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } else {
    dateText = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  }

  const titleText = note || `Progress updated to ${progressValue}%`;

  const item = document.createElement("div");
  item.className = "timeline-item";
  item.innerHTML = `
    <div class="timeline-dot success"><i class="bi bi-arrow-up"></i></div>
    <div class="timeline-content">
      <div class="timeline-title">${titleText}</div>
      <div class="timeline-sub">${kpi.title} · ${dateText}</div>
    </div>
  `;

  historyBody.prepend(item);
}

function toggleNotif(event) {
  event.stopPropagation();

  const dropdown = document.getElementById("notifDropdown");
  if (!dropdown) return;

  notifOpen = !notifOpen;
  dropdown.classList.toggle("open", notifOpen);
}

function markRead(item) {
  if (!item) return;

  item.classList.remove("unread");

  const dot = item.querySelector(".unread-dot");
  if (dot) {
    dot.remove();
  }

  updateNotifBadge();
}

function markAllRead() {
  const unreadItems = document.querySelectorAll(".notif-item.unread");

  unreadItems.forEach((item) => {
    item.classList.remove("unread");
    const dot = item.querySelector(".unread-dot");
    if (dot) {
      dot.remove();
    }
  });

  updateNotifBadge();
}

function updateNotifBadge() {
  const unreadCount = document.querySelectorAll(".notif-item.unread").length;
  const badge = document.getElementById("notifBadge");

  if (!badge) return;
  badge.style.display = unreadCount > 0 ? "block" : "none";
}

function handleProfilePicChange(input) {
  if (!input.files || !input.files[0]) return;

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    pendingImageDataUrl = event.target.result;

    const display = document.getElementById("profilePicDisplay");
    if (display) {
      display.innerHTML = `<img src="${pendingImageDataUrl}" alt="Profile"/>`;
    }

    const saveBtn = document.getElementById("saveProfileBtn");
    if (saveBtn) {
      saveBtn.innerHTML = `<i class="bi bi-check-lg"></i> Save Changes <span style="font-size:10px;background:rgba(255,255,255,0.25);border-radius:4px;padding:1px 5px;margin-left:4px;">unsaved</span>`;
    }
  };

  reader.readAsDataURL(file);
}

function setGlobalAvatars(src) {
  const topbarAvatar = document.getElementById("topbarAvatar");
  const sidebarAvatar = document.getElementById("sidebarAvatar");

  if (topbarAvatar) {
    topbarAvatar.innerHTML = `<img src="${src}" alt="Profile" style="width:36px;height:36px;object-fit:cover;border-radius:50%;">`;
  }

  if (sidebarAvatar) {
    sidebarAvatar.innerHTML = `<img src="${src}" alt="Profile" style="width:36px;height:36px;object-fit:cover;border-radius:50%;">`;
  }
}

function saveProfileChanges() {
  if (pendingImageDataUrl) {
    profileImageDataUrl = pendingImageDataUrl;
    pendingImageDataUrl = null;
    setGlobalAvatars(profileImageDataUrl);
  }

  const firstName = document.getElementById("firstNameInput")?.value.trim() || "";
  const lastName = document.getElementById("lastNameInput")?.value.trim() || "";
  const displayName = document.getElementById("profileDisplayName");

  if (displayName) {
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) {
      displayName.textContent = fullName;
    }
  }

  const saveBtn = document.getElementById("saveProfileBtn");
  if (saveBtn) {
    saveBtn.innerHTML = `<i class="bi bi-check-lg"></i> Save Changes`;
  }

  alert("Profile changes saved!");
}

function handleDrop(event) {
  event.preventDefault();

  const dropzone = document.getElementById("dropzone");
  if (dropzone) {
    dropzone.style.borderColor = "var(--border)";
  }

  const file = event.dataTransfer.files[0];
  if (file) {
    pendingEvidenceFile = file;
    showFileName(file.name);
  }
}

function showFile(input) {
  if (!input.files || !input.files[0]) return;

  pendingEvidenceFile = input.files[0];
  showFileName(pendingEvidenceFile.name);
}

function showFileName(name) {
  const preview = document.getElementById("filePreview");
  const fileName = document.getElementById("fileName");

  if (fileName) {
    fileName.textContent = name;
  }

  if (preview) {
    preview.style.display = "flex";
  }
}

function submitEvidence() {
  const kpi = document.getElementById("evidenceKpiSelect")?.value || "";
  const type = document.getElementById("evidenceTypeSelect")?.value || "";
  const description = document.getElementById("evidenceDesc")?.value.trim() || "";
  const file = pendingEvidenceFile;

  if (!kpi) {
    alert("Please select a KPI.");
    return;
  }

  if (!file) {
    alert("Please attach a file before submitting.");
    return;
  }

  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    alert("File too large. Maximum size is 10MB.");
    return;
  }

  let fileIcon = "bi-file-earmark-fill";
  if (/\.pdf$/i.test(file.name)) {
    fileIcon = "bi-file-pdf-fill";
  } else if (/\.(png|jpe?g|gif|bmp|webp)$/i.test(file.name)) {
    fileIcon = "bi-file-image";
  }

  const escapedFileName = file.name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short"
  });

  const tbody = document.querySelector("#evidenceTable tbody");
  if (!tbody) return;

  const row = document.createElement("tr");
  row.innerHTML = `
    <td><strong>${kpi}</strong></td>
    <td><a href="#" style="color:var(--primary);font-size:13px;"><i class="bi ${fileIcon}"></i> ${escapedFileName}</a></td>
    <td style="font-size:13px;color:var(--muted);">${today}</td>
    <td><span class="badge-status submitted">Pending</span></td>
  `;

  tbody.prepend(row);

  pendingEvidenceFile = null;

  const fileInput = document.getElementById("fileInput");
  const filePreview = document.getElementById("filePreview");
  const fileName = document.getElementById("fileName");
  const descInput = document.getElementById("evidenceDesc");
  const typeSelect = document.getElementById("evidenceTypeSelect");
  const kpiSelect = document.getElementById("evidenceKpiSelect");

  if (fileInput) fileInput.value = "";
  if (filePreview) filePreview.style.display = "none";
  if (fileName) fileName.textContent = "";
  if (descInput) descInput.value = "";
  if (typeSelect) typeSelect.value = "Document";
  if (kpiSelect) kpiSelect.selectedIndex = 0;

  console.log("Evidence submitted:", {
    kpi,
    type,
    description,
    fileName: file.name
  });

  alert("Evidence submitted successfully! Awaiting manager approval.");
}

function setTimeFormat(is24Hour) {
  use24Hour = is24Hour;

  const btn12 = document.getElementById("btn12");
  const btn24 = document.getElementById("btn24");

  if (btn12 && btn24) {
    if (use24Hour) {
      btn24.style.background = "var(--primary)";
      btn24.style.color = "white";
      btn24.style.borderRadius = "0 6px 6px 0";

      btn12.style.background = "transparent";
      btn12.style.color = "var(--muted)";
      btn12.style.borderRadius = "6px 0 0 6px";
    } else {
      btn12.style.background = "var(--primary)";
      btn12.style.color = "white";
      btn12.style.borderRadius = "6px 0 0 6px";

      btn24.style.background = "transparent";
      btn24.style.color = "var(--muted)";
      btn24.style.borderRadius = "0 6px 6px 0";
    }
  }

  updateTimePreview();
}

function updateTimePreview() {
  const output = document.getElementById("timePreview");
  if (!output) return;

  const now = new Date();
  let timeText = "";

  if (use24Hour) {
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    timeText = `${hh}:${mm}:${ss}`;
  } else {
    let hour = now.getHours();
    const minute = String(now.getMinutes()).padStart(2, "0");
    const second = String(now.getSeconds()).padStart(2, "0");
    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;
    if (hour === 0) hour = 12;

    timeText = `${hour}:${minute}:${second} ${ampm}`;
  }

  output.textContent = timeText;
}

function togglePwVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);

  if (!input || !icon) return;

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("bi-eye");
    icon.classList.add("bi-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("bi-eye-slash");
    icon.classList.add("bi-eye");
  }
}

function checkPwStrength(passwordValue) {
  const fill = document.getElementById("pwStrengthFill");
  const label = document.getElementById("pwStrengthLabel");

  if (!fill || !label) return;

  let strength = 0;

  if (passwordValue.length >= 8) strength++;
  if (/[A-Z]/.test(passwordValue)) strength++;
  if (/[0-9]/.test(passwordValue)) strength++;
  if (/[^A-Za-z0-9]/.test(passwordValue)) strength++;

  const colors = ["transparent", "#e53e3e", "#f5a623", "#1db87a", "#1a3a5c"];
  const labels = ["", "Weak", "Fair", "Strong", "Very Strong"];

  fill.style.width = strength * 25 + "%";
  fill.style.background = colors[strength];
  label.textContent = passwordValue ? labels[strength] : "";
  label.style.color = passwordValue ? colors[strength] : "var(--muted)";
}

function updatePassword() {
  const currentPw = document.getElementById("settingsCurrentPw");
  const newPw = document.getElementById("settingsNewPw");
  const confirmPw = document.getElementById("settingsConfirmPw");

  if (!currentPw || !newPw || !confirmPw) return;

  const currentValue = currentPw.value;
  const newValue = newPw.value;
  const confirmValue = confirmPw.value;

  if (!currentValue || !newValue || !confirmValue) {
    alert("Please fill in all password fields.");
    return;
  }

  if (newValue.length < 8) {
    alert("Password must be at least 8 characters.");
    return;
  }

  if (newValue !== confirmValue) {
    alert("New passwords do not match.");
    return;
  }

  currentPw.value = "";
  newPw.value = "";
  confirmPw.value = "";

  currentPw.type = "password";
  newPw.type = "password";
  confirmPw.type = "password";

  const eye0 = document.getElementById("eyeIcon0");
  const eye1 = document.getElementById("eyeIcon1");
  const eye2 = document.getElementById("eyeIcon2");

  [eye0, eye1, eye2].forEach((icon) => {
    if (!icon) return;
    icon.classList.remove("bi-eye-slash");
    icon.classList.add("bi-eye");
  });

  checkPwStrength("");

  alert("Password updated successfully!");
}

document.addEventListener("click", function (event) {
  const topbarRight = document.getElementById("topbarRight");
  const dropdown = document.getElementById("notifDropdown");

  if (!topbarRight || !dropdown) return;

  if (!topbarRight.contains(event.target)) {
    dropdown.classList.remove("open");
    notifOpen = false;
  }
});

window.addEventListener("DOMContentLoaded", function () {
  renderDashboardKPIs();
  renderKpiTable();
  updateSlider();
  updateNotifBadge();
  setTimeFormat(false);
  updateTimePreview();
  setInterval(updateTimePreview, 1000);
});