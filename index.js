document.getElementById("btn").addEventListener("click", searchAnime)

document.getElementById("search").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        searchAnime()
    }
});

var animeList = []

async function searchAnime() {
    let query = document.getElementById("search").value
    if (query === "") return

    let res = await fetch("https://api.jikan.moe/v4/anime?q=" + query)
    let data = await res.json()
    animeList = data.data
    document.getElementById("sort").value = "default"
    document.getElementById("rating-filter").value = "0"
    showResults(animeList)
}

document.getElementById("sort").addEventListener("change", function () {
    applyFilters()
})

document.getElementById("rating-filter").addEventListener("change", function () {
    applyFilters()
})

function applyFilters() {
    var filtered = animeList.slice()

    // rating filter
    var minRating = Number(document.getElementById("rating-filter").value)
    if (minRating > 0) {
        filtered = filtered.filter(function (anime) {
            return anime.score >= minRating
        })
    }

    // sorting
    var sortVal = document.getElementById("sort").value
    if (sortVal === "az") {
        filtered.sort(function (a, b) {
            return a.title.localeCompare(b.title)
        })
    } else if (sortVal === "za") {
        filtered.sort(function (a, b) {
            return b.title.localeCompare(a.title)
        })
    }

    showResults(filtered)
}

function showResults(list) {
    let results = document.getElementById("results")
    results.innerHTML = ""

    for (let i = 0; i < list.length; i++) {
        let anime = list[i]
        let div = document.createElement("div")
        div.className = "card"
        div.innerHTML = `
            <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
            <p>${anime.title}</p>
        `
        results.appendChild(div)
    }
}