const rooms = [
  {
    id: "protagonismo",
    name: "Protagonismo",
    zone: "Espaço Marte",
    box: [78, 53, 116, 85],
    description: "Sala grande para reuniões em grupo, no canto superior esquerdo do Espaço Marte.",
    reference: "No Espaço Marte, sala grande à direita do palco.",
  },
  {
    id: "coragem",
    name: "Coragem",
    zone: "Espaço Marte",
    box: [305, 53, 60, 51],
    description: "A sala Coragem fica no Espaço Marte.",
    reference: "No Espaço Marte, ao lado da Radar PX.",
  },
  {
    id: "cumplicidade",
    name: "Cumplicidade",
    zone: "Espaço Marte",
    box: [78, 241, 116, 84],
    description: "Sala grande para reuniões em grupo no Espaço Marte.",
    reference: "No Espaço Marte, sala grande à esquerda do palco.",
  },
  {
    id: "estudio",
    name: "Estúdio",
    zone: "Espaço Relax",
    box: [190, 497, 65, 68],
    description: "Espaço de gravação.",
    reference: "Fica no Espaço Relax.",
  },
  {
    id: "paixao",
    name: "Paixão",
    zone: "Espaço Millennium Falcon",
    box: [159, 565, 96, 49],
    description: "Sala de reunião.",
    reference: "Sala roxa dentro do Espaço Millennium Falcon.",
  },
  {
    id: "proposito",
    name: "Propósito",
    zone: "Espaço Millennium Falcon",
    box: [159, 614, 96, 49],
    description: "Sala de reunião.",
    reference: "Sala verde dentro do Espaço Millennium Falcon.",
  },
  {
    id: "inovacao",
    name: "Inovação",
    zone: "Espaço Sky",
    box: [488, 436, 97, 48],
    description: "A sala Inovação fica no Espaço Sky.",
    reference: "Entre pelo Espaço Sky; A inovação é a sala azul perto da recepção.",
  },
  {
    id: "inspiracao",
    name: "Inspiração",
    zone: "Recepção",
    box: [488, 484, 97, 49],
    description: "A sala Inspiração fica na Recepção.",
    reference: "Na Recepção, é a sala laranja na parte inferior.",
  },
  {
    id: "energia",
    name: "Energia",
    zone: "Espaço Sky",
    box: [255, 706, 150, 59],
    description: "Sala ampla na parte inferior da planta, ao lado do Espaço Millennium Falcon.",
    reference: "No fim do Espaço Sky, ao lado da Diretoria.",
  },
];

const state = {
  selectedRoom: null,
  zoom: 1,
  fullscreen: false,
};

const elements = {
  hotspotLayer: document.querySelector("#hotspot-layer"),
  quickRooms: document.querySelector("#quick-rooms"),
  search: document.querySelector("#room-search"),
  results: document.querySelector("#room-results"),
  dialog: document.querySelector("#room-dialog"),
  dialogClose: document.querySelector("#dialog-close"),
  dialogTitle: document.querySelector("#dialog-title"),
  dialogZone: document.querySelector("#dialog-zone"),
  dialogDescription: document.querySelector("#dialog-description"),
  dialogReference: document.querySelector("#dialog-reference"),
  referenceCard: document.querySelector(".reference-card"),
  showOnMap: document.querySelector("#show-on-map"),
  mapViewport: document.querySelector("#mapa"),
  mapStage: document.querySelector("#map-stage"),
  mapCard: document.querySelector(".map-card"),
  mapExpand: document.querySelector("#map-expand"),
  zoomIn: document.querySelector("#zoom-in"),
  zoomOut: document.querySelector("#zoom-out"),
  zoomReset: document.querySelector("#zoom-reset"),
  toast: document.querySelector("#toast"),
};

const normalize = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

function renderHotspots() {
  elements.hotspotLayer.innerHTML = rooms
    .map((room, index) => {
      const [x, y, width, height] = room.box;
      const labelX = x + width - 4;
      const labelY = y + 4;
      return `
        <g class="room-hotspot" data-room="${room.id}" tabindex="0" role="button"
          aria-label="Abrir localização da sala ${room.name}">
          <title>${room.name} · ${room.zone}</title>
          <rect class="hotspot-shape" x="${x}" y="${y}" width="${width}" height="${height}" rx="3" />
          <circle class="hotspot-label-bg" cx="${labelX}" cy="${labelY}" r="11" />
          <text class="hotspot-label" x="${labelX}" y="${labelY + 0.5}">${index + 1}</text>
        </g>`;
    })
    .join("");

  elements.hotspotLayer.querySelectorAll(".room-hotspot").forEach((hotspot) => {
    hotspot.addEventListener("click", () => openRoom(hotspot.dataset.room));
    hotspot.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openRoom(hotspot.dataset.room);
      }
    });
  });
}

function renderQuickRooms() {
  elements.quickRooms.innerHTML = rooms
    .map(
      (room) =>
        `<button class="room-chip" type="button" data-room="${room.id}">${room.name}</button>`,
    )
    .join("");

  elements.quickRooms.querySelectorAll(".room-chip").forEach((button) => {
    button.addEventListener("click", () => openRoom(button.dataset.room));
  });
}

function getRoom(id) {
  return rooms.find((room) => room.id === id);
}

function updateSelection(id) {
  state.selectedRoom = id;
  document.querySelectorAll("[data-room]").forEach((element) => {
    element.classList.toggle("active", element.dataset.room === id);
  });
}

function openRoom(id) {
  const room = getRoom(id);
  if (!room) return;

  updateSelection(id);
  elements.dialogTitle.textContent = room.name;
  elements.dialogZone.textContent = room.zone.toUpperCase();
  elements.dialogDescription.textContent = room.description;
  elements.dialogReference.textContent = room.reference;
  elements.referenceCard.hidden = !room.reference;
  elements.results.hidden = true;
  elements.search.value = room.name;

  if (typeof elements.dialog.showModal === "function") {
    elements.dialog.showModal();
  } else {
    elements.dialog.setAttribute("open", "");
  }
}

function closeDialog() {
  if (typeof elements.dialog.close === "function") {
    elements.dialog.close();
  } else {
    elements.dialog.removeAttribute("open");
  }
}

function showSelectedOnMap() {
  const room = getRoom(state.selectedRoom);
  if (!room) return;
  closeDialog();

  const [x, y, width, height] = room.box;
  const scaleX = elements.mapStage.offsetWidth / 650;
  const targetLeft = (x + width / 2) * scaleX - elements.mapViewport.clientWidth / 2;
  const targetTop = (y + height / 2) * scaleX - elements.mapViewport.clientHeight / 2;

  elements.mapViewport.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => {
    elements.mapViewport.scrollTo({ left: targetLeft, top: targetTop, behavior: "smooth" });
  }, 260);
  showToast(`${room.name} está destacada em laranja no mapa.`);
}

function renderResults(query) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    elements.results.hidden = true;
    return;
  }

  const matches = rooms.filter(
    (room) =>
      normalize(room.name).includes(normalizedQuery) ||
      normalize(room.zone).includes(normalizedQuery),
  );

  elements.results.innerHTML = matches.length
    ? matches
        .map(
          (room) => `
            <button class="result-button" type="button" role="option" data-room="${room.id}">
              <strong>${room.name}</strong><small>${room.zone}</small>
            </button>`,
        )
        .join("")
    : `<div class="result-button" aria-disabled="true">Nenhuma sala encontrada</div>`;

  elements.results.hidden = false;
  elements.results.querySelectorAll("[data-room]").forEach((button) => {
    button.addEventListener("click", () => openRoom(button.dataset.room));
  });
}

function fitWidth() {
  return Math.min(650, elements.mapViewport.clientWidth - 28);
}

function applyZoom(nextZoom) {
  state.zoom = Math.min(2.25, Math.max(1, nextZoom));
  elements.mapStage.style.width = `${Math.round(fitWidth() * state.zoom)}px`;
  elements.zoomReset.textContent = `${Math.round(state.zoom * 100)}%`;
  elements.zoomOut.disabled = state.zoom <= 1;
  elements.zoomIn.disabled = state.zoom >= 2.25;
}

function toggleFullscreen(forceState) {
  state.fullscreen = typeof forceState === "boolean" ? forceState : !state.fullscreen;
  elements.mapCard.classList.toggle("map-fullscreen", state.fullscreen);
  document.body.classList.toggle("map-open", state.fullscreen);
  elements.mapExpand.setAttribute("aria-pressed", String(state.fullscreen));
  elements.mapExpand.setAttribute(
    "aria-label",
    state.fullscreen ? "Fechar mapa em tela cheia" : "Abrir mapa em tela cheia",
  );
  const label = elements.mapExpand.querySelector(".expand-label");
  if (label) label.textContent = state.fullscreen ? "Fechar" : "Tela cheia";

  window.requestAnimationFrame(() => {
    applyZoom(state.fullscreen ? 1.4 : 1);
    if (state.fullscreen) {
      elements.mapViewport.scrollTo({ left: 0, top: 0 });
      elements.mapViewport.focus({ preventScroll: true });
    }
  });
}

let toastTimer;
function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  toastTimer = window.setTimeout(() => elements.toast.classList.remove("visible"), 2800);
}

elements.search.addEventListener("input", (event) => renderResults(event.target.value));
elements.search.addEventListener("focus", (event) => renderResults(event.target.value));
elements.search.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    const firstMatch = rooms.find((room) => normalize(room.name).includes(normalize(event.target.value)));
    if (firstMatch) openRoom(firstMatch.id);
  }
  if (event.key === "Escape") elements.results.hidden = true;
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".finder")) elements.results.hidden = true;
});

elements.dialogClose.addEventListener("click", closeDialog);
elements.dialog.addEventListener("click", (event) => {
  if (event.target === elements.dialog) closeDialog();
});
elements.showOnMap.addEventListener("click", showSelectedOnMap);
elements.mapExpand.addEventListener("click", () => toggleFullscreen());
elements.zoomIn.addEventListener("click", () => applyZoom(state.zoom + 0.25));
elements.zoomOut.addEventListener("click", () => applyZoom(state.zoom - 0.25));
elements.zoomReset.addEventListener("click", () => applyZoom(1));
window.addEventListener("resize", () => applyZoom(state.zoom));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.fullscreen && !elements.dialog.open) {
    toggleFullscreen(false);
  }
});

renderHotspots();
renderQuickRooms();
applyZoom(1);
