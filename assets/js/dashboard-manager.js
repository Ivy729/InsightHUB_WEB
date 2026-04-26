const staffList = [
  {
    id: 1,
    firstName: "Ali",
    lastName: "Samsuri",
    department: "Research Dept.",
    email: "ali.samsuri@university.edu.my",
    phone: "+60123456789",
    kpis: 5,
    completion: 80,
    avatarColor: "#1a3a5c"
  },
  {
    id: 2,
    firstName: "Nora",
    lastName: "Rahman",
    department: "Teaching Dept.",
    email: "nora.rahman@university.edu.my",
    phone: "+60123456790",
    kpis: 4,
    completion: 100,
    avatarColor: "#6b7a99"
  },
  {
    id: 3,
    firstName: "Kevin",
    lastName: "Lim",
    department: "Service Dept.",
    email: "kevin.lim@university.edu.my",
    phone: "+60123456791",
    kpis: 3,
    completion: 30,
    avatarColor: "#e8a020"
  },
  {
    id: 4,
    firstName: "Maya",
    lastName: "Halim",
    department: "Research Dept.",
    email: "maya.halim@university.edu.my",
    phone: "+60123456792",
    kpis: 4,
    completion: 55,
    avatarColor: "#1db87a"
  }
];

const initialKpiList = [
  {
    num: 1,
    title: "Research Publications",
    desc: "Publish 3 journal papers",
    staff: "Ali Samsuri",
    dept: "Research Dept.",
    target: "3 papers",
    startDate: "01/01/2025",
    deadline: "31/12/2025",
    status: "in-progress"
  },
  {
    num: 2,
    title: "Student Pass Rate",
    desc: "Maintain 90% pass rate",
    staff: "Nora Rahman",
    dept: "Teaching Dept.",
    target: "90%",
    startDate: "01/01/2025",
    deadline: "30/06/2025",
    status: "achieved"
  },
  {
    num: 3,
    title: "Community Service",
    desc: "5 outreach programs",
    staff: "Kevin Lim",
    dept: "Service Dept.",
    target: "5 events",
    startDate: "01/01/2025",
    deadline: "31/03/2025",
    status: "overdue"
  },
  {
    num: 4,
    title: "Industry Grants",
    desc: "Secure 2 industry grants",
    staff: "Maya Halim",
    dept: "Research Dept.",
    target: "2 grants",
    startDate: "01/01/2025",
    deadline: "30/09/2025",
    status: "in-progress"
  }
];

const notifications = [
  {
    id: 1,
    title: "Overdue KPI Alert",
    msg: "Community Service is overdue by Kevin Lim.",
    time: "2 hours ago",
    read: false,
    icon: "bi-exclamation-triangle-fill",
    color: "var(--danger)"
  },
  {
    id: 2,
    title: "KPI Achieved",
    msg: "Nora Rahman completed Student Pass Rate at 100%.",
    time: "1 day ago",
    read: false,
    icon: "bi-check-circle-fill",
    color: "var(--success)"
  },
  {
    id: 3,
    title: "Evidence Submitted",
    msg: "Ali Samsuri submitted proof for Research Publications.",
    time: "2 days ago",
    read: false,
    icon: "bi-file-earmark-check-fill",
    color: "var(--primary)"
  }
];

const pageTitles = {
  dashboard: "Dashboard",
  kpiManage: "Manage KPIs",
  verify: "Verify Evidence",
  staff: "Staff Members",
  profile: "My Profile",
  settings: "Settings"
};

const achievementData = {
  month: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
    achieved: [3, 5, 4, 6, 5, 7, 6, 8],
    inProgress: [2, 2, 3, 2, 3, 2, 3, 2],
    overdue: [1, 0, 1, 1, 0, 1, 0, 1]
  },
  quarter: {
    labels: ["Q1", "Q2", "Q3", "Q4"],
    achieved: [12, 16, 18, 10],
    inProgress: [5, 6, 7, 4],
    overdue: [2, 2, 1, 3]
  },
  year: {
    labels: ["2021", "2022", "2023", "2024", "2025"],
    achieved: [30, 38, 45, 52, 48],
    inProgress: [10, 12, 14, 16, 14],
    overdue: [5, 4, 6, 3, 5]
  }
};

let nextStaffId = 5;
let editingKpiRow = null;
let pendingProfilePic = null;
let achievementChart = null;
let currentTimeFormat = "12h";

function openModal(modalId) {
  const modalEl = document.getElementById(modalId);
  if (!modalEl) return;

  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

function clearInputFields(ids) {
  ids.forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.value = "";
  });
}

function getFullName(staff) {
  return `${staff.firstName} ${staff.lastName}`.trim();
}

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0] || "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getRandomColor() {
  const colors = ["#1db87a", "#e8a020", "#e53e3e", "#3b82f6", "#9b59b6", "#16a085"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function showPage(pageId, clickedItem) {
  const sections = document.querySelectorAll(".page-section");
  sections.forEach((section) => section.classList.remove("active"));

  const target = document.getElementById("page-" + pageId);
  if (target) {
    target.classList.add("active");
  }

  const title = document.getElementById("pageTitle");
  if (title && pageTitles[pageId]) {
    title.textContent = pageTitles[pageId];
  }

  if (clickedItem) {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    clickedItem.classList.add("active");
  }

  const notifPanel = document.getElementById("notifPanel");
  if (notifPanel) {
    notifPanel.style.display = "none";
  }
}

function renderStaffGrid() {
  const grid = document.getElementById("staffGrid");
  if (!grid) return;

  grid.innerHTML = "";

  staffList.forEach((staff) => {
    const fullName = getFullName(staff);
    const initials = getInitials(fullName);

    const col = document.createElement("div");
    col.className = "col-md-3 staff-card";
    col.dataset.staffName = fullName.toLowerCase();

    col.innerHTML = `
      <div style="border:1px solid var(--border);border-radius:12px;padding:20px;text-align:center;">
        <div class="avatar" style="width:52px;height:52px;font-size:18px;margin:0 auto 12px;background:${staff.avatarColor};">${initials}</div>
        <div class="staff-name" style="font-weight:600;font-size:14px;">${fullName}</div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:12px;">${staff.department}</div>

        <div style="display:flex;justify-content:center;gap:12px;margin-bottom:12px;">
          <div style="text-align:center;">
            <div style="font-weight:700;font-size:16px;color:var(--primary);">${staff.kpis}</div>
            <div style="font-size:11px;color:var(--muted);">KPIs</div>
          </div>
          <div style="text-align:center;">
            <div style="font-weight:700;font-size:16px;color:${staff.completion >= 70 ? "var(--success)" : staff.completion >= 50 ? "var(--warning)" : "var(--danger)"};">${staff.completion}%</div>
            <div style="font-size:11px;color:var(--muted);">Done</div>
          </div>
        </div>

        <div style="display:flex;gap:8px;justify-content:center;">
          <button class="btn-primary-custom" style="flex:1;font-size:12px;padding:6px 10px;" onclick="editStaff(${staff.id})">
            <i class="bi bi-pencil"></i> Edit
          </button>
          <button class="btn-primary-custom" style="flex:1;font-size:12px;padding:6px 10px;background:var(--danger);" onclick="deleteStaff(${staff.id})">
            <i class="bi bi-trash"></i> Delete
          </button>
        </div>
      </div>
    `;

    grid.appendChild(col);
  });
}

function filterStaffList(term) {
  const query = (term || "").trim().toLowerCase();

  document.querySelectorAll("#page-staff .staff-card").forEach((card) => {
    const name = card.dataset.staffName || "";
    card.style.display = !query || name.includes(query) ? "" : "none";
  });
}

function openAddStaffModal() {
  clearInputFields(["staffFirstName", "staffLastName", "staffDepartment", "staffEmail", "staffPhone"]);
  openModal("staffModal");
}

function hideModal(modalId) {
  const modalEl = document.getElementById(modalId);
  if (!modalEl) return;

  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) {
    modal.hide();
  }
}

function saveNewStaff() {
  const firstName = document.getElementById("staffFirstName").value.trim();
  const lastName = document.getElementById("staffLastName").value.trim();
  const department = document.getElementById("staffDepartment").value.trim();
  const email = document.getElementById("staffEmail").value.trim();
  const phone = document.getElementById("staffPhone").value.trim();

  if (!firstName || !lastName || !department) {
    alert("Please fill in first name, last name, and department.");
    return;
  }

  staffList.push({
    id: nextStaffId++,
    firstName,
    lastName,
    department,
    email,
    phone,
    kpis: 0,
    completion: 0,
    avatarColor: getRandomColor()
  });

  renderStaffGrid();
  updateKpiDepartmentDropdown();
  updateKpiStaffDropdown();
  hideModal("staffModal");
  alert("New staff member added.");
}

function editStaff(id) {
  const staff = staffList.find((item) => item.id === id);
  if (!staff) return;

  document.getElementById("editStaffId").value = staff.id;
  document.getElementById("editStaffFirstName").value = staff.firstName;
  document.getElementById("editStaffLastName").value = staff.lastName;
  document.getElementById("editStaffDepartment").value = staff.department;
  document.getElementById("editStaffEmail").value = staff.email;
  document.getElementById("editStaffPhone").value = staff.phone;

  openModal("editStaffModal");
}

function saveEditStaff() {
  const id = parseInt(document.getElementById("editStaffId").value, 10);
  const staff = staffList.find((item) => item.id === id);
  if (!staff) return;

  const firstName = document.getElementById("editStaffFirstName").value.trim();
  const lastName = document.getElementById("editStaffLastName").value.trim();
  const department = document.getElementById("editStaffDepartment").value.trim();

  if (!firstName || !lastName || !department) {
    alert("Please fill in all required fields.");
    return;
  }

  staff.firstName = firstName;
  staff.lastName = lastName;
  staff.department = department;
  staff.email = document.getElementById("editStaffEmail").value.trim();
  staff.phone = document.getElementById("editStaffPhone").value.trim();

  renderStaffGrid();
  updateKpiDepartmentDropdown();
  updateKpiStaffDropdown();
  hideModal("editStaffModal");
  alert("Staff details updated.");
}

function deleteStaff(id) {
  const index = staffList.findIndex((item) => item.id === id);
  if (index === -1) return;

  const fullName = getFullName(staffList[index]);

  if (!confirm(`Delete ${fullName}?`)) {
    return;
  }

  staffList.splice(index, 1);
  renderStaffGrid();
  updateKpiDepartmentDropdown();
  updateKpiStaffDropdown();
}

function updateKpiDepartmentDropdown() {
  const deptSelect = document.getElementById("kpiDepartment");
  if (!deptSelect) return;

  const currentValue = deptSelect.value;
  const deptList = [...new Set(staffList.map((staff) => staff.department).filter(Boolean))].sort();

  deptSelect.innerHTML = `<option value="">-- Select Department --</option>`;

  deptList.forEach((dept) => {
    const option = document.createElement("option");
    option.value = dept;
    option.textContent = dept;
    deptSelect.appendChild(option);
  });

  if (deptList.includes(currentValue)) {
    deptSelect.value = currentValue;
  }
}

function updateKpiStaffDropdown() {
  const deptSelect = document.getElementById("kpiDepartment");
  const staffSelect = document.getElementById("kpiStaff");
  if (!deptSelect || !staffSelect) return;

  const selectedDept = deptSelect.value;
  const currentValue = staffSelect.value;

  staffSelect.innerHTML = `<option value="">-- Select Staff --</option>`;

  staffList.forEach((staff) => {
    if (!selectedDept || staff.department === selectedDept) {
      const option = document.createElement("option");
      option.value = getFullName(staff);
      option.textContent = getFullName(staff);
      staffSelect.appendChild(option);
    }
  });

  const availableValues = Array.from(staffSelect.options).map((option) => option.value);
  if (availableValues.includes(currentValue)) {
    staffSelect.value = currentValue;
  }
}

function autoSelectDepartment() {
  const staffSelect = document.getElementById("kpiStaff");
  const deptSelect = document.getElementById("kpiDepartment");
  if (!staffSelect || !deptSelect) return;

  const staffName = staffSelect.value;
  const foundStaff = staffList.find((staff) => getFullName(staff) === staffName);

  if (foundStaff) {
    deptSelect.value = foundStaff.department;
    updateKpiStaffDropdown();
    staffSelect.value = staffName;
  }
}

function renderNotifications() {
  const list = document.getElementById("notifList");
  const dot = document.getElementById("notifDot");
  if (!list || !dot) return;

  dot.style.display = notifications.some((item) => !item.read) ? "block" : "none";

  if (notifications.length === 0) {
    list.innerHTML = `<div style="padding:24px;text-align:center;color:var(--muted);font-size:13px;">No notifications</div>`;
    return;
  }

  list.innerHTML = notifications
    .map((item) => {
      return `
        <div onclick="markRead(${item.id})" style="padding:14px 18px;border-bottom:1px solid var(--border);cursor:pointer;background:${item.read ? "white" : "rgba(26,58,92,0.03)"};display:flex;gap:12px;align-items:flex-start;">
          <div style="width:34px;height:34px;border-radius:50%;background:${item.color}22;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <i class="bi ${item.icon}" style="color:${item.color};font-size:14px;"></i>
          </div>
          <div style="flex:1;">
            <div style="font-weight:${item.read ? "500" : "700"};font-size:13px;">${item.title}</div>
            <div style="font-size:12px;color:var(--muted);margin-top:2px;">${item.msg}</div>
            <div style="font-size:11px;color:var(--muted);margin-top:4px;">${item.time}</div>
          </div>
          ${item.read ? "" : `<div style="width:8px;height:8px;border-radius:50%;background:var(--primary);margin-top:4px;"></div>`}
        </div>
      `;
    })
    .join("");
}

function markRead(id) {
  const target = notifications.find((item) => item.id === id);
  if (!target) return;

  target.read = true;
  renderNotifications();
}

function clearAllNotifications() {
  notifications.length = 0;
  renderNotifications();
}

function toggleNotifPanel() {
  const panel = document.getElementById("notifPanel");
  if (!panel) return;

  panel.style.display = panel.style.display === "block" ? "none" : "block";

  if (panel.style.display === "block") {
    renderNotifications();
  }
}

document.addEventListener("click", function (event) {
  const btn = document.getElementById("notifBtn");
  const panel = document.getElementById("notifPanel");

  if (!btn || !panel) return;

  if (!btn.contains(event.target) && !panel.contains(event.target)) {
    panel.style.display = "none";
  }
});

function previewProfilePic(input) {
  if (!input.files || !input.files[0]) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    pendingProfilePic = event.target.result;

    const display = document.getElementById("profileAvatarDisplay");
    if (display) {
      display.innerHTML = `<img src="${pendingProfilePic}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    }
  };

  reader.readAsDataURL(input.files[0]);
}

function saveProfileChanges(event) {
  const firstName = document.getElementById("profileFirstName").value.trim();
  const lastName = document.getElementById("profileLastName").value.trim();
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = getInitials(fullName);

  if (fullName) {
    const displayName = document.getElementById("profileDisplayName");
    const sidebarName = document.getElementById("sidebarUserName");

    if (displayName) displayName.textContent = "Dr. " + fullName;
    if (sidebarName) sidebarName.textContent = "Dr. " + fullName;
  }

  const topbarAvatar = document.getElementById("topbarAvatar");
  const sidebarAvatar = document.getElementById("sidebarAvatar");

  if (pendingProfilePic) {
    const imgHtml = `<img src="${pendingProfilePic}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    if (topbarAvatar) topbarAvatar.innerHTML = imgHtml;
    if (sidebarAvatar) sidebarAvatar.innerHTML = imgHtml;
  } else if (initials) {
    if (topbarAvatar) topbarAvatar.textContent = initials;
    if (sidebarAvatar) sidebarAvatar.textContent = initials;
  }

  if (event && event.currentTarget) {
    const btn = event.currentTarget;
    const oldText = btn.innerHTML;

    btn.innerHTML = `<i class="bi bi-check-lg"></i> Saved`;
    btn.style.background = "var(--success)";

    setTimeout(() => {
      btn.innerHTML = oldText;
      btn.style.background = "";
    }, 1500);
  }
}

function getStatusBadge(status) {
  if (status === "achieved") {
    return `<span class="badge-status achieved">Achieved</span>`;
  }
  if (status === "overdue") {
    return `<span class="badge-status overdue">Overdue</span>`;
  }
  return `<span class="badge-status in-progress">In Progress</span>`;
}

function formatDate(value) {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function toInputDate(value) {
  if (!value || value === "--") return "";

  const parts = value.split("/");
  if (parts.length !== 3) return "";

  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function fillKpiTables() {
  const tbody = document.getElementById("kpiTableBody");
  const recentBody = document.getElementById("recentKpiBody");
  if (!tbody || !recentBody) return;

  if (tbody.children.length > 0) return;

  initialKpiList.forEach((kpi) => {
    const initials = getInitials(kpi.staff);

    const row = document.createElement("tr");
    row.dataset.staff = kpi.staff;
    row.innerHTML = `
      <td>${kpi.num}</td>
      <td><strong>${kpi.title}</strong><br><span style="font-size:12px;color:var(--muted);">${kpi.desc}</span></td>
      <td><span class="staff-chip"><span class="av">${initials}</span>${kpi.staff}</span></td>
      <td>${kpi.dept}</td>
      <td>${kpi.target}</td>
      <td>${kpi.startDate}</td>
      <td>${kpi.deadline}</td>
      <td>${getStatusBadge(kpi.status)}</td>
      <td>
        <button class="action-btn" title="Edit" onclick="openEditKPI(this)"><i class="bi bi-pencil"></i></button>
        <button class="action-btn" title="Delete" onclick="deleteRow(this)"><i class="bi bi-trash"></i></button>
      </td>
    `;
    tbody.appendChild(row);

    const recentRow = document.createElement("tr");
    recentRow.innerHTML = `
      <td><strong>${kpi.title}</strong></td>
      <td><span class="staff-chip"><span class="av">${initials}</span>${kpi.staff}</span></td>
      <td>--</td>
      <td>${getStatusBadge(kpi.status)}</td>
    `;
    recentBody.appendChild(recentRow);
  });
}

function getNextKpiNumber() {
  const rows = document.querySelectorAll("#kpiTableBody tr");
  return rows.length + 1;
}

function openNewKPI() {
  editingKpiRow = null;

  document.getElementById("kpiModalTitle").textContent = "New KPI";
  document.getElementById("kpiSaveBtn").innerHTML = `<i class="bi bi-plus-lg"></i> Create KPI`;

  clearInputFields(["kpiTitle", "kpiDesc", "kpiTarget", "kpiStartDate", "kpiDeadline"]);
  document.getElementById("kpiDepartment").value = "";
  updateKpiStaffDropdown();
  document.getElementById("kpiStaff").value = "";

  openModal("kpiModal");
}

function openEditKPI(btn) {
  const row = btn.closest("tr");
  if (!row) return;

  editingKpiRow = row;

  const title = row.cells[1].querySelector("strong")?.textContent.trim() || "";
  const desc = row.cells[1].querySelector("span")?.textContent.trim() || "";
  const staff = row.cells[2].textContent.trim();
  const dept = row.cells[3].textContent.trim();
  const target = row.cells[4].textContent.trim();
  const startDate = row.cells[5].textContent.trim();
  const deadline = row.cells[6].textContent.trim();

  document.getElementById("kpiModalTitle").textContent = "Edit KPI";
  document.getElementById("kpiSaveBtn").innerHTML = `<i class="bi bi-check-lg"></i> Save Changes`;

  document.getElementById("kpiTitle").value = title;
  document.getElementById("kpiDesc").value = desc;
  document.getElementById("kpiTarget").value = target;
  document.getElementById("kpiStartDate").value = toInputDate(startDate);
  document.getElementById("kpiDeadline").value = toInputDate(deadline);

  const deptSelect = document.getElementById("kpiDepartment");
  const exists = Array.from(deptSelect.options).some((option) => option.value === dept);

  if (!exists && dept) {
    const newOption = document.createElement("option");
    newOption.value = dept;
    newOption.textContent = dept;
    deptSelect.appendChild(newOption);
  }

  deptSelect.value = dept;
  updateKpiStaffDropdown();
  document.getElementById("kpiStaff").value = staff;

  openModal("kpiModal");
}

function saveKPI() {
  const title = document.getElementById("kpiTitle").value.trim();
  const desc = document.getElementById("kpiDesc").value.trim();
  const dept = document.getElementById("kpiDepartment").value.trim();
  const staff = document.getElementById("kpiStaff").value.trim();
  const target = document.getElementById("kpiTarget").value.trim() || "Target";
  const startDate = formatDate(document.getElementById("kpiStartDate").value);
  const deadline = formatDate(document.getElementById("kpiDeadline").value);

  if (!title) {
    alert("Please enter a KPI title.");
    return;
  }

  if (!dept) {
    alert("Please select a department.");
    return;
  }

  if (!staff) {
    alert("Please select a staff member.");
    return;
  }

  const initials = getInitials(staff);

  if (editingKpiRow) {
    editingKpiRow.cells[1].innerHTML = `<strong>${title}</strong><br><span style="font-size:12px;color:var(--muted);">${desc}</span>`;
    editingKpiRow.cells[2].innerHTML = `<span class="staff-chip"><span class="av">${initials}</span>${staff}</span>`;
    editingKpiRow.cells[3].textContent = dept;
    editingKpiRow.cells[4].textContent = target;
    editingKpiRow.cells[5].textContent = startDate;
    editingKpiRow.cells[6].textContent = deadline;
  } else {
    const tbody = document.getElementById("kpiTableBody");
    const row = document.createElement("tr");

    row.dataset.staff = staff;
    row.innerHTML = `
      <td>${getNextKpiNumber()}</td>
      <td><strong>${title}</strong><br><span style="font-size:12px;color:var(--muted);">${desc || "Description here"}</span></td>
      <td><span class="staff-chip"><span class="av">${initials}</span>${staff}</span></td>
      <td>${dept}</td>
      <td>${target}</td>
      <td>${startDate}</td>
      <td>${deadline}</td>
      <td><span class="badge-status pending">Pending</span></td>
      <td>
        <button class="action-btn" title="Edit" onclick="openEditKPI(this)"><i class="bi bi-pencil"></i></button>
        <button class="action-btn" title="Delete" onclick="deleteRow(this)"><i class="bi bi-trash"></i></button>
      </td>
    `;
    tbody.appendChild(row);

    const recentBody = document.getElementById("recentKpiBody");
    if (recentBody) {
      const recentRow = document.createElement("tr");
      recentRow.innerHTML = `
        <td><strong>${title}</strong></td>
        <td><span class="staff-chip"><span class="av">${initials}</span>${staff}</span></td>
        <td>--</td>
        <td><span class="badge-status pending">Pending</span></td>
      `;
      recentBody.prepend(recentRow);

      while (recentBody.children.length > 6) {
        recentBody.removeChild(recentBody.lastChild);
      }
    }
  }

  editingKpiRow = null;
  hideModal("kpiModal");
  filterKpiTable(document.getElementById("kpiSearch")?.value || "");
}

function deleteRow(btn) {
  const row = btn.closest("tr");
  if (!row) return;

  if (confirm("Delete this KPI?")) {
    row.remove();
  }
}

function filterKpiTable(term) {
  const search = (term || "").trim().toLowerCase();
  const statusFilter = (document.getElementById("kpiStatusFilter")?.value || "").trim().toLowerCase();
  const categoryFilter = (document.getElementById("kpiCategoryFilter")?.value || "").trim().toLowerCase();

  document.querySelectorAll("#kpiTableBody tr").forEach((row) => {
    const titleText = row.cells[1]?.textContent.toLowerCase() || "";
    const deptText = row.cells[3]?.textContent.toLowerCase() || "";
    const statusText = row.cells[7]?.textContent.toLowerCase() || "";

    const matchSearch = !search || titleText.includes(search);
    const matchStatus = !statusFilter || statusText.includes(statusFilter);
    const matchCategory = !categoryFilter || deptText.includes(categoryFilter);

    row.style.display = matchSearch && matchStatus && matchCategory ? "" : "none";
  });
}

function getPendingEvidenceKeys() {
  const keys = new Set();

  document.querySelectorAll("tr").forEach((row) => {
    const hasVerifyButton = row.querySelector('button[onclick*="verifyEvidence"]');
    if (!hasVerifyButton || row.cells.length < 2) return;

    const staff = row.cells[0].textContent.trim();
    const kpi = row.cells[1].textContent.trim();

    if (staff && kpi) {
      keys.add(`${staff}||${kpi}`);
    }
  });

  return Array.from(keys);
}

function updateVerifyPendingCount() {
  const count = getPendingEvidenceKeys().length;
  const label = `${count} pending`;

  const verifyPendingCount = document.getElementById("verifyPendingCount");
  const pendingCount = document.getElementById("pendingCount");
  const verifyNavBadge = document.getElementById("verifyNavBadge");

  if (verifyPendingCount) verifyPendingCount.textContent = label;
  if (pendingCount) pendingCount.textContent = label;

  if (verifyNavBadge) {
    verifyNavBadge.textContent = count;
    verifyNavBadge.style.display = count > 0 ? "inline-block" : "none";
  }
}

function verifyEvidence(btn, action) {
  const row = btn.closest("tr");
  if (!row || row.cells.length < 2) return;

  const staff = row.cells[0].textContent.trim();
  const kpi = row.cells[1].textContent.trim();

  document.querySelectorAll("tr").forEach((item) => {
    const hasVerifyButton = item.querySelector('button[onclick*="verifyEvidence"]');
    if (!hasVerifyButton || item.cells.length < 2) return;

    const rowStaff = item.cells[0].textContent.trim();
    const rowKpi = item.cells[1].textContent.trim();

    if (rowStaff === staff && rowKpi === kpi) {
      const lastCell = item.cells[item.cells.length - 1];

      if (action === "Approved") {
        lastCell.innerHTML = `<span class="badge-status achieved"><i class="bi bi-check-circle-fill me-1"></i>Approved</span>`;
      } else {
        lastCell.innerHTML = `<span class="badge-status overdue"><i class="bi bi-x-circle-fill me-1"></i>Rejected</span>`;
      }

      setTimeout(() => {
        if (item.parentNode) {
          item.remove();
          updateVerifyPendingCount();
        }
      }, 700);
    }
  });
}

function createCharts() {
  const achievementCanvas = document.getElementById("achievementChart");
  const categoryCanvas = document.getElementById("categoryChart");

  if (achievementCanvas) {
    achievementChart = new Chart(achievementCanvas, {
      type: "bar",
      data: {
        labels: achievementData.month.labels,
        datasets: [
          {
            label: "Achieved",
            data: achievementData.month.achieved,
            backgroundColor: "#1db87a",
            borderRadius: 6
          },
          {
            label: "In Progress",
            data: achievementData.month.inProgress,
            backgroundColor: "#e8a020",
            borderRadius: 6
          },
          {
            label: "Overdue",
            data: achievementData.month.overdue,
            backgroundColor: "#e53e3e",
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom"
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  if (categoryCanvas) {
    new Chart(categoryCanvas, {
      type: "doughnut",
      data: {
        labels: ["Research", "Teaching", "Service", "Admin"],
        datasets: [
          {
            data: [10, 8, 4, 2],
            backgroundColor: ["#1a3a5c", "#1db87a", "#e8a020", "#6b7a99"],
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      }
    });
  }
}

function filterAchievementChart(period) {
  if (!achievementChart) return;

  const selected = achievementData[period] || achievementData.month;

  achievementChart.data.labels = selected.labels;
  achievementChart.data.datasets[0].data = selected.achieved;
  achievementChart.data.datasets[1].data = selected.inProgress;
  achievementChart.data.datasets[2].data = selected.overdue;
  achievementChart.update();
}

function setTimeFormat(format) {
  currentTimeFormat = format;

  const btn12 = document.getElementById("btn12h");
  const btn24 = document.getElementById("btn24h");

  if (btn12 && btn24) {
    if (format === "12h") {
      btn12.style.background = "var(--primary)";
      btn12.style.color = "white";
      btn24.style.background = "white";
      btn24.style.color = "var(--muted)";
    } else {
      btn24.style.background = "var(--primary)";
      btn24.style.color = "white";
      btn12.style.background = "white";
      btn12.style.color = "var(--muted)";
    }
  }

  updateTimeClock();
}

function updateTimeClock() {
  const preview = document.getElementById("timePreview");
  if (!preview) return;

  const now = new Date();
  let text = "";

  if (currentTimeFormat === "24h") {
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    text = `${hh}:${mm}:${ss}`;
  } else {
    let hh = now.getHours();
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    const ampm = hh >= 12 ? "PM" : "AM";

    hh = hh % 12 || 12;
    text = `${hh}:${mm}:${ss} ${ampm}`;
  }

  preview.textContent = text;
}

function togglePwdVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);

  if (!input || !icon) return;

  if (input.type === "password") {
    input.type = "text";
    icon.className = "bi bi-eye-slash";
  } else {
    input.type = "password";
    icon.className = "bi bi-eye";
  }
}

function checkPwdStrength(value) {
  const bar = document.getElementById("pwdStrengthBar");
  const label = document.getElementById("pwdStrengthLabel");
  if (!bar || !label) return;

  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  const levels = [
    { width: "0%", color: "", text: "" },
    { width: "25%", color: "var(--danger)", text: "Weak" },
    { width: "50%", color: "var(--warning)", text: "Fair" },
    { width: "75%", color: "#3b82f6", text: "Good" },
    { width: "100%", color: "var(--success)", text: "Strong" }
  ];

  const current = levels[score];

  bar.style.width = value ? current.width : "0%";
  bar.style.background = current.color;
  label.textContent = value ? current.text : "";
  label.style.color = current.color;
}

function updatePassword() {
  const current = document.getElementById("secCurrentPwd").value.trim();
  const newPwd = document.getElementById("secNewPwd").value.trim();
  const confirmPwd = document.getElementById("secConfirmPwd").value.trim();
  const msg = document.getElementById("pwdMatchMsg");

  if (!current || !newPwd || !confirmPwd) {
    alert("Please fill in all password fields.");
    return;
  }

  if (newPwd.length < 8) {
    alert("New password must be at least 8 characters.");
    return;
  }

  if (newPwd !== confirmPwd) {
    if (msg) {
      msg.textContent = "Passwords do not match.";
      msg.style.color = "var(--danger)";
    }
    return;
  }

  if (msg) {
    msg.textContent = "Password updated successfully.";
    msg.style.color = "var(--success)";
  }

  document.getElementById("secCurrentPwd").value = "";
  document.getElementById("secNewPwd").value = "";
  document.getElementById("secConfirmPwd").value = "";
  checkPwdStrength("");

  setTimeout(() => {
    if (msg) msg.textContent = "";
  }, 1800);
}

window.addEventListener("DOMContentLoaded", function () {
  renderStaffGrid();
  updateKpiDepartmentDropdown();
  updateKpiStaffDropdown();
  fillKpiTables();
  renderNotifications();
  updateVerifyPendingCount();
  createCharts();
  setTimeFormat("12h");
  updateTimeClock();
  setInterval(updateTimeClock, 1000);

  document.getElementById("kpiSearch")?.addEventListener("input", function (event) {
    filterKpiTable(event.target.value);
  });

  document.getElementById("staffSearch")?.addEventListener("input", function (event) {
    filterStaffList(event.target.value);
  });

  document.getElementById("kpiStatusFilter")?.addEventListener("change", function () {
    filterKpiTable(document.getElementById("kpiSearch")?.value || "");
  });

  document.getElementById("kpiCategoryFilter")?.addEventListener("change", function () {
    filterKpiTable(document.getElementById("kpiSearch")?.value || "");
  });
});