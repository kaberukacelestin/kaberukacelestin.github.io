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
    tbody.innerHTML = '<tr><td colspan="4">No students registered yet.</td></tr>';
    return;
  }

  students.forEach((student) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${student.name}</td>
      <td>${student.className}</td>
      <td>${student.parentName}</td>
      <td>${student.parentPhone}</td>
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
  students.push(student);
  saveStudents(students);
  renderStudents();
  document.getElementById('studentForm').reset();
  showMessage('Student registered successfully.');
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

document.getElementById('adminRegisterForm').addEventListener('submit', registerAdmin);
document.getElementById('adminLoginForm').addEventListener('submit', loginAdmin);
document.getElementById('logoutButton').addEventListener('click', logoutAdmin);
document.getElementById('studentForm').addEventListener('submit', registerStudent);
setupTabs();
loadDashboard();
