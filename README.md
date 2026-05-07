# 🎵 Alfira The Bard

An experimental multitrack audio player developed using HTML5, CSS3, and Vanilla JavaScript. This mixer allows real-time interaction with independent tracks, enabling the creation of dynamic mixes and the study of synchronized musical layers.

>*"Music is the voice of the gods, and Milil is the one who teaches us to listen."* — This project has been blessed by Milil, the Lord of Song

## 🚀 Features
Perfect Synchronization: Simultaneous playback of multiple audio files (.ogg).

*   **Live Mixing:** Instrument panel to mute/unmute tracks on the fly by interacting directly with their icons.
*   **Dynamic Visualizer:** Real-time frequency spectrum display blessed by the Lord of Song.
*   **Progress Control:** Fluid seek bar to navigate through the song's timeline.
*   **Track Selection:** Support for multiple song sets with the same instrumental structure.
*   **Immersive UI:** A visual experience inspired by the aesthetic of Baldur's Gate 3.

## 🛠️ Project Structure

For the mixer to function correctly, files must be organized as follows:

```text
/
├── index.html
├── css/bard_outfit.css
├── js/bard_logic.js
├── img/
    ├── favicon.webp
    ├── drum.png
    ├── flute.png
    └── ... (remaining instruments)
└── music/
    ├── song-name_drum.ogg
    ├── song-name_flute.ogg
    └── ... (remaining instruments)
```

# 📜 Credits & Attributions

## 💭 Original Inspiration

This experiment is inspired by [Stuart Thompson's](https://sthom.kiwi) project, which you can find [here](https://github.com/s-thom/bg3-music-box).

## 🎶 Music

All music used in this project's demonstrations belongs to the Baldur's Gate 3 original soundtrack.

*   **Composer:** Borislav Slavov.
*   **Studio:** Larian Studios.

*Note: This side-project is purely educational and non-commercial. All rights belong to their respective owners.*

# ⚙️ Installation

1. Clone this repository.
2. Run a local server (like Python's http.server or VS Code's Live Server) to avoid CORS issues with the Audio API.
3. Go to: http://localhost:8000/