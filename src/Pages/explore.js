import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom'

import sketch from '../StyleP5/styleExplore'

import Loading from '../components/Loading'

import axios from 'axios'
import p5 from 'p5';

import streams from '../StreamingHistory.json';

//import { type } from '@testing-library/user-event/dist/type/index.js';

// ---------------------------------------------------------------------------------------------------------------------
export default function Explore() {
    let p5Instance;

    const navigate = useNavigate();
    const p5ContainerRef = useRef();

    const [loading, setLoading] = useState(true);

    async function initialize() {
        let count = 0;
        for (const stream of streams) {
            let songAux = [];
            if (count < window.range) {
                try {
                    const response1 = await axios.get("https://api.spotify.com/v1/search", {
                        headers: { 'Authorization': 'Bearer ' + localStorage.getItem("token") },
                        params: {
                            q: stream.trackName + " " + stream.artistName,
                            type: "track",
                            limit: 8,
                            market: "PT"
                        }
                    });

                    let r1 = response1.data;

                    songAux.push(r1.tracks.items[0].album.images[0].url);
                    songAux.push(r1.tracks.items[0].preview_url);
                    songAux.push(r1.tracks.items[0].name);

                   /* const response2 = await axios.get("https://api.spotify.com/v1/audio-features/" + r1.tracks.items[0].id, {
                        headers: {'Authorization': 'Bearer ' + localStorage.getItem("token")}});

                    let r2 = response2.data;

                    songAux.unshift(r2.valence);
                    songAux.unshift(r2.energy);
                    songAux.unshift(r2.danceability);
                    songAux.unshift(Math.round(r2.duration_ms/1000/60));*/

                    songAux.unshift(0.5);
                    songAux.unshift(0.5);
                    songAux.unshift(0.5);
                    songAux.unshift(1);

                    let counter = 0;
                    for (let a in r1.tracks.items[0].artists) {
    
                        if (counter === 0) {
                            const response3 = await axios.get("https://api.spotify.com/v1/artists/" + r1.tracks.items[0].artists[a].id, {
                                headers: {'Authorization': 'Bearer ' + localStorage.getItem("token")}});

                            let r3 = response3.data.genres[0];

                            songAux.push(r3);
                            songAux.push(r1.tracks.items[0].artists.length); 


                            if (count>=window.range-1) setLoading(false);

                            counter++;
                        }
                        songAux.push(r1.tracks.items[0].artists[a].name);
                    }
                } catch (error) {
                    console.error(`Error in request`, error.message);
                    if (error.response.status === 401) navigate("/");
                }
                window.songs.push(songAux);
                count++;
            }
        }
        console.log(window.songs);
    }

    // ---------------------------------------------------------------------------------------------------------------------
    async function getLastTracks(l) {
        try {
          const response = await axios.get("https://api.spotify.com/v1/me/player/recently-played", {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem("token")
            },
            params: {
                limit: l,
            }});
        
        return response.data;

        } catch (error) {console.error('Error fetching data:', error); navigate("/");}
      }

    // ---------------------------------------------------------------------------------------------------------------------
    useEffect(() => {

        if (localStorage.getItem("token")) {
            const fetchData = async () => {
            await initialize();
            p5Instance = new p5(sketch, p5ContainerRef.current);
            };
            //const p5Instance = new p5(sketch, p5ContainerRef.current);
            //return () => { p5Instance.remove();}
            fetchData();

            return () => { p5Instance.remove();}

        } else navigate("/");
    }, []);

    return (
        <div className="canvas" ref={p5ContainerRef}>
            {loading ? <Loading /> : null}
            <audio id="player" src="https://p.scdn.co/mp3-preview/7f504e434283e3e6b10ab73500eefdc7c30c73c8?cid=50367420c4004c81a3326f5f7be2c86f"></audio>
        </div>
    );
}