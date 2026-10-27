const CX = 395, CY = 425, F = 172;
const defs = `<defs>
  <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff0b0"/><stop offset="0.22" stop-color="#f1cd62"/>
    <stop offset="0.5" stop-color="#d4a23a"/><stop offset="0.78" stop-color="#a8761f"/><stop offset="1" stop-color="#7a5212"/>
  </linearGradient>
  <linearGradient id="goldV" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fbe49a"/><stop offset="0.5" stop-color="#d9aa42"/><stop offset="1" stop-color="#93661a"/>
  </linearGradient>
  <linearGradient id="blade" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#b68a2c"/><stop offset="0.45" stop-color="#fff2bf"/><stop offset="0.55" stop-color="#f2d27a"/><stop offset="1" stop-color="#9c7020"/>
  </linearGradient>
  <radialGradient id="field" cx="0.4" cy="0.35" r="0.8">
    <stop offset="0" stop-color="#e6bf5c"/><stop offset="0.7" stop-color="#c2922f"/><stop offset="1" stop-color="#9a6d1c"/>
  </radialGradient>
  <linearGradient id="enamel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c5232b"/><stop offset="1" stop-color="#8a1016"/></linearGradient>
  <filter id="metal" x="-12%" y="-12%" width="124%" height="124%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="2.4" result="b"/>
    <feDiffuseLighting in="b" surfaceScale="4" diffuseConstant="1.18" lighting-color="#ffffff" result="diff"><feDistantLight azimuth="235" elevation="52"/></feDiffuseLighting>
    <feSpecularLighting in="b" surfaceScale="4" specularConstant="1.05" specularExponent="24" lighting-color="#fff6d2" result="spec"><feDistantLight azimuth="235" elevation="44"/></feSpecularLighting>
    <feComposite in="SourceGraphic" in2="diff" operator="arithmetic" k1="1.12" k2="0" k3="0" k4="0" result="shaded"/>
    <feComposite in="spec" in2="SourceAlpha" operator="in" result="sp"/>
    <feComposite in="shaded" in2="sp" operator="arithmetic" k1="0" k2="1" k3="0.85" k4="0" result="lit"/>
    <feComposite in="lit" in2="SourceAlpha" operator="in" result="litIn"/>
    <feDropShadow in="litIn" dx="1.6" dy="2.4" stdDeviation="1.8" flood-color="#3a2405" flood-opacity="0.6"/>
  </filter>
  <filter id="matte" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="7" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.42  0 0 0 0 0.15  0 0 0 0.35 0" result="g"/>
    <feComposite in="g" in2="SourceAlpha" operator="in" result="gi"/>
    <feBlend in="SourceGraphic" in2="gi" mode="multiply"/>
  </filter>
  <filter id="drop" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="5" dy="9" stdDeviation="9" flood-color="#000" flood-opacity="0.3"/></filter>
  <clipPath id="fieldClip"><circle cx="${CX}" cy="${CY}" r="${F}"/></clipPath>
</defs>`;
module.exports = { defs };
