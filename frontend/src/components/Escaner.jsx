import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

function Escaner({ alEscanear }) {
  useEffect(() => {
    // Configuración del escáner
    const scanner = new Html5QrcodeScanner(
      "reader", 
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    // Función que se ejecuta al detectar un código
    const onScanSuccess = (decodedText) => {
      // Limpiamos el escáner (apagamos cámara)
      scanner.clear().catch(error => console.error("Error al limpiar.", error));
      // Enviamos el texto encontrado al padre
      alEscanear(decodedText);
    };

    const onScanFailure = (_error) => {
      // No hacemos nada si falla un frame (es normal mientras enfoca)
    };

    scanner.render(onScanSuccess, onScanFailure);

    // Limpieza al desmontar el componente (si el usuario cancela)
    return () => {
      scanner.clear().catch(error => console.error("Limpieza final.", error));
    };
  }, [alEscanear]);

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>📷 Apunta al código QR</h3>
      <div id="reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}></div>
    </div>
  );
}

export default Escaner;
