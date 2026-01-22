const sidebarHTML = `
<div id="mobileOverlay" onclick="toggleSidebar()" class="fixed inset-0 bg-gray-900/50 z-20 hidden md:hidden transition-opacity opacity-0"></div>

<aside id="sidebar" class="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform -translate-x-full md:translate-x-0 transition-transform duration-300 ease-in-out z-30 flex flex-col md:relative">
    <div class="p-6 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
            <div class="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <i class="ph-bold ph-buildings text-xl"></i>
            </div>
            <span class="text-xs font-bold tracking-tight">Peminjaman Ruangan Psikologi <span class="text-indigo-600"> UMS</span></span>
        </div>
        <button onclick="toggleSidebar()" class="md:hidden text-gray-400 hover:text-gray-600">
            <i class="ph-bold ph-x text-xl"></i>
        </button>
    </div>

    <nav class="flex-1 px-4 space-y-1 mt-4">
        <a href="./" data-page="home" class="sidebar-link flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors">
            <i class="ph-fill ph-squares-four text-lg"></i>
            Dashboard
        </a>
        <a href="./schedules" class="sidebar-link flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors">
            <i class="ph-bold ph-calendar-blank text-lg"></i>
            All Schedules
        </a>
        <a href="./form" data-page="form" class="sidebar-link flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors">
            <i class="ph-bold ph-table text-lg"></i>
            Form Peminjaman
        </a>
    </nav>

    <div class="p-4 border-t border-gray-100">
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div class="flex items-center justify-between mb-2">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Pukul
                </p>
                <div class="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
            </div>
            <div>
                <div id="clockDisplay" class="text-2xl font-bold text-gray-700 font-mono tracking-tight leading-none">
                    --:--:--
                </div>
                <div id="dateDisplay" class="text-xs text-gray-500 font-medium mt-1">
                    Syncing...
                </div>
            </div>
        </div>
    </div>
</aside>
`;

function renderSidebar() {
  document.body.insertAdjacentHTML("afterbegin", sidebarHTML);
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll(".sidebar-link");
  links.forEach((link) => {
    let isActive = false;
    const linkHref = link.getAttribute("href");
    if (linkHref === "./" && (currentPath.endsWith("/") || currentPath.includes("index.html"))) {
      isActive = true;
    } else if (linkHref.includes("form.html") && currentPath.includes("form.html")) {
      isActive = true;
    } else if (linkHref.includes("schedules.html") && currentPath.includes("schedules.html")) {
      isActive = true;
    }
    if (isActive) {
      link.className = "sidebar-link flex items-center gap-3 px-4 py-3 text-sm font-medium bg-indigo-50 text-indigo-700 rounded-xl";
    } else {
      link.className = "sidebar-link flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors";
    }
  });
}
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("mobileOverlay");

  if (sidebar.classList.contains("-translate-x-full")) {
    sidebar.classList.remove("-translate-x-full");
    overlay.classList.remove("hidden");
    setTimeout(() => overlay.classList.remove("opacity-0"), 10);
  } else {
    sidebar.classList.add("-translate-x-full");
    overlay.classList.add("opacity-0");
    setTimeout(() => overlay.classList.add("hidden"), 300);
  }
}
document.addEventListener("DOMContentLoaded", renderSidebar);