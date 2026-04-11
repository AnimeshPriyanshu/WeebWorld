document.getElementById("btn").addEventListener("click", searchAnime)

document.getElementById("dark-btn").addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
})

let isDm = localStorage.getItem("darkMode") === "true";
if (isDm) {
    document.body.classList.add("dark-mode");
}

let loginBtn = document.getElementById("login-btn");
if (loginBtn) {
    loginBtn.addEventListener("click", function() {
        window.location.href = "login.html";
    });
}

let signinBtn = document.getElementById("signin-btn");
if (signinBtn) {
    signinBtn.addEventListener("click", function() {
        window.location.href = "signin.html";
    });
}

document.getElementById("search").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        searchAnime()
    }
});

let animeList = []
let currentPage = 1;
let itemsPerPage = 9;

// Home Page Fetching
async function getTop() {
    let res = await fetch("https://api.jikan.moe/v4/top/anime")
    let data = await res.json()
    let topData = data.data.slice(0, 6)
    let topGrid = document.getElementById("top-list")
    
    topData.forEach(item => {
        let box = document.createElement("div")
        box.className = "card"
        box.innerHTML = `
            <img src="${item.images.jpg.image_url}" alt="${item.title}">
            <p>${item.title}</p>
        `
        topGrid.appendChild(box)
    })
}

async function getNew() {
    let res = await fetch("https://api.jikan.moe/v4/seasons/now")
    let data = await res.json()
    let newArr = data.data.slice(0, 6)
    let newGrid = document.getElementById("new-list")
    
    newArr.forEach(show => {
        let box = document.createElement("div")
        box.className = "card"
        box.innerHTML = `
            <img src="${show.images.jpg.image_url}" alt="${show.title}">
            <p>${show.title}</p>
        `
        newGrid.appendChild(box)
    })
}

async function searchAnime() {
    let query = document.getElementById("search").value
    if (query === "") return

    // Hide Home Content
    document.getElementById("home-content").classList.add("hidden")

    let res = await fetch("https://api.jikan.moe/v4/anime?q=" + query)
    let data = await res.json()
    animeList = data.data
    document.getElementById("sort").value = "default"
    document.getElementById("rating-filter").value = "0"
    currentPage = 1;
    showResults(animeList)
}

document.getElementById("sort").addEventListener("change", function () {
    applyFilters()
})

document.getElementById("rating-filter").addEventListener("change", function () {
    applyFilters()
})

function applyFilters() {
    let filtered = animeList.slice()

    let minRating = Number(document.getElementById("rating-filter").value)
    if (minRating > 0) {
        filtered = filtered.filter(function (anim) {
            return anim.score >= minRating
        })
    }

    let sortVal = document.getElementById("sort").value
    if (sortVal === "az") {
        filtered.sort(function (a, b) {
            return a.title.localeCompare(b.title)
        })
    } else if (sortVal === "za") {
        filtered.sort(function (a, b) {
            return b.title.localeCompare(a.title)
        })
    }
    currentPage = 1;
    showResults(filtered)
}

function showResults(list) {
    let results = document.getElementById("results")
    results.innerHTML = ""

    let totalPages = Math.ceil(list.length / itemsPerPage);
    if (totalPages > 0 && currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    let start = (currentPage - 1) * itemsPerPage;
    let end = start + itemsPerPage;
    let currentList = list.slice(start, end);

    // Using forEach instead of for loop
    currentList.forEach(anime => {
        let div = document.createElement("div")
        div.className = "card"
        div.innerHTML = `
            <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
            <p>${anime.title}</p>
        `
        results.appendChild(div)
    })

    renderPagination(list.length, totalPages, list);
}

function renderPagination(totalItems, totalPages, list) {
    let pagination = document.getElementById("pagination");
    if (!pagination) return;
    pagination.innerHTML = "";
    
    if (totalItems === 0) return;

    let prevBtn = document.createElement("button");
    prevBtn.innerHTML = "&#8592; Prev";
    prevBtn.disabled = currentPage === 1;
    if (currentPage === 1) prevBtn.style.opacity = "0.5";
    prevBtn.addEventListener("click", function() {
        if (currentPage > 1) {
            currentPage--;
            showResults(list);
        }
    });

    let nextBtn = document.createElement("button");
    nextBtn.innerHTML = "Next &#8594;";
    nextBtn.disabled = currentPage === totalPages;
    if (currentPage === totalPages) nextBtn.style.opacity = "0.5";
    nextBtn.addEventListener("click", function() {
        if (currentPage < totalPages) {
            currentPage++;
            showResults(list);
        }
    });

    let pageInfo = document.createElement("span");
    pageInfo.innerHTML = " Page " + currentPage + " of " + (totalPages === 0 ? 1 : totalPages) + " ";
    pageInfo.style.margin = "0 15px";
    pageInfo.style.fontWeight = "bold";

    pagination.appendChild(prevBtn);
    pagination.appendChild(pageInfo);
    pagination.appendChild(nextBtn);
}

// Start Home Page
getTop()
getNew()