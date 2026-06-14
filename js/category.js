// ==========================================
// WeebWorld - Category Page Logic
// ==========================================

gsap.registerPlugin(ScrollTrigger);

// --- Shared Constants & State ---
const CARD_CLASSES = "card bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg cursor-pointer border border-white/50 dark:border-gray-700/50 hover:shadow-indigo-500/40 hover:-translate-y-1.5 hover:scale-[1.03] transition-all duration-300";
const CARD_IMG = "w-full h-auto block max-md:h-[140px] max-md:object-cover";
const CARD_P = "p-2.5 text-[13px] font-bold text-gray-700 dark:text-gray-200 max-md:text-[11px] max-md:p-1.5 max-md:leading-tight max-md:max-h-8 max-md:overflow-hidden";

let animeList = [], currentPage = 1, itemsPerPage = 24, currentAnimeId = null;

// --- Dark Mode ---
document.getElementById("dark-btn").addEventListener("click", function() {
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("darkMode", document.documentElement.classList.contains("dark"));
    gsap.to(this, { rotation: "+=360", duration: 0.5, ease: "power2.inOut" });
    this.innerText = document.documentElement.classList.contains("dark") ? "☀️" : "🌙";
});
let isDm = localStorage.getItem("darkMode") === "true";
if (isDm) { document.documentElement.classList.add("dark"); document.getElementById("dark-btn").innerText = "☀️"; }

// --- Initialization ---
const urlParams = new URLSearchParams(window.location.search);
const categoryType = urlParams.get('type');

document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    setPageTitle();
    fetchCategoryData();
});

function setPageTitle() {
    const titleEl = document.getElementById("page-title").querySelector('span');
    if (categoryType === 'popular') titleEl.innerText = "🔥 Most Popular Anime";
    else if (categoryType === 'trending') titleEl.innerText = "📈 Trending Now";
    else if (categoryType === 'upcoming') titleEl.innerText = "🚀 Upcoming Anime";
    else titleEl.innerText = "Anime Collection";
    
    gsap.from("#page-title", { opacity: 0, y: -20, duration: 0.6, ease: "power2.out" });
}

// --- Data Fetching ---
async function fetchCategoryData() {
    let resultsContainer = document.getElementById("results");
    showSkeletons(resultsContainer, itemsPerPage);
    
    let url = "";
    if (categoryType === 'popular') url = "https://api.jikan.moe/v4/top/anime";
    else if (categoryType === 'trending') url = "https://api.jikan.moe/v4/seasons/now";
    else if (categoryType === 'upcoming') url = "https://api.jikan.moe/v4/top/anime?filter=upcoming";
    else url = "https://api.jikan.moe/v4/top/anime"; // fallback
    
    try {
        let res = await fetch(url);
        if (!res.ok) throw new Error("API Error");
        let data = await res.json();
        animeList = data.data;
        showResults(animeList);
    } catch (err) {
        resultsContainer.innerHTML = "<p class='text-red-500 col-span-full'>Failed to load data. Please try again later.</p>";
        console.error(err);
    }
}

function showResults(list) {
    let results = document.getElementById("results");
    results.innerHTML = "";
    let totalPages = Math.ceil(list.length / itemsPerPage);
    if (totalPages > 0 && currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    let start = (currentPage - 1) * itemsPerPage;
    list.slice(start, start + itemsPerPage).forEach(anime => results.appendChild(makeCard(anime)));
    animateCards(results);
    renderPagination(list.length, totalPages, list);
}

function renderPagination(total, pages, list) {
    let pag = document.getElementById("pagination");
    pag.innerHTML = "";
    if (total === 0) return;
    let prevBtn = document.createElement("button");
    prevBtn.innerHTML = "← Prev";
    prevBtn.className = "page-btn px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm border-none cursor-pointer shadow-md";
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => { if (currentPage > 1) { currentPage--; showResults(list); window.scrollTo({ top: 0, behavior: "smooth" }); } });
    
    let nextBtn = document.createElement("button");
    nextBtn.innerHTML = "Next →";
    nextBtn.className = "page-btn px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-sm border-none cursor-pointer shadow-md";
    nextBtn.disabled = currentPage === pages;
    nextBtn.addEventListener("click", () => { if (currentPage < pages) { currentPage++; showResults(list); window.scrollTo({ top: 0, behavior: "smooth" }); } });
    
    let info = document.createElement("span");
    info.innerHTML = "Page " + currentPage + " of " + (pages || 1);
    info.className = "font-bold text-indigo-600 dark:text-violet-400 text-sm px-3";
    
    pag.appendChild(prevBtn); pag.appendChild(info); pag.appendChild(nextBtn);
    gsap.from(pag.children, { opacity: 0, y: 10, stagger: 0.1, duration: 0.3 });
}

// --- Watchlist & Comments Logic (Shared) ---
function getWatchlist() { return JSON.parse(localStorage.getItem("watchlist") || "[]"); }
function saveWatchlist(list) { localStorage.setItem("watchlist", JSON.stringify(list)); }
function isInWatchlist(id) { return getWatchlist().some(a => a.mal_id === id); }

function toggleWatchlist(anime) {
    let list = getWatchlist();
    let idx = list.findIndex(a => a.mal_id === anime.mal_id);
    if (idx >= 0) { list.splice(idx, 1); } else {
        list.push({ mal_id: anime.mal_id, title: anime.title, image: anime.images.jpg.image_url, score: anime.score });
    }
    saveWatchlist(list);
    updatePopWatchlistBtn(anime.mal_id);
}

function updatePopWatchlistBtn(id) {
    let btn = document.getElementById("pop-watchlist-btn");
    let heart = document.getElementById("pop-heart");
    if (isInWatchlist(id)) {
        btn.innerHTML = '<span>❤️</span> In Watchlist';
        btn.classList.remove("from-pink-500", "to-rose-400");
        btn.classList.add("from-gray-500", "to-gray-400");
    } else {
        btn.innerHTML = '<span>🤍</span> Add to Watchlist';
        btn.classList.remove("from-gray-500", "to-gray-400");
        btn.classList.add("from-pink-500", "to-rose-400");
    }
}

function getComments(id) { return JSON.parse(localStorage.getItem("comments_" + id) || "[]"); }
function saveComments(id, list) { localStorage.setItem("comments_" + id, JSON.stringify(list)); }

function loadComments(id) {
    currentAnimeId = id;
    let list = getComments(id);
    document.getElementById("comment-count").innerText = "(" + list.length + ")";
    let container = document.getElementById("comments-list");
    container.innerHTML = "";
    if (list.length === 0) {
        container.innerHTML = '<p class="text-gray-400 dark:text-gray-500 text-sm text-center py-4">No comments yet. Be the first!</p>';
        return;
    }
    list.forEach((c, i) => {
        let div = document.createElement("div");
        div.className = "comment-item bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 flex justify-between items-start gap-2";
        div.innerHTML = `
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                    <span class="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">A</span>
                    <span class="text-xs text-gray-400 dark:text-gray-500">${c.date}</span>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300">${c.text}</p>
            </div>
            <button class="del-comment text-gray-300 hover:text-red-400 text-xs cursor-pointer bg-transparent border-none transition-colors" data-idx="${i}">🗑️</button>
        `;
        div.querySelector(".del-comment").addEventListener("click", function() {
            let comments = getComments(id);
            comments.splice(i, 1);
            saveComments(id, comments);
            gsap.to(div, { x: 50, opacity: 0, duration: 0.25, onComplete: () => loadComments(id) });
        });
        container.appendChild(div);
    });
}

document.getElementById("comment-submit").addEventListener("click", postComment);
document.getElementById("comment-input").addEventListener("keydown", e => { if (e.key === "Enter") postComment(); });

function postComment() {
    let input = document.getElementById("comment-input");
    let text = input.value.trim();
    if (!text || !currentAnimeId) return;
    let comments = getComments(currentAnimeId);
    comments.unshift({ text: text, date: new Date().toLocaleDateString() });
    saveComments(currentAnimeId, comments);
    input.value = "";
    loadComments(currentAnimeId);
    gsap.from("#comments-list .comment-item:first-child", { y: -20, opacity: 0, duration: 0.3 });
}

// --- UI Components ---
function makeCard(item) {
    let box = document.createElement("div");
    box.className = CARD_CLASSES;
    box.onclick = function() { openPop(item); };
    let scoreTag = item.score ? `<div class="absolute top-2 left-2 bg-amber-400/90 text-violet-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow backdrop-blur-sm">⭐ ${item.score}</div>` : '';
    box.innerHTML = `
        <div class="relative">
            <img class="${CARD_IMG}" src="${item.images.jpg.image_url}" alt="${item.title}">
            ${scoreTag}
        </div>
        <p class="${CARD_P}">${item.title}</p>
    `;
    return box;
}

function showSkeletons(container, count) {
    container.innerHTML = "";
    for (let i = 0; i < count; i++) {
        let s = document.createElement("div");
        s.className = "skeleton rounded-2xl overflow-hidden";
        s.innerHTML = '<div class="skeleton w-full h-[180px] max-md:h-[140px]"></div><div class="skeleton h-4 mx-3 my-3 rounded"></div>';
        container.appendChild(s);
    }
}

// --- Modal ---
function animateModalOpen() {
    let pop = document.getElementById("pop-box");
    let mc = pop.querySelector(".modal-content");
    gsap.fromTo(pop, { opacity: 0 }, { opacity: 1, duration: 0.25 });
    gsap.fromTo(mc, { scale: 0.75, opacity: 0, y: 30 }, { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: "back.out(1.7)", delay: 0.05 });
}

function closePop() {
    let pop = document.getElementById("pop-box");
    let mc = pop.querySelector(".modal-content");
    let tl = gsap.timeline({ onComplete: () => pop.classList.add("hidden-section") });
    tl.to(mc, { scale: 0.85, opacity: 0, y: 20, duration: 0.25, ease: "power2.in" })
      .to(pop, { opacity: 0, duration: 0.2 }, "-=0.1");
    document.getElementById("pop-trailer").src = "";
}

document.getElementById("close-pop").onclick = closePop;
window.onclick = function(e) { if (e.target === document.getElementById("pop-box")) closePop(); };

function openPop(info) {
    let pop = document.getElementById("pop-box");
    document.getElementById("pop-img").src = info.images.jpg.image_url;
    document.getElementById("pop-title").innerText = info.title;
    document.getElementById("pop-score").innerText = "⭐ Score: " + (info.score || "N/A") + "/10";
    document.getElementById("pop-type").innerText = "📺 Type: " + (info.type || "N/A");
    document.getElementById("pop-episodes").innerText = "🎬 Episodes: " + (info.episodes || "N/A");
    document.getElementById("pop-status").innerText = "📡 Status: " + (info.status || "N/A");
    document.getElementById("pop-aired").innerText = "📅 Aired: " + (info.aired ? info.aired.string : "N/A");
    let season = info.season || "", year = info.year || "";
    document.getElementById("pop-premiered").innerText = "🌸 Premiered: " + (season && year ? season.charAt(0).toUpperCase() + season.slice(1) + " " + year : "N/A");
    document.getElementById("pop-duration").innerText = "⏱️ Duration: " + (info.duration || "N/A");
    document.getElementById("pop-rating").innerText = "🔞 Rating: " + (info.rating || "N/A");
    document.getElementById("pop-producers").innerText = "🏢 Producers: " + (info.producers ? info.producers.map(p => p.name).join(", ") : "N/A");
    document.getElementById("pop-studios").innerText = "🎨 Studios: " + (info.studios ? info.studios.map(s => s.name).join(", ") : "N/A");
    document.getElementById("pop-genres").innerText = "🏷️ Genres: " + (info.genres ? info.genres.map(g => g.name).join(", ") : "N/A");
    document.getElementById("pop-themes").innerText = "🎭 Themes: " + (info.themes ? info.themes.map(t => t.name).join(", ") : "N/A");
    document.getElementById("pop-text").innerText = info.synopsis || "No description available.";

    let trailerSec = document.getElementById("trailer-section");
    if (info.trailer && info.trailer.embed_url) {
        document.getElementById("pop-trailer").src = info.trailer.embed_url;
        trailerSec.classList.remove("hidden-section");
    } else { trailerSec.classList.add("hidden-section"); document.getElementById("pop-trailer").src = ""; }

    let streamSec = document.getElementById("streaming-section");
    let streamLinks = document.getElementById("streaming-links");
    streamLinks.innerHTML = "";
    if (info.streaming && info.streaming.length > 0) {
        streamSec.classList.remove("hidden-section");
        info.streaming.forEach(s => {
            let a = document.createElement("a");
            a.href = s.url; a.target = "_blank"; a.rel = "noopener";
            a.className = "stream-badge inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm font-medium border border-indigo-200 dark:border-indigo-700/50 transition-all duration-200 no-underline hover:bg-indigo-200 dark:hover:bg-indigo-800/50";
            a.innerText = "▶ " + s.name;
            streamLinks.appendChild(a);
        });
    } else { streamSec.classList.add("hidden-section"); }

    updatePopWatchlistBtn(info.mal_id);
    document.getElementById("pop-watchlist-btn").onclick = function() {
        toggleWatchlist(info);
        gsap.to(this, { scale: 1.1, duration: 0.15, yoyo: true, repeat: 1 });
    };

    loadComments(info.mal_id);
    pop.classList.remove("hidden-section");
    animateModalOpen();
}

function animateCards(container) {
    gsap.from(container.querySelectorAll(".card"), {
        opacity: 0, y: 30, scale: 0.9, stagger: 0.06, duration: 0.45,
        ease: "back.out(1.4)", clearProps: "all"
    });
}

function createParticles() {
    let container = document.getElementById("particles");
    let colors = ["#818cf8", "#a78bfa", "#c084fc", "#f472b6", "#fb923c"];
    for (let i = 0; i < 20; i++) {
        let p = document.createElement("div");
        p.className = "particle";
        let size = Math.random() * 8 + 3;
        p.style.cssText = `width:${size}px;height:${size}px;background:${colors[i % colors.length]};left:${Math.random()*100}%;top:${Math.random()*100}%`;
        container.appendChild(p);
        animateParticle(p);
    }
}
function animateParticle(p) {
    gsap.to(p, {
        x: "random(-100,100)", y: "random(-100,100)", opacity: "random(0.1,0.4)",
        duration: "random(4,8)", ease: "sine.inOut", repeat: -1, yoyo: true,
        delay: "random(0,3)"
    });
}

let backBtn = document.getElementById("back-top");
window.addEventListener("scroll", () => {
    if (window.scrollY > 300) { backBtn.style.opacity = "1"; backBtn.style.pointerEvents = "auto"; }
    else { backBtn.style.opacity = "0"; backBtn.style.pointerEvents = "none"; }
});
backBtn.addEventListener("click", () => { window.scrollTo({ top: 0, behavior: "smooth" }); });
