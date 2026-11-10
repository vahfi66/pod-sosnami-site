"use strict";

const select = (selector, scope = document) => scope.querySelector(selector);
const all = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const money = new Intl.NumberFormat("ru-RU", {
  style: "currency", currency: "RUB", maximumFractionDigits: 0,
});
const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");

const specs = {
  home: {
    name: "Дом", min: 40, max: 300, initial: 112, shell: 48000, ready: 73000,
    shellName: "Утеплённый дом без отделки", readyName: "Готовый дом",
    readyDescription: "С отделкой, электрикой, отоплением и сантехникой",
    base: ["Фундамент", "Утеплённые стены и крыша", "Фасад, окна и входная дверь"],
    extra: ["Отделка стен, пола и потолка", "Межкомнатные двери", "Электрика, отопление и сантехника внутри дома"],
  },
  bath: {
    name: "Баня", min: 12, max: 90, initial: 32, shell: 53000, ready: 79000,
    shellName: "Утеплённая баня без отделки", readyName: "Готовая баня",
    readyDescription: "С отделкой парной, полками и печью",
    base: ["Фундамент", "Утеплённые стены и крыша", "Фасад, окна и входная дверь"],
    extra: ["Отделка парной и комнаты отдыха", "Полки и печь с дымоходом", "Освещение"],
  },
};

const projects = [
  { id: "sosny", name: "Сосны", type: "home", area: 112, facts: "1 этаж · 3 спальни", description: "Кухня-гостиная с выходом на крытую террасу и три спальни в отдельной части дома." },
  { id: "lug", name: "Луг", type: "home", area: 68, facts: "1 этаж · 2 спальни", description: "Компактный дом для дачи с двумя спальнями и большой кухней-гостиной." },
  { id: "bereg", name: "Берег", type: "home", area: 154, facts: "2 этажа · 4 спальни", description: "На первом этаже общая гостиная и спальня. На втором — три спальни и ванная." },
  { id: "bath", name: "Терраса", type: "bath", area: 32, facts: "Парная 6 м² · крытая терраса", description: "Парная, душевая и комната отдыха с выходом на крытую террасу." },
  { id: "birch", name: "Берёза", type: "bath", area: 22, facts: "Парная 5 м² · комната отдыха", description: "Небольшая баня с парной, душевой и комнатой отдыха." },
];

const plans = {
  sosny: [[0,0,224,148,"Кухня-гостиная"],[224,0,124,94,"Спальня"],[348,0,124,94,"Спальня"],[224,94,248,54,"Холл"],[0,148,178,74,"Терраса"],[178,148,117,74,"Прихожая"],[295,148,73,74,"Санузел"],[368,148,104,74,"Спальня"]],
  lug: [[0,0,262,148,"Кухня-гостиная"],[262,0,105,148,"Спальня"],[367,0,105,148,"Спальня"],[0,148,247,74,"Терраса"],[247,148,128,74,"Прихожая"],[375,148,97,74,"Санузел"]],
  bereg: [[0,0,135,122,"Гостиная"],[135,0,91,78,"Спальня"],[135,78,91,44,"Санузел"],[0,122,107,100,"Терраса"],[107,122,119,100,"Холл"],[246,0,110,100,"Спальня"],[356,0,116,100,"Спальня"],[246,100,226,47,"Холл"],[246,147,125,75,"Спальня"],[371,147,101,75,"Ванная"]],
  bath: [[0,0,225,150,"Комната отдыха"],[225,0,112,150,"Душевая"],[337,0,135,150,"Парная"],[0,150,472,72,"Терраса"]],
  birch: [[0,0,215,222,"Комната отдыха"],[215,0,107,222,"Душевая"],[322,0,150,222,"Парная"]],
};

const planFurniture = {
  "Спальня": '<rect x="29" y="8" width="42" height="44" rx="3"/><path d="M29 25h42M50 10v13"/><rect x="14" y="8" width="10" height="13"/><rect x="76" y="8" width="10" height="13"/>',
  "Кухня-гостиная": '<path d="M8 31V8h44v9H19v14z"/><rect x="68" y="16" width="24" height="34" rx="3"/><path d="M72 20v25m0-12h17"/><circle cx="60" cy="33" r="5"/>',
  "Гостиная": '<rect x="21" y="13" width="58" height="24" rx="3"/><path d="M25 19h50m-29 0v15"/><rect x="38" y="44" width="26" height="11" rx="4"/>',
  "Терраса": '<rect x="35" y="18" width="30" height="28" rx="3"/><path d="M39 14h22m-22 36h22M31 23v18m38-18v18"/>',
  "Комната отдыха": '<rect x="19" y="15" width="62" height="22" rx="3"/><path d="M24 20h52m-26 0v12"/><rect x="39" y="44" width="22" height="10" rx="3"/>',
  "Парная": '<path d="M14 12h72v17H31v23H14zm6 6h60M21 23v23"/><rect x="68" y="38" width="18" height="14" rx="2"/>',
};

function planGraphic(project, compact = false) {
  const rooms = plans[project.id].map(([x, y, w, h, label]) => {
    const fill = label === "Терраса" ? "#e3d3bd" : "#efeade";
    const furniture = planFurniture[label];
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>
      ${furniture ? `<g stroke="#7b8070" stroke-width="1.3" transform="translate(${x} ${y}) scale(${w / 100} ${h / 100})">${furniture}</g>` : ""}
      ${compact && label === "Терраса" ? "" : `<text x="${x + w / 2}" y="${y + h * (furniture ? 0.77 : 0.5)}" dominant-baseline="middle">${label}</text>`}`;
  }).join("");
  const twoFloors = project.id === "bereg";
  const terrace = plans[project.id].find(room => room[4] === "Терраса");
  const marking = terrace && compact ? `
    <path d="M${terrace[0]} 231v9m0-4h${terrace[2]}m0-5v9" stroke="#596557" fill="none"/>
    <text x="${terrace[0] + terrace[2] / 2}" y="254" text-anchor="middle" fill="#435344" font-size="15">Терраса</text>` : "";
  const footerY = twoFloors && marking ? 277 : 247;
  const footer = twoFloors
    ? '<text x="113">1 этаж</text><text x="359">2 этаж</text>'
    : marking ? "" : `<text x="236">${project.area} м²</text>`;
  return `<svg viewBox="-14 -14 500 ${footerY + 33}" role="img" aria-label="Демонстрационная планировка проекта «${project.name}»">
    <g stroke="#596557" stroke-width="2" fill="none" text-anchor="middle" font-size="${compact ? 16 : 18}"
      font-family="Manrope, Arial" style="paint-order:stroke">
      ${rooms.replaceAll("<text ", '<text fill="#29382e" stroke="none" ')}
    </g>
    ${marking}
    <g transform="translate(0 ${footerY})" text-anchor="middle" fill="#435344" font-size="16">${footer}</g>
  </svg>`;
}

function accent(target, options = {}) {
  if (!window.gsap || !motion.matches) return;
  gsap.fromTo(target, { opacity: 0.72, y: 5 }, {
    opacity: 1, y: 0, duration: 0.26, ease: "power2.out", overwrite: true,
    clearProps: "opacity,transform", ...options,
  });
}

function press(buttons, key, value) {
  buttons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset[key] === value)));
}

function goTo(id) {
  const target = document.getElementById(id);
  target.scrollIntoView({ behavior: motion.matches ? "smooth" : "instant", block: "start" });
  target.focus({ preventScroll: true });
}

const grid = select("#project-grid");
const filters = all("[data-filter]");
let catalogType = "home";

function renderCatalog(type) {
  catalogType = type;
  press(filters, "filter", type);
  grid.innerHTML = projects.filter(project => project.type === type).map(project => `
    <article class="project-card" id="card-${project.id}">
      <button class="project-photo" type="button" data-open="${project.id}" aria-expanded="false" aria-controls="detail-${project.id}" aria-label="Смотреть проект «${project.name}»">
        <img src="assets/${project.id}.webp" alt="" loading="lazy">
      </button>
      <div class="project-info">
        <h3>${project.name}</h3><p class="project-meta">${project.area} м² · ${project.facts}</p>
        <div class="project-plan">${planGraphic(project, true)}</div>
        <span class="project-price">от ${money.format(project.area * specs[type].shell)}</span>
        <button class="button button-dark" type="button" data-open="${project.id}" aria-expanded="false" aria-controls="detail-${project.id}">Смотреть проект <span aria-hidden="true">↗</span></button>
      </div>
    </article>
    <div class="project-detail" id="detail-${project.id}" tabindex="-1" hidden></div>
  `).join("");
  window.ScrollTrigger?.refresh();
}

function closeDetails(detail, restoreFocus = false) {
  const id = detail.id.slice(7);
  detail.hidden = true;
  const controls = all(`[data-open="${id}"]`, grid);
  controls.forEach(button => button.setAttribute("aria-expanded", "false"));
  if (restoreFocus) controls[1]?.focus();
  window.ScrollTrigger?.refresh();
}

function openProject(project) {
  if (project.type !== catalogType) renderCatalog(project.type);
  all(".project-detail:not([hidden])", grid).forEach(detail => closeDetails(detail));
  const detail = select(`#detail-${project.id}`);
  detail.innerHTML = `
    <div class="detail-head"><h3>Проект «${project.name}»</h3>
      <button type="button" class="detail-close" data-close>Свернуть <span aria-hidden="true">−</span></button></div>
    <div class="detail-tabs segmented" aria-label="Вид проекта">
      <button type="button" data-view-tab="photo" aria-pressed="true">Фото</button>
      <button type="button" data-view-tab="plan" aria-pressed="false">Планировка</button>
    </div>
    <div class="detail-media" data-view="photo">
      <img src="assets/${project.id}.webp" alt="Фасад проекта «${project.name}»">
      <div class="plan-frame">${planGraphic(project)}</div>
    </div>
    <div class="detail-links"><p>${project.description}</p>
      <a href="#calculator" class="button button-dark" data-calculate="${project.id}">Рассчитать стоимость <span aria-hidden="true">↗</span></a>
    </div>`;
  detail.hidden = false;
  all(`[data-open="${project.id}"]`, grid).forEach(button => button.setAttribute("aria-expanded", "true"));
  accent(detail);
  goTo(detail.id);
  window.ScrollTrigger?.refresh();
}

filters.forEach(button => button.addEventListener("click", () => {
  if (button.dataset.filter !== catalogType) renderCatalog(button.dataset.filter);
}));
all("[data-category]").forEach(link => link.addEventListener("click", () => {
  if (link.dataset.category !== catalogType) renderCatalog(link.dataset.category);
}));

grid.addEventListener("click", event => {
  const control = event.target.closest("button, a");
  if (!control) return;
  if (control.dataset.open) {
    const detail = select(`#detail-${control.dataset.open}`);
    if (detail.hidden) openProject(projects.find(project => project.id === control.dataset.open));
    else closeDetails(detail, true);
  }
  if (control.hasAttribute("data-close")) closeDetails(control.closest(".project-detail"), true);
  if (control.dataset.viewTab) {
    const detail = control.closest(".project-detail");
    select(".detail-media", detail).dataset.view = control.dataset.viewTab;
    press(all("[data-view-tab]", detail), "viewTab", control.dataset.viewTab);
  }
  if (control.dataset.calculate) {
    const project = projects.find(item => item.id === control.dataset.calculate);
    setType(project.type, project);
  }
});

const range = select("#area-range");
const number = select("#area-number");
const areaError = select("#area-error");
const estimateLink = select("#estimate-link");
const typeButtons = all("[data-calc-type]");
const packageInputs = all('input[name="package"]');
let calcType = "home";
let selected = null;
let area = specs.home.initial;
let estimateRequested = false;

function setType(type, project = null) {
  calcType = type;
  selected = project;
  const spec = specs[type];
  press(typeButtons, "calcType", type);
  [range, number].forEach(input => {
    input.min = spec.min;
    input.max = spec.max;
  });
  select("#area-min").textContent = `${spec.min} м²`;
  select("#area-max").textContent = `${spec.max} м²`;
  select("#shell-title").textContent = spec.shellName;
  select("#shell-desc").textContent = type === "home"
    ? "С окнами и входной дверью, без отделки и коммуникаций"
    : "С окнами и дверью, без отделки парной и печи";
  select("#ready-title").textContent = spec.readyName;
  select("#ready-desc").textContent = spec.readyDescription;
  select("#selected-project").hidden = !project;
  select("#selected-name").textContent = project ? `Проект «${project.name}»` : "";
  setArea(project?.area ?? spec.initial);
}

function setArea(value, syncNumber = true) {
  area = value;
  if (area === null) {
    const { min, max } = specs[calcType];
    const message = `Введите целое число от ${min} до ${max} м².`;
    number.setAttribute("aria-invalid", "true");
    if (areaError.textContent !== message) areaError.textContent = message;
  } else {
    range.value = area;
    if (syncNumber) number.value = area;
    number.removeAttribute("aria-invalid");
    areaError.textContent = "";
    if (selected && selected.area !== area) {
      selected = null;
      select("#selected-project").hidden = true;
    }
  }
  updateEstimate();
}

function updateEstimate(animate = false) {
  const spec = specs[calcType];
  const ready = packageInputs[1].checked;
  const rate = ready ? spec.ready : spec.shell;
  const valid = area !== null;
  const price = valid ? money.format(area * rate) : "—";
  select("#price").value = price;
  select("#formula").textContent = valid
    ? `${area} м² × ${money.format(rate)} за м²`
    : "Стоимость появится после ввода площади.";
  estimateLink.setAttribute("aria-disabled", String(!valid));
  select("#included").innerHTML = [...spec.base, ...(ready ? spec.extra : [])].map(item => `<li>${item}</li>`).join("");
  select("#addition").hidden = !ready || !valid;
  if (ready && valid) {
    select("#addition").textContent = `+${money.format(area * (spec.ready - spec.shell))} к варианту без отделки`;
  }
  select("#summary-text").textContent = valid
    ? `${selected?.name ?? spec.name} · ${area} м² · ${ready ? spec.readyName : spec.shellName}`
    : "";
  select("#summary-price").textContent = price;
  select("#estimate-summary").hidden = !estimateRequested || !valid;
  if (animate) accent([select("#price"), select("#included")]);
}

typeButtons.forEach(button => button.addEventListener("click", () => {
  if (calcType !== button.dataset.calcType) setType(button.dataset.calcType);
}));
range.addEventListener("input", () => setArea(range.valueAsNumber));
number.addEventListener("input", () => {
  setArea(number.validity.valid ? number.valueAsNumber : null, false);
});
packageInputs.forEach(input => input.addEventListener("change", () => updateEstimate(true)));
select("#clear-project").addEventListener("click", () => {
  selected = null;
  select("#selected-project").hidden = true;
  number.focus();
  updateEstimate();
});

const tourData = {
  home: { title: "Экскурсия по дому «Сосны»", duration: "0:12", project: "sosny" },
  bath: { title: "Обзор бани «Терраса»", duration: "0:09", project: "bath" },
};
const video = select("#tour-video");
const cover = select("#play-tour");
const tourImage = select("#tour-image");
let tour = "home";
let playAttempt = 0;

function showVideoError() {
  video.hidden = true;
  cover.hidden = false;
  select("#tour-error").hidden = false;
  cover.focus({ preventScroll: true });
}

cover.addEventListener("click", async () => {
  const attempt = ++playAttempt;
  select("#tour-error").hidden = true;
  video.poster = tourImage.src;
  video.src = `assets/tour-${tour}.mp4`;
  video.hidden = false;
  cover.hidden = true;
  video.focus({ preventScroll: true });
  try {
    await video.play();
  } catch {
    if (attempt === playAttempt) showVideoError();
  }
});

const tourButtons = all("[data-tour]");
tourButtons.forEach(button => button.addEventListener("click", () => {
  if (button.dataset.tour === tour) return;
  tour = button.dataset.tour;
  playAttempt++;
  video.pause();
  video.removeAttribute("src");
  video.load();
  video.hidden = true;
  cover.hidden = false;
  const data = tourData[tour];
  tourImage.src = `assets/tour-${tour}-poster.webp`;
  select("#tour-title").textContent = data.title;
  select("#tour-note").textContent = `Демонстрационный обзор · ${data.duration}`;
  select("#tour-error").hidden = true;
  press(tourButtons, "tour", tour);
  if (window.gsap && motion.matches) {
    gsap.fromTo(cover, { opacity: 0.84 }, {
      opacity: 1, duration: 0.24, ease: "power2.out", overwrite: true, clearProps: "opacity",
    });
  }
  if (window.matchMedia("(max-width: 900px)").matches) {
    const player = cover.parentElement;
    const { top, bottom } = player.getBoundingClientRect();
    if (top < 0 || bottom > window.innerHeight) {
      player.scrollIntoView({ behavior: motion.matches ? "smooth" : "instant" });
      cover.focus({ preventScroll: true });
    }
  }
}));
select("#tour-project").addEventListener("click", event => {
  event.preventDefault();
  openProject(projects.find(project => project.id === tourData[tour].project));
});

const form = select("#estimate-form");
const visitorName = select("#visitor-name");
const phone = select("#visitor-phone");
const phoneError = select("#phone-error");
const success = select("#form-success");

function resetForm() {
  form.reset();
  form.hidden = false;
  success.hidden = true;
  phoneError.hidden = true;
  phone.removeAttribute("aria-invalid");
}

estimateLink.addEventListener("click", event => {
  if (area === null) {
    event.preventDefault();
    number.focus();
    return;
  }
  estimateRequested = true;
  updateEstimate();
  if (form.hidden) resetForm();
});
visitorName.addEventListener("input", () => visitorName.setCustomValidity(""));
phone.addEventListener("input", () => {
  phoneError.hidden = true;
  phone.removeAttribute("aria-invalid");
});
form.addEventListener("submit", event => {
  event.preventDefault();
  if (!visitorName.value.trim()) {
    visitorName.setCustomValidity("Введите имя.");
    visitorName.reportValidity();
    return;
  }
  const digits = phone.value.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15 || /[^\d+()\s-]/.test(phone.value)) {
    phoneError.hidden = false;
    phone.setAttribute("aria-invalid", "true");
    phone.focus();
    return;
  }
  form.reset();
  form.hidden = true;
  success.hidden = false;
  accent(success);
  select("#success-title").focus();
});
select("#return-projects").addEventListener("click", () => {
  resetForm();
  select("#projects-title").setAttribute("tabindex", "-1");
  select("#projects-title").focus({ preventScroll: true });
});

renderCatalog("home");
setType("home");

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    gsap.timeline({ defaults: { ease: "power2.out", clearProps: "transform,opacity" } })
      .from(".hero-title-main, .hero-title-sub", { opacity: 0.68, y: 9, duration: 0.43, stagger: 0.09 }, 0)
      .from(".extension", { scaleY: 0, duration: 0.21 }, 0.15)
      .from(".dimension", { scaleX: 0, duration: 0.35 }, 0.36)
      .from(".hero-caption", { opacity: 0, y: 4, duration: 0.2 }, 0.65);
    all(".section-heading, .warranty-layout, .form-stage").forEach(section => {
      gsap.from(section, {
        y: 13, opacity: 0.84, duration: 0.46, ease: "power2.out",
        clearProps: "transform,opacity", scrollTrigger: { trigger: section, start: "top 93%", once: true },
      });
    });
  });
}
