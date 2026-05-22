/**
 * Sellnook Notifications System
 * Handles real-time in-app alerts and notifications dropdown.
 */
import { auth, db } from "./config.js";
import { 
  collection, query, where, orderBy, onSnapshot, 
  updateDoc, doc, limit, getDocs 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

class NotificationSystem {
  constructor() {
    this.unreadCount = 0;
    this.notifications = [];
    this.isOpen = false;
    this.init();
  }

  async init() {
    onAuthStateChanged(auth, user => {
      if (user) {
        this.userId = user.uid;
        this.setupListener();
        this.injectUI();
      }
    });
  }

  setupListener() {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", this.userId),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    onSnapshot(q, snap => {
      this.notifications = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      this.unreadCount = this.notifications.filter(n => !n.read).length;
      this.updateBell();
      if (this.isOpen) this.renderDropdown();
    });
  }

  injectUI() {
    // Look for a place to put the bell. Usually in .nav-right
    const navRight = document.querySelector('.nav-right');
    if (!navRight) return;

    // Create bell container
    const bellContainer = document.createElement('div');
    bellContainer.className = 'nav-notif-container';
    bellContainer.style.position = 'relative';
    bellContainer.style.marginRight = '8px';
    bellContainer.style.cursor = 'pointer';

    bellContainer.innerHTML = `
      <div class="notif-bell" id="notif-bell">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <div id="notif-badge" style="display:none; position:absolute; top:-4px; right:-4px; background:#e8734a; color:#fff; font-size:10px; font-weight:700; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fafaf9;">0</div>
      </div>
      <div id="notif-dropdown" style="display:none; position:absolute; top:40px; right:0; width:320px; background:#fff; border:1px solid #e8e8e5; border-radius:12px; box-shadow:0 10px 25px rgba(0,0,0,0.1); z-index:100; overflow:hidden;">
        <div style="padding:16px; border-bottom:1px solid #e8e8e5; display:flex; justify-content:space-between; align-items:center;">
          <h3 style="font-family:'Syne',sans-serif; font-size:0.9rem; font-weight:700;">Notifications</h3>
          <button id="mark-all-read" style="background:none; border:none; color:#e8734a; font-size:0.75rem; font-weight:600; cursor:pointer;">Mark all read</button>
        </div>
        <div id="notif-list" style="max-height:400px; overflow-y:auto;">
          <div style="padding:40px 20px; text-align:center; color:#bbb; font-size:0.82rem;">No notifications yet.</div>
        </div>
        <div style="padding:12px; text-align:center; border-top:1px solid #e8e8e5; background:#f9f9f8;">
          <a href="/notifications.html" style="font-size:0.75rem; color:#888; text-decoration:none; font-weight:500;">View all notifications</a>
        </div>
      </div>
    `;

    navRight.insertBefore(bellContainer, navRight.firstChild);

    // Click to toggle
    bellContainer.querySelector('#notif-bell').onclick = (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    };

    // Close on outside click
    document.addEventListener('click', () => {
      if (this.isOpen) this.toggleDropdown();
    });

    bellContainer.querySelector('#notif-dropdown').onclick = (e) => e.stopPropagation();

    // Mark all read
    bellContainer.querySelector('#mark-all-read').onclick = () => this.markAllRead();

    this.updateBell();
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
    const dropdown = document.getElementById('notif-dropdown');
    if (dropdown) {
      dropdown.style.display = this.isOpen ? 'block' : 'none';
      if (this.isOpen) this.renderDropdown();
    }
  }

  updateBell() {
    const badge = document.getElementById('notif-badge');
    if (badge) {
      badge.textContent = this.unreadCount;
      badge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
    }
  }

  renderDropdown() {
    const list = document.getElementById('notif-list');
    if (!list) return;

    if (this.notifications.length === 0) {
      list.innerHTML = '<div style="padding:40px 20px; text-align:center; color:#bbb; font-size:0.82rem;">No notifications yet.</div>';
      return;
    }

    list.innerHTML = this.notifications.map(n => `
      <div class="notif-item" style="padding:14px 16px; border-bottom:1px solid #f8f8f7; cursor:pointer; background:${n.read ? '#fff' : '#fff9f6'};" onclick="window.location.href='${n.url || '#'}';">
        <div style="display:flex; gap:12px;">
          <div style="width:32px; height:32px; border-radius:50%; background:${this.getIconColor(n.type)}; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0;">
            ${this.getIcon(n.type)}
          </div>
          <div style="flex:1;">
            <div style="font-size:0.82rem; font-weight:600; color:#1a1a1a; margin-bottom:2px;">${n.title}</div>
            <div style="font-size:0.75rem; color:#666; line-height:1.4; margin-bottom:4px;">${n.body}</div>
            <div style="font-size:0.65rem; color:#bbb;">${this.timeAgo(n.createdAt)}</div>
          </div>
          ${!n.read ? '<div style="width:6px; height:6px; border-radius:50%; background:#e8734a; margin-top:6px;"></div>' : ''}
        </div>
      </div>
    `).join('');
  }

  async markAllRead() {
    const unread = this.notifications.filter(n => !n.read);
    for (const n of unread) {
      await updateDoc(doc(db, "notifications", n.id), { read: true });
    }
  }

  getIcon(type) {
    switch(type) {
      case 'sale': return '💰';
      case 'offer': return '🤝';
      case 'message': return '💬';
      case 'shipping': return '📦';
      default: return '🔔';
    }
  }

  getIconColor(type) {
    switch(type) {
      case 'sale': return '#e6f4ea';
      case 'offer': return '#e8f0fe';
      case 'message': return '#fef7e0';
      case 'shipping': return '#f3e8ff';
      default: return '#f1f3f4';
    }
  }

  timeAgo(timestamp) {
    const date = new Date(timestamp);
    const diff = (new Date() - date) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff/60) + 'm ago';
    if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
    return date.toLocaleDateString();
  }
}

// Global initialization
window.sellnookNotifs = new NotificationSystem();
