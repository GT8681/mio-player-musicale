import React, { useState, useRef, useEffect } from 'react';

function App() {
  const [playlist, setPlaylist] = useState([]);
  const [indiceBrano, setIndiceBrano] = useState(0);
  const [inRiproduzione, setInRiproduzione] = useState(false);
  const [tempoCorrente, setTempoCorrente] = useState(0);
  const [durataBrano, setDurataBrano] = useState(0);
  
  // Nuovi stati per il volume
  const [volume, setVolume] = useState(1); // 1 = massimo (100%)
  const [silenziato, setSilenziato] = useState(false);
  const [volumePrecedente, setVolumePrecedente] = useState(1);

  const audioRef = useRef(null);
  const branoCorrente = playlist[indiceBrano];

  const gestisciCaricamentoFile = (e) => {
    const fileSelezionati = Array.from(e.target.files);
    
    const nuoviBrani = fileSelezionati.map((file, index) => ({
      id: Date.now() + index,
      titolo: file.name.replace(/\.[^/.]+$/, ""),
      artista: "I miei brani",
      url: URL.createObjectURL(file)
    }));

    setPlaylist((prev) => [...prev, ...nuoviBrani]);
  };

  const formattaTempo = (secondi) => {
    if (isNaN(secondi)) return "00:00";
    const minuti = Math.floor(secondi / 60);
    const sec = Math.floor(secondi % 60);
    return `${minuti < 10 ? '0' : ''}${minuti}:${sec < 10 ? '0' : ''}${sec}`;
  };

  useEffect(() => {
    setTempoCorrente(0);
    if (inRiproduzione && audioRef.current) {
      audioRef.current.play().catch((err) => console.log(err));
    }
  }, [indiceBrano]);

  // Aggiorna il volume dell'elemento audio quando cambia lo stato
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = silenziato ? 0 : volume;
    }
  }, [volume, silenziato]);

  const togglePlay = () => {
    if (!branoCorrente) return;
    
    if (inRiproduzione) {
      audioRef.current.pause();
      setInRiproduzione(false);
    } else {
      audioRef.current.play();
      setInRiproduzione(true);
    }
  };

  const branoSuccessivo = () => {
    if (playlist.length === 0) return;
    const prossimo = (indiceBrano + 1) % playlist.length;
    setIndiceBrano(prossimo);
  };

  const branoPrecedente = () => {
    if (playlist.length === 0) return;
    const precedente = (indiceBrano - 1 + playlist.length) % playlist.length;
    setIndiceBrano(precedente);
  };

  const selezionaBrano = (index) => {
    setIndiceBrano(index);
    setInRiproduzione(true);
  };

  const gestisciAggiornamentoTempo = () => {
    setTempoCorrente(audioRef.current.currentTime);
  };

  const gestisciCaricamentoMetadati = () => {
    setDurataBrano(audioRef.current.duration);
    audioRef.current.volume = silenziato ? 0 : volume;
  };

  const gestisciCambioSlider = (e) => {
    const nuovoTempo = e.target.value;
    audioRef.current.currentTime = nuovoTempo;
    setTempoCorrente(nuovoTempo);
  };

  // Gestione cambio volume da slider
  const gestisciCambioVolume = (e) => {
    const nuovoVolume = parseFloat(e.target.value);
    setVolume(nuovoVolume);
    if (nuovoVolume > 0) {
      setSilenziato(false);
    }
  };

  // Toggle Mute / Unmute
  const toggleMute = () => {
    if (silenziato) {
      setSilenziato(false);
      setVolume(volumePrecedente > 0 ? volumePrecedente : 0.5);
    } else {
      setVolumePrecedente(volume);
      setSilenziato(true);
      setVolume(0);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 p-3">
      <div className="card player-card text-white p-4 rounded-4" style={{ width: '100%', maxWidth: '400px' }}>
        
        {/* Intestazione Brand */}
        <div className="d-flex align-items-center justify-content-between mb-3 text-white-50 small">
          <span className="fw-bold tracking-wider text-uppercase" style={{ letterSpacing: '1px' }}>🎵 SoundPlayer</span>
          <span className="badge bg-indigo-500 bg-opacity-20 text-indigo-300 rounded-pill px-2 py-1">PRO</span>
        </div>

        {/* Copertina Album */}
        <div className={`album-art-box rounded-4 d-flex align-items-center justify-content-center mb-4 ${inRiproduzione ? 'playing' : ''}`} style={{ height: '220px' }}>
          <span className="display-1 drop-shadow">🎧</span>
        </div>

        {/* Info Brano */}
        <div className="text-center mb-3">
          <h2 className="h5 fw-bold text-truncate mb-1 text-white">
            {branoCorrente ? branoCorrente.titolo : "Seleziona una canzone"}
          </h2>
          <p className="text-white-50 small mb-0 fw-medium">
            {branoCorrente ? branoCorrente.artista : "La tua musica in un unico posto"}
          </p>
        </div>

        {/* Elemento Audio */}
        <audio 
          ref={audioRef} 
          src={branoCorrente ? branoCorrente.url : ""} 
          onTimeUpdate={gestisciAggiornamentoTempo}
          onLoadedMetadata={gestisciCaricamentoMetadati}
          onEnded={branoSuccessivo}
        />

        {/* Slider Progresso */}
        <div className="mb-3 px-1">
          <input 
            type="range" 
            className="form-range" 
            min={0} 
            max={durataBrano || 0} 
            value={tempoCorrente} 
            onChange={gestisciCambioSlider}
            disabled={!branoCorrente}
          />
          <div className="d-flex justify-content-between text-white-50 extra-small fw-semibold mt-1" style={{ fontSize: '0.75rem' }}>
            <span>{formattaTempo(tempoCorrente)}</span>
            <span>{formattaTempo(durataBrano)}</span>
          </div>
        </div>

        {/* Sezione Controllo Volume */}
        <div className="d-flex align-items-center gap-2 mb-4 px-1">
          <button 
            onClick={toggleMute} 
            className="btn btn-control rounded-circle p-0 d-flex align-items-center justify-content-center"
            style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}
            title={silenziato ? "Riattiva audio" : "Silenzia"}
          >
            {silenziato || volume === 0 ? "🔇" : "🔊"}
          </button>
          <input 
            type="range" 
            className="form-range" 
            min={0} 
            max={1} 
            step={0.01} 
            value={silenziato ? 0 : volume} 
            onChange={gestisciCambioVolume}
          />
          <span className="text-white-50" style={{ fontSize: '0.75rem', width: '30px', textAlign: 'right' }}>
            {Math.round((silenziato ? 0 : volume) * 100)}%
          </span>
        </div>

        {/* Controlli Riproduzione */}
        <div className="d-flex justify-content-center align-items-center gap-3 mb-4">
          <button 
            onClick={branoPrecedente} 
            disabled={playlist.length <= 1}
            className="btn btn-control rounded-circle p-3 d-flex align-items-center justify-content-center"
            style={{ width: '45px', height: '45px' }}
          >
            ⏮
          </button>
          
          <button 
            onClick={togglePlay} 
            disabled={!branoCorrente}
            className="btn btn-play rounded-circle text-white p-3 d-flex align-items-center justify-content-center fw-bold"
            style={{ width: '60px', height: '60px', fontSize: '1.2rem' }}
          >
            {inRiproduzione ? "⏸" : "▶"}
          </button>
          
          <button 
            onClick={branoSuccessivo} 
            disabled={playlist.length <= 1}
            className="btn btn-control rounded-circle p-3 d-flex align-items-center justify-content-center"
            style={{ width: '45px', height: '45px' }}
          >
            ⏭
          </button>
        </div>

        {/* Pulsante Caricamento File */}
        <div className="d-grid mb-4">
          <label className="btn btn-control rounded-pill fw-semibold py-2 text-center" style={{ cursor: 'pointer' }}>
            ✨ Aggiungi File MP3
            <input 
              type="file" 
              accept="audio/*" 
              multiple 
              onChange={gestisciCaricamentoFile} 
              className="d-none" 
            />
          </label>
        </div>

        {/* Lista Playlist */}
        {playlist.length > 0 && (
          <div className="pt-2">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-uppercase text-white-50 extra-small fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
                Brani caricati ({playlist.length})
              </span>
            </div>
            <div style={{ maxHeight: '130px', overflowY: 'auto' }}>
              <ul className="list-group list-group-flush">
                {playlist.map((brano, i) => (
                  <li 
                    key={brano.id}
                    onClick={() => selezionaBrano(i)}
                    className={`list-group-item playlist-item bg-transparent text-white border-0 small py-2 px-3 rounded-3 d-flex align-items-center justify-content-between cursor-pointer mb-1 ${
                      i === indiceBrano ? 'active fw-bold' : ''
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="text-truncate me-2" style={{ maxWidth: '240px' }}>
                      <span className="text-white-50 me-2">{i + 1}.</span> {brano.titolo}
                    </span>
                    {i === indiceBrano && inRiproduzione && (
                      <span className="badge rounded-pill" style={{ backgroundColor: '#ec4899' }}>LIVE</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
