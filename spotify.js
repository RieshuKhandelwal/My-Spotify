// as we are not using backend that's why we are writing the following code, otherwise we could have used API of any website like spotify to get the mp3 files in our backend database or server.

let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder){
    currFolder=folder;
    let a = await fetch(`http://127.0.0.1:3000/My_Spotify/songs/${folder}`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML=response;
    let as = div.getElementsByTagName("a");
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`${folder}/`)[1]);
        }
    }

    //show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML="";
    for(const song of songs){
        songUL.innerHTML = songUL.innerHTML + 
        `<li>
        <img class="invert" src="music.svg" alt="">
        <div class="info">
            <div>${song.replaceAll("%20"," ")} </div>
            <div>Rieshu</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="play.svg" alt="">
        </div>
        </li>`;
    }
    
    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",element=>{ 
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        });
    });
    return songs;
}

const playMusic = (track, pause=false)=>{
    currentSong.src = `songs/${currFolder}/`+ track;
    
    if(!pause){
        currentSong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".songinfo").innerHTML=`${track}`;
    document.querySelector(".songtime").innerHTML="00:00 / 00:00";
}

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:3000/My_Spotify/songs`);
    let response = await a.text();    
    let div = document.createElement("div");
    div.innerHTML=response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes("/songs") && !e.href.includes(".htaccess")){
            let folder = e.href.split("/").slice(-2)[0];
            // Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/My_Spotify/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <button class="playButton">▶</button>
            <img src="songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }
    //Load the playlist when card gets clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{  
        e.addEventListener("click", async item =>{
            console.log("fetching");
            songs = await getSongs(`${item.currentTarget.dataset.folder}`)
            playMusic(songs[0]);
        });
    });

    
}

async function main(){

    
    // get all songs in songs list 
    await getSongs("/ncs");
    //set 1st music of list into playbar for display
    playMusic(songs[0],true);

    //Display all the albums on the page
    await displayAlbums();

    //Attach an event listener to previous, play & next
    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play();
            play.src="pause.svg";
        }else{
            currentSong.pause();
            play.src="play.svg";
        }
    });

    // event for timeupdate
    currentSong.addEventListener("timeupdate",()=>{
        document.querySelector(".songtime").innerHTML=`${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration)*100 + "%";
    });

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100;
        // to move the circle in seekbar according to left value
        
        document.querySelector(".circle").style.left = percent +"%";
        
        // to update the cuurent time in seekbar
        
        currentSong.currentTime = ((currentSong.duration)*percent)/100;
    });

    //Add an event listener to Hamburger3line
    document.querySelector(".Hamburger3line").addEventListener(("click"),()=>{
        document.querySelector(".left").style.left="0";
    });

    //Add an event listener to close button
    document.querySelector(".close>img").addEventListener(("click"),()=>{
        document.querySelector(".left").style.left="-120%";
    });

    //Add an event listener to previous & next

    previous.addEventListener("click",()=>{
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);

        if((index-1)>=0){
            playMusic(songs[index-1]);
        }
    });

    next.addEventListener("click",()=>{next
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);        

        if((index+1)<songs.length){
            playMusic(songs[index+1]);
        } 
    });

    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currentSong.volume=parseInt(e.target.value)/100;
        if (currentSong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    });

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .30;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 30;
        }

    });

    
}

main(); 
