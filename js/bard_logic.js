// Configuración: Define aquí tus instrumentos exactos
const instrumentos = ['drum', 'flute', 'lute', 'lyre', 'violin', 'voice'];
const songSelect = document.getElementById('songSelect');
const mixerContainer = document.getElementById('mixer');
const btnPlay = document.getElementById('btnPlay');
// Barra de Progreso
const progressBar = document.getElementById('progressBar');
const currentTimeText = document.getElementById('currentTime');
const durationText = document.getElementById('duration');
// Visualizer
const canvas = document.getElementById('visualizer');
const canvasCtx = canvas.getContext('2d');
let audioCtx;
let analyser;
let source;
let dataArray;

let audioElements = {};
let isPlaying = false;

// 1. Crear la interfaz de instrumentos y los elementos de audio
function initMixer() {
    mixerContainer.innerHTML = '';
    audioElements = {};

    instrumentos.forEach(inst => {
        // Crear elemento de audio (oculto)
        const audio = new Audio();
        audio.crossOrigin = "anonymous";
        audio.loop = true;
        audioElements[inst] = audio;

        // Crear UI (Checkbox)
        const row = document.createElement('div');
        row.className = 'instrument-row';
        row.innerHTML = `
            <input type="checkbox" id="check_${inst}" checked style="display:none;">
            <div class="instrument-icon">
                <img src="img/${inst}.png" alt="${inst}">
            </div>
            <label>${inst.charAt(0).toUpperCase() + inst.slice(1)}</label>
        `;

        // El evento ahora es para toda la FILA
        row.addEventListener('click', () => {
            const checkbox = row.querySelector('input');
            
            // Invertimos el estado
            checkbox.checked = !checkbox.checked;
            audio.muted = !checkbox.checked;

            // Cambiamos la clase visual
            if (audio.muted) {
                row.classList.add('is-muted');
            } else {
                row.classList.remove('is-muted');
            }

            row.classList.toggle('is-muted', audio.muted);
        });        

        // Evento para mutear/desmutear al vuelo
        row.querySelector('input').addEventListener('change', (e) => {
            audio.muted = !e.target.checked;
        });

        mixerContainer.appendChild(row);
    });
    loadSongs();
}

// 2. Cargar los archivos .ogg según la canción elegida
function loadSongs() {
    const songName = songSelect.value;
    instrumentos.forEach(inst => {
        // Nomenclatura: <nombre_cancion>_<instrumento>.ogg
        audioElements[inst].src = `music/${songName}_${inst}.ogg`;
        audioElements[inst].load();
        audioElements[inst].muted = !document.getElementById(`check_${inst}`).checked;
    });
    audioElements[instrumentos[0]].onloadedmetadata = () => { progressBar.value = 0; };
}

// 3. Inicializa el visualizar de barras
function setupVisualizer() {
    // Creamos el contexto de audio solo la primera vez que se da a PLAY
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        
        // Conectamos el "leaderAudio" al analizador
        source = audioCtx.createMediaElementSource(leaderAudio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
        
        analyser.fftSize = 512; // Cantidad de barras
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        
        draw();
    }
}

// 4. Dibuja las barras en el visualizador
function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / dataArray.length) * 2;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        const barHeight = dataArray[i] / 4; // Un poco más altas

        // Gradiente dorado para que brille como en la imagen
        const gradient = canvasCtx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#c19a6b'); // Oro apagado abajo
        gradient.addColorStop(1, '#f4d03f'); // Oro brillante arriba

        canvasCtx.fillStyle = gradient;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 2;
    }
}

// 5. Control Maestro (Play/Pause)
btnPlay.addEventListener('click', () => {
    setupVisualizer(); // Inicializa el analizador
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    if (!isPlaying) {
        // Reproducir todos simultáneamente
        Object.values(audioElements).forEach(a => a.play());
        isPlaying = true;
        btnPlay.innerText = "PAUSE";
    } else {
        Object.values(audioElements).forEach(a => a.pause());
        isPlaying = false;
        btnPlay.innerText = "PLAY";
    }
});

// Cambiar canción al seleccionar otra
songSelect.addEventListener('change', () => {
    const wasPlaying = isPlaying;
    if (wasPlaying) btnPlay.click(); // Pausa antes de cambiar
    loadSongs();
    if (wasPlaying) btnPlay.click(); // Intenta reanudar
});

// Inicializar al cargar
initMixer();

// Elegir una pieza de audio para dirigir al resto (el líder)
const leaderAudio = audioElements[instrumentos[2]]; 

leaderAudio.ontimeupdate = () => {
    // Actualizar la barra de progreso
    if (!isNaN(leaderAudio.duration)) {
        const percentage = (leaderAudio.currentTime / leaderAudio.duration) * 100;
        progressBar.value = percentage;
        
        // Formatear tiempo
        const formatTime = (time) => {
            if (isNaN(time)) return "0:00";
            const mins = Math.floor(time / 60);
            const secs = Math.floor(time % 60).toString().padStart(2, '0');
            return `${mins}:${secs}`;
        };
        currentTimeText.innerText = formatTime(leaderAudio.currentTime);
        durationText.innerText = formatTime(leaderAudio.duration);
    }

    // Para evitar desfases acumulados después de varios loops
    // Si el líder está cerca del final o acaba de loopear
    if (leaderAudio.currentTime < 0.1) { 
        instrumentos.forEach(inst => {
            const audio = audioElements[inst];
            // Si la diferencia de tiempo es mayor a 50ms, forzamos sincronía
            if (Math.abs(audio.currentTime - leaderAudio.currentTime) > 0.05) {
                audio.currentTime = leaderAudio.currentTime;
            }
        });
    }
};

// Sincronizar todos los audios cuando mueves la barra manualmente
progressBar.addEventListener('input', () => {
    const seekTime = (progressBar.value / 100) * leaderAudio.duration;
    Object.values(audioElements).forEach(audio => {
        audio.currentTime = seekTime;
    });
});