'use strict';

/* ---------- Til ---------- */
const T = {
  uz: {
    title2: "ni o'rganmoqchimisiz?",
    lead: "U holda raqamingizni qoldiring va biz barcha savollaringizga javob beramiz.",
    name: "Ismingiz", age: "O'quvchi yoshi", ageSuffix: " yosh", send: "Yuborish",
    thanks: "Rahmat!", accepted: "So'rovingiz qabul qilindi. Tez orada siz bilan bog'lanamiz.",
    eName: "Ismingizni kiriting", eAge: "Yoshni tanlang", ePhone: "Telefon raqamini to'liq kiriting",
    eSend: "Xatolik yuz berdi. Qayta urinib ko'ring."
  },
  ru: {
    title2: "хотите изучать?",
    lead: "Тогда оставьте свой номер, и мы ответим на все ваши вопросы.",
    name: "Ваше имя", age: "Возраст ученика", ageSuffix: " лет", send: "Отправить",
    thanks: "Спасибо!", accepted: "Ваша заявка принята. Скоро мы свяжемся с вами.",
    eName: "Введите имя", eAge: "Выберите возраст", ePhone: "Введите номер полностью",
    eSend: "Произошла ошибка. Попробуйте ещё раз."
  }
};
let lang = localStorage.getItem('lang') || 'uz';

const $ = (s) => document.querySelector(s);
const ageSel = $('#age');

function buildAges() {
  const t = T[lang], cur = ageSel.value;
  ageSel.innerHTML = '<option value="">' + t.age + '</option>';
  for (let a = 7; a <= 19; a++) ageSel.insertAdjacentHTML('beforeend', `<option value="${a}">${a}${t.ageSuffix}</option>`);
  ageSel.value = cur;
  ageSel.classList.toggle('empty', !ageSel.value);
}

function setLang(l) {
  lang = l; localStorage.setItem('lang', l);
  document.documentElement.lang = l;
  document.querySelectorAll('[data-t]').forEach(el => el.textContent = T[l][el.dataset.t]);
  $('#name').placeholder = T[l].name;
  document.querySelectorAll('.lang').forEach(b => b.classList.toggle('active', b.dataset.lang === l));
  buildAges();
}
document.querySelectorAll('.lang').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
ageSel.addEventListener('change', () => ageSel.classList.toggle('empty', !ageSel.value));

/* ---------- Logo (nuqtali aylana) ---------- */
(function logo() {
  const svg = $('#logo'); let s = '';
  [[44, 14, 2.6], [30, 9, 2.1], [18, 6, 1.6]].forEach(([r, n, d], ri) => {
    for (let i = 0; i < n * 2 / (ri + 1) + 4; i++) {
      const cnt = [18, 14, 10][ri], a = (i / cnt) * Math.PI * 2 + ri * .3;
      if (i >= cnt) break;
      s += `<circle cx="${50 + Math.cos(a) * r}" cy="${50 + Math.sin(a) * r}" r="${d}" fill="#161a3a"/>`;
    }
  });
  svg.innerHTML = s + '<circle cx="50" cy="50" r="5" fill="#ffd100"/>';
})();

/* ---------- Slayder ---------- */
const track = $('#track'), bars = $('#bars');
const N = track.children.length, DELAY = 4000;
let cur = 0, timer;
for (let i = 0; i < N; i++) bars.insertAdjacentHTML('beforeend', '<div class="bar"><i></i></div>');
const barEls = [...bars.children];

function show(i) {
  cur = (i + N) % N;
  track.style.transform = `translateX(-${cur * 100}%)`;
  barEls.forEach((b, k) => {
    b.classList.remove('run', 'done');
    if (k < cur) b.classList.add('done');
  });
  void bars.offsetWidth;
  barEls[cur].classList.add('run');
  clearTimeout(timer);
  timer = setTimeout(() => show(cur + 1), DELAY);
}
barEls.forEach((b, i) => b.addEventListener('click', () => show(i)));
show(0);

/* ---------- Telefon niqobi: 90 123 45 67 ---------- */
const phone = $('#phone');
phone.addEventListener('input', () => {
  let d = phone.value.replace(/\D/g, '');
  if (d.startsWith('998') && d.length > 9) d = d.slice(3);
  d = d.slice(0, 9);
  const p = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  phone.value = p.join(' ');
  phone.parentElement.classList.remove('bad');
});
$('#name').addEventListener('input', e => e.target.parentElement.classList.remove('bad'));
ageSel.addEventListener('change', () => ageSel.parentElement.classList.remove('bad'));

/* ---------- Forma ---------- */
const form = $('#form'), btn = $('#btn'), err = $('#err');
let sending = false;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (sending) return;                                   // ikki marta yuborishdan himoya
  const t = T[lang];
  const name = $('#name').value.trim(), age = ageSel.value, digits = phone.value.replace(/\D/g, '');
  document.querySelectorAll('.field').forEach(f => f.classList.remove('bad'));
  let msg = '';
  if (name.length < 2) { msg = t.eName; $('#name').parentElement.classList.add('bad'); }
  else if (!age) { msg = t.eAge; ageSel.parentElement.classList.add('bad'); }
  else if (digits.length !== 9) { msg = t.ePhone; phone.parentElement.classList.add('bad'); }
  err.textContent = msg;
  if (msg) return;

  sending = true; btn.disabled = true;
  btn.innerHTML = '<span class="spin"></span>';
  try {
    await sendLead({ name, age: +age, phone: '+998' + digits, lang });
    $('#formView').hidden = true;
    $('#doneView').hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (_) {
    err.textContent = t.eSend;
    btn.disabled = false; sending = false;
    btn.innerHTML = '<span data-t="send">' + t.send + '</span>';
  }
});

/* Demo rejim: haqiqiy serverga ulash uchun shu funksiyani almashtiring (fetch / Supabase / Telegram bot) */
function sendLead(data) {
  return new Promise(res => setTimeout(() => { console.log('Yangi ariza:', data); res(); }, 900));
}

setLang(lang);
