# Bio.me for Spotify

Web-based platform that generates an interactive digital ruled by the user's Spotify activity.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Getting Started

### Prerequisites

In the project directory, you can run:

- Create a [Spotify](https://www.spotify.com/) account.
- Request your complete streaming history data on the [privacy section](https://www.spotify.com/us/account/privacy/) of your Spotify profile.
- Install [Node.js](https://nodejs.org/en/download)

### Instalation

1. Clone this repository or download the source code.
2. Replace the <code>/src/StreamingHistory.json</code> file with your own.
2. On the project directory, <code>npm install</code> to install all dependencies.
3. On the project directory, <code>npm start</code> to run the app in the development mode.
4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser. The page will reload when you make changes. You may also see any lint errors in the console.

## Usage

In <code>/src</code> directory you can find the source code of the application. The 2 more important folders are the following:
- <code>/Pages</code> - Here you have access to the files that rule the requests to the Spotify API and the basic html structure of the pages "Login" and "Explore". If you want to change or enhance the core data organization, as well as add new information calls, consider the files in this folder.
- <code>/StyleP5</code> - Here you have access to all the interactive and dynamic dimentions of the pages "Login" and "Explore". If you want to change the look, the interactions or the creatures behavor, as well as add new features, consider the files in this folder.


## Credits

This project is developed in the context of a university course in the MSc of Design and Multimedia of the University of Coimbra.

### Technology
- [React.js](https://react.dev) - App skeleton.
    - [p5.js](https://p5js.org/) - App visual and interactive components.
    - [Axios library](https://axios-http.com/docs/intro) - http requests management for information about Spotify history.
- [Spotify API](https://developer.spotify.com/documentation/web-api) - Data source.

### Code References
- [Dom the dev. "How to use the Spotify API In Your React JS App"](https://dev.to/dom_the_dev/how-to-use-the-spotify-api-in-your-react-js-app-50pn) - Spotify Login/Authentication.
- [Coding Train. "#64 — Kinematics"](https://thecodingtrain.com/challenges/64-kinematics) - Base of the movement and behavor of the creatures.
- [Tom Holloway. "Flow Fields and Noise Algorithms with P5.js"](https://dev.to/nyxtom/flow-fields-and-noise-algorithms-with-p5-js-5g67) - Base of the ornamental particles in the background.

### Contributors

- [Thomas Fresco](https://github.com/thomaspfresco) - Design and development.
- [Eva Filipe](https://github.com/evaffsimoes) - Provided her own Spotify complete streaming history and tested the platform.




