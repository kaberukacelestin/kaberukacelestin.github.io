const STORAGE_KEYS = {
  admins: 'schoolAdminUsers',
  students: 'schoolStudents',
  currentAdmin: 'schoolCurrentAdmin'
};

const defaultAdmin = {
  name: 'System Admin',
  email: 'admin@school.com',
  password: 'admin123'
};

function getStoredAdmins() {
  const saved = localStorage.getItem(STORAGE_KEYS.admins);
  if (!saved) {
    localStorage.setItem(STORAGE_KEYS.admins, JSON.stringify([defaultAdmin]));
    return [defaultAdmin];
  }
  return JSON.parse(saved);
}

function saveAdmins(admins) {
  localStorage.setItem(STORAGE_KEYS.admins, JSON.stringify(admins));
}

function getStoredStudents() {
  const saved = localStorage.getItem(STORAGE_KEYS.students);
  return saved ? JSON.parse(saved) : [];
}

function saveStudents(students) {
  localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students));
}

function showMessage(text, isError = false) {
  const box = document.getElementById('messageBox');
  box.textContent = text;
  box.style.color = isError ? '#b42318' : '#0d6efd';
}

function toggleAuthView(isLoggedIn) {
  document.getElementById('authSection').classList.toggle('hidden', isLoggedIn);
  document.getElementById('dashboardSection').classList.toggle('hidden', !isLoggedIn);
}

function renderStudents() {
  const tbody = document.getElementById('studentTableBody');
  const students = getStoredStudents();
  tbody.innerHTML = '';

  if (!students.length) {
    tbody.innerHTML = '<tr><td colspan="5">No students registered yet.</td></tr>';
    return;
  }

  students.forEach((student, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${student.name}</td>
      <td>${student.className}</td>
      <td>${student.parentName}</td>
      <td>${student.parentPhone}</td>
      <td>
        <button class="action-btn edit" data-index="${idx}">Edit</button>
        <button class="action-btn delete" data-index="${idx}">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function loadDashboard() {
  const currentAdmin = localStorage.getItem(STORAGE_KEYS.currentAdmin);
  if (!currentAdmin) {
    toggleAuthView(false);
    return;
  }

  document.getElementById('welcomeMessage').textContent = `Welcome, ${currentAdmin}`;
  toggleAuthView(true);
  renderStudents();
}

function registerAdmin(event) {
  event.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;

  if (!name || !email || !password || !confirmPassword) {
    showMessage('Please fill in all fields.', true);
    return;
  }

  if (password !== confirmPassword) {
    showMessage('Passwords do not match.', true);
    return;
  }

  const admins = getStoredAdmins();
  const exists = admins.some((admin) => admin.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    showMessage('An admin with this email already exists.', true);
    return;
  }

  admins.push({ name, email, password });
  saveAdmins(admins);
  showMessage('Admin account created successfully. You can now log in.');
  document.getElementById('adminRegisterForm').reset();
}

function loginAdmin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  const admins = getStoredAdmins();
  const foundAdmin = admins.find(
    (admin) => admin.email.toLowerCase() === email.toLowerCase() && admin.password === password
  );

  if (!foundAdmin) {
    showMessage('Invalid email or password.', true);
    return;
  }

  localStorage.setItem(STORAGE_KEYS.currentAdmin, foundAdmin.name);
  document.getElementById('welcomeMessage').textContent = `Welcome, ${foundAdmin.name}`;
  document.getElementById('adminLoginForm').reset();
  showMessage('Login successful.');
  toggleAuthView(true);
  renderStudents();
}

function logoutAdmin() {
  localStorage.removeItem(STORAGE_KEYS.currentAdmin);
  toggleAuthView(false);
  showMessage('You have been logged out.');
}

function registerStudent(event) {
  event.preventDefault();
  const student = {
    name: document.getElementById('studentName').value.trim(),
    className: document.getElementById('studentClass').value,
    dob: document.getElementById('dob').value,
    gender: document.getElementById('gender').value,
    parentName: document.getElementById('parentName').value.trim(),
    parentPhone: document.getElementById('parentPhone').value.trim(),
    address: document.getElementById('address').value.trim()
  };

  if (!student.name || !student.className || !student.dob || !student.gender || !student.parentName || !student.parentPhone || !student.address) {
    showMessage('Please complete all student fields.', true);
    return;
  }

  const students = getStoredStudents();
  // editing flow: if an index is present, update instead
  if (typeof window._editingIndex === 'number' && window._editingIndex >= 0) {
    students[window._editingIndex] = student;
    window._editingIndex = -1;
    document.getElementById('studentSubmitBtn').textContent = 'Register Student';
    document.getElementById('cancelEditBtn').classList.add('hidden');
    showMessage('Student updated successfully.');
  } else {
    students.push(student);
    showMessage('Student registered successfully.');
  }
  saveStudents(students);
  renderStudents();
  document.getElementById('studentForm').reset();
}

function startEdit(index) {
  const students = getStoredStudents();
  const s = students[index];
  if (!s) return;
  window._editingIndex = index;
  document.getElementById('studentName').value = s.name;
  document.getElementById('studentClass').value = s.className;
  document.getElementById('dob').value = s.dob;
  document.getElementById('gender').value = s.gender;
  document.getElementById('parentName').value = s.parentName;
  document.getElementById('parentPhone').value = s.parentPhone;
  document.getElementById('address').value = s.address;
  document.getElementById('studentSubmitBtn').textContent = 'Save Changes';
  document.getElementById('cancelEditBtn').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
  window._editingIndex = -1;
  document.getElementById('studentForm').reset();
  document.getElementById('studentSubmitBtn').textContent = 'Register Student';
  document.getElementById('cancelEditBtn').classList.add('hidden');
}

function deleteStudent(index) {
  const students = getStoredStudents();
  if (!students[index]) return;
  if (!confirm('Delete this student?')) return;
  students.splice(index, 1);
  saveStudents(students);
  renderStudents();
  showMessage('Student deleted.');
}

function setupTabs() {
  document.querySelectorAll('.tab').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      document.querySelectorAll('.panel').forEach((panel) => panel.classList.remove('active'));
      document.getElementById(button.dataset.target).classList.add('active');
    });
  });
}

const adminRegisterForm = document.getElementById('adminRegisterForm');
if (adminRegisterForm) adminRegisterForm.addEventListener('submit', registerAdmin);
const adminLoginForm = document.getElementById('adminLoginForm');
if (adminLoginForm) adminLoginForm.addEventListener('submit', loginAdmin);
const logoutBtn = document.getElementById('logoutButton');
if (logoutBtn) logoutBtn.addEventListener('click', logoutAdmin);
const studentFormEl = document.getElementById('studentForm');
if (studentFormEl) studentFormEl.addEventListener('submit', registerStudent);
const cancelBtn = document.getElementById('cancelEditBtn');
if (cancelBtn) cancelBtn.addEventListener('click', cancelEdit);
const tableBody = document.getElementById('studentTableBody');
if (tableBody) {
  tableBody.addEventListener('click', (e) => {
    const index = e.target.getAttribute && e.target.getAttribute('data-index');
    if (!index) return;
    const i = parseInt(index, 10);
    if (e.target.classList.contains('edit')) startEdit(i);
    if (e.target.classList.contains('delete')) deleteStudent(i);
  });
}
setupTabs();
loadDashboard();
