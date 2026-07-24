export function HypnocamentsLogo({ width = 180, height = 40 }) {
  return (
    <div style={{ position: 'relative', width: `${width}px`, height: `${height}px` }}>
      <img 
        src="/images/logo_color.png" 
        alt="Hypnocaments Logo" 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain' 
        }}
      />
    </div>
  );
}
