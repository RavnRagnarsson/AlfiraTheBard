// Configuración: Define aquí tus instrumentos exactos
const instrumentos = ['drum', 'flute', 'lute', 'lyre', 'violin', 'voice'];
const songSelect = document.getElementById('songSelect');
const mixerContainer = document.getElementById('mixer');
const btnPlay = document.getElementById('btnPlay');
const statusText = document.getElementById('status');
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
    statusText.innerText = `Cargada: ${songName}`;
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
        
        analyser.fftSize = 128; // Cantidad de barras
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        
        draw();
    }
}

// 4. Dibuja las barras en el visualizador
function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    // Limpiar el canvas
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / dataArray.length) * 2.5;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
        const barHeight = dataArray[i] / 5; // Ajustamos la escala para que no se salga del canvas

        // Color dorado/ámbar con opacidad basada en la altura
        canvasCtx.fillStyle = `rgba(193, 163, 95, ${barHeight / 40})`;
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
        statusText.innerText = "Reproduciendo...";
    } else {
        Object.values(audioElements).forEach(a => a.pause());
        isPlaying = false;
        btnPlay.innerText = "PLAY";
        statusText.innerText = "En pausa";
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

// Actualizar la barra según el progreso del primer audio (el líder)
const leaderAudio = audioElements[instrumentos[0]]; 

leaderAudio.ontimeupdate = () => {
    if (!isNaN(leaderAudio.duration)) {
        const percentage = (leaderAudio.currentTime / leaderAudio.duration) * 100;
        progressBar.value = percentage;
        
        // Formatear tiempo
        const formatTime = (time) => Math.floor(time / 60) + ":" + Math.floor(time % 60).toString().padStart(2, '0');
        currentTimeText.innerText = formatTime(leaderAudio.currentTime);
        durationText.innerText = formatTime(leaderAudio.duration);
    }
};

// Sincronizar todos los audios cuando mueves la barra manualmente
progressBar.addEventListener('input', () => {
    const seekTime = (progressBar.value / 100) * leaderAudio.duration;
    Object.values(audioElements).forEach(audio => {
        audio.currentTime = seekTime;
    });
});