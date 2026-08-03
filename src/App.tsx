import { useEffect } from 'react';
import { Scene } from './components/3d/Scene';
import { Overlay } from './components/ui/Overlay';
import { startSimulationLoop, stopSimulationLoop } from './engine/simulation';
import './styles/globals.css';

function App() {
  useEffect(() => {
    // Note: simulation actually only moves when isPlaying is true, 
    // but the loop itself runs in background.
    startSimulationLoop();
    return () => {
      stopSimulationLoop();
    };
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, width: '100vw', height: '100vh', zIndex: 0, overflow: 'hidden', backgroundColor: 'black' }}>
      <Scene />
      <Overlay />
    </div>
  );
}

export default App;
