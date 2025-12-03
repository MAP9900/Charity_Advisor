const BACKEND_BASE_URL = 'http://localhost:8000';
const FEATURED_ENDPOINT = `${BACKEND_BASE_URL}/featured`;

const featuredSection = document.getElementById('featured-section');
const featuredMessage = document.getElementById('featured-message');
const carouselTrack = document.getElementById('carousel-track');
const featuredFallback = document.getElementById('featured-fallback');
const prevButton = document.getElementById('carousel-prev');
const nextButton = document.getElementById('carousel-next');
let carouselViewport = null;

let featuredCharities = [];
let autoScrollInterval = null;
let currentOffset = 0;

function truncate(text = '', max = 220) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function clearAutoScroll() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }
}

function adjustOffset(delta) {
  if (!carouselTrack || !carouselViewport) return;
  const totalWidth = carouselTrack.scrollWidth;
  const viewportWidth = carouselViewport.clientWidth;
  const contentWidth = Math.max(totalWidth / 2, viewportWidth);
  if (contentWidth <= viewportWidth) {
    carouselTrack.style.transform = 'translateX(0)';
    return;
  }

  currentOffset += delta;
  if (currentOffset >= contentWidth) {
    currentOffset -= contentWidth;
  } else if (currentOffset < 0) {
    currentOffset += contentWidth;
  }
  carouselTrack.style.transform = `translateX(-${currentOffset}px)`;
}

function renderFeaturedCards(charities) {
  if (!carouselTrack) return;
  carouselTrack.innerHTML = '';

  const cards = charities.map((charity) => {
    const card = document.createElement('article');
    card.className = 'charity-card';

    const title = document.createElement('h3');
    const displayName = charity.name || 'Unknown charity';
    const primaryLink = charity.websiteUrl || charity.profileUrl;
    if (primaryLink) {
      const link = document.createElement('a');
      link.href = primaryLink;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = displayName;
      title.appendChild(link);
    } else {
      title.textContent = displayName;
    }
    card.appendChild(title);

    const meta = document.createElement('p');
    meta.className = 'charity-meta';
    const metaBits = [];
    if (charity.location) metaBits.push(charity.location);
    if (charity.nteeCode) metaBits.push(charity.nteeCode);
    meta.textContent = metaBits.join(' • ');
    card.appendChild(meta);

    if (charity.description) {
      const desc = document.createElement('p');
      desc.className = 'charity-description';
      desc.textContent = truncate(charity.description);
      card.appendChild(desc);
    }

    if (charity.websiteUrl) {
      const website = document.createElement('a');
      website.className = 'charity-website-link';
      website.href = charity.websiteUrl;
      website.target = '_blank';
      website.rel = 'noopener noreferrer';
      website.textContent = 'Visit website';
      card.appendChild(website);
    }

    return card;
  });

  cards.forEach((card) => carouselTrack.appendChild(card));
  // Duplicate cards for smooth looping
  cards.forEach((card) => {
    carouselTrack.appendChild(card.cloneNode(true));
  });
}

function startAutoScroll(resetOffset = true) {
  clearAutoScroll();
  if (!carouselViewport || !carouselTrack) return;

  if (resetOffset) {
    currentOffset = 0;
    carouselTrack.style.transform = 'translateX(0)';
  }
  const speed = 0.5; // pixels per tick

  autoScrollInterval = setInterval(() => {
    adjustOffset(speed);
  }, 30);
}

async function loadFeaturedCharities() {
  if (featuredFallback) {
    featuredFallback.classList.remove('hidden');
    featuredFallback.textContent = 'Loading featured charities…';
  }
  if (featuredMessage) {
    featuredMessage.textContent = '';
  }

  try {
    const response = await fetch(FEATURED_ENDPOINT);
    if (!response.ok) {
      throw new Error('Failed to fetch featured charities.');
    }
    const data = await response.json();
    featuredCharities = Array.isArray(data?.charities) ? data.charities : [];

    if (!featuredCharities.length) {
      if (featuredMessage) {
        featuredMessage.textContent = 'No featured charities available today. Please check back tomorrow.';
      }
      if (featuredFallback) {
        featuredFallback.classList.add('hidden');
      }
      return;
    }

    if (featuredMessage) {
      featuredMessage.textContent = `Discover ${featuredCharities.length} featured charities for today.`;
    }
    if (featuredFallback) {
      featuredFallback.classList.add('hidden');
    }

    renderFeaturedCards(featuredCharities);
    startAutoScroll(true);
  } catch (error) {
    console.error('Error loading featured charities:', error);
    if (featuredMessage) {
      featuredMessage.textContent = 'Sorry, we could not load featured charities right now.';
    }
    if (featuredFallback) {
      featuredFallback.classList.add('hidden');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  carouselViewport = document.querySelector('.carousel-viewport');
  if (prevButton) {
    prevButton.addEventListener('click', () => adjustOffset(-340));
  }
  if (nextButton) {
    nextButton.addEventListener('click', () => adjustOffset(340));
  }
  loadFeaturedCharities();
});
