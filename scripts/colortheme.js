function dark() {
    document.body.classList.add("dark");

    setCookie("theme", 1, 365);
}

function light() {
    document.body.classList.remove("dark");

    setCookie("theme", 0, 365);
}

if (getCookie("theme") == 1) {
    dark();
}