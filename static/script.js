document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("tripForm");
  const output = document.getElementById("itineraryOutput");
  const heroImage = document.getElementById("heroImage");
  const destInput = document.getElementById("destination");
  const daysInput = document.getElementById("days");
  const destHint = document.getElementById("destHint");
  const daysHint = document.getElementById("daysHint");
  const exportBtn = document.getElementById("exportBtn");
  const savedList = document.getElementById("savedList");
  const gallery = document.getElementById("gallery");
  const gallerySubmitBtn = document.getElementById("gallerySubmit");

  /* helpers */
  function setBusy(isBusy) {
    output.setAttribute("aria-busy", String(isBusy));
  }
  function show(el, on) {
    el.style.display = on ? "" : "none";
  }

  // =======================
  // imageCandidates: multiple fallback URLs for a theme
  // =======================
  function imageCandidates(dest, theme) {
    const sig = Date.now() % 100000;
    const base1 = encodeURIComponent(`${dest} ${theme} landmark`);
    const base2 = encodeURIComponent(`${dest} ${theme} skyline`);
    const csv = encodeURIComponent(`${dest},${theme},landmark`);

    return [
      `https://source.unsplash.com/800x500/?${base1}&sig=${sig}`,
      `https://source.unsplash.com/800x500/?${base2}&sig=${sig}`,
      `https://source.unsplash.com/collection/190727/800x500?${base1}&sig=${sig}`,
      `https://loremflickr.com/800/500/${csv}`,
      `https://picsum.photos/seed/${encodeURIComponent(
        dest + "-" + theme
      )}/800/500`,
    ];
  }

  // simple themedImage helper (so itinerary cards don't break)
  function themedImage(dest, theme) {
    const cands = imageCandidates(dest, theme);
    return cands[0]; // use the first candidate (falls back via onerror in <img>)
  }

  function renderSkeletons(count) {
    output.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const skel = document.createElement("div");
      skel.className = "skeleton";
      skel.innerHTML = `
      <div class="sk-img"></div>
      <div class="sk-line" style="width:80%"></div>
      <div class="sk-line" style="width:60%"></div>
    `;
      output.appendChild(skel);
    }
  }

  function tagsFromPlan(text) {
    const bank = [
      "museum",
      "market",
      "temple",
      "cathedral",
      "beach",
      "park",
      "garden",
      "fort",
      "palace",
      "café",
      "food",
      "street walk",
      "shopping",
      "viewpoint",
      "sunset",
      "boat",
      "gallery",
      "heritage",
      "trek",
      "lake",
    ];
    const lower = text.toLowerCase();
    return bank.filter((w) => lower.includes(w)).slice(0, 4);
  }

  function saveTrip(key, payload) {
    const all = JSON.parse(localStorage.getItem("savedTrips") || "{}");
    all[key] = payload;
    localStorage.setItem("savedTrips", JSON.stringify(all));
    renderSaved();
  }
  function renderSaved() {
    const all = JSON.parse(localStorage.getItem("savedTrips") || "{}");
    savedList.innerHTML = "";
    const keys = Object.keys(all);
    if (keys.length === 0) {
      savedList.innerHTML =
        '<span class="hint">No saved itineraries yet.</span>';
      return;
    }
    keys.forEach((k) => {
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "saved-pill";
      pill.textContent = k;
      pill.onclick = () => {
        const trip = all[k];
        destInput.value = trip.destination;
        daysInput.value = trip.days;
        renderItinerary(trip.destination, trip.data);
        updateHero(trip.destination);
        renderGalleryPixabay(trip.destination); // use pixabay here
        window.location.hash = "#plan";
      };
      savedList.appendChild(pill);
    });
  }

  function updateHero(dest) {
    // keep using unsplash for hero (no key)
    const q = encodeURIComponent(`${dest} travel skyline`);
    heroImage.src = `https://source.unsplash.com/featured/1200x750?${q}`;
    heroImage.alt = `Scenic photo of ${dest}`;
  }

  // ---------- (kept) single-image renderGallery (not used by UI unless you want it) ----------
  function renderGallery(dest) {
    gallery.innerHTML = "";

    const theme = "famous tourist place"; // strong keyword

    const candidates = imageCandidates(dest, theme);
    const img = document.createElement("img");
    img.loading = "lazy";
    img.alt = `${dest} — ${theme}`;
    img.referrerPolicy = "no-referrer";

    let i = 0;
    function tryNext() {
      if (i < candidates.length) {
        img.src = candidates[i++];
      } else {
        img.src =
          `data:image/svg+xml;charset=utf-8,` +
          encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'><rect width='100%' height='100%' fill='#f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Inter,Arial' font-size='20' fill='#9aa0a6'>No image</text></svg>`
          );
      }
    }

    img.onerror = tryNext;
    tryNext();

    gallery.appendChild(img);
  }

  // ---------- itinerary renderer ----------
  function renderItinerary(destination, data) {
    output.innerHTML = "";
    data.forEach((dayPlan, idx) => {
      const imgURL = themedImage(
        destination,
        [
          "skyline",
          "old town",
          "museum",
          "park",
          "cafe",
          "viewpoint",
          "monument",
          "beach",
          "mountain",
          "night",
        ][idx % 10]
      );
      const card = document.createElement("article");
      card.className = "itinerary-card";
      const tags = tagsFromPlan(dayPlan.plan);
      card.innerHTML = `
          <div class="card-img">
            <img src="${imgURL}" alt="Day ${
        dayPlan.day
      } in ${destination}" loading="lazy" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='https://picsum.photos/800/500?random=${Math.floor(
        Math.random() * 1000
      )}'">
          </div>
          <div class="card-body">
            <span class="day-chip">Day ${dayPlan.day}</span>
            <h3>${destination} • Highlights</h3>
            <p>${dayPlan.plan}</p>
            <div class="tagbar">
              ${tags.map((t) => `<span class="tag">${t}</span>`).join("")}
            </div>
          </div>
        `;
      output.appendChild(card);
    });
  }

  /* validation */
  function validate() {
    const dest = destInput.value.trim();
    const days = Number(daysInput.value);
    const destOk = dest.length >= 2;
    const daysOk = Number.isFinite(days) && days >= 1 && days <= 30;
    show(destHint, !destOk);
    show(daysHint, !daysOk);
    return destOk && daysOk;
  }
  destInput.addEventListener("input", () => validate());
  daysInput.addEventListener("input", () => validate());

  /* Export to print/PDF */
  exportBtn.addEventListener("click", () => window.print());

  // -----------------------------
  // PIXABAY FRONTEND-ONLY GALLERY
  // -----------------------------
  // Replace with your real key (demo: visible in client)
  const PIXABAY_KEY = "53203243-2eee9ee64f1ffb6b98688ce50";

  async function fetchPixabayImages(dest, perPage = 4) {
    const q = encodeURIComponent(`${dest} tourism landmark`);
    const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${q}&image_type=photo&orientation=horizontal&per_page=${perPage}&safesearch=true`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Pixabay error: ${res.status}`);
      const data = await res.json();
      const hits = data.hits || [];
      return hits.slice(0, perPage).map((h) => ({
        src: h.webformatURL || h.largeImageURL,
        alt: h.tags || dest,
      }));
    } catch (err) {
      console.error("Pixabay fetch error:", err);
      return [];
    }
  }

  async function renderGalleryPixabay(dest) {
    gallery.innerHTML = "";
    if (!dest || dest.trim().length < 2) return;

    const imgs = await fetchPixabayImages(dest, 4);

    if (imgs.length === 0) {
      gallery.innerHTML = `<div class="hint">No images found for "${dest}". Try another destination.</div>`;
      return;
    }

    imgs.forEach((i, idx) => {
      const el = document.createElement("img");
      el.loading = "lazy";
      el.src = i.src;
      el.alt = i.alt;
      el.referrerPolicy = "no-referrer";
      // if an image fails, we don't block the tile — show a small placeholder
      el.onerror = () =>
        (el.src =
          `data:image/svg+xml;charset=utf-8,` +
          encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='500'><rect width='100%' height='100%' fill='#f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Inter,Arial' font-size='20' fill='#9aa0a6'>No image</text></svg>`
          ));
      gallery.appendChild(el);
    });
  }

  /* NEW: Separate “Submit Destination” → Gallery updates immediately (Pixabay) */
  gallerySubmitBtn.addEventListener("click", () => {
    const destination = destInput.value.trim();
    if (destination.length < 2) {
      show(destHint, true);
      destInput.focus();
      return;
    }
    show(destHint, false);
    renderGalleryPixabay(destination);
  });

  /* Main submit: Generate Itinerary (kept same) */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const destination = destInput.value.trim();
    const days = parseInt(daysInput.value, 10);

    setBusy(true);
    renderSkeletons(Math.min(days, 6));
    updateHero(destination);
    // use pixabay gallery here too (consistent)
    renderGalleryPixabay(destination);

    try {
      const response = await fetch("/get_itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, days }),
      });
      if (!response.ok) throw new Error("Server returned " + response.status);
      const data = await response.json();

      renderItinerary(destination, data);

      const stamp = new Date().toLocaleString();
      const key = `${destination} • ${days}d • ${stamp}`;
      saveTrip(key, { destination, days, data });
    } catch (err) {
      console.error(err);
      output.innerHTML = `
          <article class="itinerary-card" role="alert">
            <div class="card-body">
              <span class="day-chip" style="background:#fde8ea; color:#8a2031; border-color:#f6c9cf">Error</span>
              <h3>We couldn’t generate your itinerary</h3>
              <p style="color:${"var(--warn)"}">Check that <code>/get_itinerary</code> is reachable and returns JSON.</p>
            </div>
          </article>`;
    } finally {
      setBusy(false);
    }
  });

  // Initial: show a nice default Pixabay gallery so the page isn't empty
  renderGalleryPixabay("Paris");
  renderSaved();
});
