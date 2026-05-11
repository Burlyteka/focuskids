export const BG_THEMES = [
  { id: 'space',     emoji: '🚀', es: 'Espacio',          en: 'Space',           cost: 0,    gradient: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',     dark: true  },
  { id: 'ocean',     emoji: '🌊', es: 'Océano Profundo',   en: 'Deep Ocean',      cost: 75,   gradient: 'linear-gradient(135deg,#005C97,#363795)',             dark: true  },
  { id: 'forest',    emoji: '🌿', es: 'Bosque Mágico',     en: 'Magic Forest',    cost: 150,  gradient: 'linear-gradient(135deg,#134E5E,#71B280)',             dark: true  },
  { id: 'sunset',    emoji: '🌅', es: 'Atardecer',         en: 'Sunset',          cost: 250,  gradient: 'linear-gradient(135deg,#FF512F,#F09819)',             dark: false },
  { id: 'candy',     emoji: '🍭', es: 'Mundo Dulce',       en: 'Candy World',     cost: 400,  gradient: 'linear-gradient(135deg,#FF9A9E,#FECFEF)',             dark: false },
  { id: 'galaxy',    emoji: '🌌', es: 'Galaxia Arcoíris',  en: 'Rainbow Galaxy',  cost: 600,  gradient: 'linear-gradient(135deg,#4776E6,#8E54E9)',             dark: true  },
  { id: 'superhero', emoji: '⚡', es: 'Superhéroe',        en: 'Superhero',       cost: 1000, gradient: 'linear-gradient(135deg,#1a1a2e,#16213e,#e94560)',     dark: true  },
]

export const BG_MAP = Object.fromEntries(BG_THEMES.map(t => [t.id, t]))
