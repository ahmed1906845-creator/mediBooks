window.addEventListener('scroll', function() {
  var nav = document.getElementById('navbar');
  if (window.scrollY > 50) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});

document.querySelectorAll('a[href^="#"]').forEach(function(link) {
  link.addEventListener('click', function(e) {
    var target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});



//app.html

var DOCTORS = [
  { id:1, name:'د. أحمد محمود', spec:'قلب وأوعية دموية', price:300, icon:'❤️', rating:4.8, exp:15 },
  { id:2, name:'د. سارة علي', spec:'طب الأطفال', price:200, icon:'👶', rating:4.9, exp:10 },
  { id:3, name:'د. محمد حسن', spec:'جراحة العظام', price:250, icon:'🦴', rating:4.7, exp:12 },
  { id:4, name:'د. فاطمة إبراهيم', spec:'الجلدية', price:220, icon:'✨', rating:4.8, exp:8 },
  { id:5, name:'د. خالد عمر', spec:'طب الأسنان', price:280, icon:'🦷', rating:4.6, exp:14 },
  { id:6, name:'د. نور الهدى', spec:'النساء والتوليد', price:350, icon:'🌸', rating:4.9, exp:18 }
];

var selectedDoctorId = null;
var appointments = [];
var currentFilter = 'all';

function loadData() {
  try {
    var data = localStorage.getItem('medibook_appointments');
    appointments = data ? JSON.parse(data) : [];
  } catch(e) { appointments = []; }
}
function saveData() {
  try { localStorage.setItem('medibook_appointments', JSON.stringify(appointments)); } catch(e) {}
}
function showToast(msg, isError) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(function() { t.className = 'toast' + (isError ? ' error' : ''); }, 2500);
}
function switchTab(tabName) {
  var tabs = document.querySelectorAll('.tab');
  var panels = document.querySelectorAll('.panel');
  var i;
  for (i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
  for (i = 0; i < panels.length; i++) panels[i].classList.remove('active');
  document.querySelector('.tab[data-tab="' + tabName + '"]').classList.add('active');
  document.getElementById('panel-' + tabName).classList.add('active');
  if (tabName === 'appointments') renderAppointments();
  if (tabName === 'doctors') renderAllDoctors();
}
function renderDoctors() {
  var grid = document.getElementById('docsGrid');
  var html = '';
  for (var i = 0; i < DOCTORS.length; i++) {
    var d = DOCTORS[i];
    var sel = (selectedDoctorId === d.id) ? ' selected' : '';
    html += '<div class="doc-card' + sel + '" data-id="' + d.id + '">' +
      '<div class="avatar">' + d.icon + '</div>' +
      '<div class="d-name">' + d.name + '</div>' +
      '<div class="d-spec">' + d.spec + '</div>' +
      '<div class="d-rating">⭐ ' + d.rating + ' (' + d.exp + ' سنة)</div>' +
      '<div class="d-price">' + d.price + ' ج.م</div>' +
    '</div>';
  }
  grid.innerHTML = html;
  var cards = grid.querySelectorAll('.doc-card');
  for (var j = 0; j < cards.length; j++) {
    cards[j].addEventListener('click', function() {
      selectDoctor(parseInt(this.getAttribute('data-id')));
    });
  }
}
function renderAllDoctors() {
  var grid = document.getElementById('allDocsGrid');
  var html = '';
  for (var i = 0; i < DOCTORS.length; i++) {
    var d = DOCTORS[i];
    html += '<div class="doc-card">' +
      '<div class="avatar">' + d.icon + '</div>' +
      '<div class="d-name">' + d.name + '</div>' +
      '<div class="d-spec">' + d.spec + '</div>' +
      '<div class="d-rating">⭐ ' + d.rating + ' (' + d.exp + ' سنة خبرة)</div>' +
      '<div class="d-price">' + d.price + ' ج.م</div>' +
    '</div>';
  }
  grid.innerHTML = html;
}
function selectDoctor(id) {
  selectedDoctorId = id;
  var cards = document.querySelectorAll('#docsGrid .doc-card');
  for (var i = 0; i < cards.length; i++) {
    if (parseInt(cards[i].getAttribute('data-id')) === id) cards[i].classList.add('selected');
    else cards[i].classList.remove('selected');
  }
}
function bookAppointment() {
  var name = document.getElementById('pName').value.trim();
  var phone = document.getElementById('pPhone').value.trim();
  var date = document.getElementById('pDate').value;
  var time = document.getElementById('pTime').value;
  var notes = document.getElementById('pNotes').value.trim();
  if (!name) { showToast('❌ أدخل الاسم', true); return; }
  if (!phone || !/^01[0-9]{9}$/.test(phone)) { showToast('❌ رقم هاتف غير صحيح', true); return; }
  if (!selectedDoctorId) { showToast('❌ اختر طبيباً', true); return; }
  if (!date) { showToast('❌ اختر التاريخ', true); return; }
  if (!time) { showToast('❌ اختر الوقت', true); return; }
  var doctor = null;
  for (var i = 0; i < DOCTORS.length; i++) {
    if (DOCTORS[i].id === selectedDoctorId) { doctor = DOCTORS[i]; break; }
  }
  if (!doctor) { showToast('❌ خطأ', true); return; }
  for (var k = 0; k < appointments.length; k++) {
    var a = appointments[k];
    if (a.doctorName === doctor.name && a.date === date && a.time === time && a.status !== 'cancelled') {
      showToast('⚠️ هذا الوقت محجوز', true); return;
    }
  }
  appointments.push({
    id: Date.now(), patientName: name, phone: phone,
    doctorName: doctor.name, doctorSpec: doctor.spec, doctorIcon: doctor.icon,
    price: doctor.price, date: date, time: time, notes: notes,
    status: 'pending', createdAt: new Date().toISOString()
  });
  saveData(); updateStats();
  showToast('✅ تم حجز الموعد بنجاح');
  resetForm();
  setTimeout(function() { switchTab('appointments'); }, 1200);
}
function resetForm() {
  document.getElementById('pName').value = '';
  document.getElementById('pPhone').value = '';
  document.getElementById('pDate').value = '';
  document.getElementById('pTime').value = '';
  document.getElementById('pNotes').value = '';
  selectedDoctorId = null;
  var cards = document.querySelectorAll('#docsGrid .doc-card');
  for (var i = 0; i < cards.length; i++) cards[i].classList.remove('selected');
}
function renderAppointments() {
  var list = document.getElementById('aptsList');
  var filtered = [];
  for (var i = 0; i < appointments.length; i++) {
    if (currentFilter === 'all' || appointments[i].status === currentFilter) filtered.push(appointments[i]);
  }
  filtered.sort(function(a, b) { return b.createdAt.localeCompare(a.createdAt); });
  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty"><div class="icon">📭</div><h3>لا توجد مواعيد</h3><p>ابدأ بحجز موعدك الأول</p></div>';
    return;
  }
  var statusText = { pending:'⏳ قيد الانتظار', confirmed:'✅ مؤكد', cancelled:'❌ ملغي' };
  var html = '';
  for (var j = 0; j < filtered.length; j++) {
    var a = filtered[j];
    var btns = '';
    if (a.status === 'pending') {
      btns = '<button class="btn btn-sm btn-success" data-action="confirm" data-id="' + a.id + '">✔️ تأكيد</button>' +
             '<button class="btn btn-sm btn-danger" data-action="cancel" data-id="' + a.id + '">✖️ إلغاء</button>';
    } else if (a.status === 'confirmed') {
      btns = '<button class="btn btn-sm btn-info" data-action="print" data-id="' + a.id + '">🖨️ طباعة</button>' +
             '<button class="btn btn-sm btn-danger" data-action="cancel" data-id="' + a.id + '">✖️ إلغاء</button>';
    } else {
      btns = '<button class="btn btn-sm btn-danger" data-action="delete" data-id="' + a.id + '">🗑️ حذف</button>';
    }
    html += '<div class="apt ' + a.status + '">' +
      '<div class="apt-info">' +
        '<h4>' + a.doctorIcon + ' ' + a.doctorName + '</h4>' +
        '<p>👤 ' + a.patientName + ' | 📞 ' + a.phone + '</p>' +
        '<p>📅 ' + a.date + ' ⏰ ' + a.time + ' | 💰 ' + a.price + ' ج.م</p>' +
        '<p><span class="badge badge-' + a.status + '">' + statusText[a.status] + '</span></p>' +
        (a.notes ? '<p>📝 ' + a.notes + '</p>' : '') +
      '</div>' +
      '<div class="apt-actions">' + btns + '</div>' +
    '</div>';
  }
  list.innerHTML = html;
  var actionBtns = list.querySelectorAll('[data-action]');
  for (var x = 0; x < actionBtns.length; x++) {
    actionBtns[x].addEventListener('click', function() {
      var action = this.getAttribute('data-action');
      var id = parseInt(this.getAttribute('data-id'));
      if (action === 'confirm') confirmApt(id);
      else if (action === 'cancel') cancelApt(id);
      else if (action === 'delete') deleteApt(id);
      else if (action === 'print') printApt(id);
    });
  }
}
function confirmApt(id) {
  for (var i = 0; i < appointments.length; i++) {
    if (appointments[i].id === id) { appointments[i].status = 'confirmed'; break; }
  }
  saveData(); updateStats(); renderAppointments();
  showToast('✅ تم تأكيد الموعد');
}
function cancelApt(id) {
  if (!confirm('هل تريد إلغاء هذا الموعد؟')) return;
  for (var i = 0; i < appointments.length; i++) {
    if (appointments[i].id === id) { appointments[i].status = 'cancelled'; break; }
  }
  saveData(); updateStats(); renderAppointments();
  showToast('تم إلغاء الموعد', true);
}
function deleteApt(id) {
  if (!confirm('حذف الموعد نهائياً؟')) return;
  var newList = [];
  for (var i = 0; i < appointments.length; i++) {
    if (appointments[i].id !== id) newList.push(appointments[i]);
  }
  appointments = newList;
  saveData(); updateStats(); renderAppointments();
  showToast('🗑️ تم الحذف');
}
function printApt(id) {
  var a = null;
  for (var i = 0; i < appointments.length; i++) {
    if (appointments[i].id === id) { a = appointments[i]; break; }
  }
  if (!a) return;
  var win = window.open('', '', 'width=600,height=700');
  win.document.write(
    '<html dir="rtl"><head><title>تذكرة موعد</title>' +
    '<style>body{font-family:Arial;padding:30px;text-align:center}' +
    '.ticket{border:3px dashed #6366f1;border-radius:15px;padding:25px;text-align:right}' +
    'h1{color:#6366f1;text-align:center}' +
    '.row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee}' +
    '.label{font-weight:bold;color:#666}</style></head><body>' +
    '<div class="ticket"><h1>🏥 MediBook</h1>' +
    '<p style="text-align:center;color:#666;margin-bottom:20px">تذكرة موعد طبي</p>' +
    '<div class="row"><span class="label">الطبيب:</span><span>' + a.doctorIcon + ' ' + a.doctorName + '</span></div>' +
    '<div class="row"><span class="label">التخصص:</span><span>' + a.doctorSpec + '</span></div>' +
    '<div class="row"><span class="label">المريض:</span><span>' + a.patientName + '</span></div>' +
    '<div class="row"><span class="label">الهاتف:</span><span>' + a.phone + '</span></div>' +
    '<div class="row"><span class="label">التاريخ:</span><span>' + a.date + '</span></div>' +
    '<div class="row"><span class="label">الوقت:</span><span>' + a.time + '</span></div>' +
    '<div class="row"><span class="label">السعر:</span><span>' + a.price + ' ج.م</span></div>' +
    '<p style="text-align:center;margin-top:20px;color:#999;font-size:12px">رقم التذكرة: #' + a.id + '</p>' +
    '</div><script>window.print();<\/script></body></html>'
  );
  win.document.close();
}
function updateStats() {
  document.getElementById('statTotal').textContent = appointments.length;
  var pending = 0, confirmed = 0;
  for (var i = 0; i < appointments.length; i++) {
    if (appointments[i].status === 'pending') pending++;
    if (appointments[i].status === 'confirmed') confirmed++;
  }
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statConfirmed').textContent = confirmed;
  document.getElementById('statDoctors').textContent = DOCTORS.length;
}
function init() {
  loadData();
  var tabs = document.querySelectorAll('.tab');
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener('click', function() {
      switchTab(this.getAttribute('data-tab'));
    });
  }
  var filters = document.querySelectorAll('.filter-btn');
  for (var j = 0; j < filters.length; j++) {
    filters[j].addEventListener('click', function() {
      var f = document.querySelectorAll('.filter-btn');
      for (var x = 0; x < f.length; x++) f[x].classList.remove('active');
      this.classList.add('active');
      currentFilter = this.getAttribute('data-filter');
      renderAppointments();
    });
  }
  document.getElementById('bookBtn').addEventListener('click', bookAppointment);
  var today = new Date().toISOString().split('T')[0];
  document.getElementById('pDate').min = today;
  renderDoctors();
  renderAllDoctors();
  updateStats();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}