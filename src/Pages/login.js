import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom'

import GetUser from '../components/GetUser'

import streams from '../StreamingHistory.json'

import sketch from '../StyleP5/styleLogin'
import p5 from 'p5';

import spotify from '../Images/Spotify_Logo.png'

// ---------------------------------------------------------------------------------------------------------------------

export default function Login() {

    const navigate = useNavigate();

    const p5ContainerRef = useRef();

    const [token, setToken] = useState("");

    // ---------------------------------------------------------------------------------------------------------------------

    const totalTime = () => {
        let total = 0
        streams.forEach((stream) => {
            total += stream.msPlayed
        })
        return (total/1000/60)
    }

    useEffect(() => {
        const hash = window.location.hash
        let token = window.localStorage.getItem("token")

        if (!token && hash) {
            token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

            window.location.hash = ""
            window.localStorage.setItem("token", token)
        }

        setToken(token)

        //console.log(totalTime());

        const p5Instance = new p5(sketch, p5ContainerRef.current)
        return () => { p5Instance.remove(); }
    }, [])

    const logout = () => {
        setToken("")
        window.localStorage.removeItem("username")
        window.filling = 0
        window.localStorage.removeItem("token")
    }

    return (
        <div className="canvas" ref={p5ContainerRef}>
            <div className="navbar">
            <button className="logo">Biome</button>
            {!token ?
                <a href={`${window.AUTH_ENDPOINT}?client_id=${window.CLIENT_ID}&redirect_uri=${window.REDIRECT_URI}&response_type=${window.RESPONSE_TYPE}&scope=${window.SCOPE}`}>
                    <button className='button' id="log">Login</button>
                </a>
                : <button className='button' id="log" onClick={logout}>Logout</button>
            }

            {token ? <button className='button' id="explore" onClick={() => { navigate("/explore") }}>Explore</button> : null}
            
            {token ? <GetUser /> : null}
            </div>

            {token ? <button className="button" id='begin' onClick={() => { navigate("/explore") }}>Begin Experience</button>
            : <button className="button" id='begin'>Try it Now</button>}

            <div className="pwr">powered by
                <a href="https://developer.spotify.com/documentation/web-api/"><img className="spotifyLogo" src={spotify} alt="Spotify Logo"/></a>
            </div>
        </div>
    );
}