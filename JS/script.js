
let songs;
let currFolder;
let currentsong = new Audio();
let play = document.getElementById("playButton");

async function getSongs(folder) {
    currFolder = folder
    //getting the songs from the local server.
    let a = await fetch(`${currFolder}/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1])
        }
    }

    // Show all the songs in the playlist.
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = " ";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        <img src="img/music.svg" alt="">
        <div class="info">
        <div>${song.replaceAll("%20", " ")}</div>
        <div>Song Artist</div>
        </div>
        <div class="playnow">
        <span>Play Now</span>
        <img src="img/play.svg " alt="">
        </div>
        </li>`
    }

    // Attach a event listner to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML);
        })
    })

    return songs;
}


function secondsToMinutesSeconds(secondsWithDecimals) {
    var solidSeconds = Math.floor(secondsWithDecimals); // Extract solid seconds
    var minutes = Math.floor(solidSeconds / 60);
    var remainingSeconds = solidSeconds % 60;

    // Add leading zero if remainingSeconds is less than 10
    remainingSeconds = remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

    if (minutes < 10 && minutes >= 0) {
        return "0" + minutes + ":" + remainingSeconds;
    }
    else {
        return minutes + ":" + remainingSeconds;
    }
}


// Creating the play music function.
const playmusic = (music, pause = false) => {
    currentsong.src = `${currFolder}/` + music;
    if (!pause) {
        currentsong.play();
        play.innerHTML = `<img src="img/pause.svg" alt="">`
    }
    document.querySelector(".songinfo").innerHTML = `${decodeURI(music)}`
    document.querySelector(".songtime").innerHTML = `00:00 / 00:00`
}

async function displayAlbums() {
    let a = await fetch(`songs/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("songs/")) {
            let folder = e.href.split("/").slice(-1)[0];

            // Get the metadata of the folder.
            let a = await fetch(`songs/${folder}/info.json`);
            let response = await a.json();
            let cardContainer = document.querySelector(".cardContainer")
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                            <div class="play">
                                <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24"
                                    fill="black">
                                    <circle cx="12" cy="12" r="12" fill="#00FF00" />
                                    <path
                                        d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                        stroke="black" stroke-width="1.5" stroke-linejoin="round" />
                                </svg>
                            </div>
                            <img src="songs/${folder}/cover.jpeg" alt="">
                            <h2>${response.title}</h2>
                            <p>${response.description}</p>
                        </div>`;
        }
    }
}


async function main() {
    // get the list of all the songs.
    await getSongs("songs/ncs");
    playmusic(songs[0], true);
    await displayAlbums();

    // Attach a event listner to play, next and previous.
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.innerHTML = `<img src="img/pause.svg" alt="">`
        }
        else {
            currentsong.pause();
            play.innerHTML = `<img src="img/play.svg" alt="">`
        }
    })

    // Listen for timeupdate event 
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })

    // Add an evenentListner to a seekbar.
    document.querySelector(".seekbar").addEventListener("click", e => {
        let persent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = persent + "%";
        currentsong.currentTime = (currentsong.duration * persent) / 100;
    })

    // Add an event listener for hamberger.
    document.querySelector(".hamberger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    // Add an event listener for close button on hamburger.
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    })

    // Add an eventlistner on previous and next.
    privious.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }


    })
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
    })

    // Add an event to volume.
    document.getElementById("input").addEventListener("change", e => {

        currentsong.volume = parseInt(e.target.value) / 100;

        if (e.target.value == 0) {
            document.querySelector(".volume>img").src = "img/mute.svg";
        }
        else {
            document.querySelector(".volume>img").src = "img/volume.svg";
        }
    })

    // Load the plyalist whenever card is clicked.
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async event => {
            await getSongs(`songs/${card.dataset.folder}`);
            // Do something with songs
            playmusic(songs[0]);
        });
    });

    // Add event listener to mute the track.
    document.querySelector(".volume img").addEventListener("click", e => {
        console.log(e.target.src)
        if (e.target.src == "02_Spotify_web/img/volume.svg") {
            e.target.src = "02_Spotify_web/img/mute.svg"
            currentsong.volume = 0;
            document.getElementById("input").value = 0;
        }
        else {
            e.target.src = "02_Spotify_web/img/volume.svg"
            currentsong.volume = 0.1;
            document.getElementById("input").value = 10;
        }
    })
}

main()