const navigation = document.querySelector('#site-nav');
const menu = document.querySelector('.menu-toggle');
const narrow = matchMedia('(max-width: 760px)');
function resetNavigation() {
  menu.hidden = !narrow.matches;
  menu.setAttribute('aria-expanded', 'false');
  navigation.hidden = narrow.matches;
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!open));
  navigation.hidden = open;
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a') && narrow.matches) { navigation.hidden = true; menu.setAttribute('aria-expanded', 'false'); }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && narrow.matches && menu.getAttribute('aria-expanded') === 'true') {
    navigation.hidden = true; menu.setAttribute('aria-expanded', 'false'); menu.focus();
  }
});
narrow.addEventListener('change', resetNavigation);
resetNavigation();

const search = document.querySelector('#search');
const category = document.querySelector('#category');
if (search && category) {
  const rows = [...document.querySelectorAll('[data-plugin]')];
  const count = document.querySelector('#result-count');
  const empty = document.querySelector('#no-results');
  const params = new URLSearchParams(location.search);
  search.value = params.get('q') || '';
  if ([...category.options].some(option => option.value === params.get('category'))) category.value = params.get('category');
  function filter(updateURL = true) {
    const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const row of rows) {
      row.hidden = !(terms.every(term => row.dataset.search.includes(term)) && (!category.value || row.dataset.category === category.value));
      if (!row.hidden) visible++;
    }
    count.textContent = `${visible} ${visible === 1 ? 'plugin' : 'plugins'}`;
    empty.hidden = visible !== 0;
    if (updateURL) {
      const url = new URL(location.href);
      search.value.trim() ? url.searchParams.set('q', search.value.trim()) : url.searchParams.delete('q');
      category.value ? url.searchParams.set('category', category.value) : url.searchParams.delete('category');
      history.replaceState(null, '', url);
    }
  }
  search.addEventListener('input', () => filter());
  category.addEventListener('change', () => filter());
  document.querySelector('.catalog-tools').addEventListener('submit', event => { event.preventDefault(); filter(); });
  document.querySelector('#reset-filters').addEventListener('click', () => { search.value = ''; category.value = ''; filter(); search.focus(); });
  filter(false);
}

let statusTimer;
const status = document.querySelector('#copy-status');
document.addEventListener('click', async event => {
  const button = event.target.closest('[data-copy]');
  if (!button) return;
  clearTimeout(statusTimer);
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(button.dataset.copy);
    status.textContent = 'Command copied. Paste it into omp.';
    button.textContent = 'Copied';
    setTimeout(() => { button.textContent = 'Copy'; }, 1800);
    statusTimer = setTimeout(() => { status.textContent = ''; }, 5000);
  } catch {
    status.textContent = 'Copy unavailable. Select the command text and copy it manually.';
    const selection = window.getSelection();
    if (selection) { const range = document.createRange(); range.selectNodeContents(button.previousElementSibling); selection.removeAllRanges(); selection.addRange(range); }
  }
});

const canvas = document.querySelector('#night-lights');
const context = canvas.getContext('2d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let frame = 0;
let previous = 0;
let width = 0;
let height = 0;
let particles = [];
function resize() {
  width = innerWidth; height = innerHeight;
  const dpr = Math.min(devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  const amount = Math.min(30, Math.max(10, Math.round(width / 55)));
  particles = Array.from({ length: amount }, () => ({ x: Math.random() * width, y: Math.random() * height, r: .5 + Math.random() * 1.1, speed: 2 + Math.random() * 5, alpha: .14 + Math.random() * .3 }));
}
function draw(now) {
  frame = 0;
  if (document.hidden || reduced.matches) return;
  if (now - previous >= 40) {
    const delta = Math.min((now - previous) / 1000, .08); previous = now;
    context.clearRect(0, 0, width, height);
    for (const particle of particles) {
      particle.y -= particle.speed * delta;
      if (particle.y < -3) particle.y = height + 3;
      context.beginPath(); context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      context.fillStyle = `rgba(211,171,105,${particle.alpha})`; context.fill();
    }
  }
  frame = requestAnimationFrame(draw);
}
function syncMotion() {
  cancelAnimationFrame(frame); frame = 0;
  context.clearRect(0, 0, width, height);
  if (!reduced.matches && !document.hidden) { previous = performance.now(); frame = requestAnimationFrame(draw); }
}
if (context) {
  resize();
  addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', syncMotion);
  reduced.addEventListener('change', syncMotion);
  syncMotion();
}
