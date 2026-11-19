/* =====================================================
   1. EDIT THIS PART — dates, venues, links, photos
   (The invitation wording itself is in index.html)
   ===================================================== */
const CONFIG = {
  bride: "Sree Sahana Lakshmi",
  groom: "Kanagaraj",
  coupleShort: "S & K",

  wedding: {
    label: "Muhurtham",
    short: "10 · 12 · 2026",
    venue: "Mahalakshmi Thirumana Mahal",
    place: "Kovilpatti, Tuticorin District",
    start: "2026-12-10T10:30:00+05:30",
    end: "2026-12-10T11:30:00+05:30",
    maps: "" // optional: paste a Google Maps share link here; otherwise a search link is made
  },

  reception: {
    label: "Wedding Reception",
    short: "18 · 12 · 2026",
    venue: "Madras Hotel Ashoka",
    place: "47, Pantheon Road, Egmore, Chennai – 600 008",
    start: "2026-12-18T19:00:00+05:30",
    end: "2026-12-18T22:00:00+05:30",
    maps: ""
  },


  // Gallery photos: add or remove file names here (files live in the images/ folder)
  photos: [5, 1 , 6].map(n => `images/photo-${n}.jpeg`)
};

/* =====================================================
   2. Fill the page from CONFIG
   ===================================================== */
const get = (o, path) => path.split(".").reduce((a, k) => (a == null ? a : a[k]), o);
document.title = `${CONFIG.bride} & ${CONFIG.groom} — Wedding Invitation`;
document.querySelectorAll("[data-bind]").forEach(el => (el.textContent = get(CONFIG, el.dataset.bind) ?? ""));

const mapsUrl = ev => ev.maps || "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${ev.venue}, ${ev.place}`);
document.querySelectorAll("[data-map]").forEach(a => (a.href = mapsUrl(CONFIG[a.dataset.map])));

const gcalFmt = s => new Date(s).toISOString().replace(/[-:]|\.\d{3}/g, "");
document.querySelectorAll("[data-cal]").forEach(a => {
  const ev = CONFIG[a.dataset.cal];
  a.href = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(`${CONFIG.bride} & ${CONFIG.groom} – ${ev.label}`)}` +
    `&dates=${gcalFmt(ev.start)}/${gcalFmt(ev.end)}` +
    `&location=${encodeURIComponent(`${ev.venue}, ${ev.place}`)}`;
});

/* =====================================================
   3. Gallery + lightbox
   ===================================================== */
const photos = CONFIG.photos;
const lb = document.getElementById("lightbox"), lbImg = lb.querySelector("img");
let cur = 0;
function showPhoto(i) { cur = (i + photos.length) % photos.length; lbImg.src = photos[cur]; lb.hidden = false; document.body.classList.add("lb-open"); }
function closeLb() { lb.hidden = true; document.body.classList.remove("lb-open"); }
lb.querySelector(".lb-close").onclick = closeLb;
lb.querySelector(".prev").onclick = e => { e.stopPropagation(); showPhoto(cur - 1); };
lb.querySelector(".next").onclick = e => { e.stopPropagation(); showPhoto(cur + 1); };
lb.addEventListener("click", e => e.target === lb && closeLb());
document.addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowLeft") showPhoto(cur - 1);
  if (e.key === "ArrowRight") showPhoto(cur + 1);
});
// swipe left/right in the lightbox on phones
let tx = null;
lb.addEventListener("touchstart", e => (tx = e.touches[0].clientX), { passive: true });
lb.addEventListener("touchend", e => {
  if (tx === null) return;
  const dx = e.changedTouches[0].clientX - tx; tx = null;
  if (Math.abs(dx) > 50) showPhoto(cur + (dx < 0 ? 1 : -1));
});
const grid = document.getElementById("masonry");
grid.innerHTML = photos.map((src, i) =>
  `<figure class="shot" data-i="${i}"><img loading="lazy" src="${src}" alt="Sree Sahana Lakshmi and Kanagaraj, photo ${i + 1}" /></figure>`).join("");
grid.querySelectorAll(".shot").forEach(f => (f.onclick = () => showPhoto(+f.dataset.i)));

/* =====================================================
   4. Countdowns (one per celebration)
   ===================================================== */
document.querySelectorAll(".cd").forEach(box => {
  const target = new Date(CONFIG[box.dataset.event].start).getTime();
  const set = (u, v) => { const el = box.querySelector(`[data-u="${u}"]`); if (el) el.textContent = v; };
  (function tick() {
    const diff = target - Date.now();
    if (diff <= 0) { box.innerHTML = "<p class='done'>With your blessings, the celebration has begun 🙏</p>"; return; }
    set("d", Math.floor(diff / 864e5));
    set("h", Math.floor((diff / 36e5) % 24));
    set("m", Math.floor((diff / 6e4) % 60));
    set("s", Math.floor((diff / 1e3) % 60));
    setTimeout(tick, 1000);
  })();
});

/* =====================================================
   5. Background music — plays automatically, no button
   Song file: music/song.mp3
   Browsers block sound until the visitor interacts with the page, so the music
   is attempted immediately and, if blocked, starts on the first tap / click / key press.
   ===================================================== */
(function () {
  const audio = document.getElementById("bgm");
  if (!audio) return;
  audio.volume = 0.5;
  audio.addEventListener("error", () => console.error("Music file not found: " + audio.getAttribute("src")));

  const events = ["pointerup", "click", "touchend", "keydown"];
  const start = () => audio.play().then(() => events.forEach(t => document.removeEventListener(t, start))).catch(() => {});
  start();                                                   // works in browsers that allow autoplay
  events.forEach(t => document.addEventListener(t, start));  // otherwise begins on first interaction

  // stop the song when the guest switches tabs/apps, resume when they come back
  let wasPlaying = false;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { wasPlaying = !audio.paused; audio.pause(); }
    else if (wasPlaying) audio.play().catch(() => {});
  });
})();
