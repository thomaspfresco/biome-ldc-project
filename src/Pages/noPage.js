import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'

export default function NoPage() {

    const navigate = useNavigate();

    useEffect(() => { navigate("/") }, []);

    return (
        <div className="noPage">
            <h1>404</h1>
            <h2>Page not found</h2>
        </div>
    )
}