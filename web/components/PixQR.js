export default function PixQR({ data }) {
  if (!data) return null;
  const img = data.image_url_png || data.image_url_svg;
  const code = data.qr_code || data.qr_code_url;
  return (
    <div className="qr-box">
      {img ? (
        <img src={img} alt="QR Code PIX" style={{ width: 280, height: 280, objectFit: 'contain' }} />
      ) : (
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{code}</pre>
      )}
      <small style={{ marginTop: 8, color: '#9ca3af' }}>Escaneie para pagar R$ 300,00 via PIX</small>
    </div>
  );
}
