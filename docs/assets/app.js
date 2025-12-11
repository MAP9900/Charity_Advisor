import { apiFetch } from './client.js';

export function renderCharityCard(charity) {
  const card = document.createElement('article');
  card.className = 'card';
  card.setAttribute('role', 'listitem');

  const title = document.createElement('h3');
  title.textContent = charity.name;
  card.appendChild(title);

  if (charity.summary) {
    const summary = document.createElement('p');
    summary.textContent = charity.summary;
    card.appendChild(summary);
  }

  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent = formatLocation(charity.location);
  card.appendChild(meta);

  if (charity.url) {
    const link = document.createElement('a');
    link.href = charity.url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.className = 'button secondary';
    link.textContent = 'Explore organization';
    link.style.marginTop = '12px';
    card.appendChild(link);
  }

  return card;
}

function formatLocation(location) {
  if (!location) return 'Location not provided';
  return Array.isArray(location) ? location.join(', ') : location;
}

export function setLiveMessage(element, message) {
  if (!element) return;
  if (!message) {
    element.hidden = true;
    element.textContent = '';
    return;
  }
  element.hidden = false;
  element.textContent = message;
}

function initSmoothScroll() {
  document.querySelectorAll('[data-scroll]').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.scroll);
      target?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

async function loadDailyPicks() {
  const container = document.getElementById('daily-picks');
  if (!container) return;
  const errorEl = document.getElementById('daily-error');
  container.setAttribute('aria-busy', 'true');
  container.textContent = '';

  try {
    const data = await apiFetch('/api/daily-picks?limit=3');
    const charities = data.charities ?? [];
    charities.forEach((charity) => container.appendChild(renderCharityCard(charity)));
    if (!charities.length) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = 'No picks available right now. Please check back soon.';
      container.appendChild(empty);
    }
    setLiveMessage(errorEl, '');
  } catch (error) {
    console.error(error);
    setLiveMessage(errorEl, 'Unable to load today\'s picks. Please try again later.');
  } finally {
    container.setAttribute('aria-busy', 'false');
  }
}

function hydrateHome() {
  if (!document.getElementById('daily-picks')) return;
  initSmoothScroll();
  loadDailyPicks();
}

function onReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

onReady(hydrateHome);
