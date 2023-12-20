import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Login from './Pages/login'
import Explore from './Pages/explore'
import NoPage from './Pages/noPage'

import streams from './StreamingHistory.json'

import './App.css';

window.CLIENT_ID = "50367420c4004c81a3326f5f7be2c86f"
window.REDIRECT_URI = "http://localhost:3000"
window.AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
window.RESPONSE_TYPE = "token"
window.SCOPE = "user-read-recently-played"

window.range = 250
window.idOffset = 0
window.songs = []
window.songsProcessed = []
window.totalMinutes = 0
window.firstday = streams[0].endTime.split(" ")[0]

// ---------------------------------------------------------------------------------------------------------------------

function App() {

  return (
      <BrowserRouter>
        <Routes>
          <Route index element={<Login/>}/>
          <Route path="/explore" element={<Explore/>}/>
          <Route path="*" element={<NoPage/>}/>
        </Routes>
      </BrowserRouter>
  );
}

export default App;