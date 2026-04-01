let query = "naruto"
async function fetchData(query) {
    let res = await fetch(`https://api.jikan.moe/v4/anime?q=${query}`);
let data = await res.json();

console.log(data.images); // full object
}
fetchData(query)
