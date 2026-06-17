// ===== その場でふわふわ＋排気煙エフェクト =====
(function(){
  const wrap = document.querySelector('.loading-plane-wrap');
  const canvas = document.getElementById('main-canvas');
  if(!wrap || !canvas) return;

  const ctx = canvas.getContext('2d');
  let startTime = null;
  const DURATION = 5000;

  function resize(){
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // 飛行機も雲もcanvasで描画（黒四角問題を完全解決）
  const PLANE_SRC = '/images/loading-plane.png';
  const CLOUD_SRC = '/images/loading-cloud.png';
  const planeImg = new Image();
  const cloudImg = new Image();
  planeImg.src = PLANE_SRC;
  cloudImg.src = CLOUD_SRC;
  // canvasで飛行機ピクセルの黒を除去
  let processedPlane = null;
  planeImg.onload = function(){
    const off = document.createElement('canvas');
    off.width = planeImg.naturalWidth;
    off.height = planeImg.naturalHeight;
    const octx = off.getContext('2d');
    octx.drawImage(planeImg, 0, 0);
    const d = octx.getImageData(0, 0, off.width, off.height);
    for(let i=0; i<d.data.length; i+=4){
      const brightness = d.data[i]+d.data[i+1]+d.data[i+2];
      if(brightness < 80){ d.data[i+3] = 0; }
      else if(brightness < 120){ d.data[i+3] = Math.floor(d.data[i+3]*(brightness-80)/40); }
    }
    octx.putImageData(d, 0, 0);
    processedPlane = off;
  };
  cloudImg.src = CLOUD_SRC;

  const particles = [];
  const MAX_PARTICLES = 12;

  function createParticle(planeX, planeY, pw, ph){
    // 飛行機が右向き → 後方は左端
    const ex = planeX + pw * 0.88;
    const ey = planeY + ph * 0.50;
    const scale = 0.06 + Math.random() * 0.06;  // 小さめに生まれる
    return {
      x: ex + (Math.random() - 0.5) * 10,
      y: ey + (Math.random() - 0.5) * 8,
      vx: (Math.random() * 1.4 + 0.4),    // 後方（右）へ
      vy: -(Math.random() * 0.3 + 0.05),  // わずかに上昇
      life: 0,
      maxLife: 80 + Math.random() * 60,
      scale: scale,
      alpha: 0.85 + Math.random() * 0.15,
    };
  }

  function updateParticles(planeX, planeY, pw, ph){
    if(particles.length < MAX_PARTICLES && Math.random() < 0.25){
      particles.push(createParticle(planeX, planeY, pw, ph));
    }
    for(let i = particles.length - 1; i >= 0; i--){
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.975;
      p.vy -= 0.008;
      p.scale += 0.0012;   // 徐々に大きくなる
      p.life++;
      if(p.life >= p.maxLife) particles.splice(i, 1);
    }
  }

  function drawParticles(){
    if(!cloudImg.complete) return;
    particles.forEach(p => {
      const t = p.life / p.maxLife;
      // フェードイン→フェードアウト
      let alpha = p.alpha;
      if(t < 0.15) alpha *= t / 0.15;
      else if(t > 0.6) alpha *= (1 - t) / 0.4;
      const w = cloudImg.naturalWidth  * p.scale;
      const h = cloudImg.naturalHeight * p.scale;
      ctx.save();
      ctx.globalAlpha = alpha * 0.75;
      ctx.drawImage(cloudImg, p.x - w/2, p.y - h/2, w, h);
      ctx.restore();
    });
  }

  function animate(ts){
    if(!startTime) startTime = ts;
    const elapsed = ts - startTime;
    const t = Math.min(elapsed / DURATION, 1);
    const W = window.innerWidth, H = window.innerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 飛行機位置を計算（煙の基点として使う）
    const pw = Math.min(W * 0.55, 480);
    const ph = pw * (210/420);
    const baseY = H * 0.41;
    const floatY = Math.sin(elapsed / 320) * 22;
    const sway   = Math.sin(elapsed / 480) * 12;
    const tilt   = Math.sin(elapsed / 380) * 6;
    const x = W/2 - pw/2 + sway;
    const y = baseY - ph/2 + floatY;

    // 排気雲 → 飛行機 の順でcanvasに描画
    updateParticles(x, y, pw, ph);
    drawParticles();

    // 飛行機をcanvasに直接描画（黒ピクセル透過済み）
    let opacity = 1;
    if(t < 0.05) opacity = t / 0.05;
    if(t > 0.9)  opacity = (1-t) / 0.1;

    if(processedPlane){
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.translate(x + pw/2, y + ph/2);
      ctx.rotate(tilt * Math.PI / 180);
      ctx.drawImage(processedPlane, -pw/2, -ph/2, pw, ph);
      ctx.restore();
    }

    if(t < 1){
      requestAnimationFrame(animate);
    } else {
      setTimeout(()=>{
        document.getElementById('loading').classList.add('done');
      }, 300);
    }
  }

  window.addEventListener('load', ()=>{
    setTimeout(()=>requestAnimationFrame(animate), 200);
  });
})();
