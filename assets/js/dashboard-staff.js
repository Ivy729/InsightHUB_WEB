// ─── KPI Data Store ───────────────────────────────────────────────────────
const kpiData = [
  {
    id: 0,
    title: 'Research Publications',
    subtitle: 'Publish 3 journal papers',
    category: 'Research',
    categoryColor: '#e8f0fe',
    categoryText: '#1a3a5c',
    target: '3 papers',
    progress: 67,
    deadline: 'Dec 2025',
    status: 'in-progress',
    statusLabel: 'In Progress',
    progressBar: 'var(--warning)',
    achievement: '2 of 3 papers published',
  },
  {
    id: 1,
    title: 'Student Pass Rate',
    subtitle: 'Maintain 90% pass rate',
    category: 'Teaching',
    categoryColor: '#e6f9f0',
    categoryText: '#1db87a',
    target: '90%',
    progress: 100,
    deadline: 'Jun 2025',
    status: 'achieved',
    statusLabel: 'Achieved',
    progressBar: 'var(--success)',
    achievement: 'Achieved: 95% pass rate',
  },
  {
    id: 2,
    title: 'Community Service',
    subtitle: '5 outreach programs',
    category: 'Service',
    categoryColor: '#fef3e0',
    categoryText: '#f5a623',
    target: '5 events',
    progress: 30,
    deadline: 'Mar 2025',
    status: 'overdue',
    statusLabel: 'Overdue',
    progressBar: 'var(--danger)',
    achievement: '1 of 3 events done',
  },
];

// ─── Page Navigation ──────────────────────────────────────────────────────
const pageTitles = { dashboard:'Dashboard', myKpis:'My KPIs', updateProgress:'Update Progress', submitEvidence:'Submit Evidence', profile:'My Profile', settings:'Settings' };

function showPage(id, el) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  document.getElementById('pageTitle').textContent = pageTitles[id];
  if (el) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
  }
  document.getElementById('notifDropdown').classList.remove('open');
}

// ─── Dashboard KPI Render ────────────────────────────────────────────────
function renderDashboardKPIs() {
  const container = document.getElementById('dashboardKpiList');
  container.innerHTML = '';
  kpiData.forEach(kpi => {
    const div = document.createElement('div');
    div.className = 'kpi-detail-card ' + kpi.status;
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
        <div>
          <div style="font-weight:700;font-size:14px;">${kpi.title}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:2px;">${kpi.category} · Due ${kpi.deadline}</div>
        </div>
        <div class="kpi-score-circle" style="border-color:${borderColor(kpi.status)};color:${borderColor(kpi.status)};">${kpi.progress}%</div>
      </div>
      <div class="progress-wrap"><div class="progress-fill" style="width:${kpi.progress}%;background:${kpi.progressBar};"></div></div>
      <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:12px;color:var(--muted);">
        <span>${kpi.achievement}</span>
        <span class="badge-status ${kpi.status}">${kpi.statusLabel}</span>
      </div>
    `;
    container.appendChild(div);
  });
  updateStatCards();
}

function borderColor(status) {
  if (status === 'achieved') return 'var(--success)';
  if (status === 'in-progress') return 'var(--warning)';
  if (status === 'overdue') return 'var(--danger)';
  return 'var(--muted)';
}

function updateStatCards() {
  document.getElementById('dashTotal').textContent = kpiData.length;
  document.getElementById('dashAchieved').textContent = kpiData.filter(k => k.status === 'achieved').length;
  document.getElementById('dashInProgress').textContent = kpiData.filter(k => k.status === 'in-progress').length;
  document.getElementById('dashOverdue').textContent = kpiData.filter(k => k.status === 'overdue').length;
}

// ─── My KPIs Table ────────────────────────────────────────────────────────
function renderKpiTable(filter = 'all') {
  const tbody = document.getElementById('myKpiTableBody');
  tbody.innerHTML = '';
  const filtered = filter === 'all' ? kpiData : kpiData.filter(k => k.status === filter);
  filtered.forEach((kpi, i) => {
    const actionBtn = kpi.status === 'achieved'
      ? `<button class="btn-primary-custom" style="padding:5px 12px;font-size:12px;" onclick="showPage('submitEvidence',null)"><i class="bi bi-upload"></i> Evidence</button>`
      : `<button class="btn-primary-custom" style="padding:5px 12px;font-size:12px;" onclick="goToUpdateProgress(${kpi.id})"><i class="bi bi-pencil"></i> Update</button>`;
    const tr = document.createElement('tr');
    tr.setAttribute('data-status', kpi.status);
    tr.innerHTML = `
      <td>${i+1}</td>
      <td><strong>${kpi.title}</strong><br><span style="font-size:12px;color:var(--muted);">${kpi.subtitle}</span></td>
      <td><span style="font-size:12px;background:${kpi.categoryColor};color:${kpi.categoryText};padding:2px 8px;border-radius:10px;">${kpi.category}</span></td>
      <td>${kpi.target}</td>
      <td>
        <div style="display:flex;align-items:center;gap:6px;">
          <div class="progress-wrap" style="width:80px;"><div class="progress-fill" style="width:${kpi.progress}%;background:${kpi.progressBar};"></div></div>
          <span style="font-size:12px;color:var(--muted);">${kpi.progress}%</span>
        </div>
      </td>
      <td style="font-size:13px;">${kpi.deadline}</td>
      <td><span class="badge-status ${kpi.status}">${kpi.statusLabel}</span></td>
      <td>${actionBtn}</td>
    `;
    tbody.appendChild(tr);
  });
}

function filterKpiTable() {
  const val = document.getElementById('kpiStatusFilter').value;
  renderKpiTable(val);
}

function goToUpdateProgress(kpiId) {
  showPage('updateProgress', document.querySelector('.nav-item[onclick*=updateProgress]'));
  document.getElementById('kpiSelect').value = kpiId;
  updateSlider();
}

// ─── Update Progress ──────────────────────────────────────────────────────
function updateSlider() {
  const idx = parseInt(document.getElementById('kpiSelect').value);
  const kpi = kpiData[idx];
  document.getElementById('progressSlider').value = kpi.progress;
  document.getElementById('progressVal').textContent = kpi.progress + '%';
  document.getElementById('achievementInput').value = kpi.achievement;
  const select = document.getElementById('kpiSelect');
  for (let opt of select.options) {
    if (parseInt(opt.value) === idx) {
      opt.text = `${kpi.title} (currently ${kpi.progress}%)`;
    }
  }
}

function submitProgress() {
  const idx = parseInt(document.getElementById('kpiSelect').value);
  const newProgress = parseInt(document.getElementById('progressSlider').value);
  const achievement = document.getElementById('achievementInput').value.trim();
  const kpi = kpiData[idx];

  kpi.progress = newProgress;
  if (achievement) kpi.achievement = achievement;

  if (newProgress >= 100) {
    kpi.status = 'achieved';
    kpi.statusLabel = 'Achieved';
    kpi.progressBar = 'var(--success)';
  } else {
    const deadlineDate = new Date(kpi.deadline.replace('Dec','2025-12').replace('Jun','2025-06').replace('Mar','2025-03'));
    const now = new Date();
    if (now > deadlineDate && newProgress < 100) {
      kpi.status = 'overdue';
      kpi.statusLabel = 'Overdue';
      kpi.progressBar = 'var(--danger)';
    } else {
      kpi.status = 'in-progress';
      kpi.statusLabel = 'In Progress';
      kpi.progressBar = 'var(--warning)';
    }
  }

  const select = document.getElementById('kpiSelect');
  select.options[idx].text = `${kpi.title} (currently ${newProgress}%)`;

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'});
  const histBody = document.getElementById('progressHistoryBody');
  const newItem = document.createElement('div');
  newItem.className = 'timeline-item';
  newItem.innerHTML = `
    <div class="timeline-dot success"><i class="bi bi-arrow-up"></i></div>
    <div class="timeline-content">
      <div class="timeline-title">Progress updated to ${newProgress}%</div>
      <div class="timeline-sub">${kpi.title} · ${dateStr}</div>
    </div>
  `;
  histBody.prepend(newItem);

  renderDashboardKPIs();
  renderKpiTable(document.getElementById('kpiStatusFilter').value);
  alert('Progress updated successfully!');

  showPage('myKpis', document.querySelector('.nav-item[onclick*=myKpis]'));
}

// ─── Notifications ────────────────────────────────────────────────────────
let notifOpen = false;

function toggleNotif(e) {
  e.stopPropagation();
  notifOpen = !notifOpen;
  document.getElementById('notifDropdown').classList.toggle('open', notifOpen);
}

function markRead(item) {
  item.classList.remove('unread');
  const dot = item.querySelector('.unread-dot');
  if (dot) dot.remove();
  updateNotifBadge();
}

function markAllRead() {
  document.querySelectorAll('.notif-item.unread').forEach(item => {
    item.classList.remove('unread');
    const dot = item.querySelector('.unread-dot');
    if (dot) dot.remove();
  });
  updateNotifBadge();
}

function updateNotifBadge() {
  const unread = document.querySelectorAll('.notif-item.unread').length;
  const badge = document.getElementById('notifBadge');
  badge.style.display = unread > 0 ? 'block' : 'none';
}

document.addEventListener('click', function(e) {
  if (!document.getElementById('topbarRight').contains(e.target)) {
    document.getElementById('notifDropdown').classList.remove('open');
    notifOpen = false;
  }
});

// ─── Profile Picture Upload ───────────────────────────────────────────────
let profileImageDataUrl = null;
let pendingImageDataUrl = null;

function handleProfilePicChange(input) {
  if (!input.files || !input.files[0]) return;
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    pendingImageDataUrl = e.target.result;
    const profileDisplay = document.getElementById('profilePicDisplay');
    profileDisplay.innerHTML = `<img src="${pendingImageDataUrl}" alt="Profile"/>`;
    const saveBtn = document.getElementById('saveProfileBtn');
    saveBtn.innerHTML = '<i class="bi bi-check-lg"></i> Save Changes <span style="font-size:10px;background:rgba(255,255,255,0.25);border-radius:4px;padding:1px 5px;margin-left:4px;">unsaved</span>';
  };
  reader.readAsDataURL(file);
}

function setGlobalAvatars(src) {
  const topbarAvatar = document.getElementById('topbarAvatar');
  topbarAvatar.innerHTML = `<img src="${src}" alt="Profile" style="width:36px;height:36px;object-fit:cover;border-radius:50%;"/>`;
  const sidebarAvatar = document.getElementById('sidebarAvatar');
  sidebarAvatar.innerHTML = `<img src="${src}" alt="Profile" style="width:36px;height:36px;object-fit:cover;border-radius:50%;"/>`;
}

// ─── Profile Save ─────────────────────────────────────────────────────────
function saveProfileChanges() {
  if (pendingImageDataUrl) {
    profileImageDataUrl = pendingImageDataUrl;
    pendingImageDataUrl = null;
    setGlobalAvatars(profileImageDataUrl);
  }
  const saveBtn = document.getElementById('saveProfileBtn');
  saveBtn.innerHTML = '<i class="bi bi-check-lg"></i> Save Changes';
  alert('Profile changes saved!');
}

// ─── Evidence helpers ─────────────────────────────────────────────────────
let pendingEvidenceFile = null;

function handleDrop(e) {
  e.preventDefault();
  document.getElementById('dropzone').style.borderColor = 'var(--border)';
  const file = e.dataTransfer.files[0];
  if (file) {
    pendingEvidenceFile = file;
    showFileName(file.name);
  }
}

function showFile(input) {
  const file = input.files[0];
  if (file) {
    pendingEvidenceFile = file;
    showFileName(file.name);
  }
}

function showFileName(name) {
  const preview = document.getElementById('filePreview');
  document.getElementById('fileName').textContent = name;
  preview.style.display = 'flex';
}

function submitEvidence() {
  const kpi = document.getElementById('evidenceKpiSelect')?.value || '';
  const type = document.getElementById('evidenceTypeSelect')?.value || '';
  const desc = document.getElementById('evidenceDesc')?.value.trim() || '';
  const file = pendingEvidenceFile;

  if (!kpi) { alert('Please select a KPI.'); return; }
  if (!file) { alert('Please attach a file before submitting.'); return; }

  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) { alert('File too large. Maximum size is 10MB.'); return; }

  const tbody = document.querySelector('#evidenceTable tbody');
  const tr = document.createElement('tr');
  const today = new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short'});
  const fileNameEsc = file.name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let fileIcon = 'bi-file-earmark-fill';
  if (/\.pdf$/i.test(file.name)) fileIcon = 'bi-file-pdf-fill';
  else if (/\.(png|jpe?g|gif|bmp|webp)$/i.test(file.name)) fileIcon = 'bi-file-image';

  tr.innerHTML = `
    <td><strong>${kpi}</strong></td>
    <td><a href="#" style="color:var(--primary);font-size:13px;"><i class="bi ${fileIcon}"></i> ${fileNameEsc}</a></td>
    <td style="font-size:13px;color:var(--muted);">${today}</td>
    <td><span class="badge-status submitted">Pending</span></td>`;

  tbody.prepend(tr);

  pendingEvidenceFile = null;
  document.getElementById('fileInput').value = '';
  document.getElementById('filePreview').style.display = 'none';
  document.getElementById('fileName').textContent = '';
  document.getElementById('evidenceDesc').value = '';
  document.getElementById('evidenceTypeSelect').value = 'Document';
  document.getElementById('evidenceKpiSelect').selectedIndex = 0;

  alert('Evidence submitted successfully! Awaiting manager approval.');
}

// ─── Settings: Time Format ────────────────────────────────────────────────
let use24Hour = false;

function setTimeFormat(is24) {
  use24Hour = is24;
  const btn12 = document.getElementById('btn12');
  const btn24 = document.getElementById('btn24');
  if (use24Hour) {
    btn24.style.background = 'var(--primary)';
    btn24.style.color = 'white';
    btn24.style.borderRadius = '0 6px 6px 0';
    btn12.style.background = 'transparent';
    btn12.style.color = 'var(--muted)';
    btn12.style.borderRadius = '6px 0 0 6px';
  } else {
    btn12.style.background = 'var(--primary)';
    btn12.style.color = 'white';
    btn12.style.borderRadius = '6px 0 0 6px';
    btn24.style.background = 'transparent';
    btn24.style.color = 'var(--muted)';
    btn24.style.borderRadius = '0 6px 6px 0';
  }
  updateTimePreview();
}

function updateTimePreview() {
  const now = new Date();
  let timeStr;
  if (use24Hour) {
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    timeStr = `${hh}:${mm}:${ss}`;
  } else {
    let h = now.getHours();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    timeStr = `${h}:${mm}:${ss} ${ampm}`;
  }
  const el = document.getElementById('timePreview');
  if (el) el.textContent = timeStr;
}

setInterval(updateTimePreview, 1000);

// ─── Settings: Show/Hide Password ─────────────────────────────────────────
function togglePwVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!input || !icon) return;
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('bi-eye', 'bi-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('bi-eye-slash', 'bi-eye');
  }
}

// ─── Settings: Password Strength ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  const pwInput = document.getElementById('settingsNewPw');
  if (pwInput) {
    pwInput.addEventListener('input', function() {
      const val = this.value;
      const fill = document.getElementById('pwStrengthFill');
      const lbl = document.getElementById('pwStrengthLabel');
      let strength = 0;
      if (val.length >= 8) strength++;
      if (/[A-Z]/.test(val)) strength++;
      if (/[0-9]/.test(val)) strength++;
      if (/[^A-Za-z0-9]/.test(val)) strength++;
      const colors = ['', '#e53e3e', '#f5a623', '#1db87a', '#1a3a5c'];
      const labels = ['', 'Weak', 'Fair', 'Strong', 'Very Strong'];
      fill.style.width = (strength * 25) + '%';
      fill.style.background = colors[strength] || 'transparent';
      lbl.textContent = val ? labels[strength] : '';
      lbl.style.color = colors[strength] || 'var(--muted)';
    });
  }
});

// ─── Settings: Password Update ────────────────────────────────────────────
function updatePassword() {
  const curr = document.getElementById('settingsCurrentPw').value;
  const nw = document.getElementById('settingsNewPw').value;
  const conf = document.getElementById('settingsConfirmPw').value;
  if (!curr || !nw || !conf) { alert('Please fill in all password fields.'); return; }
  if (nw !== conf) { alert('New passwords do not match.'); return; }
  if (nw.length < 8) { alert('Password must be at least 8 characters.'); return; }
  document.getElementById('settingsCurrentPw').value = '';
  document.getElementById('settingsNewPw').value = '';
  document.getElementById('settingsConfirmPw').value = '';
  ['settingsCurrentPw','settingsNewPw','settingsConfirmPw'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.type = 'password';
  });
  ['eyeIcon0','eyeIcon1','eyeIcon2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('bi-eye-slash'); el.classList.add('bi-eye'); }
  });
  document.getElementById('pwStrengthFill').style.width = '0';
  document.getElementById('pwStrengthLabel').textContent = '';
  alert('Password updated successfully!');
}

window.addEventListener('DOMContentLoaded', () => {
  renderDashboardKPIs();
  renderKpiTable();
  updateSlider();
  updateNotifBadge();
  setTimeFormat(false);
});
