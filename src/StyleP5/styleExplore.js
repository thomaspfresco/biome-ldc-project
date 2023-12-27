/* BASED ON:
Tom Holloway. "Flow Fields and Noise Algorithms with P5.js". 2020.
https://dev.to/nyxtom/flow-fields-and-noise-algorithms-with-p5-js-5g67
(acedido em 12/11/2023)

Coding Train. "#64 — Kinematics". 2017.
https://thecodingtrain.com/challenges/64-kinematics
(acedido em 13/11/2023)
*/

import p5 from 'p5';
import genres from '../Data/genres.js';

import streams from '../Data/StreamingHistory.json';
import nohemiBold from '../Fonts/Nohemi-Bold.otf';
import nohemiLight from '../Fonts/Nohemi-Light.otf';

let colors = [["bluesRnb",[30,90,150]],["classicalJazz",[255,190,20]],["country",[20,115,20]],
              ["easyListeningNewAge",[255,100,185]],["electronic",[50,250,60]],["worldFolk",[100,50,15]],
              ["hipHop",[50,215,245]],["latin",[245,105,35]],["pop",[120,25,125]],["rockMetal",[220,20,20]]];
             // bluesRnb, classicalJazz, country, easyListeningNewAge, electronic, worldFolk, hipHop, latin, pop, rockMetal

let dayMoments = ["OVERNIGHT","MORNING","AFTERNOON","EVENING","NIGHT"];

let instructions = ["Click anywhere to move.","Click on the Creatures to collect them.",'Press "left arrow"/"right arrow" or scroll up/down to navigate through your Spotify history.','Press "space" or click on the Character to change the View Mode.'];
let instIndex = 0;
let instOpa = 0;
let instStamp = 0;
let instOn = true;

let streamsPerDay = []; //lista de streams por dia -> []
let streamsPerDayConcat = [];
let days = []; //lista de objetos DAY
let dates = []; //datas de dias com audicoes, por ordem

let f1 = 0;
let f2 = 0;
let opaText = 0;
let opaPause = 0;
let opaBackground = 0;
let opaUnderline = 0;
let opaUnderline2 = 0;

let opaMusicPlayer = 0;
let offsetMusicPlayer = 0;

let absorveOpa = 0;
let absorveRadius = 0;

let clearOpa = 255;
let clearRadius = 0;

let gradientAux = [0,0,0];

let sizeClick = 200;
let opaClick = 0;

let scrollDebounce = 0;

let currentDay = 0;
let songOpa = 0;
let songOpaPause = 0;

var particles = new Array(100);
var totalFrames = 240;
var counter = 0;

let pause = false;
let pauseX = 0;
let pauseY = 0;
let statSwitch = false;

let player;

let nMoments = 5;

let playerX = 0;
let playerY = 0;
let targetX = 0;
let targetY = 0;

let lastClick = 0;
let offset = 0;
let incOffset = 0.002;

let currentlyPlaying = null;

// --------------------------------------------------------------------------------------

function findColor(genre) {
  for (let i = 0; i < colors.length; i++) {
    if (colors[i][0] === genre) return colors[i][1];
  }
  return null;
}

function findOcur(stream,auxExp) {
  for (let i = 0; i < auxExp.length; i++) {
    if (auxExp[i][0][0] === stream.trackName && auxExp[i][0][1] === stream.artistName) return i;
  }
  return -1;
}

function insertStats(a,label,flag) {
  let arr = [];
  if (flag === "player") {
    if (label === "song") arr = player.songs;
    else if (label === "artist") arr = player.artists;
    else  if (label === "genre") arr = player.genres;
  } else {
    if (label === "song") arr = days[flag].songsStats;
    else if (label === "artist") arr = days[flag].artists;
    else  if (label === "genre") arr = days[flag].genres;
  }
    
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][0] === a) {
      arr[i][1]++;
      arr = arr.sort((a, b) => b[1] - a[1]);
      return;
    }
  }

  arr.push([a,1]);
  arr = arr.sort((a, b) => b[1] - a[1]);
}

function processData() {

  let prevDate = streams[0].endTime.split(" ")[0];
  let auxDay = [];
  let auxExp = [];

  streams.forEach((stream) => {
    let aux = stream.endTime.split(" ")[0];
    let aux2 = stream.endTime.split(" ")[1].split(":")[0];

    if (aux === prevDate) {
      auxDay.push(stream);
      let ocur = findOcur(stream,auxExp);
      if (ocur !== -1) {
        auxExp[ocur][1] += 1;
        auxExp[ocur][2].push(aux2);
        auxExp[ocur][0][2] = (auxExp[ocur][0][2] + stream.msPlayed)/2;
      }
      else auxExp.push([[stream.trackName, stream.artistName, stream.msPlayed],1,[aux2]]);
    }

    else {
      window.songsAux.push([]);
      dates.push(aux);
      streamsPerDay.push(auxDay);
      streamsPerDayConcat.push(auxExp);
      auxDay = [];
      auxExp = [];
      auxDay.push(stream);
      auxExp.push([[stream.trackName, stream.artistName, stream.msPlayed],1,[aux2]]);
    }

    prevDate = aux;
  })
}

function getDayTime(day) {
  let total = 0;
  streamsPerDay[day].forEach((stream) => {
    total += stream.msPlayed;
  })
  return total / 1000 / 60;
}

// --------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------
function sketch(p) {

  var mTop = p.windowHeight / 20;
  var mBottom = -p.windowHeight / 20 + p.windowHeight;
  var mLeft = p.windowHeight / 20;
  var mRight = -p.windowHeight / 20 + p.windowWidth;

function showNowPlaying() {
  if (offsetMusicPlayer > 0) offsetMusicPlayer -= 2;

        if (opaMusicPlayer < 255 && document.getElementById("player").currentTime<29.5) opaMusicPlayer += 15;
        else if (opaMusicPlayer > 0 && document.getElementById("player").currentTime>29.5) opaMusicPlayer -= 15;

        if (currentlyPlaying.id < window.range) {
          p.tint(255, opaMusicPlayer);
          p.image(currentlyPlaying.cover,p.windowWidth/30,p.windowHeight-p.windowWidth/16-p.windowWidth/30+offsetMusicPlayer,p.windowWidth/16,p.windowWidth/16);
        }
        p.fill(255,255,255,opaMusicPlayer);
        p.noStroke();
        p.textFont(f1);
        p.textAlign(p.LEFT,p.TOP);
        p.textSize(p.windowHeight/20);
        p.text(currentlyPlaying.info[6],p.windowWidth/30+p.windowWidth/16+p.windowWidth/60,p.windowHeight-p.windowWidth/16-p.windowWidth/30+offsetMusicPlayer);
       
        p.textSize(p.windowHeight/50);

        let authors = ""
        p.textFont(f2);

        //artistas
        for (let i = 9; i < 9+currentlyPlaying.info[8]; i++) {
          if(i === currentlyPlaying.info.length-1) authors += currentlyPlaying.info[i];
          else authors += (currentlyPlaying.info[i]+", ");
        }
        
        p.text(authors,p.windowWidth/30+p.windowWidth/16+p.windowWidth/60,p.windowHeight-p.windowWidth/16-p.windowWidth/220+offsetMusicPlayer);

        p.textSize(p.windowHeight/75);
        p.textAlign(p.LEFT,p.BOTTOM);
        p.textFont(f1);

        let seek = document.getElementById("player").currentTime;

        if (seek<10) p.text("0:0"+p.floor(seek)+" / 0:30",p.windowWidth/30+p.windowWidth/16+p.windowWidth/60,p.windowHeight-p.windowWidth/30+offsetMusicPlayer);
        else p.text("0:"+p.floor(seek)+" / 0:30",p.windowWidth/30+p.windowWidth/16+p.windowWidth/60,p.windowHeight-p.windowWidth/30+offsetMusicPlayer);

        if (document.getElementById("player").currentTime>29.7 && opaMusicPlayer <= 0) currentlyPlaying = null;
}

  function noiseLoop(diameter, min, max, rnd) {
    let cx = p.random(rnd || 1000);
    let cy = p.random(rnd || 1000);
    return function (angle) {
      let xoff = p.map(p.cos(angle), -1, 1, cx, cx + diameter);
      let yoff = p.map(p.sin(angle), -1, 1, cy, cy + diameter);
      let zoff = p.sin(angle) * 0.0001;
      let r = p.noise(xoff, yoff, zoff);
      return p.map(r, 0, 1, min, max);
    };
  }

  function radialGradient(sX, sY, sR, eX, eY, eR, colorS, colorE) {
    let gradient = p.drawingContext.createRadialGradient(
      sX, sY, sR, eX, eY, eR
    );
    gradient.addColorStop(0, colorS);
    gradient.addColorStop(1, colorE);
    p.drawingContext.fillStyle = gradient;
  }

  // **************************************************************************************
  class Player {

    constructor() {

        this.angle = 0;
        this.curve = 0;

        this.streams = 0;
        this.minutes = 0;
        this.artists = [];
        this.songs = [];
        this.genres = [];

        this.debounce = 0;

        this.size = p.windowHeight / 25;

        this.songsVisited = [];

        this.moving = false;
        this.d = 0;

        this.opaHover = 0;

        this.opaCircles = 0;

        this.moments = [];
        for (let i = 0; i < nMoments; i++) this.moments.push(new Moment(i));
    }

    addSong(song) {

      if (this.songsVisited.includes(song)) return;
      
      this.songsVisited.push(song);

      this.streams += song.timeStamps.length;
      this.minutes += song.timeStamps.length * p.ceil(song.timeListened/1000/60);

      for (let j = 0; j < song.timeStamps.length; j++) {
        insertStats(song.info[6],"song","player");
        insertStats(song.genre,"genre","player");
        for (let i = 9; i<9+song.info[8]; i++) {
          insertStats(song.info[i],"artist","player");
        }
    }

      for (let i = 0; i < song.timeStamps.length; i++) {
        let h = parseInt(song.timeStamps[i],10);

        if (h >= 0 && h < 24/nMoments*1) this.moments[0].songs.push([song.id,song.c]);
        else if (h >= 24/nMoments*1 && h < 24/nMoments*2) this.moments[1].songs.push([song.id,song.c]);
        else if (h >= 24/nMoments*2 && h < 24/nMoments*3) this.moments[2].songs.push([song.id,song.c]);
        else if (h >= 24/nMoments*3 && h < 24/nMoments*4) this.moments[3].songs.push([song.id,song.c]);
        else this.moments[4].songs.push([song.id,song.c]); 
      }
    }

    show() {
        let check = -1;
        if (statSwitch) {
          for (let i = 0; i < days[currentDay].moments.length; i++) {
            for (let j = 0; j < days[currentDay].moments[i].length; j++) {
              if (days[currentDay].moments[i][j].onHoverPause) {
                check = i;
                break;
              }
            }
         }

        } else {
          for (let i = 0; i < player.songsVisited.length; i++) {
            if (player.songsVisited[i].onHoverPause) {
              for (let j = 0; j < player.moments.length; j++) {
                for (let k = 0; k < player.moments[j].songs.length; k++) {
                  if (player.moments[j].songs[k][0] === player.songsVisited[i].id) {
                    check = j;
                    break;
                  }
                }
              }
            }
          }
        }

        for (let i = 0; i < player.moments.length; i++) player.moments[i].hover = false;
        if (check !== -1) player.moments[check].hover = true;

        if (p.dist(p.mouseX,p.mouseY,playerX,playerY) < this.moments[0].distance*2.6) {
          if (this.opaCircles < 200) this.opaCircles += 5;
        } else if (this.opaCircles > 0) this.opaCircles -= 5;

        if (statSwitch) pauseX = p.windowWidth/2 - p.windowWidth/12;
        else pauseX = p.windowWidth/2 + p.windowWidth/12;

        if (p.dist(p.mouseX,p.mouseY,playerX,playerY) < this.size) {
          if (this.opaHover < 150) this.opaHover += 10;
        } else {
          if (this.opaHover > 0) this.opaHover -= 10;
        }

        if (p.mouseIsPressed && (playerX !== targetX || playerY !== targetY) && pause === false) {
            
            if (p.dist(p.mouseX,p.mouseY,playerX,playerY) < this.size) {
              pause = true;
              this.debounce = p.millis();
              if (instIndex === 3) {
                instIndex++;
                instOpa = 0;
                instStamp = p.millis();
              }
            } else {

            targetX = p.mouseX;
            targetY = p.mouseY;
            document.getElementById("player").currentTime = 29.9;
            this.moving = true;
            if (p.dist(playerX, playerY, targetX, targetY) > p.windowHeight / 4 && p.millis() - lastClick > 1500 && currentlyPlaying === null) this.curve = -p.PI ;
            lastClick = p.millis();
            opaClick = 255;
            sizeClick = 10;
            let check = false;
            for (let s in days[currentDay].songs) {
              if (days[currentDay].songs[s].onHover) {
                check = true;
                break;
              }
            }
 
            if (check === false) {
              p.mouseIsPressed = false;
              if (instIndex === 0) {
                instIndex++;
                instOpa = 0;
                instStamp = p.millis();
              }
            }
          }
        }

        if (pause) {

          if (p.mouseX > p.windowWidth - p.windowWidth/4.6 &&
              p.mouseY > p.windowWidth/18 &&
              p.mouseX < p.windowWidth - p.windowWidth/4.6 + p.windowHeight/3.5 &&
              p.mouseY < p.windowWidth/18 + p.windowHeight/25 && statSwitch === false)  {

              if (opaUnderline < 255) opaUnderline += 15;

              p.push();
              p.stroke(255,255,255,opaUnderline);
              p.strokeWeight(1);
              p.line(p.windowWidth - p.windowWidth/4.8,p.windowWidth/18 + p.windowHeight/25,p.windowWidth - p.windowWidth/4.6 + p.windowHeight/3.75,p.windowWidth/18 + p.windowHeight/25);
              p.pop();
              if (p.mouseIsPressed) {
                statSwitch = !statSwitch;
                opaPause = 0;
                p.mouseIsPressed = false;
              }
          }
          else if (p.mouseX > p.windowWidth/16 &&
          p.mouseY > p.windowHeight - p.windowWidth/14 &&
          p.mouseX < p.windowWidth/16+p.windowWidth/6.5 &&
          p.mouseY < p.windowHeight - p.windowWidth/14+p.windowWidth/50 && statSwitch === false && player.songsVisited.length > 0)  {

          if (opaUnderline2 < 255) opaUnderline2 += 15;

          p.push();
          p.stroke(225,0,0,opaUnderline2);
          p.strokeWeight(1);
          p.line(p.windowWidth/15,p.windowHeight - p.windowWidth/14+p.windowWidth/50,p.windowWidth/18 + p.windowWidth/6.5,p.windowHeight - p.windowWidth/14+p.windowWidth/50);
          p.pop();
          if (p.mouseIsPressed) {
            for (let i = 0; i < player.songsVisited.length; i++) player.songsVisited[i].visited = false;
            player.songsVisited = [];
            for (let i = 0; i < player.moments.length; i++) player.moments[i].songs = [];
            if (currentlyPlaying !== null) document.getElementById("player").currentTime = 29.9;
            clearRadius = 0;
            clearOpa = 255;

            player.streams = 0;
            player.minutes = 0;
            player.artists = [];
            player.songs = [];
            player.genres = [];

            opaPause = 0;

            p.mouseIsPressed = false;
          }
      }
          else if (p.mouseX > p.windowWidth/16 &&
          p.mouseY > p.windowWidth/18 &&
          p.mouseX < p.windowWidth/16 + p.windowHeight/3.7 &&
          p.mouseY < p.windowWidth/18 + p.windowHeight/25 && statSwitch) {

            p.fill(255,0,0);
            p.rect(10,10,10,10);

            if (opaUnderline < 255) opaUnderline += 15;

              p.push();
              p.stroke(255,255,255,opaUnderline);
              p.strokeWeight(1);
              p.line(p.windowWidth/15,p.windowWidth/18 + p.windowHeight/25,p.windowWidth/16 + p.windowHeight/3.8,p.windowWidth/18 + p.windowHeight/25);
              p.pop();
              if (p.mouseIsPressed) {
                statSwitch = !statSwitch;
                opaPause = 0;
                p.mouseIsPressed = false;
              }
            
          }
          else if ((p.dist(p.mouseX,p.mouseY,playerX,playerY) < this.size || p.dist(p.mouseX,p.mouseY,playerX,playerY) > this.moments[0].distance*2.6)
            && p.millis() - this.debounce > 200) {
            if (opaUnderline >= 0) opaUnderline -= 15;
            if (opaUnderline2 >= 0) opaUnderline2 -= 15;
            if (p.mouseIsPressed) {
              pause = false;
              p.mouseIsPressed = false;
            }
          }
          else {
            if (opaUnderline >= 0) opaUnderline -= 15;
            if (opaUnderline2 >= 0) opaUnderline2 -= 15;

          }

          this.angle = p.createVector(0, -1).angleBetween(p.createVector(pauseX - playerX, pauseY - playerY));
          this.d = p.dist(playerX, playerY, pauseX, pauseY);

          if (statSwitch) {

            p.textSize(p.windowHeight/50);
            p.textFont(f2);
            p.textAlign(p.LEFT,p.CENTER);
            p.fill(230,230,230,opaPause/2 + opaUnderline/2);
            p.text("ABOUT YOUR COLLECTION",p.windowWidth/15,p.windowWidth/15);  

            p.textSize(p.windowHeight/75);
            p.textFont(f2);
            p.textAlign(p.RIGHT,p.TOP);
            p.fill(230,230,230,opaPause);
            p.text("STREAMS",p.windowWidth-p.windowWidth/15,p.windowHeight/2-p.windowHeight/12/2-p.windowHeight/12*3);
            p.text("MINUTES",p.windowWidth-p.windowWidth/15,p.windowHeight/2-p.windowHeight/12/2-p.windowHeight/12*2);
            p.text("UNIQUE SONGS",p.windowWidth-p.windowWidth/15,p.windowHeight/2-p.windowHeight/12/2-p.windowHeight/12);
            p.text("UNIQUE ARTISTS",p.windowWidth-p.windowWidth/15,p.windowHeight/2-p.windowHeight/12/2);
            p.text("UNIQUE GENRES",p.windowWidth-p.windowWidth/15,p.windowHeight/2+p.windowHeight/12/2);
            p.text("TOP SONG",p.windowWidth-p.windowWidth/15,p.windowHeight/2+p.windowHeight/12/2+p.windowHeight/12);
            p.text("TOP ARTIST",p.windowWidth-p.windowWidth/15,p.windowHeight/2+p.windowHeight/12/2+p.windowHeight/12*2);
            p.text("TOP GENRE",p.windowWidth-p.windowWidth/15,p.windowHeight/2+p.windowHeight/12/2+p.windowHeight/12*3);
            
            p.textSize(p.windowHeight/50);
            p.text("Songs listened on "+dates[currentDay],p.windowWidth-p.windowWidth/15,p.windowWidth/12.5);  

            p.textFont(f1);
            p.textSize(p.windowHeight/35);

            p.textAlign(p.RIGHT,p.CENTER);
            p.text("ABOUT THE CURRENT DAY",p.windowWidth - p.windowWidth/15,p.windowWidth/15);

            p.textAlign(p.RIGHT,p.TOP);

            p.text(days[currentDay].streams,p.windowWidth-p.windowWidth/15,p.windowHeight/2-p.windowHeight/12/2-p.windowHeight/12*3+p.windowHeight/50);
            p.text(p.ceil(days[currentDay].minutes),p.windowWidth-p.windowWidth/15,p.windowHeight/2-p.windowHeight/12/2-p.windowHeight/12*2+p.windowHeight/50);
            p.text(days[currentDay].songsStats.length,p.windowWidth-p.windowWidth/15,p.windowHeight/2-p.windowHeight/12/2-p.windowHeight/12+p.windowHeight/50);
            p.text(days[currentDay].artists.length,p.windowWidth-p.windowWidth/15,p.windowHeight/2-p.windowHeight/12/2+p.windowHeight/50);
            p.text(days[currentDay].genres.length,p.windowWidth-p.windowWidth/15,p.windowHeight/2+p.windowHeight/12/2+p.windowHeight/50);
            if (days[currentDay].songsStats.length > 0) p.text(days[currentDay].songsStats[0][0],p.windowWidth-p.windowWidth/15,p.windowHeight/2+p.windowHeight/12/2+p.windowHeight/12+p.windowHeight/50);
            else p.text("-",p.windowWidth-p.windowWidth/15,p.windowHeight/2+p.windowHeight/12/2+p.windowHeight/12+p.windowHeight/50);
            if (days[currentDay].artists.length > 0) p.text(days[currentDay].artists[0][0],p.windowWidth-p.windowWidth/15,p.windowHeight/2+p.windowHeight/12/2+p.windowHeight/12*2+p.windowHeight/50);
            else p.text("-",p.windowWidth-p.windowWidth/15,p.windowHeight/2+p.windowHeight/12/2+p.windowHeight/12*2+p.windowHeight/50);
            if (days[currentDay].genres.length > 0) p.text(days[currentDay].genres[0][0],p.windowWidth-p.windowWidth/15,p.windowHeight/2+p.windowHeight/12/2+p.windowHeight/12*3+p.windowHeight/50);
            else p.text("-",p.windowWidth-p.windowWidth/15,p.windowHeight/2+p.windowHeight/12/2+p.windowHeight/12*3+p.windowHeight/50);
          }

          else {
  
            p.textSize(p.windowHeight/50);
            p.textFont(f2);
            p.textAlign(p.RIGHT,p.CENTER);
            p.fill(230,230,230,opaPause/2 + opaUnderline/2);
            p.text("ABOUT THE CURRENT DAY",p.windowWidth - p.windowWidth/15,p.windowWidth/15);  

            p.textSize(p.windowHeight/75);
            p.textFont(f2);
            p.textAlign(p.LEFT,p.TOP);
            p.fill(230,230,230,opaPause);
            p.text("STREAMS",p.windowWidth/15,p.windowHeight/2-p.windowHeight/12/2-p.windowHeight/12*3);
            p.text("MINUTES",p.windowWidth/15,p.windowHeight/2-p.windowHeight/12/2-p.windowHeight/12*2);
            p.text("UNIQUE SONGS",p.windowWidth/15,p.windowHeight/2-p.windowHeight/12/2-p.windowHeight/12);
            p.text("UNIQUE ARTISTS",p.windowWidth/15,p.windowHeight/2-p.windowHeight/12/2);
            p.text("UNIQUE GENRES",p.windowWidth/15,p.windowHeight/2+p.windowHeight/12/2);
            p.text("TOP SONG",p.windowWidth/15,p.windowHeight/2+p.windowHeight/12/2+p.windowHeight/12);
            p.text("TOP ARTIST",p.windowWidth/15,p.windowHeight/2+p.windowHeight/12/2+p.windowHeight/12*2);
            p.text("TOP GENRE",p.windowWidth/15,p.windowHeight/2+p.windowHeight/12/2+p.windowHeight/12*3);

            p.textSize(p.windowHeight/50);
            p.text("Songs you collected",p.windowWidth/15,p.windowWidth/12.5);
            
            p.push();
            p.fill(230,230,230,opaPause/2);
            p.text("CLEAR YOUR COLLECTION",p.windowWidth/15,p.windowHeight - p.windowWidth/15);
            p.fill(225,0,0,opaUnderline2);
            p.text("CLEAR YOUR COLLECTION",p.windowWidth/15,p.windowHeight - p.windowWidth/15);
            p.pop();

            p.textFont(f1);
            p.textSize(p.windowHeight/35);

            p.textAlign(p.LEFT,p.CENTER);
            p.text("ABOUT YOUR COLLECTION",p.windowWidth/15,p.windowWidth/15);

            p.textAlign(p.LEFT,p.TOP);
            p.text(this.streams,p.windowWidth/15,p.windowHeight/2-p.windowHeight/12/2-p.windowHeight/12*3+p.windowHeight/50);
            p.text(this.minutes,p.windowWidth/15,p.windowHeight/2-p.windowHeight/12/2-p.windowHeight/12*2+p.windowHeight/50);
            p.text(this.songs.length,p.windowWidth/15,p.windowHeight/2-p.windowHeight/12/2-p.windowHeight/12+p.windowHeight/50);
            p.text(this.artists.length,p.windowWidth/15,p.windowHeight/2-p.windowHeight/12/2+p.windowHeight/50);
            p.text(this.genres.length,p.windowWidth/15,p.windowHeight/2+p.windowHeight/12/2+p.windowHeight/50);
            if (this.songs.length > 0) p.text(this.songs[0][0],p.windowWidth/15,p.windowHeight/2+p.windowHeight/12/2+p.windowHeight/12+p.windowHeight/50);
            else p.text("-",p.windowWidth/15,p.windowHeight/2+p.windowHeight/12/2+p.windowHeight/12+p.windowHeight/50);
            if (this.artists.length > 0) p.text(this.artists[0][0],p.windowWidth/15,p.windowHeight/2+p.windowHeight/12/2+p.windowHeight/12*2+p.windowHeight/50);
            else p.text("-",p.windowWidth/15,p.windowHeight/2+p.windowHeight/12/2+p.windowHeight/12*2+p.windowHeight/50);
            if (this.genres.length > 0) p.text(this.genres[0][0],p.windowWidth/15,p.windowHeight/2+p.windowHeight/12/2+p.windowHeight/12*3+p.windowHeight/50);
            else p.text("-",p.windowWidth/15,p.windowHeight/2+p.windowHeight/12/2+p.windowHeight/12*3+p.windowHeight/50);
          }

          if (incOffset > 0.005) incOffset-=0.005;
        }
        else {

          if (currentlyPlaying !== null) {
            targetX = currentlyPlaying.pos.x;
            targetY = currentlyPlaying.pos.y;
            if (incOffset < 0.2) incOffset+=0.005;
          }
          else {
            if (incOffset > 0.005) incOffset-=0.005;
          }

          this.angle = p.createVector(0, -1).angleBetween(p.createVector(targetX - playerX, targetY - playerY));
          this.d = p.dist(playerX, playerY, targetX, targetY);
        }

        if (this.curve < 0) this.curve += 0.1;

        if (playerX !== targetX || playerY !== targetY) {

            if (this.curve < 0) this.d = p.windowHeight / 200;
            else this.d = 2 * this.d / 50;

            if (this.d > p.windowHeight/70) this.d = p.windowHeight/70;

            if (this.d < p.windowHeight / 200) this.moving = false;

            if (this.moving === false) {
                if (this.rot > 0.01) this.rot -= 0.0001;
                if (this.dis > p.windowHeight / 50) this.dis -= 1;
            }

            playerX += p5.Vector.fromAngle(this.curve + this.angle, this.d).y;
            playerY += p5.Vector.fromAngle(this.curve + p.PI - this.angle, this.d).x;
        }

        if (currentlyPlaying !== null) {
          p.noFill();
          p.stroke(gradientAux[0],gradientAux[1],gradientAux[2],absorveOpa);
          p.strokeWeight(3);
          p.push();
          p.drawingContext.shadowBlur = 15;
          p.drawingContext.shadowColor = '#FFFFFF';
          p.circle(playerX, playerY, absorveRadius);
          p.pop();

          absorveRadius -= 2;
          absorveOpa += 3;
          if (absorveOpa >= 255) {
            absorveRadius = this.size*5;
            absorveOpa = 0;
          }
        }

        p.textAlign(p.CENTER,p.CENTER);

        p.push();
        p.translate(playerX,playerY);
        p.rotate(0+offset);
        p.translate(-playerX,-playerY);

        for (let i = 0; i < nMoments; i++) {
          p.push();
          p.translate(playerX,playerY);
          p.rotate(p.PI + i*p.TWO_PI/nMoments);
          p.translate(-playerX,-playerY);
          p.fill(255,255,255,this.moments[i].opaLabel);
          p.noStroke();
          p.textFont(f2);
          p.textSize(p.windowHeight/75);
          p.text(dayMoments[i], playerX, playerY+this.moments[i].distance*2+p.windowHeight/15);
          if (this.moments[i].hover) {
            if (this.moments[i].opaLabel < 255) this.moments[i].opaLabel += 10;
          } else if (this.moments[i].opaLabel > 0) this.moments[i].opaLabel -= 10;
          p.pop();
          this.moments[i].update();
          this.moments[i].show();
        }

        p.fill(gradientAux[0],gradientAux[1],gradientAux[2]);
        p.noStroke();

        p.push();
        p.drawingContext.shadowBlur = 20;
        p.drawingContext.shadowColor = '#FFFFFF';
        p.circle(playerX, playerY, this.size);
        p.pop();
        p.circle(playerX, playerY, this.size);

        p.pop();

        if (pause === false) for (let i = 0; i < this.songsVisited.length; i++) this.songsVisited[i].show();
        else if (pause && statSwitch === false) for (let i = 0; i < this.songsVisited.length; i++) this.songsVisited[i].show();
        else if (pause && statSwitch) {
          for (let i = 0; i < days[currentDay].songs.length; i++) {
            let m = 0;
            if (days[currentDay].moments[0].includes(days[currentDay].songs[i])) m = 0;
            else if (days[currentDay].moments[1].includes(days[currentDay].songs[i])) m = 1;
            else if (days[currentDay].moments[2].includes(days[currentDay].songs[i])) m = 2;
            else if (days[currentDay].moments[3].includes(days[currentDay].songs[i])) m = 3;
            else m = 4;

            let v = p5.Vector.fromAngle(-p.PI/2 + p.TWO_PI/nMoments*m+offset, player.moments[m].distance);
            days[currentDay].songs[i].visited = true;
            days[currentDay].songs[i].visitedX = playerX + v.x + player.moments[m].radius/2*p.cos(player.moments[m].count + p.TWO_PI/days[currentDay].moments[m].length*i) + 6*p.cos(days[currentDay].songs[i].id - (5*player.moments[m].count));
            days[currentDay].songs[i].visitedY = playerY + v.y + player.moments[m].radius/2*p.sin(player.moments[m].count + p.TWO_PI/days[currentDay].moments[m].length*i) + 6*p.sin(days[currentDay].songs[i].id - (5*player.moments[m].count));

            days[currentDay].songs[i].show();
            if (!player.songsVisited.includes(days[currentDay].songs[i])) days[currentDay].songs[i].visited = false;
          }

        }
        p.noStroke();
        p.fill(250,250,250,this.opaHover);
        p.circle(playerX, playerY, this.size);
    }
}

  // **************************************************************************************
class Moment {

  constructor(id) { 
      this.id = id;
      this.songs = []; // [id, color]
      this.pos = p.createVector(0, 0);
      this.distance =  p.windowHeight / 250;
      this.radius = p.windowHeight / 15;
      this.count = 0;
      this.opaOrbit = 0;
      this.hover = false;
      this.opaLabel = 0;
      this.opaHighlight = 0;
  }

  update() { 
      let aux = p5.Vector.fromAngle(-p.PI/2 + p.TWO_PI/nMoments*this.id, this.distance);
      this.pos.x = playerX + aux.x;
      this.pos.y = playerY + aux.y;

      if (pause) {
        if (this.distance < p.windowHeight / 8) this.distance += 8;
        if (this.radius < p.windowHeight / 3) this.radius += 8;
        if (this.opaOrbit < 255) this.opaOrbit += 5;
      } else {
        if (this.distance > p.windowHeight / 300) this.distance -= 8;
        if (this.radius > p.windowHeight / 20) this.radius -= 8;
        if (this.opaOrbit > 0) this.opaOrbit -= 15;
      }
  }

  show() {
      if (this.hover){
        if (this.opaHighlight < 25) this.opaHighlight += 1;
      } else if (this.opaHighlight > 0) this.opaHighlight -= 1;
      
      p.fill(255,this.opaHighlight);

      p.stroke(255,255,255,player.opaCircles);
      p.strokeWeight(0.5);

      this.count += 0.01;

      p.push();
      p.circle(this.pos.x, this.pos.y,this.radius);
      p.translate(this.pos.x,this.pos.y);
      p.rotate(this.count);
      p.translate(-this.pos.x,-this.pos.y);
      
      for (let i = 0; i < this.songs.length; i++) {
          let angle = p.TWO_PI / this.songs.length * i + this.id*p.PI;
          let aux = p5.Vector.fromAngle(angle, this.radius/2);
          let aux2 = p5.Vector.fromAngle(-p.PI/2 + p.TWO_PI/nMoments*this.id+offset, this.distance);

          p.push();
          p.translate(this.pos.x + aux.x,this.pos.y + aux.y);
          p.rotate(this.id + this.count);
          p.translate(-this.pos.x - aux.x,-this.pos.y - aux.y);
          p.noStroke();

          let tX = playerX + this.radius*2*p.cos(this.count + p.TWO_PI/this.songs.length*i) * p.noise(this.songs[i][0]*this.id + this.count/4);
          let tY = playerY + this.radius*2*p.sin(this.count + p.TWO_PI/this.songs.length*i) * p.noise(this.songs[i][0]*this.id + this.count/4);

          if (pause) {
          tX = playerX + aux2.x + this.radius/2*p.cos(this.count + p.TWO_PI/this.songs.length*i) + 6*p.cos(this.songs[i][0] - (5*this.count));
          tY = playerY + aux2.y + this.radius/2*p.sin(this.count + p.TWO_PI/this.songs.length*i) + 6*p.sin(this.songs[i][0] - (5*this.count));
          }

          p.noStroke();
          p.strokeWeight(3);
          p.stroke(this.songs[i][1][0],this.songs[i][1][1],this.songs[i][1][2]);
          p.pop();

          for (let j = 0; j < player.songsVisited.length; j++) {
            if (this.songs[i][0] === player.songsVisited[j].id) {
              player.songsVisited[j].visitedX = tX;
              player.songsVisited[j].visitedY = tY;
              break;
            }
          }
      }
      p.pop();
  }
}

  // **************************************************************************************
  class Particle {

    constructor() {
      this.xn = noiseLoop(0.05, -p.windowWidth, p.windowWidth * 2);
      this.yn = noiseLoop(0.05, -p.windowHeight, p.windowHeight * 2);
      this.rn = noiseLoop(0.5, 0, 255);
      this.gn = noiseLoop(0.5, 0, 255);
      this.bn = noiseLoop(0.5, 0, 255);
      this.dn = noiseLoop(0.5, 1, 10);
      this.an = noiseLoop(1, 5, 200);
    }

    render(a) {
      p.noStroke();
      p.fill(this.rn(a), this.gn(a), this.bn(a), this.an(a));
      p.circle(this.xn(a), this.yn(a), this.dn(a) / 2);
    }
  }

  // **************************************************************************************
  class Segment {
    constructor(arg1, arg2, arg3) {
      if (arguments.length === 3) {
        this.a = p.createVector(arg1, arg2);
        this.len = arg3;
        this.b = p.createVector(0, 0);
      } else {
        this.a = arg1.b.copy();
        this.len = arg2;
        this.b = p.createVector(0, 0);
      }
      this.angle = 0;
    }
  
    follow(arg1, arg2) {
      // arg1: segment  
      if (arguments.length === 2) {
        const target = p.createVector(arg1, arg2);
        let dir = target.copy();
        dir = dir.sub(this.a);
        dir.setMag(this.len);
        dir.mult(-1);
        this.a = target.copy();
        this.a = this.a.add(dir);
      
      // arg1: segment   
      } else if (arguments.length === 1) {   
        const target = p.createVector(arg1.a.x, arg1.a.y);
        let dir = target.copy();
        dir = dir.sub(this.a);
        dir.setMag(this.len);
        dir.mult(-1);
        this.a = target.copy();
        this.a = this.a.add(dir);
      }
    }
    
    show(r) {
      let point = p.createVector(0, 0);
      point.add(this.a);
      p.ellipse(point.x, point.y, r, r);
      }
  }

  // **************************************************************************************
  class Song {
    constructor(id, day, dayListens, timeStamps, timeListened) {
      this.id = id;
      this.day = day;
      this.dayListens = dayListens;
      this.timeListened = timeListened;
      this.r = p.windowHeight/150 + 0.5*dayListens*p.windowHeight/150;
      this.l = p.windowHeight/150 + 0.5*dayListens*p.windowHeight/300;
      this.segments = [];
      this.speed = 1;

      this.timeStamps = timeStamps;

      this.numSeg = p.ceil(this.timeListened/1000/60);

      this.opa = 150;

      this.infoOpa = 0;
      this.infoOffset = 0;

      this.visitedX = 0;
      this.visitedY = 0;

      this.emitterOpa = 255;
      this.emitterRadius = 0;

      this.cover = "";

      this.onHover = false;
      this.onHoverPause = false;
      this.visited = false;

      this.mainGenre = genres[0][0];
      this.genre = "";

      if (this.id+window.idOffset < window.range) {

      let aux = false;

      while(aux === false) {

      let aux2 = window.idOffset;

      for (let i = 0; i < window.songsAux[this.day].length; i++) {
          if (window.songsAux[this.day].length === 0) {
            window.songsAux[this.day].push([window.songs[this.id+window.idOffset][6],window.songs[this.id+window.idOffset][9]]);
            break;
          }
          else {
            if (window.songsAux[this.day][i][0] === window.songs[this.id+window.idOffset][6] 
              && window.songsAux[this.day][i][1] === window.songs[this.id+window.idOffset][9]) {
                window.idOffset++;
                i = window.songsAux[this.day].length;
              }
          }
      }
      if (aux2 === window.idOffset) {
        window.songsAux[this.day].push([window.songs[this.id+window.idOffset][6],window.songs[this.id+window.idOffset][9]]);
        aux = true;
      }
    }
        this.info = window.songs[this.id+window.idOffset];
        this.cover = p.loadImage(this.info[4]); 
        this.genre = this.info[7];

        //console.log(this.info);

      for (let g in genres) {
        if (genres[g].includes(this.genre)) {
            this.mainGenre = genres[g][0];
            break;
        }
    }

    if (typeof this.genre === 'undefined') this.genre = "-";
    

    this.c = findColor(this.mainGenre);
      } else this.info = "";


      if (this.c === undefined || this.c === null) this.c = [255,255,255];

      let x = p.random(mLeft,p.windowWidth-mLeft);
      let y = p.random(mTop,p.windowHeight-mTop);

      this.pos = p.createVector(x, y);
      this.dir = p.createVector(p.random(-1, 1), p.random(-1, 1));
      this.vel = p.createVector(0, 0);

      this.sinTime = 0;
      this.sinInc = p.TWO_PI / 200;
      this.sinMag = 1;

      this.perlinTime = 0;
      this.perlinInc = 1;
      this.perlinMag = 1;

      this.time = 0;
      this.speedAux = this.speed;

      this.segments.unshift(new Segment(x, y, this.r));
      for (let i = 1; i < this.numSeg; i++) {
        this.segments.unshift(new Segment(this.segments[i - 1], this.l));
      }
    }

    calcSine() {
      this.sinTime += this.sinInc;
      return this.sinMag * p.sin(this.sinTime);
    }
  
    calcPerlin() {
      this.perlinTime += this.perlinInc;
      return this.perlinMag * p.noise(this.perlinTime);
    }
  
    flipAngle() {
      if (p.random() < 0.5) return p.radians(p.random(-20, -70));
      else return p.radians(p.random(20, 70));
    }
  
    update() {
  
      if (this.onHover || this.onHoverPause) {
        this.speed = 0;
       } else {
      if (p.millis() - this.time > 2000) {
        let aux = p.random(0,1);
        if (aux < 0.2) this.speedAux = p.random(2,2.2);
        else this.speedAux = p.random(0,1);
        this.time = p.millis();
      }
    
      if (this.speedAux > this.speed) this.speed += 0.01;
      else this.speed -= 0.01;
    }
  
      const total = this.segments.length;
      
      this.vel.setMag(0);
  
      //guia
      this.vel.add(p.createVector(this.speed, 0)); //eixo principal
      this.vel.add(p.createVector(0, this.calcSine())); //sin
      this.vel.add(p.createVector(0, this.calcPerlin()));  //noise
  
      //limites
      if (this.pos.x > mRight || this.pos.x < mLeft ||
        this.pos.y < mTop || this.pos.y > mBottom) {
          let canvasCenter = p.createVector(p.windowWidth / 2, p.windowHeight / 2);
          canvasCenter.sub(this.pos);
          canvasCenter.normalize();
          this.dir.set(canvasCenter);
          this.dir.rotate(this.flipAngle());
      }
      
      this.vel.rotate(this.dir.heading());
      this.vel.setMag(this.speed);
      if ((this.visited === false || currentlyPlaying === this) && pause === false) this.pos.add(this.vel);
      else if (this.visited === false && pause) this.pos.add(this.vel);
      //end guide
  
      const end = this.segments[total - 1];
      end.follow(this.pos.x, this.pos.y);
  
      for (let i = total - 2; i >= 0; i--) this.segments[i].follow(this.segments[i + 1]);
    }

    checkHover() {
      for (let i = 0; i < days[this.day].songs.length; i++) {
        if (days[this.day].songs[i].onHover && days[this.day].songs[i].id !== this.id) {
          return true;
        }
      }
      return false;
    }

    checkHoverPause() {
      if (statSwitch) {
        for (let i = 0; i < days[this.day].songs.length; i++) {
          if (days[this.day].songs[i].onHoverPause && days[this.day].songs[i].id !== this.id) {
            return true;
          }
        }
      } else {
      for (let i = 0; i < player.songsVisited.length; i++) {
        if (player.songsVisited[i].onHoverPause && player.songsVisited[i].id !== this.id) {
          return true;
        }
      }
    }
      return false;
    }
  
    show() {

      if (currentlyPlaying === this) {
        p.noFill();
        p.strokeWeight(2);
        p.stroke(gradientAux[0], gradientAux[1], gradientAux[2],this.emitterOpa);
       
        p.push();
        p.drawingContext.shadowBlur = 15;
        p.drawingContext.shadowColor = '#FFFFFF';
        p.circle(this.pos.x,this.pos.y,this.emitterRadius);
        p.pop();

        this.emitterRadius += 1;
        this.emitterOpa -= 4;
        if (absorveRadius > player.size*2 && absorveRadius < player.size*3) {
          this.emitterRadius = 0;
          this.emitterOpa = 255;
        }
      }

      p.noStroke();

      if (p.mouseX<this.pos.x+this.r*1.5 && p.mouseX>this.pos.x-this.r*1.5
        && p.mouseY<this.pos.y+this.r*1.5 && p.mouseY>this.pos.y-this.r*1.5 && this.checkHoverPause() === false && pause && ((this.visited && statSwitch === false) || statSwitch)) {

          if (this.onHoverPause) {
            p.push();
            p.fill(255);
            p.drawingContext.shadowBlur = 20;
            p.drawingContext.shadowColor = '#FFFFFF';
            p.ellipse(this.pos.x, this.pos.y, this.r, this.r);
            p.pop();
            }
    
            if(this.onHoverPause === false) {
              this.infoOffset = p.windowHeight/50;
              this.infoOpa = 0;
            }
    
            if (this.infoOffset > 0) this.infoOffset -= 2;
    
            if (this.infoOpa  < 255 && this.onHoverPause) this.infoOpa  += 15;
            else if (this.infoOpa  > 0 && this.onHoverPause === false) this.infoOpa  -= 15;
    
            this.onHoverPause = true;
            p.fill(230,230,230,this.infoOpa);
            p.noStroke();
            p.textFont(f1);
            p.textSize(p.windowHeight/25);
            p.tint(255, this.infoOpa);
    
            let authors = ""
    
            for (let i = 9; i < 9+this.info[8]; i++) {
              if(i === this.info.length-1) authors += this.info[i];
              else authors += (this.info[i]+", ");
            }
    
            if (this.id < window.range && statSwitch === false) {
              p.textAlign(p.LEFT,p.TOP);
              p.text(this.info[6],this.pos.x+p.windowHeight/150+p.windowWidth/20,this.pos.y+p.windowHeight/150+this.infoOffset);
              p.image(this.cover,this.pos.x+p.windowHeight/150,this.pos.y+p.windowHeight/150+this.infoOffset,p.windowWidth/25,p.windowWidth/25);
              p.textFont(f2);
              p.textSize(p.windowHeight/50);
              p.text(authors,this.pos.x+p.windowHeight/150+p.windowWidth/20,this.pos.y+p.windowWidth/35+this.infoOffset);
            }
            else if (this.id < window.range && statSwitch) {
              p.textAlign(p.RIGHT,p.TOP);
              p.text(this.info[6],this.pos.x-p.windowHeight/150-p.windowWidth/20,this.pos.y+p.windowHeight/150+this.infoOffset);
              p.image(this.cover,this.pos.x-p.windowHeight/150-p.windowWidth/25,this.pos.y+p.windowHeight/150+this.infoOffset,p.windowWidth/25,p.windowWidth/25);
              p.textFont(f2);
              p.textSize(p.windowHeight/50);
              p.text(authors,this.pos.x-p.windowHeight/150-p.windowWidth/20,this.pos.y+p.windowWidth/35+this.infoOffset);
            }

            if(p.mouseIsPressed) {
              if (typeof this.info[5] !== "object") {
              this.onHoverPause = false;
              currentDay = this.day;
              pause = false;
              days[currentDay].timer = p.millis();
              document.getElementById("player").src = this.info[5];
              document.getElementById("player").play();
              currentlyPlaying = this;
              } else if (this.id < window.range) {
                currentlyPlaying = this;
                this.blobNotAvailable = true;
                this.blobTimeStamp = p.millis();
              } else {
                currentlyPlaying = this;
                offsetMusicPlayer = p.windowHeight/30;
                opaMusicPlayer = 0;
              }
      
              p.mouseIsPressed = false;
              if (instIndex === 1) {
                instIndex++;
                instOpa = 0;
                instStamp = p.millis();
              }
              }

      } else {
        this.onHoverPause = false;
      }

      if (p.mouseX<this.pos.x+this.r*1.5 && p.mouseX>this.pos.x-this.r*1.5
      && p.mouseY<this.pos.y+this.r*1.5 && p.mouseY>this.pos.y-this.r*1.5 && this.checkHover() === false && pause === false) {

        if (this.onHover) {
        p.push();
        p.fill(255);
        p.drawingContext.shadowBlur = 20;
        p.drawingContext.shadowColor = '#FFFFFF';
        p.ellipse(this.pos.x, this.pos.y, this.r, this.r);
        p.pop();
        }

        if(this.onHover === false) {
          this.infoOffset = p.windowHeight/50;
          this.infoOpa = 0;
        }

        if (this.infoOffset > 0) this.infoOffset -= 2;

        if (this.infoOpa  < 255 && this.onHover) this.infoOpa  += 15;
        else if (this.infoOpa  > 0 && this.onHover === false) this.infoOpa  -= 15;

        this.onHover = true;

        p.fill(230,230,230,this.infoOpa);
        p.noStroke();
        p.textFont(f1);
        p.textSize(p.windowHeight/25);
        p.tint(255, this.infoOpa);

        let authors = ""

        for (let i = 9; i < 9+this.info[8]; i++) {
          if(i === this.info.length-1) authors += this.info[i];
          else authors += (this.info[i]+", ");
        }

        if (this.id < window.range && this.pos.x < p.windowWidth / 2) {
          p.textAlign(p.LEFT,p.TOP);
          p.text(this.info[6],this.pos.x+p.windowHeight/150+p.windowWidth/20,this.pos.y+p.windowHeight/150+this.infoOffset);
          p.image(this.cover,this.pos.x+p.windowHeight/150,this.pos.y+p.windowHeight/150+this.infoOffset,p.windowWidth/25,p.windowWidth/25);
          p.textFont(f2);
          p.textSize(p.windowHeight/50);
          p.text(authors,this.pos.x+p.windowHeight/150+p.windowWidth/20,this.pos.y+p.windowWidth/35+this.infoOffset);
        }
        else if (this.id < window.range && this.pos.x >= p.windowWidth / 2) {
          p.textAlign(p.RIGHT,p.TOP);
          p.text(this.info[6],this.pos.x-p.windowHeight/150-p.windowWidth/20,this.pos.y+p.windowHeight/150+this.infoOffset);
          p.image(this.cover,this.pos.x-p.windowHeight/150-p.windowWidth/25,this.pos.y+p.windowHeight/150+this.infoOffset,p.windowWidth/25,p.windowWidth/25);
          p.textFont(f2);
          p.textSize(p.windowHeight/50);
          p.text(authors,this.pos.x-p.windowHeight/150-p.windowWidth/20,this.pos.y+p.windowWidth/35+this.infoOffset);
        }
        
        if(p.mouseIsPressed && this.visited === false) {
        if (typeof this.info[5] !== "object") {
        this.onHover = false;
        document.getElementById("player").src = this.info[5];
        document.getElementById("player").play();
        currentlyPlaying = this;
        } else if (this.id < window.range) {
          currentlyPlaying = this;
          this.blobNotAvailable = true;
          this.blobTimeStamp = p.millis();
        } else {
          currentlyPlaying = this;
          offsetMusicPlayer = p.windowHeight/30;
          opaMusicPlayer = 0;
        }

        p.mouseIsPressed = false;
        if (instIndex === 1) {
          instIndex++;
          instOpa = 0;
          instStamp = p.millis();
        }
        }
      }

      else {
        this.onHover = false;
      }

      if (currentlyPlaying === this && pause === false) {
        this.visited = true;
        player.addSong(this);
      }

      let songOpaCopy = songOpa;
      let songOpaPauseCopy = songOpaPause;

      if (this.onHover) songOpaCopy = 255;
      if (this.onHoverPause) songOpaPauseCopy = 255;

      if (this.visited) {
        this.onHover = false;
        if (pause) songOpaCopy = 255;
        else songOpaCopy = 255/2;

        if ((currentlyPlaying !== this || (pause && currentlyPlaying === this)) && this.onHoverPause === false) {
          const v = p5.Vector.normalize(p.createVector(this.visitedX - this.pos.x, this.visitedY - this.pos.y));
          let d = p.dist(this.pos.x, this.pos.y, this.visitedX, this.visitedY);
          v.mult(d/20);
          this.pos.x += v.x;
          this.pos.y += v.y;
        }
        if (pause) p.fill(this.c[0], this.c[1], this.c[2],songOpaPauseCopy); 
        else p.fill(this.c[0], this.c[1], this.c[2],songOpaCopy); 
      }
      else {
        p.fill(this.c[0], this.c[1], this.c[2],songOpaCopy);
        p.noStroke();
      }
      p.ellipse(this.pos.x, this.pos.y, this.r, this.r);
      p.noStroke();
      
      if (this.visited && pause === false) p.fill(230,230,230,songOpaCopy/4);
      else if (this.visited && pause) p.fill(230,230,230,songOpaPauseCopy); 
      else p.fill(230,230,230,songOpaCopy);

      for (let i = 0; i < this.numSeg; i++) this.segments[i].show(this.r/4 + 0.5*this.r * i/this.numSeg);
      this.update();
      
    }
  }

  // **************************************************************************************
  class Day {
    constructor(id, date, songs, nSongs, minutes) {
      this.id = id;
      this.date = date;
      this.songs = songs;
      this.streams = nSongs;
      this.minutes = minutes;

      this.artists = [];
      this.songsStats = [];
      this.genres = [];

      this.opa = 0;
      this.timer = 0;

      this.moments = [[],[],[],[],[]];

      for (let j = 0; j < this.songs.length; j++) {
        for (let i = 0; i < this.songs[j].timeStamps.length; i++) {
          let h = parseInt(this.songs[j].timeStamps[i],10);
          //console.log(h);
          if (h >= 0 && h < 24/nMoments*1) this.moments[0].push(this.songs[j]);
          else if (h >= 24/nMoments*1 && h < 24/nMoments*2) this.moments[1].push(this.songs[j]);
          else if (h >= 24/nMoments*2 && h < 24/nMoments*3) this.moments[2].push(this.songs[j]);
          else if (h >= 24/nMoments*3 && h < 24/nMoments*4) this.moments[3].push(this.songs[j]);
          else this.moments[4].push(this.songs[j]); 
        }
      }
    }

    show() {
      for (let i = 0; i < this.songs.length; i++) if (this.songs[i].visited === false) this.songs[i].show(this.id);

      if (pause) this.opa = 0;
      if (p.millis() - this.timer < 2000) {
        if (this.opa < 255) this.opa += 15;
      }
      else if (this.opa > 0) this.opa -= 5;
      p.fill(255, 255, 255, this.opa);
      p.textAlign(p.LEFT,p.TOP);

      p.textFont(f1);
      p.textSize(p.windowHeight/35);
      p.text(dates[currentDay],p.windowWidth/30,p.windowWidth/21);

      p.textFont(f2);
      p.textSize(p.windowHeight/75);
      p.text("CURRENT DAY",p.windowWidth/30,p.windowWidth/28);
      
      p.fill(255, 255, 255, opaText);
    }
  }

  // --------------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------------
  p.preload = function () {
    f1 = p.loadFont(nohemiBold);
    f2 = p.loadFont(nohemiLight);
    processData();
  }

  // --------------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------------
  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.background(0);
    p.frameRate(60);
    p.textFont(f1);
    p.noStroke();

    targetX = p.windowWidth / 2;
    targetY = p.windowHeight / 2;
    player = new Player();

    pauseX = p.windowWidth / 2 + p.windowWidth/12;
    pauseY = p.windowHeight / 2;

    offsetMusicPlayer = p.windowHeight/30;

    let id=0;
    for (let i = 0; i < streamsPerDayConcat.length; i++) { //days
      let aux = [];
      for (let j = 0; j < streamsPerDayConcat[i].length; j++) { //songs
        aux.push(new Song(id,i,streamsPerDayConcat[i][j][1],streamsPerDayConcat[i][j][2],streamsPerDayConcat[i][j][0][2]));

        id++;
      }
      days[i] = new Day(i, dates[i], aux, streamsPerDayConcat[i].length, getDayTime(i));

      for (let k = 0; k < days[i].songs.length; k++) {
        for (let j = 0; j < days[i].songs[k].timeStamps.length; j++) {
          insertStats(days[i].songs[k].info[6],"song",days[i].id);
          insertStats(days[i].songs[k].genre,"genre",days[i].id);
          for (let l = 9; l<9+days[i].songs[k].info[8]; l++) {
            insertStats(days[i].songs[k].info[l],"artist",days[i].id);
          }
        }
      }
    }

    for (let i = 0; i < particles.length; i++) {
      particles[i] = new Particle();
    }
  }

  p.keyPressed = function() {
    if (p.keyCode === 32) {
      pause = !pause;
      if (instIndex === 3) {
        instIndex++;
        instOpa = 0;
        instStamp = p.millis();
      }
    }
    if (p.keyCode === p.RIGHT_ARROW) {
      if (currentDay < days.length-1) {
        currentDay += 1;
        songOpa = 0;
        days[currentDay].timer = p.millis();
        opaPause = 0;
        opaUnderline = 0;
        opaUnderline2 = 0;
        if (instIndex === 2) {
          instIndex++;
          instOpa = 0;
          instStamp = p.millis();
        }
      }
    }
    if (p.keyCode === p.LEFT_ARROW) {
      if (currentDay > 0) {
        currentDay -= 1;
        songOpa = 0;
        days[currentDay].timer = p.millis();
        opaPause = 0;
        opaUnderline = 0;
        opaUnderline2 = 0;
        if (instIndex === 2) {
          instIndex++;
          instOpa = 0;
          instStamp = p.millis();
        }
      }
    }
  }

  p.mouseWheel = function(event) { 
    let scrollDelta = event.delta; 
   
    if (p.millis()-scrollDebounce > 300) {
    if (scrollDelta > 0) {
      if (currentDay < days.length-1) {
        currentDay += 1;
        songOpa = 0;
        days[currentDay].timer = p.millis();
        opaPause = 0;
        opaUnderline = 0;
        opaUnderline2 = 0;

        if (instIndex === 2) {
          instIndex++;
          instOpa = 0;
          instStamp = p.millis();
        }
      }
    }
    else {
      if (currentDay > 0) {
      currentDay -= 1;
      songOpa = 0;
      days[currentDay].timer = p.millis();
      opaPause = 0;
      opaUnderline = 0;
      opaUnderline2 = 0;

      if (instIndex === 2) {
        instIndex++;
        instOpa = 0;
        instStamp = p.millis();
      }
      }
    }

    scrollDebounce = p.millis();
  }
} 

  // --------------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------------
  p.draw = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);

    if (currentlyPlaying !== null) {
      if (gradientAux[0] < currentlyPlaying.c[0]) gradientAux[0] += 2;
      if (gradientAux[1] < currentlyPlaying.c[1]) gradientAux[1] += 2;
      if (gradientAux[2] < currentlyPlaying.c[2]) gradientAux[2] += 2;
      if (gradientAux[0] > currentlyPlaying.c[0]) gradientAux[0] -= 2;
      if (gradientAux[1] > currentlyPlaying.c[1]) gradientAux[1] -= 2;
      if (gradientAux[2] > currentlyPlaying.c[2]) gradientAux[2] -= 2;
    } else {
      if (gradientAux[0] > 0) gradientAux[0] -= 2;
      if (gradientAux[1] > 0) gradientAux[1] -= 2;
      if (gradientAux[2] > 0) gradientAux[2] -= 2;
    }
    
    p.push();
    radialGradient(
      p.windowWidth / 2, p.windowHeight / 2 , 0,//Start pX, pY, start circle radius
      p.windowWidth / 2 , p.windowHeight / 2, p.windowWidth/1.2,//End pX, pY, End circle radius
      p.color(0, 0, 0, 0), //Start color
      p.color(gradientAux[0], gradientAux[1], gradientAux[2], 255/2), //End color
    );
    p.rect(0, 0, p.windowWidth, p.windowHeight);
    p.pop();
    
    
    p.noFill();
    p.strokeWeight(2);
    p.stroke(255,255,255,opaClick);
    p.circle(targetX,targetY,sizeClick);
    p.noStroke();

    if (sizeClick < 200) sizeClick += 4;
    if (opaClick > 0) opaClick -= 10;
    
    if (pause === false) player.show();
    offset += incOffset;

    let check = false;
    let check2 = false;

    for (let s in days[currentDay].songs) {
      if(days[currentDay].songs[s].onHover) check = true;
      if(days[currentDay].songs[s].onHoverPause) check2 = true;
    }
    for (let s in player.songsVisited) {
      if(player.songsVisited[s].onHover) check = true;
      if(player.songsVisited[s].onHoverPause) check2 = true;
    }

    if (check === false && songOpa < 255) songOpa += 5;
    else if (check && songOpa > 100) songOpa -= 15;

    if (check2 === false && songOpaPause < 255) songOpaPause += 5;
    else if (check2 && songOpaPause > 100) songOpaPause -= 15;

    if (opaText < 255) opaText += 10;

    days[currentDay].show();

    let percent = (counter % totalFrames) / totalFrames;
    let a = percent * p.TWO_PI;
    for (let i = 0; i < particles.length; i++) {
      particles[i].render(a);
    }
    counter++;

    if (currentlyPlaying !== null) showNowPlaying();
    else {
      opaMusicPlayer = 0;
      offsetMusicPlayer = p.windowHeight/30;
    }

    if (clearOpa > 0) {
      clearOpa -= 4;
      clearRadius += 10;
    }

    if (pause) {
      if (opaPause < 240) opaPause += 10;
      if (opaBackground < 240) opaBackground += 10;
      p.fill(0,0,0,opaBackground);
      p.noStroke();
      p.rect(0,0,p.windowWidth,p.windowHeight);
      player.show();
      p.push();
      p.noFill();
      p.stroke(225,0,0,clearOpa);
      p.strokeWeight(5);
      p.drawingContext.shadowBlur = 20;
      p.drawingContext.shadowColor = '#FFFFFF';
      p.circle(playerX,playerY,clearRadius);
      p.pop();
    }
    else {
      opaPause = 0;
      opaBackground = 0;
    }
    if (instOn) {
      if (instOpa < 255 && p.millis()-instStamp > 10000) instOpa += 3;
      else if (p.millis()-instStamp < 15000 && instOpa > 0) instOpa -= 3;
    }

    if (pause !== true) {
      p.fill(255,255,255,instOpa);
      p.textFont(f1);
      p.textSize(p.windowHeight/65);
      p.textAlign(p.CENTER,p.TOP);
      p.text(instructions[instIndex],p.windowWidth/2,p.windowHeight-p.windowWidth/20);
    }
  }
}

export default sketch;