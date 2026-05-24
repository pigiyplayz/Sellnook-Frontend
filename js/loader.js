/**
 * Sellnook Global Loader — Snappy Edition
 * Injects a branded loading overlay and auto-hides as soon as the page is ready.
 */

const loaderHTML = `
<div class="loader-wrapper" id="site-loader">
<style>
.loader-wrapper {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: #fafaf9;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  z-index: 99999;
  transition: opacity 0.3s ease-out, visibility 0.3s;
}
.loader-wrapper.hide { opacity: 0; visibility: hidden; }
.logo-container-loader { position: relative; width: 80px; height: 80px; margin-bottom: 18px; }
.logo-img-loader { width: 100%; height: 100%; animation: float-loader 2s ease-in-out infinite; object-fit: contain; }
.pulse-ring-loader {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 80px; height: 80px; border-radius: 50%; background: #e8734a;
  opacity: 0; animation: pulse-ring-loader 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}
.loading-text-loader {
  font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700;
  color: #1a1a1a; margin-bottom: 6px; text-align: center; letter-spacing: 0.02em;
}
@keyframes float-loader { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes pulse-ring-loader { 0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0.4; } 100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; } }
</style>
<div class="logo-container-loader">
  <div class="pulse-ring-loader"></div>
  <img src="/assets/logo.png" alt="Sellnook" class="logo-img-loader" id="loader-logo-img">
</div>
<div class="loading-text-loader">Unboxing your experience</div>
</div>
`;

function injectLoader() {
  if (document.getElementById('site-loader')) return;

  const div = document.createElement('div');
  div.innerHTML = loaderHTML;
  document.body.appendChild(div.firstElementChild);

  const img = document.getElementById('loader-logo-img');
  if (img) {
    img.onerror = () => {
      img.src = './assets/logo.png';
      img.onerror = () => { img.style.opacity = '0'; };
    };
  }
}

let _loaderHidden = false;

window.hideLoader = function() {
  if (_loaderHidden) return;
  _loaderHidden = true;
  const loader = document.getElementById('site-loader');
  if (loader) {
    loader.classList.add('hide');
    setTimeout(() => { if (loader.parentNode) loader.remove(); }, 350);
  }
};

function _hideOldLoading() {
  const old = document.getElementById('loading');
  if (old) {
    old.classList.add('hide');
    setTimeout(() => { if (old.parentNode) old.remove(); }, 400);
  }
}

// Inject as early as possible
if (document.body) {
  injectLoader();
} else {
  document.addEventListener('DOMContentLoaded', injectLoader);
}

// Hide as soon as the page is loaded — no artificial delay
window.addEventListener('load', () => {
  // Give the browser 1 frame to paint before fading out
  requestAnimationFrame(() => requestAnimationFrame(window.hideLoader));
});

// Failsafe: never show the loader for more than 4 seconds
setTimeout(() => {
  if (!_loaderHidden) {
    window.hideLoader();
    _hideOldLoading();
  }
}, 4000);

// Also dismiss old-style #loading divs if present
if (document.readyState === 'complete') {
  _hideOldLoading();
} else {
  window.addEventListener('load', _hideOldLoading);
}
