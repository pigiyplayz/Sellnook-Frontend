import { auth, API } from "./config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

/**
 * Sellnook Page Guard
 * Restricts access based on user role (Free, Pro, Dev) before launch.
 */

const ALWAYS_ALLOWED = [
    '/',
    '/index.html',
    '/login.html',
    '/signup.html',
    '/seller-handbook.html',
    '/buyer-handbook.html',
    '/dashboard.html',
    '/terms.html',
    '/privacy.html',
    '/404.html',
    '/seller-dashboard.html'
];

const PRO_ALLOWED = [
    ...ALWAYS_ALLOWED,
    '/seller-dashboard.html'
];

async function checkAccess() {
    const path = window.location.pathname;
    
    // Normalize path for comparison
    let cleanPath = path;
    if (cleanPath.endsWith('/')) cleanPath += 'index.html';
    if (!cleanPath.endsWith('.html') && !cleanPath.includes('.') && cleanPath !== '/') {
        cleanPath += '.html';
    }

    // 1. If it's a "Free/Everyone" page, allow immediately
    if (ALWAYS_ALLOWED.some(p => cleanPath.endsWith(p))) {
        return;
    }

    // 2. Otherwise, check auth status
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            // Not logged in -> Redirect to login
            console.log("Restricted: Redirecting to login");
            window.location.href = '/login.html';
            return;
        }

        // 3. Admin bypass - Admin always gets access instantly without hitting the backend
        if (user.email && user.email.toLowerCase() === 'austinmalick9@gmail.com') {
            return;
        }

        // 4. Right now, ONLY the admin can access restricted pages. Everyone else gets kicked to home/not-ready.
        console.warn("Non-admin tried to access restricted page. Redirecting to home.");
        window.location.href = '/';
    });
}

checkAccess();
