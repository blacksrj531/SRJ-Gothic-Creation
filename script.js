(function() {
  const html = document.documentElement;
  const toggleBtn = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const themeText = document.getElementById('themeText');
  const flash = document.getElementById('flashOverlay');
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  
  let w, h, particles = [], mouseX = -200, mouseY = -200;
  let bats = [], batAnim = null;

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 4 + 2;
      this.sx = (Math.random() - 0.5) * 2.5;
      this.sy = (Math.random() - 0.5) * 2.5;
      this.life = 1;
      this.decay = 0.014 + Math.random() * 0.022;
      this.color = html.getAttribute('data-theme') === 'light' 
        ? `hsl(${340 + Math.random() * 15}, 28%, 72%)` 
        : `hsl(${340 + Math.random() * 15}, 62%, 52%)`;
    }
    update() {
      this.x += this.sx;
      this.y += this.sy;
      this.life -= this.decay;
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.life * 0.85;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowColor = html.getAttribute('data-theme') === 'light' ? '#c8b4bc' : '#9b3048';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.restore();
    }
  }

  function spawn(x, y) {
    if (particles.length < 55) particles.push(new Particle(x, y));
  }

  class Bat {
    constructor() {
      this.x = Math.random() * w * 0.8 + w * 0.1;
      this.y = -20 - Math.random() * 120;
      this.size = 18 + Math.random() * 28;
      this.speedY = 2.5 + Math.random() * 4.5;
      this.speedX = (Math.random() - 0.5) * 3.5;
      this.wingPhase = Math.random() * Math.PI * 2;
      this.opacity = 0.65 + Math.random() * 0.35;
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.wingPhase += 0.35;
      return this.y < h + 100;
    }
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      const flap = Math.sin(this.wingPhase) * 0.5;
      ctx.fillStyle = '#140610';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.size * 0.5, this.size * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-this.size * 0.4, -this.size * 0.15);
      ctx.quadraticCurveTo(-this.size * 0.9, -this.size * 0.7 * flap, -this.size * 1.1, -this.size * 0.1);
      ctx.quadraticCurveTo(-this.size * 0.6, this.size * 0.1, -this.size * 0.3, this.size * 0.1);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(this.size * 0.4, -this.size * 0.15);
      ctx.quadraticCurveTo(this.size * 0.9, -this.size * 0.7 * flap, this.size * 1.1, -this.size * 0.1);
      ctx.quadraticCurveTo(this.size * 0.6, this.size * 0.1, this.size * 0.3, this.size * 0.1);
      ctx.fill();
      ctx.restore();
    }
  }

  function animBats() {
    if (!bats.length) { batAnim = null; return; }
    ctx.clearRect(0, 0, w, h);
    for (let i = bats.length - 1; i >= 0; i--) {
      bats[i].draw(ctx);
      if (!bats[i].update()) bats.splice(i, 1);
    }
    batAnim = requestAnimationFrame(animBats);
  }

  function triggerBats() {
    bats = [];
    for (let i = 0; i < 45; i++) bats.push(new Bat());
    if (!batAnim) animBats();
  }

  function triggerFlash() {
    flash.style.opacity = '1';
    setTimeout(() => { flash.style.opacity = '0'; }, 160);
  }

  function setTheme(t) {
    html.setAttribute('data-theme', t);
    if (t === 'light') {
      themeIcon.className = 'fas fa-sun';
      themeText.textContent = 'Gothic Dawn';
    } else {
      themeIcon.className = 'fas fa-cross';
      themeText.textContent = 'Gothic Night';
    }
    localStorage.setItem('gothicTheme', t);
  }

  const saved = localStorage.getItem('gothicTheme') || 'gothic';
  setTheme(saved);

  toggleBtn.addEventListener('click', () => {
    const cur = html.getAttribute('data-theme');
    const next = cur === 'gothic' ? 'light' : 'gothic';
    setTheme(next);
    if (next === 'gothic') triggerBats();
    else triggerFlash();
  });

  const heroCard = document.getElementById('heroCard');
  const container = document.getElementById('hero3dContainer');
  
  container.addEventListener('mousemove', (e) => {
    const r = container.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    heroCard.style.transform = `rotateY(${((x - r.width / 2) / r.width * 15)}deg) rotateX(${((y - r.height / 2) / r.height * -11)}deg) translateZ(12px)`;
  });
  
  container.addEventListener('mouseleave', () => {
    heroCard.style.transform = '';
  });

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    for (let i = 0; i < 2; i++) spawn(mouseX + (Math.random() - 0.5) * 12, mouseY + (Math.random() - 0.5) * 12);
  });

  function animParticles() {
    if (batAnim) { requestAnimationFrame(animParticles); return; }
    ctx.clearRect(0, 0, w, h);
    for (let i = particles.length - 1; i >= 0; i--) {
      let p = particles[i];
      p.update();
      p.draw(ctx);
      if (p.life <= 0.02) particles.splice(i, 1);
      const dx = mouseX - p.x, dy = mouseY - p.y;
      if (Math.hypot(dx, dy) < 130) { p.x += dx * 0.008; p.y += dy * 0.008; }
    }
    requestAnimationFrame(animParticles);
  }
  animParticles();

  document.querySelectorAll('.star-btn').forEach(s => {
    s.addEventListener('click', function() {
      document.getElementById('ratingInput').value = this.dataset.value;
      document.querySelectorAll('.star-btn').forEach(b => b.classList.remove('selected'));
      for (let i = 0; i < this.dataset.value; i++) {
        document.querySelectorAll('.star-btn')[i].classList.add('selected');
      }
    });
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  
  document.querySelectorAll('.animate-card').forEach(c => obs.observe(c));
  
  window.addEventListener('load', () => {
    document.querySelectorAll('.animate-card').forEach(c => {
      if (c.getBoundingClientRect().top < window.innerHeight - 30) c.classList.add('visible');
    });
  });
})();