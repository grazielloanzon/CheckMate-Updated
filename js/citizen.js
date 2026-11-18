/**
 * CheckMate - Citizen Portal Script
 * Reads the SAME 'checkmate_events' list that the admin portal writes to,
 * so whatever the admin creates, edits, completes or deletes shows up here.
 */

const CM_EVENTS_KEY = 'checkmate_events';
const CM_VALID_STATUSES = ['upcoming', 'ongoing', 'completed'];

let citizenStatusFilter = 'upcoming';
let citizenSearchQuery = '';
let citizenCategoryFilter = 'all';


document.addEventListener('DOMContentLoaded', () => {
    setupCitizenNavigation();
    setupCitizenSearch();
    setupCitizenNotifications();

    // Remember existing statuses before checking for changes.
    initializeCitizenEventStatusSnapshot();

    // Update event statuses before displaying them.
    updateCitizenEventStatuses();

    // Detect automatic or admin-made status changes.
    checkCitizenEventStatusChanges();

    showCitizenSection();

    window.addEventListener('hashchange', showCitizenSection);

    // Live update when the admin changes events in another tab.
    window.addEventListener('storage', (e) => {
        if (e.key === CM_EVENTS_KEY) {
            updateCitizenEventStatuses();
            checkCitizenEventStatusChanges();
            showCitizenSection();
        }

        if (e.key === CM_NOTIF_KEY) {
            checkNewNotifications();
        }
    });

    // Check event statuses every 30 seconds.
    setInterval(() => {
        updateCitizenEventStatuses();
        checkCitizenEventStatusChanges();
        showCitizenSection();
    }, 30000);

    // Recheck when the citizen returns to the tab.
    window.addEventListener('focus', () => {
        updateCitizenEventStatuses();
        checkCitizenEventStatusChanges();
        showCitizenSection();
    });

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            updateCitizenEventStatuses();
            checkCitizenEventStatusChanges();
            showCitizenSection();
        }
    });
});



/* ==========================================================================
   DATA
   ========================================================================== */

/*-------(AUTOMATIC EVENT STATUS UPDATES)-------*/

function updateCitizenEventStatuses() {
    const events = getCitizenEvents();

    const now = new Date();
    let changed = false;

    events.forEach(event => {
        // Preserve manually completed events
        if (event.status === 'completed') return;

        // Skip events without complete date and time information
        if (!event.date || !event.startTime || !event.endTime) return;

        const startDateTime = new Date(
            `${event.date}T${event.startTime}:00`
        );

        const endDateTime = new Date(
            `${event.date}T${event.endTime}:00`
        );

        // Skip invalid date or time values
        if (
            isNaN(startDateTime.getTime()) ||
            isNaN(endDateTime.getTime()) ||
            endDateTime <= startDateTime
        ) return;

        let newStatus;

        if (now >= endDateTime) {
            newStatus = 'completed';
        } else if (now >= startDateTime) {
            newStatus = 'ongoing';
        } else {
            newStatus = 'upcoming';
        }

        if (event.status !== newStatus) {
            event.status = newStatus;
            changed = true;
        }
    });

    if (changed) {
        localStorage.setItem(CM_EVENTS_KEY, JSON.stringify(events));
    }

    return changed;
}

function getCitizenEvents() {
    try {
        const events = JSON.parse(localStorage.getItem(CM_EVENTS_KEY));
        return Array.isArray(events) ? events : [];
    } catch (err) {
        return [];
    }
}


/* ==========================================================================
   ROUTING (hash)
   ========================================================================== */
function getCitizenRoute() {
    const hash = window.location.hash.replace('#', '').split('?')[0];

    if (CM_VALID_STATUSES.includes(hash)) {
        return { section: 'events', status: hash };
    }

    return { section: 'home', status: null };
}

function showCitizenSection() {
    const route = getCitizenRoute();

    const home = document.getElementById('citizen-home-section');
    const events = document.getElementById('citizen-events-section');

    if (route.section === 'events') {
        if (citizenStatusFilter !== route.status) {
            citizenStatusFilter = route.status;
            citizenSearchQuery = '';
            const input = document.getElementById('searchInput');
            if (input) input.value = '';
        }

        home.style.display = 'none';
        events.style.display = 'block';

        updateCitizenTabs();
        renderCitizenEvents();
    } else {
        events.style.display = 'none';
        home.style.display = 'block';

        renderFeaturedEvents();
    }

    updateTopNavActive(route.section);
}

function updateCitizenTabs() {
    document.querySelectorAll('[data-event-status]').forEach(link => {
        link.classList.toggle('active', link.dataset.eventStatus === citizenStatusFilter);
    });
}

function updateTopNavActive(section) {
    document.querySelectorAll('[data-citizen-nav]').forEach(link => {
        const isHome = link.dataset.citizenNav === 'home' && section === 'home';
        const isEvents = link.dataset.citizenNav === 'events' && section === 'events';
        link.classList.toggle('active', isHome || isEvents);
    });
}


/* ==========================================================================
   HOME - FEATURED EVENTS
   ========================================================================== */
function renderFeaturedEvents() {
    const container = document.querySelector('.featured-events-container');
    if (!container) return;

    const featured = getCitizenEvents()
        .filter(e => e.status === 'ongoing' || e.status === 'upcoming')
        .sort((a, b) => {
            // ongoing first, then the nearest date
            if (a.status !== b.status) return a.status === 'ongoing' ? -1 : 1;
            return String(a.date || '').localeCompare(String(b.date || ''));
        })
        .slice(0, 3);

    if (featured.length === 0) {
        container.innerHTML = `
            <div class="empty-events" style="grid-column: 1 / -1;">
                <i class="bx bx-calendar"></i>
                <h3>Featured events</h3>
                <p>Featured community events will appear here.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = featured.map(buildEventCard).join('');
}


/* ==========================================================================
   EVENTS PAGE
   ========================================================================== */
function renderCitizenEvents() {
    const container = document.getElementById('citizenEventsContainer');
    if (!container) return;

    let events = getCitizenEvents().filter(e => e.status === citizenStatusFilter);

    if (citizenCategoryFilter !== 'all') {
        events = events.filter(e => (e.category || 'Community') === citizenCategoryFilter);
    }

    const query = citizenSearchQuery.trim().toLowerCase();

    if (query) {
        events = events.filter(e => eventMatchesQuery(e, query));
    }

    // Upcoming/ongoing: nearest date first. Completed: most recent first.
    events.sort((a, b) => {
        const cmp = String(a.date || '').localeCompare(String(b.date || ''));
        return citizenStatusFilter === 'completed' ? -cmp : cmp;
    });

    if (events.length === 0) {
        const label = capitalize(citizenStatusFilter);
        const isFiltering = query || citizenCategoryFilter !== 'all';

        container.className = 'events-empty';
        container.innerHTML = `
            <i class="bx bx-calendar-event"></i>
            <h2>${isFiltering ? 'No matching events' : `${label} events`}</h2>
            <p>${isFiltering
                ? 'Try a different search word or category.'
                : `Community ${citizenStatusFilter} events will appear here.`}</p>
        `;
        return;
    }

    container.className = 'events-list';
    container.innerHTML = events.map(buildEventCard).join('');
}

function setupCitizenSearch() {
    const form = document.getElementById('citizenSearchForm');
    const input = document.getElementById('searchInput');

    if (!form || !input) return;

    const categorySelect = document.getElementById('categoryFilter');

    if (categorySelect) {
        categorySelect.addEventListener('change', () => {
            citizenCategoryFilter = categorySelect.value;
            renderCitizenEvents();
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        citizenSearchQuery = input.value;
        renderCitizenEvents();
    });

    input.addEventListener('input', () => {
        citizenSearchQuery = input.value;
        renderCitizenEvents();
    });
}


/* ------------- EVENT CARD + DETAILS MODAL ------------ */

function buildEventCard(event) {
    const status = CM_VALID_STATUSES.includes(event.status)
        ? event.status
        : 'upcoming';

    return `
        <article class="featured-event-card">

            <!-- TOP: EVENT TITLE -->
            <div class="event-card-header">
                <h3 class="event-header-label"
                    title="${escapeHTML(event.title)}">
                    ${escapeHTML(truncate(event.title || '', 30))}${(event.title || '').length > 30 ? '...' : ''}
                </h3>
            </div>

            <div class="event-card-body">

                <!-- EVENT STATUS -->
                <div class="event-card-top">
                    <span class="event-status ${status}">
                        <span class="status-dot"></span>
                        ${escapeHTML(status)}
                    </span>
                </div>

                <!-- EVENT INFORMATION -->
                <div class="event-info">
                    <div>
                        <i class="bx bx-calendar"></i>
                        <span>${escapeHTML(formatEventDate(event.date))}</span>
                    </div>

                    <div>
                        <i class="bx bx-time"></i>
                        <span>${escapeHTML(formatEventTime(event))}</span>
                    </div>

                    <div>
                        <i class="bx bx-map"></i>
                        <span>${escapeHTML(event.location || '—')}</span>
                    </div>
                </div>

                <div class="event-card-divider"></div>

                <!-- BOTTOM: CATEGORY AND BUTTON -->
                <div class="event-card-bottom">
                    <span class="event-category">
                        ${escapeHTML(event.category || 'Community')}
                    </span>

                    <button type="button"
                            class="view-details-btn"
                            onclick="openEventDetails('${escapeHTML(event.id)}')">
                        View Details
                        <i class="bx bx-right-arrow-alt"></i>
                    </button>
                </div>

            </div>
        </article>
    `;
}


window.openEventDetails = function (id) {
    const event = getCitizenEvents().find(e => String(e.id) === String(id));
    if (!event) return;

    let modalEl = document.getElementById('eventDetailsModal');

    if (!modalEl) {
        modalEl = document.createElement('div');
        modalEl.className = 'modal fade';
        modalEl.id = 'eventDetailsModal';
        modalEl.tabIndex = -1;
        modalEl.setAttribute('aria-hidden', 'true');
        document.body.appendChild(modalEl);
    }

    const status = CM_VALID_STATUSES.includes(event.status) ? event.status : 'upcoming';

    modalEl.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content event-details-modal">
                <div class="modal-header">
                    <h5 class="modal-title">${escapeHTML(event.title)}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body">
                    <div class="d-flex flex-wrap gap-3 align-items-center">
                        <span class="event-status ${status}">
                            <span class="status-dot"></span>${escapeHTML(status)}
                        </span>
                        <span class="event-category">${escapeHTML(event.category || 'Community')}</span>
                    </div>

                    <div class="event-detail-block">
                        <h6>Date</h6>
                        <p>${escapeHTML(formatEventDate(event.date))}</p>
                    </div>

                    <div class="event-detail-block">
                        <h6>Time</h6>
                        <p>${escapeHTML(formatEventTime(event))}</p>
                    </div>

                    <div class="event-detail-block">
                        <h6>Location</h6>
                        <p>${escapeHTML(event.location || '—')}</p>
                    </div>

                    <div class="event-detail-block">
                        <h6>Description</h6>
                        <p>${escapeHTML(event.description || 'No description provided.')}</p>
                    </div>

                    <div class="event-detail-block">
                        <h6>Requirements</h6>
                        <p>${escapeHTML(event.requirements || 'No special requirements.')}</p>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;

    bootstrap.Modal.getOrCreateInstance(modalEl).show();
};


/* ==========================================================================
   NAVIGATION / LOGOUT
   ========================================================================== */
function setupCitizenNavigation() {
    const logout = document.getElementById('citizenLogout');

    if (logout) {
        logout.addEventListener('click', (e) => {
            e.preventDefault();
            confirmLogout();
        });
    }

    // Personalize the greeting
    try {
        const user = JSON.parse(sessionStorage.getItem('checkmate_user'));
        const heading = document.querySelector('.content-middle-text');
        if (user && user.name && heading) {
            heading.textContent = `Welcome, ${user.name.split(' ')[0]}!`;
        }
    } catch (e) { }
}


/* ==========================================================================
   HELPERS
   ========================================================================== */
function formatEventDate(dateStr) {
    if (!dateStr) return '—';

    const d = new Date(`${dateStr}T00:00:00`);
    if (isNaN(d)) return dateStr;

    return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatTime12(timeStr) {
    if (!timeStr) return '';

    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return timeStr;

    const suffix = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function formatEventTime(event) {
    const start = formatTime12(event.startTime || event.time);
    const end = formatTime12(event.endTime);

    if (start && end) return `${start} – ${end}`;
    return start || 'Time to be announced';
}

// Every word typed must appear in the event's title, category or location
function eventMatchesQuery(event, query) {
    const text = [event.title, event.category, event.location]
        .map(v => String(v || '').toLowerCase())
        .join(' ');

    return query.split(/\s+/).filter(Boolean).every(word => text.includes(word));
}

function truncate(str, max) {
    str = String(str);
    return str.length > max ? str.slice(0, max).trim() + '…' : str;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHTML(str) {
    return String(str ?? '').replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

/* ==========================================================================
   LOGOUT CONFIRMATION POPUP
   ========================================================================== */
function confirmLogout() {
    if (document.getElementById('logoutOverlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'logout-overlay';
    overlay.id = 'logoutOverlay';
    overlay.innerHTML = `
        <div class="logout-box" role="dialog" aria-modal="true" aria-labelledby="logoutTitle">
            <h3 id="logoutTitle">Confirm logout?</h3>
            <div class="logout-actions">
                <button type="button" class="logout-cancel">Cancel</button>
                <button type="button" class="logout-confirm">Logout</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const close = () => overlay.remove();

    overlay.querySelector('.logout-cancel').addEventListener('click', close);
    overlay.querySelector('.logout-confirm').addEventListener('click', () => {
        sessionStorage.removeItem('checkmate_user');
        window.location.href = 'index.html';
    });

    // Click outside the box or press Esc to cancel
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function onKey(e) {
        if (e.key === 'Escape') {
            close();
            document.removeEventListener('keydown', onKey);
        }
    });

    overlay.querySelector('.logout-cancel').focus();
}


/* ==========================================================================
   NOTIFICATIONS
   The admin sends these from the bell in the admin portal. They are stored in
   'checkmate_notifications'. Read/unread is tracked per user.
   ========================================================================== */
const CM_NOTIF_KEY = 'checkmate_notifications';

let knownNotifIds = new Set();

function getNotifications() {
    try {
        const list = JSON.parse(localStorage.getItem(CM_NOTIF_KEY));
        return Array.isArray(list) ? list : [];
    } catch (err) {
        return [];
    }
}

/* =========================================
   AUTOMATIC EVENT STATUS NOTIFICATIONS
   ========================================= */

const CM_EVENT_STATUS_KEY = 'checkmate_event_status_snapshot';

function initializeCitizenEventStatusSnapshot() {
    const existingSnapshot = localStorage.getItem(CM_EVENT_STATUS_KEY);

    // First visit: save current statuses without notifying
    // citizens about events that were already ongoing/completed.
    if (existingSnapshot === null) {
        const snapshot = {};

        getCitizenEvents().forEach(event => {
            snapshot[event.id] = event.status;
        });

        localStorage.setItem(
            CM_EVENT_STATUS_KEY,
            JSON.stringify(snapshot)
        );
    }
}

function checkCitizenEventStatusChanges() {
    const events = getCitizenEvents();

    let previousStatuses = {};

    try {
        previousStatuses = JSON.parse(
            localStorage.getItem(CM_EVENT_STATUS_KEY)
        ) || {};
    } catch (err) {
        previousStatuses = {};
    }

    const notifications = getNotifications();
    let notificationAdded = false;

    events.forEach(event => {
        const previousStatus = previousStatuses[event.id];
        const currentStatus = event.status;

        // Only notify when an existing event changes status.
        if (previousStatus === currentStatus) return;
        if (!previousStatus) return;

        // Only notify for Ongoing and Completed changes.
        if (!['ongoing', 'completed'].includes(currentStatus)) return;

        // Avoid duplicate notifications for the same event/status.
        const alreadyNotified = notifications.some(n =>
            String(n.eventId) === String(event.id) &&
            n.status === currentStatus
        );

        if (alreadyNotified) return;

        notifications.unshift({
            id: `event-status-${event.id}-${currentStatus}`,
            eventId: event.id,
            title: event.title || 'Community Event',
            status: currentStatus,
            date: event.date || '',
            location: event.location || '',
            sentAt: new Date().toISOString()
        });

        notificationAdded = true;
    });

    // Save the latest event statuses.
    const updatedSnapshot = {};

    events.forEach(event => {
        updatedSnapshot[event.id] = event.status;
    });

    localStorage.setItem(
        CM_EVENT_STATUS_KEY,
        JSON.stringify(updatedSnapshot)
    );

    // Save notifications and refresh the citizen's notification display.
    if (notificationAdded) {
        localStorage.setItem(
            CM_NOTIF_KEY,
            JSON.stringify(notifications)
        );

        checkNewNotifications();
    }
}

function notifReadKey() {
    let id = 'guest';

    try {
        const user = JSON.parse(sessionStorage.getItem('checkmate_user'));
        if (user && user.id != null) id = user.id;
    } catch (err) { }

    return `checkmate_notif_read_${id}`;
}

function getReadNotifIds() {
    try {
        const ids = JSON.parse(localStorage.getItem(notifReadKey()));
        return Array.isArray(ids) ? ids : [];
    } catch (err) {
        return [];
    }
}

function saveReadNotifIds(ids) {
    localStorage.setItem(notifReadKey(), JSON.stringify(ids));
}

function updateNotifBadge() {
    const read = new Set(getReadNotifIds());
    const unread = getNotifications().filter(n => !read.has(n.id)).length;

    const badges = [
        document.getElementById('citizenNotifBadge'),
        document.getElementById('citizenNotifBadgeEvents')
    ];

    badges.forEach(badge => {
        if (!badge) return;

        badge.textContent = unread > 9 ? '9+' : unread;
        badge.hidden = unread === 0;
    });
}

function notifLabel(status) {
    if (status === 'ongoing') return 'Happening now';
    if (status === 'completed') return 'Event completed';
    return 'Upcoming event';
}

function timeAgo(iso) {
    const then = new Date(iso);
    if (isNaN(then)) return '';

    const mins = Math.floor((Date.now() - then.getTime()) / 60000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;

    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;

    return then.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

function setupCitizenNotifications() {
    const buttons = [
        document.getElementById('citizenNotifBtn'),
        document.getElementById('citizenNotifBtnEvents')
    ].filter(Boolean);

    const panels = [
        document.getElementById('citizenNotifPanel'),
        document.getElementById('citizenNotifPanelEvents')
    ].filter(Boolean);

    if (!buttons.length || !panels.length) return;

    knownNotifIds = new Set(getNotifications().map(n => n.id));
    updateNotifBadge();

    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();

            const panelId = btn.id === 'citizenNotifBtnEvents'
                ? 'citizenNotifPanelEvents'
                : 'citizenNotifPanel';

            const panel = document.getElementById(panelId);
            if (!panel) return;

            if (panel.hidden) {
                renderNotifPanel(panel.id);
                panel.hidden = false;
                btn.setAttribute('aria-expanded', 'true');
            } else {
                closeNotifPanel();
            }
        });
    });

    panels.forEach(panel => {
        panel.addEventListener('click', (e) => e.stopPropagation());
    });

    document.addEventListener('click', closeNotifPanel);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeNotifPanel();
    });

    window.addEventListener('storage', (e) => {
        if (e.key === CM_NOTIF_KEY) checkNewNotifications();
    });

    setInterval(checkNewNotifications, 30000);
    window.addEventListener('focus', checkNewNotifications);
}

function closeNotifPanel() {
    const panelIds = [
        'citizenNotifPanel',
        'citizenNotifPanelEvents'
    ];

    const buttonIds = [
        'citizenNotifBtn',
        'citizenNotifBtnEvents'
    ];

    panelIds.forEach(id => {
        const panel = document.getElementById(id);
        if (panel) panel.hidden = true;
    });

    buttonIds.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.setAttribute('aria-expanded', 'false');
    });
}

function checkNewNotifications() {
    const list = getNotifications();
    const fresh = list.filter(n => !knownNotifIds.has(n.id));

    knownNotifIds = new Set(list.map(n => n.id));

    updateNotifBadge();

    const panels = [
        document.getElementById('citizenNotifPanel'),
        document.getElementById('citizenNotifPanelEvents')
    ];

    panels.forEach(panel => {
        if (panel && !panel.hidden) {
            renderNotifPanel(panel.id);
        }
    });

    fresh.slice(0, 3).reverse().forEach(n => {
        showCitizenToast(
            `${notifLabel(n.status)}: ${n.title}`,
            'info',
            'New Notification'
        );

        cmDesktopNotify(
            `CheckMate: ${notifLabel(n.status)}`,
            `${n.title}${n.date ? ' • ' + formatEventDate(n.date) : ''}`,
            `checkmate-${n.id}`,
            () => openNotification(n.id)
        );
    });
}

function renderNotifPanel(panelId = 'citizenNotifPanel') {
    const panel = document.getElementById(panelId);
    if (!panel) return;

    const notifications = getNotifications();
    const read = new Set(getReadNotifIds());
    const hasUnread = notifications.some(n => !read.has(n.id));

    let desktopBanner = '';

    if (cmDesktopSupported()) {
        if (Notification.permission === 'default') {
            desktopBanner = `
                <div class="notif-desktop-banner">
                    <span>Get alerts on your laptop, even when this tab is in the background.</span>
                    <button type="button" onclick="requestDesktopAlerts()">Enable</button>
                </div>`;
        } else if (Notification.permission === 'denied') {
            desktopBanner = `
                <div class="notif-desktop-banner blocked">
                    <span>Laptop alerts are blocked. Allow notifications for this site in your browser settings.</span>
                </div>`;
        }
    }

    panel.innerHTML = `
        <div class="notif-panel-head">
            <h4>Notifications</h4>
            <button type="button" class="notif-markall" onclick="markAllNotificationsRead()"
                    ${hasUnread ? '' : 'disabled'}>Mark all as read</button>
        </div>

        ${desktopBanner}

        <div class="notif-panel-list">
            ${notifications.length === 0 ? `
                <div class="notif-panel-empty">
                    <i class="bx bx-bell"></i>
                    <p>You're all caught up.</p>
                </div>
            ` : notifications.map(n => `
                <button type="button"
                        class="notif-entry ${read.has(n.id) ? '' : 'unread'}"
                        onclick="openNotification('${escapeHTML(n.id)}')">
                    <span class="notif-entry-icon"><i class="bx bx-calendar-event"></i></span>
                    <span class="notif-entry-text">
                        <em>${escapeHTML(notifLabel(n.status))}</em>
                        <strong>${escapeHTML(n.title)}</strong>
                        <small>${escapeHTML(formatEventDate(n.date))}${n.location ? ' • ' + escapeHTML(n.location) : ''}</small>
                        <time>${escapeHTML(timeAgo(n.sentAt))}</time>
                    </span>
                </button>
            `).join('')}
        </div>
    `;
}

window.requestDesktopAlerts = function () {
    cmRequestDesktopPermission().then(permission => {
        renderNotifPanel('citizenNotifPanel');
        renderNotifPanel('citizenNotifPanelEvents');

        if (permission === 'granted') {
            cmDesktopNotify(
                'Laptop alerts enabled',
                'You will now get CheckMate notifications on this device.',
                'checkmate-enabled'
            );
        }
    });
};

window.markAllNotificationsRead = function () {
    saveReadNotifIds(getNotifications().map(n => n.id));

    updateNotifBadge();

    renderNotifPanel('citizenNotifPanel');
    renderNotifPanel('citizenNotifPanelEvents');
};

window.openNotification = function (id) {
    const notification = getNotifications().find(n => String(n.id) === String(id));
    if (!notification) return;

    const read = new Set(getReadNotifIds());
    read.add(notification.id);
    saveReadNotifIds([...read]);

    updateNotifBadge();
    closeNotifPanel();

    const event = getCitizenEvents().find(e => String(e.id) === String(notification.eventId));

    if (!event) {
        showCitizenToast('This event is no longer available.', 'warning', 'Event not found');
        return;
    }

    openEventDetails(event.id);
};


/* ------------- TOAST ------------ */
function showCitizenToast(message, type = 'info', title = '') {
    let container = document.querySelector('.cm-toast-container');

    if (!container) {
        container = document.createElement('div');
        container.className = 'cm-toast-container';
        document.body.appendChild(container);
    }

    const settings = {
        success: { icon: 'bx-check-circle', title: title || 'Success' },
        error: { icon: 'bx-x-circle', title: title || 'Something went wrong' },
        warning: { icon: 'bx-error-circle', title: title || 'Warning' },
        info: { icon: 'bx-bell', title: title || 'Information' }
    };

    const config = settings[type] || settings.info;
    const toast = document.createElement('div');

    toast.className = `cm-toast ${type}`;
    toast.innerHTML = `
        <i class="bx ${config.icon} cm-toast-icon"></i>
        <div class="cm-toast-content">
            <strong>${escapeHTML(config.title)}</strong>
            <p>${escapeHTML(message)}</p>
        </div>
        <button type="button" class="cm-toast-close" aria-label="Close notification">&times;</button>
    `;

    container.appendChild(toast);

    let removed = false;

    function removeToast() {
        if (removed) return;
        removed = true;
        toast.classList.add('cm-toast-out');
        setTimeout(() => toast.remove(), 250);
    }

    toast.querySelector('.cm-toast-close').addEventListener('click', removeToast);
    setTimeout(removeToast, 5000);
}


/* ==========================================================================
   DESKTOP (LAPTOP) NOTIFICATIONS
   Uses the browser's Notification API. Needs one-time permission, and the
   page must be served from https:// or http://localhost (not file://).
   ========================================================================== */
function cmDesktopSupported() {
    return 'Notification' in window;
}

function cmDesktopNotify(title, body, tag, onClick) {
    if (!cmDesktopSupported() || Notification.permission !== 'granted') return;

    try {
        const n = new Notification(title, {
            body,
            tag,
            icon: '../img/CMicon.png'
        });

        n.onclick = () => {
            window.focus();
            n.close();
            if (typeof onClick === 'function') onClick();
        };
    } catch (err) {
        // Some browsers only allow notifications through a service worker
    }
}

function cmRequestDesktopPermission() {
    if (!cmDesktopSupported() || Notification.permission !== 'default') {
        return Promise.resolve(cmDesktopSupported() ? Notification.permission : 'unsupported');
    }

    return Notification.requestPermission();
}