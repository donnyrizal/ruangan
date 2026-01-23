const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTt3orOXvvfiKTCtlAhWbsBe5HNriBWTrESKih-PMPnncLdx6xYrsVm65LscTdvuhnj_HZRyUiaZnfz/pub?gid=63771902&single=true&output=csv";
const START_HOUR = 6;
const END_HOUR = 24;
const FIXED_ROOMS = [
  "Ruang Rapat (Lt. 1)",
  "Hall Tengah (Lt. 1)",
  "Hall Selatan (Lt. 1)",
  "L1.101 (Profesi)",
  "L1.102 (Profesi)",
  "L1.103 (Profesi)",
  "L1.104 (Profesi)",
  "L1.105 (Profesi)",
  "L1.201 (Profesi)",
  "L1.202 (Profesi)",
  "L1.203 (Profesi)",
  "L1.204 (Profesi)",
  "L1.205 (Profesi)",
  "L0.201 (Gedung Lama)",
  "L0.205 / Smart Classroom (Gedung Lama)",
  "Ruang Pusat Studi (Lt. 2)",
  "Ruang Baca Sarjana (Lt. 2)",
  "Ruang Baca Kubikus Profesi/Mapro/Magister/Doktor (Lt. 2)",
  "Ruang Hybrid (Lt.2)",
  "Ruang Podcast Psikologi (Lt. 2)",
  "L0.301 (Gedung Lama)",
  "L0.302 (Gedung Lama)",
  "L0.303 (Gedung Lama)",
  "L0.304 (Gedung Lama)",
  "L0.305 (Gedung Lama)",
  "L0.305 (Pasca)",
  "L1.301 (Profesi)",
  "L1.302 (Profesi)",
  "L1.303 (Profesi)",
  "L1.304 (Profesi)",
  "L1.305 (Profesi)",
];

const BOOKING_COLORS = [
  {
    bg: "bg-blue-50",
    border: "border-blue-500",
    text: "text-blue-700",
    subtext: "text-blue-500",
    hover: "hover:shadow-md",
  },
  {
    bg: "bg-emerald-50",
    border: "border-emerald-500",
    text: "text-emerald-700",
    subtext: "text-emerald-600",
    hover: "hover:shadow-md",
  },
  {
    bg: "bg-amber-50",
    border: "border-amber-500",
    text: "text-amber-700",
    subtext: "text-amber-600",
    hover: "hover:shadow-md",
  },
  {
    bg: "bg-rose-50",
    border: "border-rose-500",
    text: "text-rose-700",
    subtext: "text-rose-600",
    hover: "hover:shadow-md",
  },
  {
    bg: "bg-purple-50",
    border: "border-purple-500",
    text: "text-purple-700",
    subtext: "text-purple-500",
    hover: "hover:shadow-md",
  },
  {
    bg: "bg-cyan-50",
    border: "border-cyan-500",
    text: "text-cyan-700",
    subtext: "text-cyan-600",
    hover: "hover:shadow-md",
  },
];

function getBookingColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BOOKING_COLORS.length;
  return BOOKING_COLORS[index];
}
let clockIntervalId = null;
let allBookings = [];
let displayRooms = [];
let currentFilterDate = new Date();
let serverTimeOffset = 0;
let datepickerInstance = null;

document.addEventListener("DOMContentLoaded", async () => {
  const dateEl = document.getElementById("dateFilter");
  if (dateEl) {
    datepickerInstance = new Datepicker(dateEl, {
      autohide: true,
      format: "dd/mm/yyyy",
      todayBtn: true,
      clearBtn: true,
    });
    dateEl.addEventListener("changeDate", (e) => {
      currentFilterDate =
        e.detail && e.detail.date ? e.detail.date : new Date(dateEl.value);
      renderGrid();
    });
  }
  await syncServerTime();
  if (document.getElementById("clockDisplay")) startClock();
  const serverNow = getServerTime();
  currentFilterDate = serverNow;
  if (datepickerInstance) datepickerInstance.setDate(serverNow);
  fetchData();
});
function startClock() {
  if (clockIntervalId) clearInterval(clockIntervalId);
  updateClockUI();
  clockIntervalId = setInterval(updateClockUI, 1000);
}
function stopClock() {
  if (clockIntervalId) clearInterval(clockIntervalId);
  clockIntervalId = null;
}
function updateClockUI() {
  const now = new Date();
  const timeString = now
    .toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(/\./g, ":");
  const dateString = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const clockEl = document.getElementById("clockDisplay");
  const dateEl = document.getElementById("dateDisplay");

  if (clockEl) clockEl.innerText = timeString;
  if (dateEl) dateEl.innerText = dateString;
}
function openModal(booking) {
  const modal = document.getElementById("modal");
  if (!modal) return;
  document.body.classList.add("modal-open");
  stopClock();
  document.getElementById("modal-room-title").innerText = booking.room;
  document.getElementById("modal-time").innerText =
    `${formatTime(booking.start)} - ${formatTime(booking.end)}`;
  document.getElementById("modal-user").innerText = booking.user;
  document.getElementById("modal-org").innerText = booking.org;
  document.getElementById("modal-purpose").innerText = booking.purpose;
  const lampiranEl = document.getElementById("modal-lampiran");
  if (lampiranEl) {
    // STRICT CHECK: Ensure attachment exists, is not empty, and is not just a dash "-"
    const hasAttachment = booking.attachment && 
                          booking.attachment.trim().length > 0 && 
                          booking.attachment.trim() !== "-";

    if (hasAttachment) {
      // --- RENDER CARD (Only if valid) ---
      let url = booking.upload.trim();
      if (!url.startsWith('http')) url = 'http://' + url;
      const displayUrl = booking.attachment.replace(/^https?:\/\//, '');

      lampiranEl.innerHTML = `
        <a href="${url}" target="_blank" class="group flex items-center gap-3 p-3 w-full rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm hover:bg-indigo-50/30 transition-all duration-200 decoration-0">
        <div class="h-10 w-10 shrink-0 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <i class="ph-fill ph-file-text text-xl"></i>
        </div>
        
        <div class="flex-1 min-w-0 text-left">
            <p class="text-sm font-bold text-gray-800 group-hover:text-indigo-700 truncate">Buka Lampiran</p>
            <p class="text-[10px] text-gray-400 truncate group-hover:text-indigo-500/70">${displayUrl}</p>
        </div>

        <div class="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all">
            <i class="ph-bold ph-arrow-square-out text-lg"></i>
        </div>
    </a>
      `;
    } else {
      // --- RENDER EMPTY STATE (If empty or "-") ---
      lampiranEl.innerHTML = `<span class="text-gray-400 italic text-xs">Tidak ada lampiran</span>`;
    }
  }

  // 3. Show Modal
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  const modal = document.getElementById("modal");
  if (modal) modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
  startClock();
}
async function syncServerTime() {
  try {
    const response = await fetch(window.location.href, { method: "HEAD" });
    const serverDateHeader = response.headers.get("Date");
    if (serverDateHeader) {
      serverTimeOffset = new Date(serverDateHeader).getTime() - Date.now();
    }
  } catch (e) {
    console.error("Time sync failed", e);
  }
}
function getServerTime() {
  return new Date(Date.now() + serverTimeOffset);
}
setInterval(() => {
  if (!document.body.classList.contains("modal-open")) {
    fetchData();
  }
}, 60000);
function fetchData(manualReset = false) {
  const loader = document.getElementById("loader");
  if (loader) loader.classList.remove("hidden");
  const listContainer = document.getElementById("listContainer");
  if (listContainer) listContainer.classList.add("hidden");
  if (manualReset) {
    const now = getServerTime();
    currentFilterDate = now;
    if (datepickerInstance) datepickerInstance.setDate(now);
  }
  Papa.parse(SHEET_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      processData(results.data, manualReset);
      if (loader) loader.classList.add("hidden");
    },
    error: function (err) {
      console.error("Error:", err);
      if (loader) loader.classList.add("hidden");
    },
  });
}
function processData(data, preventAutoJump = false) {
  allBookings = [];
  let foundRooms = new Set();
  let firstDateFound = null;
  data.forEach((row) => {
    const rawStart = row["Tanggal Pinjam"];
    const rawEnd = row["Tanggal Pengembalian"];
    const roomRaw = row["Ruangan"];
    if (rawStart && rawEnd && roomRaw) {
      const startObj = parseDateTime(rawStart);
      const endObj = parseDateTime(rawEnd);
      if (startObj && endObj) {
        if (!firstDateFound) firstDateFound = startObj;
        const separateRooms = roomRaw
          .split(/,|\n| dan |&/i)
          .map((r) => r.trim())
          .filter((r) => r.length > 0);
        separateRooms.forEach((singleRoomName) => {
          foundRooms.add(singleRoomName);
          allBookings.push({
            start: startObj,
            end: endObj,
            room: singleRoomName,
            user: row["Nama Lengkap"] || "Unknown",
            purpose: row["Keperluan"] || "-",
            org: row["Unit/UKM/Dosen"] || "-",
            attachment: row["Lampiran"] || "-",
            upload: row["File Unggahan"] || "-",
          });
        });
      }
    }
  });
  displayRooms = [...FIXED_ROOMS];
  foundRooms.forEach((room) => {
    if (!displayRooms.includes(room)) displayRooms.push(room);
  });
  if (document.getElementById("gridContainer")) {
    const statusEl = document.getElementById("lastUpdate");
    if (statusEl) statusEl.innerText = "Live Synced"; 
    renderGrid();
  } else if (document.getElementById("listContainer")) {
    renderList();
  }
}
function renderGrid() {
  const gridBody = document.getElementById("gridBody");
  const headerRow = document.getElementById("headerRow");
  const emptyState = document.getElementById("emptyState");
  const statTotal = document.getElementById("statTotal");
  const statRooms = document.getElementById("statRooms");
  if (!gridBody) return;
  gridBody.innerHTML = "";
  while (headerRow.children.length > 1)
    headerRow.removeChild(headerRow.lastChild);
  let dailyBookingCount = 0;
  let activeRoomsToday = new Set();
  let countedBookings = new Set();
  displayRooms.forEach((room) => {
    const th = document.createElement("th");
    th.className =
      "p-4 min-w-[140px] text-center text-sm font-semibold text-gray-700 border-r border-gray-100 bg-gray-50/50";
    th.innerText = room;
    headerRow.appendChild(th);
  });
  for (let h = START_HOUR; h < END_HOUR; h++) {
    const tr = document.createElement("tr");
    tr.className = "group hover:bg-gray-50 transition-colors";
    const tdTime = document.createElement("td");
    tdTime.className =
      "p-4 whitespace-nowrap text-xs font-bold text-gray-500 sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r border-gray-200";
    tdTime.innerHTML = `<span class="bg-gray-100 px-2 py-1 rounded">${h.toString().padStart(2, "0")}:00</span>`;
    tr.appendChild(tdTime);
    displayRooms.forEach((room) => {
      const td = document.createElement("td");
      td.className =
        "p-1 border-r border-gray-100 border-b border-gray-100 relative h-16 align-top";
      const booking = allBookings.find((b) => {
        if (b.room !== room) return false;
        if (!isSameDay(b.start, currentFilterDate)) return false;
        const slotStart = h;
        const slotEnd = h + 1;
        const bStartH = b.start.getHours() + b.start.getMinutes() / 60;
        const bEndH = b.end.getHours() + b.end.getMinutes() / 60;
        return bStartH < slotEnd && bEndH > slotStart;
      });
      if (booking) {
        if (!countedBookings.has(booking)) {
          dailyBookingCount++;
          countedBookings.add(booking);
        }
        activeRoomsToday.add(room);
        const isStart =
          booking.start.getHours() === h ||
          (booking.start.getHours() < h && h === START_HOUR);
        if (isStart || booking.start.getHours() < h) {
          const colorStyles = getBookingColor(booking.user);
          const div = document.createElement("div");
          div.className = `w-full h-full rounded ${colorStyles.bg} border-l-4 ${colorStyles.border} p-2 cursor-pointer ${colorStyles.hover} transition-all shadow-sm`;
          if (isStart) {
            div.classList.add("animate-pop");
            div.innerHTML = `<p class="text-[10px] font-bold ${colorStyles.text} leading-tight truncate">${booking.user}</p><p class="text-[9px] ${colorStyles.subtext} truncate mt-0.5">${booking.purpose}</p>`;
          } else {
            div.classList.add("opacity-50", "border-l-0");
          }
          div.onclick = () => openModal(booking);
          td.appendChild(div);
        }
      } else {
        const empty = document.createElement("div");
        empty.className =
          "w-full h-full rounded hover:bg-gray-50/50 transition-colors flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer";
        empty.innerHTML = `<i class="ph-bold ph-dot text-gray-400"></i>`;
        td.appendChild(empty);
      }
      tr.appendChild(td);
    });
    gridBody.appendChild(tr);
  }
  if (statTotal) statTotal.innerText = dailyBookingCount;
  if (statRooms) statRooms.innerText = activeRoomsToday.size;
  if (emptyState) {
    if (dailyBookingCount === 0 && displayRooms.length === 0)
      emptyState.classList.remove("hidden");
    else emptyState.classList.add("hidden");
  }
}
function renderList() {
  const container = document.getElementById("listContainer");
  const emptyState = document.getElementById("emptyState");
  container.innerHTML = "";
  container.classList.remove("hidden");
  const now = getServerTime();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const upcomingBookings = allBookings.filter((b) => b.start >= todayStart);
  upcomingBookings.sort((a, b) => a.start - b.start);
  if (upcomingBookings.length === 0) {
    emptyState.classList.remove("hidden");
    container.classList.add("hidden");
    return;
  } else {
    emptyState.classList.add("hidden");
  }
  const grouped = {};
  upcomingBookings.forEach((b) => {
    const dateKey = b.start.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(b);
  });
  for (const [dateStr, bookings] of Object.entries(grouped)) {
    const section = document.createElement("div");
    section.className = "space-y-3";
    const header = document.createElement("h3");
    header.className =
      "text-sm font-bold text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 py-2 z-10";
    header.innerHTML = `<i class="ph-bold ph-calendar-blank mr-1"></i> ${dateStr}`;
    section.appendChild(header);
    const grid = document.createElement("div");
    grid.className = "grid grid-cols-1 gap-3";
    bookings.forEach((b) => {
      const color = getBookingColor(b.user);
      const card = document.createElement("div");
      card.className = `booking-card bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center ${color.hover} transition-all`;

      card.innerHTML = `
                <div class="flex-shrink-0 w-full md:w-32 bg-gray-50 rounded-lg p-2 text-center border border-gray-100">
                    <p class="text-xs font-bold text-gray-400">Pukul</p>
                    <p class="text-sm font-bold text-gray-800">${formatTime(b.start)} - ${formatTime(b.end)}</p>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 truncate max-w-[200px]">
                           ${b.room}
                        </span>
                    </div>
                    <h4 class="font-bold text-gray-900 text-sm md:text-base break-words leading-tight mb-1">Kegiatan :${b.purpose}</h4>
                    <p class="text-sm text-gray-500 truncate mt-1">Dipinjam oleh: <span class="font-semibold text-gray-700">${b.user}</span></p>
                    <p class="text-xs text-gray-400 mt-0.5 truncate">Unit: <span class="font-semibold text-gray-700">${b.org}</span></p>
                    <p class="text-xs text-gray-400 mt-0.5 truncate">Lampiran: <span class="font-semibold text-gray-700">${b.attachment}</span></p>
                </div>
            `;
      grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
  }
}

function parseDateTime(dateStr) {
  try {
    if (!dateStr) return null;
    const [datePart, timePart] = dateStr.split(" ");
    if (!timePart) return null;
    const [mm, dd, yyyy] = datePart.split("/").map(Number);
    const [hh, min, ss] = timePart.split(":").map(Number);
    return new Date(yyyy, mm - 1, dd, hh, min, ss || 0);
  } catch (e) {
    return null;
  }
}
function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
function formatTime(date) {
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
