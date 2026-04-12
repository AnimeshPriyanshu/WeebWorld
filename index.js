document.getElementById("btn").addEventListener("click", searchAnime)

document.getElementById("rand-btn").addEventListener("click", getRandom)

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

document.getElementById("search").addEventListener("input", function() {
    let query = this.value
    if (query === "") {
        // Show Home and Hide Results
        document.getElementById("home-content").classList.remove("hidden")
        document.getElementById("results").innerHTML = ""
        document.getElementById("results-info").innerText = ""
        document.getElementById("pagination").innerHTML = ""
    }
})

let animeList = []
let currentPage = 1;
let itemsPerPage = 9;

// Pop-up Logic
function openPop(info) {
    let pop = document.getElementById("pop-box")
    document.getElementById("pop-img").src = info.images.jpg.image_url
    document.getElementById("pop-title").innerText = info.title
    document.getElementById("pop-score").innerText = "Rating: " + info.score + "/10"
    document.getElementById("pop-text").innerText = info.synopsis || "No description available."
    pop.classList.remove("hidden")
}

document.getElementById("close-pop").onclick = function() {
    document.getElementById("pop-box").classList.add("hidden")
}

window.onclick = function(event) {
    let pop = document.getElementById("pop-box")
    if (event.target == pop) {
        pop.classList.add("hidden")
    }
}

// Random Anime Logic
async function getRandom() {
    try {
        // Show status so user knows it's working
        document.getElementById("results-info").innerText = "Finding a surprise..."
        
        let res = await fetch("https://api.jikan.moe/v4/random/anime")
        
        if (res.ok) {
            // Success! Use the random data
            let data = await res.json()
            openPop(data.data)
            document.getElementById("results-info").innerText = ""
        } else {
            // Fallback: Random API is busy, so pick from the most stable 'TOP' list
            console.log("Random API busy, using top-anime fallback...")
            let fallbackRes = await fetch("https://api.jikan.moe/v4/top/anime")
            let fallbackData = await fallbackRes.json()
            let randomIdx = Math.floor(Math.random() * fallbackData.data.length)
            openPop(fallbackData.data[randomIdx])
            document.getElementById("results-info").innerText = ""
        }
    } catch (err) {
        // Absolute last resort if everything fails
        document.getElementById("results-info").innerText = "Error: API is very busy. Try again!"
        console.error(err)
    }
}

// Home Page Fetching Functions
async function getPopular() {
    let res = await fetch("https://api.jikan.moe/v4/top/anime")
    let data = await res.json()
    let topData = data.data.slice(0, 6)
    let topGrid = document.getElementById("top-list")
    
    topData.forEach(item => {
        let box = document.createElement("div")
        box.className = "card"
        box.onclick = function() { openPop(item) }
        box.innerHTML = `
            <img src="${item.images.jpg.image_url}" alt="${item.title}">
            <p>${item.title}</p>
        `
        topGrid.appendChild(box)
    })
}

async function getTrending() {
    let res = await fetch("https://api.jikan.moe/v4/seasons/now")
    let data = await res.json()
    let newArr = data.data.slice(0, 6)
    let newGrid = document.getElementById("new-list")
    
    newArr.forEach(show => {
        let box = document.createElement("div")
        box.className = "card"
        box.onclick = function() { openPop(show) }
        box.innerHTML = `
            <img src="${show.images.jpg.image_url}" alt="${show.title}">
            <p>${show.title}</p>
        `
        newGrid.appendChild(box)
    })
}

async function getUpcoming() {
    let res = await fetch("https://api.jikan.moe/v4/top/anime?filter=upcoming")
    let data = await res.json()
    let upData = data.data.slice(0, 6)
    let upGrid = document.getElementById("up-list")
    
    upData.forEach(up => {
        let box = document.createElement("div")
        box.className = "card"
        box.onclick = function() { openPop(up) }
        box.innerHTML = `
            <img src="${up.images.jpg.image_url}" alt="${up.title}">
            <p>${up.title}</p>
        `
        upGrid.appendChild(box)
    })
}

async function searchAnime() {
    let query = document.getElementById("search").value
    if (query === "") return

    // Hide Home and show searching status
    document.getElementById("home-content").classList.add("hidden")
    document.getElementById("results-info").innerText = "Searching..."
    document.getElementById("results").innerHTML = ""
    document.getElementById("pagination").innerHTML = ""

    try {
        let res = await fetch("https://api.jikan.moe/v4/anime?q=" + query)
        if (!res.ok) throw new Error("API Error")
        
        let data = await res.json()
        animeList = data.data
        document.getElementById("sort").value = "default"
        document.getElementById("rating-filter").value = "0"
        document.getElementById("genre-filter").value = "all"
        currentPage = 1;
        showResults(animeList)
    } catch (err) {
        document.getElementById("results-info").innerText = "Error: API is busy. Please try again later."
        console.error(err)
    }
}

document.getElementById("sort").addEventListener("change", function () {
    applyFilters()
})

document.getElementById("rating-filter").addEventListener("change", function () {
    applyFilters()
})

document.getElementById("genre-filter").addEventListener("change", function () {
    applyFilters()
})

function applyFilters() {
    let filtered = animeList.slice()

    // Genre Filter
    let selectedGenre = document.getElementById("genre-filter").value
    if (selectedGenre !== "all") {
        filtered = filtered.filter(item => {
            // checking if any genre name matches our selection
            return item.genres.some(g => g.name === selectedGenre)
        })
    }

    // Rating Filter
    let minRating = Number(document.getElementById("rating-filter").value)
    if (minRating > 0) {
        filtered = filtered.filter(function (anim) {
            return anim.score >= minRating
        })
    }

    // Sorting
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
    let info = document.getElementById("results-info")
    info.innerText = "Found " + list.length + " anime"

    let results = document.getElementById("results")
    results.innerHTML = ""

    let totalPages = Math.ceil(list.length / itemsPerPage);
    if (totalPages > 0 && currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    let start = (currentPage - 1) * itemsPerPage;
    let end = start + itemsPerPage;
    let currentList = list.slice(start, end);

    currentList.forEach(anime => {
        let div = document.createElement("div")
        div.className = "card"
        div.onclick = function() { openPop(anime) }
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
getPopular()
getTrending()
getUpcoming()

// added a fallback function if database is busy to get the one from 