import loading from "../Images/load.gif"

function Loading() {
  return (
    <div className='loadingScreen'>
            <img src={loading} className='loading' alt="Loading..."></img>
    </div>
  );
}

export default Loading;