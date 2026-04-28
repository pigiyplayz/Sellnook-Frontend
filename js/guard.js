import { auth, API } from "./config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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
    '/coming-soon.html'
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

        try {
            // Fetch access levels from backend
            const token = await user.getIdToken();
            const res = await fetch(`${API}/api/auth/access`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!res.ok) throw new Error("Access check failed");
            
            const access = await res.json(); // Expected: { isDev: boolean, isPro: boolean }

            // 3. Dev has access to EVERYTHING (including admin)
            if (access.isDev || user.email === 'austinmalick9@gmail.com') {
                return;
            }

            // 4. Pro has access to Free pages + Seller Dashboard
            if (access.isPro) {
                if (PRO_ALLOWED.some(p => cleanPath.endsWith(p))) {
                    return;
                } else {
                    console.log("Pro Restricted: Redirecting to home");
                    window.location.href = '/';
                    return;
                }
            }

            // 5. Free users (or unknown) are blocked from anything not in ALWAYS_ALLOWED
            console.log("Free Restricted: Redirecting to home");
            window.location.href = '/';

        } catch (e) {
            console.error("Guard Error:", e);
            // If API fails, better safe than sorry: redirect to home
            window.location.href = '/';
        }
    });
}

checkAccess();
