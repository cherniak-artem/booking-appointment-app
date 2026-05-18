const STORAGE_KEY = 'booking-app-data';

// --- State ---
let bookings = [];
let currentDate = new Date().toISOString().split('T')[0];
let searchQuery = '';
let currentCalendarDate = new Date(); // Tracks the month shown in the calendar

// --- DOM Elements ---
const dateInput = document.getElementById('current-date');
const startTimeInput = document.getElementById('start-time');
const durationSelect = document.getElementById('duration');
const clientNameInput = document.getElementById('client-name');
const commentInput = document.getElementById('comment');
const bookingForm = document.getElementById('booking-form');
const formAlert = document.getElementById('form-alert');
const searchInput = document.getElementById('search-input');
const timelineContainer = document.getElementById('timeline-container');
const displayDateLabel = document.getElementById('display-date-label');
const emptyState = document.getElementById('empty-state');
const resetDemoBtn = document.getElementById('reset-demo');
const toastContainer = document.getElementById('toast-container');

// Calendar DOM
const calendarGrid = document.getElementById('calendar-grid');
const calendarMonthYear = document.getElementById('calendar-month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

// --- Initialization ---
async function init() {
  loadData();
  
  // Set initial date
  dateInput.value = currentDate;
  updateDisplayDateLabel();

  // Event Listeners
  dateInput.addEventListener('change', (e) => {
    currentDate = e.target.value;
    updateDisplayDateLabel();
    renderBookings();
    renderCalendar();
  });

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderBookings();
  });

  bookingForm.addEventListener('submit', handleFormSubmit);
  resetDemoBtn.addEventListener('click', loadDemoData);

  prevMonthBtn.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
  });
  
  nextMonthBtn.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
  });

  renderCalendar();
  renderBookings();
}

// --- Data Management ---
function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      bookings = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse localStorage', e);
      bookings = [];
    }
  } else {
    bookings = [];
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

async function loadDemoData() {
  try {
    const res = await fetch('./data/seed.json');
    if (!res.ok) throw new Error('Failed to fetch seed data');
    const demoData = await res.json();
    
    // Adjust dates in demo data to today to make them visible
    const todayStr = new Date().toISOString().split('T')[0];
    bookings = demoData.map(b => ({...b, date: todayStr}));
    
    saveData();
    
    // Reset inputs
    currentDate = todayStr;
    dateInput.value = todayStr;
    searchQuery = '';
    searchInput.value = '';
    
    updateDisplayDateLabel();
    renderBookings();
    renderCalendar();
    showToast('Демо дані успішно завантажено', 'success');
  } catch (err) {
    console.error(err);
    showToast('Помилка завантаження демо даних', 'error');
  }
}

// --- Logic & Validation ---
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function checkConflict(date, startTime, durationMins) {
  const newStart = timeToMinutes(startTime);
  const newEnd = newStart + durationMins;

  // Active bookings on the same date
  const activeBookings = bookings.filter(b => b.date === date && b.status === 'active');

  for (let b of activeBookings) {
    const bStart = timeToMinutes(b.startTime);
    const bEnd = bStart + b.duration;

    // Check overlap: newStart < bEnd AND newEnd > bStart
    if (newStart < bEnd && newEnd > bStart) {
      return true; // Conflict found
    }
  }
  return false;
}

function validateWorkingHours(startTime, durationMins) {
  const startMins = timeToMinutes(startTime);
  const endMins = startMins + durationMins;
  const workStart = 8 * 60; // 08:00
  const workEnd = 18 * 60;  // 18:00
  
  return startMins >= workStart && endMins <= workEnd;
}

function handleFormSubmit(e) {
  e.preventDefault();
  hideAlert();

  const date = currentDate; // using the date selected in the left panel
  const startTime = startTimeInput.value;
  const duration = parseInt(durationSelect.value, 10);
  const clientName = clientNameInput.value.trim();
  const comment = commentInput.value.trim();

  // Validate Sunday (BR2)
  const selectedDateObj = new Date(date);
  if (selectedDateObj.getDay() === 0) {
    showAlert('Бронювання неможливе. Неділя - вихідний день.');
    return;
  }

  // Validate working hours (BR1)
  if (!validateWorkingHours(startTime, duration)) {
    showAlert('Бронювання має бути в межах робочих годин (08:00 - 18:00)');
    return;
  }

  // Validate conflicts (BR3)
  if (checkConflict(date, startTime, duration)) {
    showAlert('Цей час вже зайнято. Будь ласка, оберіть інший слот.');
    return;
  }

  // Create booking
  const newBooking = {
    id: 'booking-' + Date.now(),
    date,
    startTime,
    duration,
    clientName,
    comment,
    status: 'active'
  };

  bookings.push(newBooking);
  saveData();
  
  // Reset form partials
  startTimeInput.value = '';
  clientNameInput.value = '';
  commentInput.value = '';
  
  showToast('Бронювання успішно створено', 'success');
  renderBookings();
  renderCalendar();
}

function cancelBooking(id) {
  if (!confirm('Ви впевнені, що хочете скасувати цей запис?')) return;
  
  const idx = bookings.findIndex(b => b.id === id);
  if (idx !== -1) {
    bookings[idx].status = 'cancelled';
    saveData();
    showToast('Бронювання скасовано', 'success');
    renderBookings();
    renderCalendar();
  }
}

// --- UI Updates ---
function getBookedMinutes(dateStr) {
  const dayBookings = bookings.filter(b => b.date === dateStr && b.status === 'active');
  return dayBookings.reduce((sum, b) => sum + b.duration, 0);
}

function renderCalendar() {
  calendarGrid.innerHTML = '';
  
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  
  const monthFormatter = new Intl.DateTimeFormat('uk-UA', { month: 'long', year: 'numeric' });
  calendarMonthYear.textContent = monthFormatter.format(new Date(year, month)).replace(/^\w/, c => c.toUpperCase());
  
  // Calculate days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Adjust first day (Monday = 1, Sunday = 0 -> 7)
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  
  // Empty cells before start of month
  for (let i = 0; i < startOffset; i++) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'calendar-day empty-cell';
    calendarGrid.appendChild(emptyDiv);
  }
  
  // Days of month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    // adjust to local YYYY-MM-DD
    const dateStr = [
      dateObj.getFullYear(),
      String(dateObj.getMonth() + 1).padStart(2, '0'),
      String(dateObj.getDate()).padStart(2, '0')
    ].join('-');
    
    const dayDiv = document.createElement('div');
    dayDiv.textContent = d;
    
    const isSunday = dateObj.getDay() === 0;
    const isSelected = dateStr === currentDate;
    
    // Classes
    let classes = ['calendar-day'];
    if (isSelected) classes.push('selected');
    
    if (isSunday) {
      classes.push('day-disabled');
    } else {
      const bookedMins = getBookedMinutes(dateStr);
      if (bookedMins === 0) {
        classes.push('day-empty');
      } else if (bookedMins >= 600) { // 10 hours max
        classes.push('day-full');
      } else {
        classes.push('day-partial');
      }
    }
    
    dayDiv.className = classes.join(' ');
    
    // Click handling
    if (!isSunday) {
      dayDiv.addEventListener('click', () => {
        currentDate = dateStr;
        dateInput.value = dateStr;
        updateDisplayDateLabel();
        renderBookings();
        renderCalendar(); // re-render to update selected state
      });
    } else {
      dayDiv.addEventListener('click', () => {
        showToast('Неділя - вихідний день', 'error');
      });
    }
    
    calendarGrid.appendChild(dayDiv);
  }
}

function updateDisplayDateLabel() {
  const dateObj = new Date(currentDate);
  const formatter = new Intl.DateTimeFormat('uk-UA', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  displayDateLabel.textContent = formatter.format(dateObj);
}

function showAlert(msg) {
  formAlert.textContent = msg;
  formAlert.classList.remove('hidden');
  formAlert.classList.add('alert-danger');
}

function hideAlert() {
  formAlert.classList.add('hidden');
  formAlert.classList.remove('alert-danger');
}

function showToast(message, type) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
      ${type === 'success' ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'}
    </svg>
    <span>${message}</span>
  `;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 3000);
}

function renderBookings() {
  timelineContainer.innerHTML = '';
  
  // Filter by date and search query
  const filtered = bookings.filter(b => {
    const matchDate = b.date === currentDate;
    const matchSearch = b.clientName.toLowerCase().includes(searchQuery) || 
                        (b.comment && b.comment.toLowerCase().includes(searchQuery));
    return matchDate && matchSearch;
  });

  // Sort by start time
  filtered.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  if (filtered.length === 0) {
    timelineContainer.classList.add('hidden');
    emptyState.classList.remove('hidden');
    // Update empty state text based on context
    if (searchQuery) {
      emptyState.querySelector('h4').textContent = 'Нічого не знайдено';
      emptyState.querySelector('p').textContent = `Немає результатів для "${searchQuery}" на цю дату.`;
    } else {
      emptyState.querySelector('h4').textContent = 'Немає бронювань';
      emptyState.querySelector('p').textContent = 'На цю дату ще немає записів. Ви можете створити новий запис ліворуч.';
    }
    return;
  }

  timelineContainer.classList.remove('hidden');
  emptyState.classList.add('hidden');

  filtered.forEach(b => {
    const isCancelled = b.status === 'cancelled';
    const endMins = timeToMinutes(b.startTime) + b.duration;
    const endHours = String(Math.floor(endMins / 60)).padStart(2, '0');
    const endMinsStr = String(endMins % 60).padStart(2, '0');
    const endTimeStr = `${endHours}:${endMinsStr}`;

    const div = document.createElement('div');
    div.className = `booking-item ${isCancelled ? 'cancelled' : 'active'}`;
    
    div.innerHTML = `
      <div class="time-col">
        <span class="time-text">${b.startTime}</span>
        <span class="duration-text">${b.duration} хв</span>
        <span class="time-text" style="font-size: 0.8em; color: var(--text-muted); margin-top: 4px;">до ${endTimeStr}</span>
      </div>
      <div class="details-col">
        <div class="client-info">
          ${isCancelled ? '<span class="status-badge cancelled">Скасовано</span>' : ''}
          <h4>${b.clientName}</h4>
          ${b.comment ? `<p class="comment-text">${b.comment}</p>` : ''}
        </div>
        <div class="actions">
          ${!isCancelled ? `<button class="btn-danger cancel-btn" data-id="${b.id}">Скасувати</button>` : ''}
        </div>
      </div>
    `;

    if (!isCancelled) {
      const cancelBtn = div.querySelector('.cancel-btn');
      cancelBtn.addEventListener('click', () => cancelBooking(b.id));
    }

    timelineContainer.appendChild(div);
  });
}

// Start
document.addEventListener('DOMContentLoaded', init);
