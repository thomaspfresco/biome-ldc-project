import { useEffect, useState } from 'react';

import axios from 'axios'

const GetUser = () => {
    const [token, setToken] = useState("");

    const updateData = (d) => {
        window.localStorage.setItem("username",d.display_name);
    }

    useEffect(() => {
        if(localStorage.getItem("token")) {
            setToken(localStorage.getItem("token"));
            if(token) {
                requestGetUser();
            }
        }
    }, [token]);

    const requestGetUser = () => {
        axios.get("https://api.spotify.com/v1/me", {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then((response) => { updateData(response.data) })
        .catch((error) => { console.log(error) })
    }

    return null;
}

export default GetUser;