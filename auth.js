document.addEventListener("DOMContentLoaded", function() {
    let isDarkMode = localStorage.getItem("darkMode") === "true";
    if (isDarkMode) {
        document.body.classList.add("dark-mode");
    }

    let darkBtn = document.getElementById("dark-btn");
    if (darkBtn) {
        darkBtn.addEventListener("click", function() {
            document.body.classList.toggle("dark-mode");
            localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
        });
    }

    let submitLogin = document.getElementById("submit-login");
    if (submitLogin) {
        submitLogin.addEventListener("click", function() {
            document.getElementById("username").value = "";
            document.getElementById("password").value = "";
        });
    }

    let submitSignin = document.getElementById("submit-signin");
    if (submitSignin) {
        submitSignin.addEventListener("click", function() {
            document.getElementById("new-username").value = "";
            document.getElementById("new-email").value = "";
            document.getElementById("new-password").value = "";
        });
    }
});
