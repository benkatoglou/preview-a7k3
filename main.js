/* Anna Bellou · homepage v5 behaviour */
document.documentElement.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = () => matchMedia('(hover: hover) and (min-width: 1181px)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- sticky header: soft shadow once the page moves ---------- */
const bar = $('.bar');
const syncBar = () => bar.classList.toggle('is-scrolled', scrollY > 4);

/* ---------- current page in the nav ---------- */
(() => { const p = document.body.dataset.page; const t = p && $('.nav [data-page="' + p + '"]'); if (t) t.setAttribute('aria-current', 'page'); })();

/* ---------- mega menus ---------- */
(() => {
  const items = $$('.has-mega');
  const close = except => items.forEach(li => { if (li !== except) { li.classList.remove('is-open'); $('.nav__top', li).setAttribute('aria-expanded', 'false'); } });
  const open = li => { close(li); li.classList.add('is-open'); $('.nav__top', li).setAttribute('aria-expanded', 'true'); $('#search').hidden = true; };
  let t; // one shared timer, so moving from one item to the next never closes the new one
  items.forEach(li => {
    const btn = $('.nav__top', li);
    btn.addEventListener('click', () => li.classList.contains('is-open') ? close() : open(li));
    li.addEventListener('mouseenter', () => { if (canHover()) { clearTimeout(t); open(li); } });
    li.addEventListener('mouseleave', () => { if (canHover()) t = setTimeout(close, 180); });
    $$('a', li).forEach(a => a.addEventListener('click', () => close()));
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') { const o = $('.has-mega.is-open'); close(); o && $('.nav__top', o).focus(); $('#search').hidden = true; } });
  document.addEventListener('click', e => { if (!e.target.closest('.bar')) { close(); $('#search').hidden = true; } });

  const rails = $$('.rail');
  const show = r => rails.forEach(x => { const on = x === r, p = $('#' + x.getAttribute('aria-controls')); x.classList.toggle('is-on', on); x.setAttribute('aria-selected', String(on)); p.hidden = !on; p.classList.toggle('is-on', on); });
  rails.forEach(r => { r.addEventListener('mouseenter', () => show(r)); r.addEventListener('focus', () => show(r)); r.addEventListener('click', () => show(r)); });

  const sb = $('#search-btn'), s = $('#search');
  sb.addEventListener('click', () => { close(); s.hidden = !s.hidden; sb.setAttribute('aria-expanded', String(!s.hidden)); if (!s.hidden) $('input', s).focus(); });
  s.addEventListener('submit', e => { e.preventDefault(); s.hidden = true; location.hash = '#diathesima'; });

  const b = $('.burger'), d = $('#drawer');
  b.addEventListener('click', () => { d.hidden = !d.hidden; b.setAttribute('aria-expanded', String(!d.hidden)); });
  $$('a', d).forEach(a => a.addEventListener('click', () => { d.hidden = true; b.setAttribute('aria-expanded', 'false'); }));
})();

/* ---------- seal: HTML letters on a circle; shrinks into "back to top" ---------- */
(() => {
  const seal = $('.seal'); if (!seal) return;   // homepage only
  const ring = $('[data-ring]', seal);
  const lay = text => {
    const chars = [...text.replace(/\s+/g, ' ').trim() + ' '];
    const step = 360 / chars.length;
    ring.innerHTML = chars.map((c, i) => `<span style="transform:rotate(${(i * step).toFixed(2)}deg)">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
  };
  const base = ring.dataset.text, alt = ring.dataset.alt;
  lay(base);
  let small = false, swap;
  const sync = () => {
    const s = scrollY > innerHeight * 0.55;
    if (s === small) return; small = s;
    seal.classList.toggle('is-small', s);
    seal.setAttribute('aria-label', s ? 'Πίσω στην κορυφή' : 'Εμπορία γεωργικών μηχανημάτων και εξοπλισμού');
    clearTimeout(swap); ring.classList.add('is-swapping');
    swap = setTimeout(() => { lay(s ? alt : base); requestAnimationFrame(() => ring.classList.remove('is-swapping')); }, 300);
  };
  addEventListener('scroll', sync, { passive: true }); sync();
  seal.addEventListener('click', e => { if (!small) return; e.preventDefault(); scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
})();

/* ---------- entrances: snappy slide-in, staggered per batch, once ---------- */
(() => {
  const els = $$('[data-r]');
  if (reduce || !('IntersectionObserver' in window)) return els.forEach(e => e.classList.add('is-in'));
  const io = new IntersectionObserver(entries => {
    const hits = entries.filter(e => e.isIntersecting).map(e => e.target)
      .sort((a, b) => { const r = a.getBoundingClientRect(), q = b.getBoundingClientRect(); return (r.top - q.top) || (r.left - q.left); });
    hits.forEach((el, i) => { el.style.setProperty('--d', `${Math.min(i, 8) * 70}ms`); el.classList.add('is-in'); io.unobserve(el); });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
  els.forEach(el => io.observe(el));
  // safety net for jumps (anchor links, fast flicks): anything already above the fold's bottom shows at once
  const sweep = () => els.forEach(el => { if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < innerHeight) { el.classList.add('is-in'); io.unobserve(el); } });
  let st; addEventListener('scroll', () => { clearTimeout(st); st = setTimeout(sweep, 120); }, { passive: true });
})();

/* ---------- about statement: grey → white, done when the text reaches ~55% of the screen ---------- */
(() => {
  const p = $('[data-fill]'); if (!p) return;
  p.innerHTML = p.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  const words = $$('.w', p);
  if (reduce) return words.forEach(w => w.style.setProperty('--p', 1));
  const update = () => {
    const r = p.getBoundingClientRect(), vh = innerHeight;
    // 0 when the text's top enters at 92% of the viewport, 1 when its middle reaches 55%
    const start = vh * 0.92, end = vh * 0.55;
    const t = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height / 2)));
    const pos = t * words.length;
    words.forEach((w, i) => w.style.setProperty('--p', Math.min(1, Math.max(0, pos - i)).toFixed(3)));
  };
  addEventListener('scroll', () => requestAnimationFrame(update), { passive: true }); addEventListener('resize', update); update();
})();

/* ---------- services accordion: expand details + slide the matching image ---------- */
const openService = (() => {
  const items = $$('.svc__item'), imgs = $$('.svc__media img');
  let cur = 0;
  const go = i => {
    if (i === cur || !items.length) return;
    items.forEach((it, j) => { it.classList.toggle('is-open', j === i); $('.svc__btn', it).setAttribute('aria-expanded', String(j === i)); });
    imgs.forEach(im => im.classList.remove('is-prev'));
    const prev = imgs[cur], next = imgs[i];
    // park the incoming image on the right without animating, then slide it in
    next.style.transition = 'none'; next.style.transform = 'translateX(100%)'; next.offsetWidth;
    next.style.transition = ''; next.style.transform = '';
    prev.classList.remove('is-on'); prev.classList.add('is-prev'); next.classList.add('is-on');
    cur = i;
  };
  items.forEach((it, i) => $('.svc__btn', it).addEventListener('click', () => go(i)));
  return go;
})();
$$('[data-svc]').forEach(a => a.addEventListener('click', () => openService(+a.dataset.svc)));

/* ---------- facts: count up once ---------- */
(() => {
  const nums = $$('[data-countup]'); if (reduce || !nums.length) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; io.unobserve(e.target);
    const el = e.target, to = +el.dataset.countup, suf = el.dataset.suffix || '', t0 = performance.now(), dur = 1400;
    const tick = now => { const k = Math.min(1, (now - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - k, 3))); el.textContent = v + suf; if (k < 1) requestAnimationFrame(tick); };
    el.textContent = '0' + suf; requestAnimationFrame(tick);
  }), { threshold: 0.6 });
  nums.forEach(n => io.observe(n));
})();

/* ---------- parallax: hero, about photos, closing horizon ---------- */
(() => {
  const layers = $$('[data-parallax]'); if (reduce || !layers.length) return;
  let ticking = false;
  const run = () => {
    ticking = false; const vh = innerHeight;
    layers.forEach(el => {
      const box = el.parentElement.getBoundingClientRect(), f = +el.dataset.parallax;
      if (box.bottom < -50 || box.top > vh + 50) return;
      let y;
      if (el.closest('.hero')) y = Math.min(Math.max(scrollY, 0), box.height) * f;             // drifts down as you leave
      else { const p = (box.top + box.height / 2 - vh / 2) / (vh / 2 + box.height / 2); y = -Math.max(-1, Math.min(1, p)) * f * box.height; }
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    });
  };
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } };
  addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); run();
})();

/* ---------- carousels: arrows page by the visible width, progress bar follows ---------- */
$$('[data-carousel]').forEach(c => {
  const track = $('.carousel__track', c), prev = $('[data-prev]', c), next = $('[data-next]', c), bar = $('.carousel__bar span', c);
  const step = () => {
    const card = track.firstElementChild, gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const per = Math.max(1, Math.floor((track.clientWidth + gap) / (card.offsetWidth + gap)));
    return per * (card.offsetWidth + gap);
  };
  const sync = () => {
    const max = track.scrollWidth - track.clientWidth, x = track.scrollLeft;
    prev.disabled = x <= 2; next.disabled = x >= max - 2;
    if (bar) {
      const w = track.clientWidth / track.scrollWidth;
      bar.style.setProperty('--w', (w * 100) + '%');
      bar.style.setProperty('--x', (max ? (x / max) * ((1 - w) / w) * 100 : 0) + '%');
    }
  };
  prev.addEventListener('click', () => track.scrollBy({ left: -step() }));
  next.addEventListener('click', () => track.scrollBy({ left: step() }));
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next.click(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev.click(); }
  });
  track.addEventListener('scroll', sync, { passive: true });
  track.addEventListener('scrollend', sync);
  addEventListener('resize', sync); sync();
});

/* =========================================================
   CATEGORY PAGE · client-side filters, sort, "load more"
   ========================================================= */
(() => {
  const shop = $('[data-shop]'); if (!shop) return;
  const form = $('#filter-form'), grid = $('[data-grid]'), cards = $$('.card', grid), PAGE = 12;
  let limit = PAGE;
  const val = c => c.dataset;
  const uniq = k => [...new Set(cards.map(c => val(c)[k]))];

  // build category + brand checkboxes, and year selects, from the cards themselves
  const opt = (k, name) => uniq(k).sort((a, b) => a.localeCompare(b, 'el')).map(v =>
    `<label class="check"><input type="checkbox" name="${name}" value="${v}"><span>${v}</span><small data-count="${name}:${v}"></small></label>`).join('');
  $('[data-options="group"]', form).innerHTML = opt('group', 'group');
  $('[data-options="brand"]', form).innerHTML = opt('brand', 'brand');
  const years = uniq('year').map(Number).sort((a, b) => b - a);
  ['yfrom', 'yto'].forEach(n => years.forEach(y => form[n].insertAdjacentHTML('beforeend', `<option value="${y}">${y}</option>`)));

  const state = () => {
    const fd = new FormData(form);
    return { deal: fd.get('deal'), cond: fd.getAll('cond'), group: fd.getAll('group'), brand: fd.getAll('brand'), yfrom: +fd.get('yfrom') || 0, yto: +fd.get('yto') || 9999, hp: +fd.get('hp') || 0 };
  };
  const pass = (c, s, skip) => {
    const d = val(c);
    return (skip === 'deal' || s.deal === 'all' || d.deal === s.deal)
      && (skip === 'cond' || !s.cond.length || s.cond.includes(d.cond))
      && (skip === 'group' || !s.group.length || s.group.includes(d.group))
      && (skip === 'brand' || !s.brand.length || s.brand.includes(d.brand))
      && +d.year >= s.yfrom && +d.year <= s.yto
      && (!s.hp || +d.hp >= s.hp);
  };
  cards.forEach((c, i) => c.dataset.rank = i);
  const sorters = {
    rec: (a, b) => a.dataset.rank - b.dataset.rank,
    new: (a, b) => b.dataset.year - a.dataset.year,
    old: (a, b) => a.dataset.year - b.dataset.year,
    'hp-desc': (a, b) => b.dataset.hp - a.dataset.hp,
    'hp-asc': (a, b) => (+a.dataset.hp || 999) - (+b.dataset.hp || 999),
    'hours-asc': (a, b) => (+a.dataset.hours || 1e6) - (+b.dataset.hours || 1e6),
  };
  const labels = { sale: 'Πώληση', rent: 'Ενοικίαση', new: 'Καινούργιο', used: 'Μεταχειρισμένο' };

  const render = (animate) => {
    const s = state();
    const sorted = [...cards].sort(sorters[$('[data-sort]').value]);
    sorted.forEach(c => grid.appendChild(c));
    const shown = sorted.filter(c => pass(c, s));
    sorted.forEach(c => { c.hidden = !shown.includes(c); c.classList.remove('is-paged', 'is-new'); });
    shown.forEach((c, i) => { if (i >= limit) c.classList.add('is-paged'); else if (animate) { c.classList.add('is-new'); c.style.animationDelay = `${Math.min(i, 8) * 40}ms`; } });
    // counts next to each option reflect the other active filters (faceted)
    $$('[data-count]', form).forEach(el => { const [k, v] = el.dataset.count.split(':'); el.textContent = cards.filter(c => pass(c, s, k) && val(c)[k] === v).length; });
    $$('[data-shown]').forEach(el => el.textContent = shown.length);
    $('[data-visible]').textContent = Math.min(limit, shown.length);
    $('[data-total]').textContent = cards.length;
    $('[data-empty]').hidden = shown.length > 0;
    const more = $('[data-more]'); more.hidden = shown.length <= PAGE && limit >= shown.length;
    $('[data-load]').hidden = limit >= shown.length;
    const bar = $('.more__bar span'); if (bar) bar.style.setProperty('--w', (Math.min(1, limit / Math.max(1, shown.length)) * 100) + '%');
    form.hpout.value = s.hp ? `από ${s.hp} hp` : 'όλες';
    // active filter chips
    const chips = [];
    if (s.deal !== 'all') chips.push(['deal', s.deal, labels[s.deal]]);
    s.cond.forEach(v => chips.push(['cond', v, labels[v]]));
    s.group.forEach(v => chips.push(['group', v, v]));
    s.brand.forEach(v => chips.push(['brand', v, v]));
    if (s.yfrom) chips.push(['yfrom', '', `από ${s.yfrom}`]);
    if (s.yto < 9999) chips.push(['yto', '', `έως ${s.yto}`]);
    if (s.hp) chips.push(['hp', '', `${s.hp}+ hp`]);
    $('[data-active-chips]').innerHTML = chips.map(([k, v, t]) => `<button class="chip" type="button" data-k="${k}" data-v="${v}">${t}<svg><use href="#close"/></svg></button>`).join('');
    $('[data-nfilters]').textContent = chips.length ? `(${chips.length})` : '';
  };

  form.addEventListener('input', () => { limit = PAGE; render(true); });
  form.addEventListener('reset', () => setTimeout(() => { limit = PAGE; render(true); }));
  $('[data-sort]').addEventListener('change', () => render(true));
  $('[data-reset]').addEventListener('click', () => form.reset());
  $('[data-load]').addEventListener('click', () => {
    const before = limit; limit += PAGE; render(false);
    $$('.card:not([hidden]):not(.is-paged)', grid).slice(before).forEach((c, i) => { c.classList.add('is-new'); c.style.animationDelay = `${Math.min(i, 8) * 40}ms`; });
  });
  $('[data-active-chips]').addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    const { k, v } = b.dataset;
    if (k === 'deal') form.querySelector('[name="deal"][value="all"]').checked = true;
    else if (k === 'hp') form.hp.value = 0;
    else if (k === 'yfrom' || k === 'yto') form[k].value = '';
    else form.querySelector(`[name="${k}"][value="${CSS.escape(v)}"]`).checked = false;
    limit = PAGE; render(true);
  });

  // mobile: filters live in a drawer
  const panel = $('#filters'), opener = $('[data-filters-open]');
  const setOpen = on => { panel.classList.toggle('is-open', on); opener.setAttribute('aria-expanded', String(on)); document.body.style.overflow = on ? 'hidden' : ''; if (on) $('input', panel).focus(); else opener.focus(); };
  opener.addEventListener('click', () => setOpen(true));
  $$('[data-filters-close]').forEach(b => b.addEventListener('click', () => { if (panel.classList.contains('is-open')) setOpen(false); }));
  addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('is-open')) setOpen(false); });

  render(false);
})();

/* =========================================================
   PRODUCT PAGE · gallery, form, sticky mobile CTA
   ========================================================= */
(() => {
  const g = $('[data-gallery]'); if (!g) return;
  const stage = $('.gallery__stage', g), imgs = $$('.gallery__stage > img', g), thumbs = $$('.thumb', g);
  const iEl = $('[data-gal-i]', g), nEl = $('[data-gal-n]', g); let cur = 0;
  const pad = n => String(n).padStart(2, '0');
  nEl.textContent = pad(imgs.length);
  const go = i => {
    cur = (i + imgs.length) % imgs.length;
    imgs.forEach((im, j) => im.classList.toggle('is-on', j === cur));
    thumbs.forEach((t, j) => { t.classList.toggle('is-on', j === cur); t.setAttribute('aria-selected', String(j === cur)); });
    iEl.textContent = pad(cur + 1);
    thumbs[cur].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  };
  $('[data-gal-prev]', g).addEventListener('click', () => go(cur - 1));
  $('[data-gal-next]', g).addEventListener('click', () => go(cur + 1));
  thumbs.forEach((t, i) => t.addEventListener('click', () => go(i)));
  stage.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(cur + 1); if (e.key === 'ArrowLeft') go(cur - 1); });
  $('.gallery__thumbs', g).addEventListener('keydown', e => { if (e.key === 'ArrowRight') { go(cur + 1); thumbs[cur].focus(); } if (e.key === 'ArrowLeft') { go(cur - 1); thumbs[cur].focus(); } });
  // swipe / drag
  let x0 = null;
  stage.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; x0 = e.clientX; });
  addEventListener('pointerup', e => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1)); });
})();

(() => {
  const f = $('#enquiry-form'); if (!f) return;
  const rules = {
    name: v => v.trim().length > 1,
    phone: v => v.replace(/\D/g, '').length >= 10,
    email: v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  };
  const check = (name, show) => {
    const input = f.elements[name], field = input.closest('.field'), ok = rules[name](input.value);
    if (show || field.classList.contains('is-bad')) { field.classList.toggle('is-bad', !ok); $('.field__err', field).hidden = ok; input.setAttribute('aria-invalid', String(!ok)); }
    return ok;
  };
  Object.keys(rules).forEach(n => { f.elements[n].addEventListener('blur', () => f.elements[n].value && check(n, true)); f.elements[n].addEventListener('input', () => check(n, false)); });
  f.addEventListener('submit', e => {
    e.preventDefault();
    const bad = Object.keys(rules).filter(n => !check(n, true));
    const consent = f.elements.consent.checked; $('[data-consent-err]', f).hidden = consent;
    if (bad.length) return f.elements[bad[0]].focus();
    if (!consent) return f.elements.consent.focus();
    const done = $('.form__done', f); done.hidden = false; done.focus();   // replace with the real submit endpoint
  });
  // "Ενδιαφέρομαι" from the homepage or a rental link can preselect the intent
  if (location.hash === '#aitisi' && /rent/.test(location.search)) f.querySelector('[value="rent"]').checked = true;
})();

(() => {
  const bar = $('[data-pd-bar]'), cta = $('[data-pd-cta]'), form = $('#aitisi'); if (!bar || !cta) return;
  let ctaGone = false, formIn = false;
  const sync = () => { const on = ctaGone && !formIn; bar.classList.toggle('is-on', on); bar.setAttribute('aria-hidden', String(!on)); $('a', bar).tabIndex = on ? 0 : -1; };
  new IntersectionObserver(([e]) => { ctaGone = !e.isIntersecting && e.boundingClientRect.top < 0; sync(); }).observe(cta);
  const seen = new Set();   // hide while the form or the footer is on screen
  const io = new IntersectionObserver(es => { es.forEach(e => e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)); formIn = seen.size > 0; sync(); }, { threshold: 0.05 });
  io.observe(form); const ft = $('.foot'); if (ft) io.observe(ft);
})();

$('[data-share]')?.addEventListener('click', e => {
  navigator.clipboard?.writeText(location.href.split('#')[0]).then(() => { e.target.textContent = 'Ο σύνδεσμος αντιγράφηκε'; setTimeout(() => e.target.textContent = 'Αντιγραφή συνδέσμου', 2200); });
});

addEventListener('scroll', syncBar, { passive: true }); syncBar();
