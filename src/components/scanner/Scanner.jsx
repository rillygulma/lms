import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const Scanner = () => {
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('render', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });

    const success = (result) => {
      scanner.clear();
      setScanResult(result);
    };

    const error = () => {
      console.error('An error occurred while trying to scan the code');
    };

    scanner.render(success, error);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="mb-4 text-2xl font-bold">Scan Your Book Here</h1>
      {scanResult ? (
        <div className="text-green-500">
          Success: <a href={`http://${scanResult}`}>{scanResult}</a>
        </div>
      ) : (
        <div id='render'></div>
      )}
    </div>
  );
};

export default Scanner;
