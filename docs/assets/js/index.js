window.onload = () => {

const body = document.getElementsByTagName("body")[0];

const name1 = document.getElementById("name-1");
const name2 = document.getElementById("name-2");

let rotating = false;
let stopRotating = false;

const rotationFunc = (loadingInterval) => {
    if (stopRotating){
        clearInterval(loadingInterval);
        return;
    }
    rotating = true;
    name1.style.animation = "2s ease loading-rotate-1"
    name2.style.animation = "2s ease loading-rotate-2"
    setTimeout(() => {rotating = false; name1.style.animation = "none"; name2.style.animation = "none";}, 2000);
};

setTimeout(() => {
    const loadingInterval = setInterval(() => {
        rotationFunc(loadingInterval);
    }, 2500);
    rotationFunc();
}, 100);

document.getElementById("background-video").addEventListener("canplay", (event) => {
    setTimeout(() => {
        stopRotating = true;
        setTimeout(() => {
            console.log("triggering");
            const loadingScreen = document.getElementById("loading-screen");
            console.log(loadingScreen)
            loadingScreen.style.animation = "1s ease-out fade-out forwards";
            name1.style.animation = "1s ease-out fade-to-black-1 forwards";
            name2.style.animation = "1s ease-out fade-to-black-2 forwards";
            setTimeout(() => {body.style.overflowY = "scroll";}, 1000);
        }, 2000);
    },1000);
});
}