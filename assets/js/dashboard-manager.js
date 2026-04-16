// ── STAFF MANAGEMENT ───────────────────────────────────────────────────────
const staffList = [
  { id:1, firstName:'Ali', lastName:'Samsuri', fullName:'Ali Samsuri', department:'Research Dept.', email:'ali.samsuri@university.edu.my', phone:'+60123456789', kpis:5, completion:80, initials:'AS', avatarColor:'#1a3a5c' },
  { id:2, firstName:'Nora', lastName:'Rahman', fullName:'Nora Rahman', department:'Teaching Dept.', email:'nora.rahman@university.edu.my', phone:'+60123456790', kpis:4, completion:100, initials:'NR', avatarColor:'#6b7a99' },
  { id:3, firstName:'Kevin', lastName:'Lim', fullName:'Kevin Lim', department:'Service Dept.', email:'kevin.lim@university.edu.my', phone:'+60123456791', kpis:3, completion:30, initials:'KL', avatarColor:'#e8a020' },
  { id:4, firstName:'Maya', lastName:'Halim', fullName:'Maya Halim', department:'Research Dept.', email:'maya.halim@university.edu.my', phone:'+60123456792', kpis:4, completion:55, initials:'MH', avatarColor:'#1db87a' }
];

let nextStaffId = 5;

function getRandomColor() {
  const colors = ['#1db87a', '#e8a020', '#e53e3e', '#3b82f6', '#9b59b6', '#f39c12', '#16a085', '#2980b9'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function renderStaffGrid() {
  const grid = document.getElementById('staffGrid');
  if (!grid) return;
  grid.innerHTML = staffList.map(staff => `
    <div class="col-md-3 staff-card" data-staff-name="${staff.fullName.toLowerCase()}">
      <div style="border:1px solid var(--border);border-radius:12px;padding:20px;text-align:center;cursor:pointer;transition:box-shadow 0.2s;" onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'" onmouseout="this.style.boxShadow=''">
        <div class="avatar" style="width:52px;height:52px;font-size:18px;margin:0 auto 12px;background:${staff.avatarColor};">${staff.initials}</div>
        <div class="staff-name" style="font-weight:600;font-size:14px;">${staff.fullName}</div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:12px;">${staff.department}</div>
        <div style="display:flex;justify-content:center;gap:12px;margin-bottom:12px;">
          <div style="text-align:center;"><div style="font-weight:700;font-size:16px;color:var(--primary);">${staff.kpis}</div><div style="font-size:11px;color:var(--muted);">KPIs</div></div>
          <div style="text-align:center;"><div style="font-weight:700;font-size:16px;color:${staff.completion >= 70 ? 'var(--success)' : staff.completion >= 50 ? 'var(--warning)' : 'var(--danger)'};">${staff.completion}%</div><div style="font-size:11px;color:var(--muted);">Done</div></div>
        </div>
        <div style="display:flex;gap:8px;justify-content:center;">
          <button class="btn-primary-custom" style="flex:1;font-size:12px;padding:6px 10px;" onclick="editStaff(${staff.id})"><i class="bi bi-pencil"></i> Edit</button>
          <button class="btn-primary-custom" style="flex:1;font-size:12px;padding:6px 10px;background:var(--danger);" onclick="deleteStaff(${staff.id})"><i class="bi bi-trash"></i> Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

function openAddStaffModal() {
  document.getElementById('staffFirstName').value = '';
  document.getElementById('staffLastName').value = '';
  document.getElementById('staffDepartment').value = '';
  document.getElementById('staffEmail').value = '';
  document.getElementById('staffPhone').value = '';
  new bootstrap.Modal(document.getElementById('staffModal')).show();
}

function saveNewStaff() {
  const firstName = document.getElementById('staffFirstName').value.trim();
  const lastName  = document.getElementById('staffLastName').value.trim();
  const department = document.getElementById('staffDepartment').value.trim();
  const email  = document.getElementById('staffEmail').value.trim();
  const phone  = document.getElementById('staffPhone').value.trim();

  if (!firstName) { alert('Please enter first name.'); return; }
  if (!lastName)  { alert('Please enter last name.'); return; }
  if (!department){ alert('Please enter department.'); return; }

  const fullName = firstName + ' ' + lastName;
  const initials = (firstName[0] + lastName[0]).toUpperCase();
  staffList.push({ id: nextStaffId++, firstName, lastName, fullName, department, email, phone, kpis:0, completion:0, initials, avatarColor: getRandomColor() });
  
  renderStaffGrid();
  updateKpiDepartmentDropdown(); 
  updateKpiStaffDropdown();
  alert(`✓ ${fullName} has been added to the staff!`);
}

function editStaff(id) {
  const staff = staffList.find(s => s.id === id);
  if (!staff) return;
  document.getElementById('editStaffId').value = id;
  document.getElementById('editStaffFirstName').value = staff.firstName;
  document.getElementById('editStaffLastName').value = staff.lastName;
  document.getElementById('editStaffDepartment').value = staff.department;
  document.getElementById('editStaffEmail').value = staff.email;
  document.getElementById('editStaffPhone').value = staff.phone;
  new bootstrap.Modal(document.getElementById('editStaffModal')).show();
}

function saveEditStaff() {
  const id = parseInt(document.getElementById('editStaffId').value);
  const staff = staffList.find(s => s.id === id);
  if (!staff) return;
  const firstName  = document.getElementById('editStaffFirstName').value.trim();
  const lastName   = document.getElementById('editStaffLastName').value.trim();
  const department = document.getElementById('editStaffDepartment').value.trim();
  if (!firstName || !lastName || !department) { alert('Please fill in all required fields.'); return; }
  
  staff.firstName  = firstName;
  staff.lastName   = lastName;
  staff.fullName   = firstName + ' ' + lastName;
  staff.department = department;
  staff.email      = document.getElementById('editStaffEmail').value.trim();
  staff.phone      = document.getElementById('editStaffPhone').value.trim();
  staff.initials   = (firstName[0] + lastName[0]).toUpperCase();
  
  renderStaffGrid();
  updateKpiDepartmentDropdown();
  updateKpiStaffDropdown();
  alert(`✓ ${staff.fullName} has been updated.`);
}

function deleteStaff(id) {
  const staff = staffList.find(s => s.id === id);
  if (!staff) return;
  if (confirm(`Are you sure you want to delete ${staff.fullName}?`)) {
    staffList.splice(staffList.findIndex(s => s.id === id), 1);
    renderStaffGrid();
    updateKpiDepartmentDropdown();
    updateKpiStaffDropdown();
    alert(`${staff.fullName} has been removed.`);
  }
}

// ── DYNAMIC DEPARTMENT & STAFF DROPDOWNS ──────────────────────────────────
function updateKpiDepartmentDropdown() {
  const deptSelect = document.getElementById('kpiDepartment');
  if (!deptSelect) return;
  const currentVal = deptSelect.value;
  deptSelect.innerHTML = '<option value="">-- Select Department --</option>';

  const depts = [...new Set(staffList.map(s => s.department).filter(Boolean))].sort();
  
  depts.forEach(dept => {
    const option = document.createElement('option');
    option.value = dept;
    option.textContent = dept;
    deptSelect.appendChild(option);
  });
  deptSelect.value = currentVal;
}

function updateKpiStaffDropdown() {
  const staffSelect = document.getElementById('kpiStaff');
  const deptSelect = document.getElementById('kpiDepartment');
  if (!staffSelect || !deptSelect) return;

  const selectedDept = deptSelect.value;
  const currentStaff = staffSelect.value;

  staffSelect.innerHTML = '<option value="">-- Select Staff --</option>';
  
  staffList.forEach(staff => {
    if (!selectedDept || staff.department === selectedDept) {
      const option = document.createElement('option');
      option.value = staff.fullName;
      option.textContent = staff.fullName;
      staffSelect.appendChild(option);
    }
  });

  staffSelect.value = currentStaff; 
}

function autoSelectDepartment() {
  const staffSelect = document.getElementById('kpiStaff');
  const deptSelect = document.getElementById('kpiDepartment');
  const selectedStaffName = staffSelect.value;

  if (selectedStaffName) {
    const staff = staffList.find(s => s.fullName === selectedStaffName);
    if (staff && staff.department) {
      deptSelect.value = staff.department;
      updateKpiStaffDropdown(); 
    }
  }
}

function filterStaffList(term) {
  const q = (term || '').trim().toLowerCase();
  document.querySelectorAll('#page-staff .staff-card').forEach(card => {
    const staffName = (card.dataset.staffName || '');
    card.style.display = (!q || staffName.includes(q)) ? '' : 'none';
  });
}

const pageTitles = { dashboard:'Dashboard', kpiManage:'Manage KPIs', verify:'Verify Evidence', staff:'Staff Members', profile:'My Profile', settings:'Settings' };

function showPage(id, el) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  document.getElementById('pageTitle').textContent = pageTitles[id];
  if (el) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
  }
}

const notifications = [
  { id:1, icon:'bi-exclamation-triangle-fill', color:'var(--danger)',  title:'Overdue KPI Alert',   msg:'Community Service is overdue by Kevin Lim.',            time:'2 hours ago', read:false },
  { id:2, icon:'bi-check-circle-fill',         color:'var(--success)', title:'KPI Achieved',        msg:'Nora Rahman completed Student Pass Rate at 100%.',      time:'1 day ago',   read:false },
  { id:3, icon:'bi-file-earmark-check-fill',   color:'var(--primary)', title:'Evidence Submitted',  msg:'Ali Samsuri submitted proof for Research Publications.', time:'2 days ago',  read:false },
];

function renderNotifications() {
  const list = document.getElementById('notifList');
  if (!list) return;
  const unread = notifications.filter(n => !n.read);
  document.getElementById('notifDot').style.display = unread.length ? 'block' : 'none';
  if (notifications.length === 0) {
    list.innerHTML = '<div style="padding:24px;text-align:center;color:var(--muted);font-size:13px;">No notifications</div>';
    return;
  }
  list.innerHTML = notifications.map(n => `
    <div onclick="markRead(${n.id})" style="padding:14px 18px;border-bottom:1px solid var(--border);cursor:pointer;background:${n.read ? 'white' : 'rgba(26,58,92,0.03)'};display:flex;gap:12px;align-items:flex-start;transition:background 0.15s;" onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background='${n.read ? 'white' : 'rgba(26,58,92,0.03)'}'">
      <div style="width:34px;height:34px;border-radius:50%;background:${n.color}22;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <i class="bi ${n.icon}" style="color:${n.color};font-size:14px;"></i>
      </div>
      <div style="flex:1;">
        <div style="font-weight:${n.read ? '500' : '700'};font-size:13px;">${n.title}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:2px;">${n.msg}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:4px;">${n.time}</div>
      </div>
      ${!n.read ? '<div style="width:8px;height:8px;border-radius:50%;background:var(--primary);flex-shrink:0;margin-top:4px;"></div>' : ''}
    </div>`).join('');
}

function markRead(id) {
  const n = notifications.find(x => x.id === id);
  if (n) n.read = true;
  renderNotifications();
}

function clearAllNotifications() {
  notifications.length = 0;
  renderNotifications();
}

function toggleNotifPanel() {
  const panel = document.getElementById('notifPanel');
  const isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) renderNotifications();
}

document.addEventListener('click', function(e) {
  const btn   = document.getElementById('notifBtn');
  const panel = document.getElementById('notifPanel');
  if (panel && btn && !btn.contains(e.target) && !panel.contains(e.target)) {
    panel.style.display = 'none';
  }
});

// ── PROFILE ────────────────────────────────────────────────────────────────
let pendingProfilePicDataUrl = null;

function previewProfilePic(input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    pendingProfilePicDataUrl = e.target.result;
    document.getElementById('profileAvatarDisplay').innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
  };
  reader.readAsDataURL(input.files[0]);
}

function saveProfileChanges(event) {
  const firstName = document.getElementById('profileFirstName').value.trim();
  const lastName  = document.getElementById('profileLastName').value.trim();
  const fullName  = [firstName, lastName].filter(Boolean).join(' ');
  const initials  = [(firstName[0] || ''), (lastName[0] || '')].join('').toUpperCase();

  if (fullName) document.getElementById('profileDisplayName').textContent = 'Dr. ' + fullName;
  if (fullName) document.getElementById('sidebarUserName').textContent = 'Dr. ' + fullName;

  const topbar  = document.getElementById('topbarAvatar');
  const sidebar = document.getElementById('sidebarAvatar');

  if (pendingProfilePicDataUrl) {
    const imgTag = `<img src="${pendingProfilePicDataUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
    topbar.innerHTML  = imgTag;
    sidebar.innerHTML = imgTag;
  } else if (initials) {
    topbar.textContent  = initials;
    sidebar.textContent = initials;
  }

  const btn  = event.currentTarget;
  const orig = btn.innerHTML;
  btn.innerHTML = '<i class="bi bi-check-all"></i> Saved!';
  btn.style.background = 'var(--success)';
  setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; }, 2000);
}

// ── KPI TABLE helpers ──────────────────────────────────────────────────────
let globalPendingCount = 3;

function deleteRow(btn) {
  if (confirm('Are you sure you want to delete this KPI?')) {
    btn.closest('tr').remove();
  }
}

function updateVerifyPendingCount() {
  const text = `${globalPendingCount} pending`;
  const el1 = document.getElementById('verifyPendingCount');
  const el2 = document.getElementById('pendingCount');
  const nav = document.getElementById('verifyNavBadge');
  if (el1) el1.textContent = text;
  if (el2) el2.textContent = text;
  if (nav) {
    nav.textContent = globalPendingCount;
    nav.style.display = globalPendingCount > 0 ? 'inline-block' : 'none';
  }
}

function verifyEvidence(btn, action) {
  const clickedRow = btn.closest('tr');
  const staffName  = clickedRow.cells[0].textContent.trim();
  const kpiName    = clickedRow.cells[1].textContent.trim();

  const allRows = Array.from(document.querySelectorAll('.kpi-table tbody tr'));
  const rowsToUpdate = [clickedRow];

  allRows.forEach(row => {
    if (row !== clickedRow && row.cells.length >= 5) {
      const rStaff = row.cells[0].textContent.trim();
      const rKpi   = row.cells[1].textContent.trim();
      if (rStaff === staffName && rKpi === kpiName && row.querySelector('button[onclick*="verifyEvidence"]')) {
        rowsToUpdate.push(row);
      }
    }
  });

  rowsToUpdate.forEach(row => {
    const actionCell = row.cells[row.cells.length - 1];
    actionCell.innerHTML = action === 'Approved'
      ? '<span class="badge-status achieved"><i class="bi bi-check-circle-fill me-1"></i>Approved</span>'
      : '<span class="badge-status overdue"><i class="bi bi-x-circle-fill me-1"></i>Rejected</span>';
    setTimeout(() => { if (row.parentNode) row.remove(); }, 800);
  });

  if (globalPendingCount > 0) globalPendingCount--;
  updateVerifyPendingCount();
}

// ── KPI MODAL ──────────────────────────────────────────────────────────────
function openNewKPI() {
  window._editingRow = null;
  document.getElementById('kpiModalTitle').textContent = 'New KPI';
  document.getElementById('kpiSaveBtn').innerHTML = '<i class="bi bi-plus-lg"></i> Create KPI';
  document.getElementById('kpiEditRow').value = '';
  
  ['kpiTitle','kpiDesc','kpiTarget','kpiStartDate','kpiDeadline'].forEach(id => document.getElementById(id).value = '');
  
  document.getElementById('kpiDepartment').value = '';
  updateKpiStaffDropdown();
  document.getElementById('kpiStaff').value = '';
  
  new bootstrap.Modal(document.getElementById('kpiModal')).show();
}

function openEditKPI(btn) {
  const row   = btn.closest('tr');
  const cells = row.cells;

  const titleEl = cells[1].querySelector('strong');
  const descEl  = cells[1].querySelector('span');
  const title   = titleEl ? titleEl.textContent.trim() : '';
  const desc    = descEl  ? descEl.textContent.trim()  : '';

  const staffChip = cells[2].querySelector('.staff-chip');
  const staffName = staffChip ? staffChip.textContent.trim() : '';

  const department = cells[3].textContent.trim();
  const target     = cells[4].textContent.trim();

  function toInputDate(str) {
    if (!str || str === '--') return '';
    const parts = str.trim().split('/');
    return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : '';
  }

  document.getElementById('kpiModalTitle').textContent = 'Edit KPI';
  document.getElementById('kpiSaveBtn').innerHTML = '<i class="bi bi-check-lg"></i> Save Changes';
  document.getElementById('kpiTitle').value      = title;
  document.getElementById('kpiDesc').value       = desc;

  const deptDropdown = document.getElementById('kpiDepartment');
  if (department && !Array.from(deptDropdown.options).some(opt => opt.value === department)) {
    const newOpt = document.createElement('option');
    newOpt.value = department;
    newOpt.textContent = department;
    deptDropdown.appendChild(newOpt);
  }
  deptDropdown.value = department;
  
  updateKpiStaffDropdown();

  document.getElementById('kpiTarget').value     = target;
  document.getElementById('kpiStartDate').value  = toInputDate(cells[5].textContent.trim());
  document.getElementById('kpiDeadline').value   = toInputDate(cells[6].textContent.trim());

  const staffSel = document.getElementById('kpiStaff');
  staffSel.value = '';
  Array.from(staffSel.options).forEach(opt => { if (opt.text.trim() === staffName) staffSel.value = opt.value; });

  window._editingRow = row;
  new bootstrap.Modal(document.getElementById('kpiModal')).show();
}

let kpiCount = 4;

function formatDate(dateStr) {
  if (!dateStr) return '--';
  const date = new Date(dateStr);
  if (isNaN(date)) return '--';
  return `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${date.getFullYear()}`;
}

function saveKPI() {
  const title      = document.getElementById('kpiTitle').value.trim();
  const desc       = document.getElementById('kpiDesc').value.trim();
  const department = document.getElementById('kpiDepartment').value.trim();
  const staff      = document.getElementById('kpiStaff').value.trim();
  const target     = document.getElementById('kpiTarget').value.trim();
  const startDate  = formatDate(document.getElementById('kpiStartDate').value);
  const deadline   = formatDate(document.getElementById('kpiDeadline').value);

  if (!title) { alert('Please add a KPI title before saving.'); return; }
  if (!department) { alert('Please select a department.'); return; }
  if (!staff) { alert('Please assign to a staff member.'); return; }

  const staffInitials = staff.split(' ').map(n => n[0]||'').slice(0,2).join('').toUpperCase();

  if (window._editingRow) {
    const row   = window._editingRow;
    const cells = row.cells;
    cells[1].innerHTML = `<strong>${title}</strong><br><span style="font-size:12px;color:var(--muted);">${desc}</span>`;
    cells[2].innerHTML = `<span class="staff-chip"><span class="av">${staffInitials}</span>${staff}</span>`;
    cells[3].textContent = department;
    cells[4].textContent = target      || 'Target';
    cells[5].textContent = startDate;
    cells[6].textContent = deadline;
    window._editingRow = null;
  } else {
    kpiCount++;
    const tbody = document.getElementById('kpiTableBody');
    const tr = document.createElement('tr');
    tr.dataset.staff = staff;
    tr.innerHTML = `
      <td>${kpiCount}</td>
      <td><strong>${title}</strong><br><span style="font-size:12px;color:var(--muted);">${desc || 'Description here'}</span></td>
      <td><span class="staff-chip"><span class="av">${staffInitials}</span>${staff}</span></td>
      <td>${department}</td>
      <td>${target     || 'Target'}</td>
      <td>${startDate}</td>
      <td>${deadline}</td>
      <td><span class="badge-status pending">Pending</span></td>
      <td>
        <button class="action-btn" title="Edit"   onclick="openEditKPI(this)"><i class="bi bi-pencil"></i></button>
        <button class="action-btn" title="Delete" onclick="deleteRow(this)"><i class="bi bi-trash"></i></button>
      </td>`;
    tbody.appendChild(tr);

    const recent = document.getElementById('recentKpiBody');
    if (recent) {
      const recentRow = document.createElement('tr');
      recentRow.innerHTML = `
        <td><strong>${title}</strong></td>
        <td><span class="staff-chip"><span class="av">${staffInitials}</span>${staff}</span></td>
        <td>--</td>
        <td><span class="badge-status pending">Pending</span></td>`;
      recent.insertBefore(recentRow, recent.firstChild);
      while (recent.children.length > 6) recent.removeChild(recent.lastChild);
    }
  }

  const searchInput = document.getElementById('kpiSearch');
  if (searchInput) filterKpiTable(searchInput.value);
}

function filterKpiTable(term) {
  const searchTerm     = (term || '').trim().toLowerCase();
  const statusFilter   = (document.getElementById('kpiStatusFilter')?.value   || '').trim();
  const categoryFilter = (document.getElementById('kpiCategoryFilter')?.value || '').trim();
  document.querySelectorAll('#kpiTableBody tr').forEach(r => {
    const titleText    = (r.cells[1]?.textContent || '').toLowerCase();
    const statusText   = (r.cells[7]?.textContent || '').trim();
    const deptText     = (r.cells[3]?.textContent || '').toLowerCase();
    const matchSearch  = !searchTerm  || titleText.includes(searchTerm);
    const matchStatus  = !statusFilter   || statusText.includes(statusFilter);
    const matchCat     = !categoryFilter || deptText.includes(categoryFilter.toLowerCase());
    r.style.display    = (matchSearch && matchStatus && matchCat) ? '' : 'none';
  });
}

// ── ACHIEVEMENT CHART ──────────────────────────────────────────────────────
const achievementData = {
  month:   { labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'], achieved:[3,5,4,6,5,7,6,8], inProgress:[2,2,3,2,3,2,3,2], overdue:[1,0,1,1,0,1,0,1] },
  quarter: { labels:['Q1','Q2','Q3','Q4'],                             achieved:[12,16,18,10],        inProgress:[5,6,7,4],          overdue:[2,2,1,3] },
  year:    { labels:['2021','2022','2023','2024','2025'],              achieved:[30,38,45,52,48],     inProgress:[10,12,14,16,14],   overdue:[5,4,6,3,5] }
};

let achievementChart;

function filterAchievementChart(period) {
  const d = achievementData[period] || achievementData.month;
  achievementChart.data.labels = d.labels;
  achievementChart.data.datasets[0].data = d.achieved;
  achievementChart.data.datasets[1].data = d.inProgress;
  achievementChart.data.datasets[2].data = d.overdue;
  achievementChart.update();
}

// ── DOMContentLoaded ───────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  renderStaffGrid();
  updateKpiDepartmentDropdown();
  updateKpiStaffDropdown();

  const initialKPIs = [
    { num:1, title:'Research Publications', desc:'Publish 3 journal papers',    staff:'Ali Samsuri', dept:'Research Dept.', target:'3 papers', startDate:'01/01/2025', deadline:'31/12/2025', status:'in-progress', initials:'AS' },
    { num:2, title:'Student Pass Rate',     desc:'Maintain 90% pass rate',      staff:'Nora Rahman',  dept:'Teaching Dept.', target:'90%',     startDate:'01/01/2025', deadline:'30/06/2025', status:'achieved',    initials:'NR' },
    { num:3, title:'Community Service',     desc:'5 outreach programs',          staff:'Kevin Lim',    dept:'Service Dept.',  target:'5 events', startDate:'01/01/2025', deadline:'31/03/2025', status:'overdue',      initials:'KL' },
    { num:4, title:'Industry Grants',       desc:'Secure 2 industry grants',     staff:'Maya Halim',   dept:'Research Dept.', target:'2 grants', startDate:'01/01/2025', deadline:'30/09/2025', status:'in-progress', initials:'MH' }
  ];

  const tbody = document.getElementById('kpiTableBody');
  if (tbody) {
    initialKPIs.forEach(kpi => {
      const tr = document.createElement('tr');
      tr.dataset.staff = kpi.staff;
      const statusHTML = kpi.status === 'achieved'
        ? '<span class="badge-status achieved">Achieved</span>'
        : kpi.status === 'overdue'
          ? '<span class="badge-status overdue">Overdue</span>'
          : '<span class="badge-status in-progress">In Progress</span>';
      tr.innerHTML = `
        <td>${kpi.num}</td>
        <td><strong>${kpi.title}</strong><br><span style="font-size:12px;color:var(--muted);">${kpi.desc}</span></td>
        <td><span class="staff-chip"><span class="av">${kpi.initials}</span>${kpi.staff}</span></td>
        <td>${kpi.dept}</td>
        <td>${kpi.target}</td>
        <td>${kpi.startDate}</td>
        <td>${kpi.deadline}</td>
        <td>${statusHTML}</td>
        <td>
          <button class="action-btn" title="Edit"   onclick="openEditKPI(this)"><i class="bi bi-pencil"></i></button>
          <button class="action-btn" title="Delete" onclick="deleteRow(this)"><i class="bi bi-trash"></i></button>
        </td>`;
      tbody.appendChild(tr);
    });
    kpiCount = 4;
  }

  document.getElementById('kpiSearch')?.addEventListener('input', e => filterKpiTable(e.target.value));
  document.getElementById('staffSearch')?.addEventListener('input', e => filterStaffList(e.target.value));
  document.getElementById('kpiStatusFilter')?.addEventListener('change', () => filterKpiTable(document.getElementById('kpiSearch')?.value || ''));
  document.getElementById('kpiCategoryFilter')?.addEventListener('change', () => filterKpiTable(document.getElementById('kpiSearch')?.value || ''));

  updateVerifyPendingCount();
  renderNotifications();

  achievementChart = new Chart(document.getElementById('achievementChart'), {
    type: 'bar',
    data: {
      labels: achievementData.month.labels,
      datasets: [
        { label:'Achieved',    data: achievementData.month.achieved,    backgroundColor:'#1db87a', borderRadius:6 },
        { label:'In Progress', data: achievementData.month.inProgress,  backgroundColor:'#e8a020', borderRadius:6 },
        { label:'Overdue',     data: achievementData.month.overdue,     backgroundColor:'#e53e3e', borderRadius:6 }
      ]
    },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', labels:{ font:{ family:'DM Sans', size:11 }, boxWidth:10, padding:12 } } }, scales:{ x:{ grid:{ display:false }, ticks:{ font:{ family:'DM Sans', size:11 } } }, y:{ grid:{ color:'#f0f0f0' }, ticks:{ font:{ family:'DM Sans', size:11 } } } } }
  });

  new Chart(document.getElementById('categoryChart'), {
    type: 'doughnut',
    data: {
      labels: ['Research','Teaching','Service','Admin'],
      datasets: [{ data:[10,8,4,2], backgroundColor:['#1a3a5c','#1db87a','#e8a020','#6b7a99'], borderWidth:0 }]
    },
    options: { responsive:true, maintainAspectRatio:false, cutout:'65%', plugins:{ legend:{ position:'bottom', labels:{ font:{ family:'DM Sans', size:11 }, boxWidth:10, padding:10 } } } }
  });

  updateTimeClock();
  setInterval(updateTimeClock, 1000);
});

// ── SETTINGS: TIME FORMAT ──────────────────────────────────────────────────
let currentTimeFormat = '12h';

function setTimeFormat(fmt) {
  currentTimeFormat = fmt;
  const btn12 = document.getElementById('btn12h');
  const btn24 = document.getElementById('btn24h');
  if (fmt === '12h') {
    btn12.style.background = 'var(--primary)'; btn12.style.color = 'white';
    btn24.style.background = 'white';          btn24.style.color = 'var(--muted)';
  } else {
    btn24.style.background = 'var(--primary)'; btn24.style.color = 'white';
    btn12.style.background = 'white';          btn12.style.color = 'var(--muted)';
  }
  updateTimeClock();
}

function updateTimeClock() {
  const el = document.getElementById('timePreview');
  if (!el) return;
  const now = new Date();
  let timeStr;
  if (currentTimeFormat === '12h') {
    let h = now.getHours();
    const m    = String(now.getMinutes()).padStart(2,'0');
    const s    = String(now.getSeconds()).padStart(2,'0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    timeStr = `${h}:${m}:${s} ${ampm}`;
  } else {
    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const s = String(now.getSeconds()).padStart(2,'0');
    timeStr = `${h}:${m}:${s}`;
  }
  el.textContent = timeStr;
}

// ── SETTINGS: SECURITY ─────────────────────────────────────────────────────
function togglePwdVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon  = document.getElementById(iconId);
  if (input.type === 'password') { input.type = 'text';     icon.className = 'bi bi-eye-slash'; }
  else                           { input.type = 'password'; icon.className = 'bi bi-eye';       }
}

function checkPwdStrength(val) {
  const bar   = document.getElementById('pwdStrengthBar');
  const label = document.getElementById('pwdStrengthLabel');
  if (!bar || !label) return;
  let score = 0;
  if (val.length >= 8)          score++;
  if (/[A-Z]/.test(val))        score++;
  if (/[0-9]/.test(val))        score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const levels = [
    { pct:'0%',   color:'',             text:'' },
    { pct:'25%',  color:'var(--danger)',   text:'Weak' },
    { pct:'50%',  color:'var(--warning)',  text:'Fair' },
    { pct:'75%',  color:'#3b82f6',        text:'Good' },
    { pct:'100%', color:'var(--success)', text:'Strong' },
  ];
  const lvl = levels[score] || levels[0];
  bar.style.width      = val.length === 0 ? '0%' : lvl.pct;
  bar.style.background = lvl.color;
  label.textContent    = val.length === 0 ? '' : lvl.text;
  label.style.color    = lvl.color;
}

function updatePassword() {
  const current = document.getElementById('secCurrentPwd').value.trim();
  const newPwd  = document.getElementById('secNewPwd').value.trim();
  const confirm = document.getElementById('secConfirmPwd').value.trim();
  const matchEl = document.getElementById('pwdMatchMsg');

  if (!current)         { alert('Please enter your current password.'); return; }
  if (newPwd.length < 8){ alert('New password must be at least 8 characters.'); return; }
  if (newPwd !== confirm){
    matchEl.textContent = 'Passwords do not match.';
    matchEl.style.color = 'var(--danger)';
    return;
  }
  matchEl.textContent = '✓ Passwords match.';
  matchEl.style.color = 'var(--success)';

  const btn  = document.querySelector('[onclick="updatePassword()"]');
  const orig = btn.innerHTML;
  btn.innerHTML = '<i class="bi bi-check-all"></i> Password Updated!';
  btn.style.background = 'var(--success)';
  setTimeout(() => {
    btn.innerHTML = orig;
    btn.style.background = '';
    document.getElementById('secCurrentPwd').value = '';
    document.getElementById('secNewPwd').value     = '';
    document.getElementById('secConfirmPwd').value = '';
    matchEl.textContent = '';
    checkPwdStrength('');
  }, 2500);
}
