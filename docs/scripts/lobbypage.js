let currentGroup = 0

function changeGroup(i) {
    let oldNavEl = getel("navgroup" + currentGroup)
    let currentNavEl = getel("navgroup" + i)
    let oldEl = getel("group" + currentGroup)
    let el = getel("group" + i)

    oldNavEl.classList.remove("current")
    currentNavEl.classList.add("current")
    
    oldEl.classList.add("hide")
    el.classList.remove("hide")

    currentGroup = i
}

let currentBurger = false

function burger() {
    let body = document.body

    if (currentBurger) {
        body.classList.remove("burger")
    } else {
        body.classList.add("burger")
    }

    currentBurger = !currentBurger
}

if (window.innerWidth > 1200) {
    burger()
}