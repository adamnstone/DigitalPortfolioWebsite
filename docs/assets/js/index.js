let allTimeouts = [];
let loadingScreen;

window.onload = () => {

const body = document.getElementsByTagName("body")[0];

const name1 = document.getElementById("name-1");
const name2 = document.getElementById("name-2");

let rotating = false;
let stopRotating = false;

loadingScreen = document.getElementById("loading-screen");

let rotationCount = 0;
const rotationFunc = (loadingInterval) => {
    rotationCount += 1;
    if (rotationCount > 4) {
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
            console.log("triggering");
            console.log(loadingScreen)
            loadingScreen.style.animation = "1s ease-out fade-out forwards";
            name1.style.animation = "1s ease-out fade-to-black-1 forwards";
            name2.style.animation = "1s ease-out fade-to-black-2 forwards";
            setTimeout(() => {loadingScreen.style.display = "none"; body.style.overflowY = "scroll";}, 1000);
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