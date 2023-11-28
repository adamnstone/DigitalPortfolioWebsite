let allTimeouts = [];
let loadingScreen, menuBtn;

window.onload = () => {

const body = document.getElementsByTagName("body")[0];

const name1 = document.getElementById("name-1");
const name2 = document.getElementById("name-2");

menuBtn = document.querySelector('.menu-btn');
const menuContainer = document.querySelector("#menu-container")
console.log(menuContainer);
let menuOpen = false;
let isClickable = true;
console.log(menuBtn);
menuBtn.addEventListener('click', (e) => {
    if (!isClickable) return;
    e.stopPropagation();
  if(!menuOpen) {
    menuBtn.classList.add('open');
    menuOpen = true;
    menuContainer.style.display = "inline";
    menuContainer.style.animation = "1s ease menu-fade-in forwards";
    isClickable = false;
    setTimeout(() => isClickable = true, 1000);
  } else {
    menuBtn.classList.remove('open');
    menuOpen = false;
    menuContainer.style.animation = "1s ease menu-fade-out forwards";
    isClickable = false;
    setTimeout(() => {menuContainer.style.display = "none"; isClickable = true}, 1000);
  }
});

let rotating = false;
let stopRotating = false;

loadingScreen = document.getElementById("loading-screen");

let rotationCount = 0;
const rotationFunc = (loadingInterval) => {
    rotationCount += 1;
    if (rotationCount > 2) {
        endLoading();
    }
    if (stopRotating){
        clearInterval(loadingInterval);
        return;
    }
    rotating = true;
    name1.style.animation = "2s ease loading-rotate-1"
    name2.style.animation = "2s ease loading-rotate-2"
    allTimeouts.push(setTimeout(() => {rotating = false; name1.style.animation = "none"; name2.style.animation = "none";}, 2000));
};

setTimeout(() => {
    const loadingInterval = setInterval(() => {
        rotationFunc(loadingInterval);
    }, 2500);
    allTimeouts.push(loadingInterval)
    rotationFunc();
}, 100);

const endLoading = (event) => {
    //setTimeout(() => {
        stopRotating = true;
        allTimeouts.push(setTimeout(() => {
            loadingScreen.style.animation = "1s ease-out fade-out forwards";
            name1.style.animation = "1s ease-out fade-to-black-1 forwards";
            name2.style.animation = "1s ease-out fade-to-black-2 forwards";
            setTimeout(() => {loadingScreen.style.display = "none"; body.style.overflowY = "scroll"; menuBtn.style.zIndex = 6;}, 1000);
        }, 2000));
    //},1000);
};

document.getElementById("background-video").addEventListener("canplay", endLoading);
};

window.onunload = () => {
    allTimeouts.forEach(t => {
        try {
            clearInterval(t);
        }
        catch {

        }
        try {
            clearTimeout(t);
        }
        catch {

        }
    });
};

