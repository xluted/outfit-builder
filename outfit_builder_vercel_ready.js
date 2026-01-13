// This is a Vercel-ready Outfit Builder project structure
// Just create a new folder locally called 'outfit-builder',
// copy these files into it, push to GitHub, and deploy on Vercel.

// package.json
{
  "name": "outfit-builder",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}

// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()] });

// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
};

// postcss.config.js
export default {
  plugins: { tailwindcss: {}, autoprefixer: {}, },
};

// index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Outfit Builder</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);

// src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

// src/App.jsx
import { useState, useEffect } from 'react';
const CATEGORIES = ["top", "bottom", "outerwear", "shoes"];
export default function App() {
  const [gender, setGender] = useState("male");
  const [items, setItems] = useState([]);
  const [outfit, setOutfit] = useState({});
  const [scale, setScale] = useState({});
  const [layers, setLayers] = useState({});
  const [body, setBody] = useState({ height: 70, weight: 180 });
  const [showHelp, setShowHelp] = useState(true);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem("closet") || "[]"));
    setOutfit(JSON.parse(localStorage.getItem("outfit") || "{}"));
    setScale(JSON.parse(localStorage.getItem("scale") || "{}"));
    setLayers(JSON.parse(localStorage.getItem("layers") || "{}"));
  }, []);

  useEffect(() => {
    localStorage.setItem("closet", JSON.stringify(items));
    localStorage.setItem("outfit", JSON.stringify(outfit));
    localStorage.setItem("scale", JSON.stringify(scale));
    localStorage.setItem("layers", JSON.stringify(layers));
  }, [items, outfit, scale, layers]);

  const upload = (e) => {
    const files = Array.from(e.target.files || []);
    setItems((p) => [...p, ...files.map((f) => ({ id: crypto.randomUUID(), name: f.name.replace(/\..+$/, ''), category: 'top', src: URL.createObjectURL(f) }))]);
  };

  const onDragStart = (e, item) => { e.dataTransfer.setData('item', JSON.stringify(item)); };
  const onDrop = (e, category) => {
    e.preventDefault();
    const item = JSON.parse(e.dataTransfer.getData('item'));
    setOutfit((o) => ({ ...o, [category]: item }));
    setScale((s) => ({ ...s, [item.id]: 1 }));
    setLayers((l) => ({ ...l, [item.id]: 10 }));
  };

  const suggestOutfit = () => {
    const result = {};
    CATEGORIES.forEach((c) => {
      const pool = items.filter((i) => i.category === c);
      if (pool.length) result[c] = pool[Math.floor(Math.random() * pool.length)];
    });
    setOutfit(result);
  };

  const resetOutfit = () => { setOutfit({}); setScale({}); setLayers({}); };
  const avatarScale = body.height / 70 + body.weight / 600;

  return (
    <div className="min-h-screen bg-gray-100 p-6 grid lg:grid-cols-[1fr_460px] gap-6">
      {showHelp && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-xl p-6 max-w-sm text-sm shadow"><h2 className="font-bold mb-2">How it works</h2><ul className="list-disc pl-4 space-y-1"><li>Upload clothes (PNG preferred)</li><li>Drag items onto the avatar</li><li>Use sliders to adjust fit</li><li>Click Suggest Outfit for ideas</li></ul><button onClick={() => setShowHelp(false)} className="mt-4 w-full bg-black text-white py-2 rounded">Got it</button></div></div>}
      <div>
        <header className="flex items-center mb-4">
          <h1 className="text-2xl font-bold">Outfit Builder</h1>
          <div className="ml-auto flex gap-2">
            <button onClick={() => setGender('male')} className={`px-3 py-1 rounded ${gender==='male'?'bg-black text-white':'bg-gray-300'}`}>Male</button>
            <button onClick={() => setGender('female')} className={`px-3 py-1 rounded ${gender==='female'?'bg-black text-white':'bg-gray-300'}`}>Female</button>
          </div>
        </header>
        <input type='file' multiple accept='image/*' onChange={upload} />
        <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4'>{items.map(i => <div key={i.id} draggable onDragStart={e=>onDragStart(e,i)} className='bg-white rounded-xl shadow p-2 cursor-grab'><img src={i.src} className='h-28 w-full object-contain'/><div className='text-xs truncate'>{i.name}</div></div>)}</div>
      </div>
      <div className='flex flex-col items-center gap-4'>
        <div className='relative w-72 h-[460px] bg-white rounded-2xl shadow flex items-center justify-center overflow-hidden'>
          <div className='absolute inset-0 flex items-center justify-center text-gray-300' style={{transform:`scale(${avatarScale})`}}>{gender} avatar</div>
          {Object.values(outfit).map(item=>item && <img key={item.id} src={item.src} style={{zIndex:layers[item.id]||10, transform:`scale(${scale[item.id]||1})`}} className='absolute max-w-[85%]' />)}
          {CATEGORIES.map(c=><div key={c} onDrop={e=>onDrop(e,c)} onDragOver={e=>e.preventDefault()} className='absolute inset-0'/>)}</div>
        <div className='bg-white w-full rounded-xl p-3 shadow text-xs'>
          <div className='font-semibold mb-2'>Body Controls</div>
          <label>Height</label>
          <input type='range' min='60' max='80' value={body.height} onChange={e=>setBody({...body,height:+e.target.value})}/>
          <label className='mt-2 block'>Weight</label>
          <input type='range' min='120' max='300' value={body.weight} onChange={e=>setBody({...body,weight:+e.target.value})}/>
        </div>
        <div className='bg-white w-full rounded-xl p-3 shadow space-y-2'>
          <button onClick={suggestOutfit} className='w-full bg-blue-600 text-white py-2 rounded'>Suggest Outfit</button>
          <button onClick={resetOutfit} className='w-full bg-gray-300 py-2 rounded'>Reset Outfit</button>
        </div>
      </div>
    </div>
  );
}
