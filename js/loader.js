/**
 * Sellnook Global Loader
 * Injects the custom "Unboxing your experience" loader into any page.
 */

const loaderHTML = `
<div class="loader-wrapper" id="site-loader">
    <style>
        .loader-wrapper {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            transition: opacity 0.5s ease-out, visibility 0.5s;
        }
        .loader-wrapper.hide { opacity: 0; visibility: hidden; }
        .logo-container-loader { position: relative; width: 100px; height: 100px; margin-bottom: 24px; }
        .logo-img-loader { width: 100%; height: 100%; animation: float-loader 2s ease-in-out infinite; object-fit: contain; }
        .pulse-ring-loader {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: 100px; height: 100px; border-radius: 50%; background: #e8734a;
            opacity: 0; animation: pulse-ring-loader 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        .loading-text-loader { 
            font-family: 'Syne', sans-serif; 
            font-size: 1.1rem; 
            font-weight: 700; 
            color: #1a1a1a; 
            margin-bottom: 8px; 
            text-align: center;
        }
        @keyframes float-loader { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        @keyframes pulse-ring-loader { 0% { transform: translate(-50%, -50%) scale(0.6); opacity: 0.5; } 100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; } }
    </style>
    <div class="logo-container-loader">
        <div class="pulse-ring-loader"></div>
        <img src="/assets/logo.png" alt="Sellnook" class="logo-img-loader" id="loader-logo-img">
    </div>
    <div class="loading-text-loader">Unboxing your experience</div>
</div>
`;

function injectLoader() {
    // Prevent double injection
    if (document.getElementById('site-loader')) return;
    
    const div = document.createElement('div');
    div.innerHTML = loaderHTML;
    document.body.appendChild(div.firstElementChild);

    // Fallback if logo fails (absolute path check)
    const img = document.getElementById('loader-logo-img');
    if (img) {
        img.onerror = () => {
            img.src = './assets/logo.png'; // Try relative if absolute fails
            img.onerror = () => { img.style.opacity = '0'; }; // Hide if both fail
        };
    }
}

window.hideLoader = function() {
    const loader = document.getElementById('site-loader');
    if (loader) {
        loader.classList.add('hide');
        setTimeout(() => {
            if (loader.classList.contains('hide')) loader.remove();
        }, 600);
    }
};

// Auto-inject on load
if (document.body) {
    injectLoader();
} else {
    document.addEventListener('DOMContentLoaded', injectLoader);
}

// Auto-hide when everything is ready
window.addEventListener('load', () => {
    setTimeout(window.hideLoader, 500);
});
