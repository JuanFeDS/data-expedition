import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function CodigoQR({ valor, etiqueta = 'Código QR' }: { valor: string; etiqueta?: string }) {
  const [imagen, setImagen] = useState<string | null>(null);
  useEffect(() => {
    let activo = true;
    QRCode.toDataURL(valor, { width: 320, margin: 1, color: { dark: '#073b3a', light: '#ffffff' } }).then((url) => { if (activo) setImagen(url); }).catch(() => undefined);
    return () => { activo = false; };
  }, [valor]);
  return imagen ? <img className="asist__qr" src={imagen} alt={etiqueta} /> : <div className="asist__qr asist__qr--cargando" />;
}
