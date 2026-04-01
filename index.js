document.getElementById("btn").addEventListener("click", searchAnime)

document.getElementById("search").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        searchAnime()
    }
});

async function searchAnime() {
    let query = document.getElementById("search").value
    if (query === "") return
    let res = await fetch(`https://api.jikan.moe/v4/anime?q=${query}`)
    let data = await res.json()
    let results = document.getElementById("results")
    results.innerHTML = ""
    for (let i = 0; i < data.data.length; i++) {
        let anime = data.data[i]
        let div = document.createElement("div")
        div.className = "card"
        div.innerHTML = `
            <img src="${anime.images.jpg.image_url}">
            <p>${anime.title}</p>
        `
        results.appendChild(div);
    }
}