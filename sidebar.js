const pathName = window.location.pathname;
const isSubPage = pathName.includes("/form") || pathName.includes("/schedules");
const root = "/ruangan/";
const sidebarHTML = `
<div id="mobileOverlay" onclick="toggleSidebar()" class="fixed inset-0 bg-gray-900/50 z-20 hidden md:hidden transition-opacity opacity-0"></div>
<aside id="sidebar" class="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform -translate-x-full md:translate-x-0 transition-transform duration-300 ease-in-out z-30 flex flex-col md:relative">
    <div class="p-6 flex items-center justify-between gap-3">
        </div>

    <nav class="flex-1 px-4 space-y-1 mt-4">
        <a href="${root}" class="sidebar-link flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors">
            <i class="ph-fill ph-squares-four text-lg"></i>
            Dashboard
        </a>
        <a href="${root}schedules" class="sidebar-link flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors">
            <i class="ph-bold ph-calendar-blank text-lg"></i>
            All Schedules
        </a>
        <a href="${root}form" class="sidebar-link flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors">
            <i class="ph-bold ph-table text-lg"></i>
            Form Peminjaman
        </a>
    </nav>
    </aside>
`;
function renderSidebar() {
  document.body.insertAdjacentHTML("afterbegin", sidebarHTML);
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll(".sidebar-link");
  links.forEach((link) => {
    const linkHref = link.getAttribute("href");
    const isActive = (linkHref === "/ruangan/" && (currentPath === "/ruangan/" || currentPath === "/ruangan/index.html")) 
                     || (linkHref !== "/ruangan/" && currentPath.startsWith(linkHref));

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