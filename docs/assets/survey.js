const BACKEND_BASE_URL = 'http://localhost:8000';
const PAGE_SIZE = 3;

let allCharities = [];
let visibleCount = 0;

let surveyForm;
let submitButton;
let resultsSection;
let resultsContainer;
let loadMoreBtn;
let errorMessage;
let resultsMessage;

const trimTrailingSlash = (url) => url.replace(/\/+$/, '');

function cloneSubmitButton(button) {
  if (!button || !button.parentNode) return button;
  const replacement = button.cloneNode(true);
  button.parentNode.replaceChild(replacement, button);
  return replacement;
}

function normalizeLocationValue(value) {
  if (!value) return 'any';
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'any' || trimmed.toLowerCase() === "doesnt_matter") {
    return 'any';
  }
  if (trimmed.length === 2 && /^[a-z]{2}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  return 'any';
}

function setLoadingState(isLoading) {
  if (!submitButton) return;
  const originalText = submitButton.dataset.originalText || submitButton.textContent || 'Get results';
  if (!submitButton.dataset.originalText) {
    submitButton.dataset.originalText = originalText;
  }
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? 'Loading…' : submitButton.dataset.originalText;
}

function clearError() {
  if (!errorMessage) return;
  errorMessage.textContent = '';
  errorMessage.classList.add('hidden');
}

function showError(message) {
  if (!errorMessage) return;
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
}

function resetResultsUI() {
  allCharities = [];
  visibleCount = 0;
  if (resultsContainer) {
    resultsContainer.innerHTML = '';
  }
  if (resultsMessage) {
    resultsMessage.textContent = '';
  }
  if (loadMoreBtn) {
    loadMoreBtn.classList.add('hidden');
  }
  if (resultsSection) {
    resultsSection.classList.add('hidden');
  }
}

function getSurveyValues() {
  let genericCode = '';
  let locationValue = 'any';

  if (typeof window.collectAnswers === 'function') {
    const { answers, error } = window.collectAnswers();
    if (error) {
      throw new Error(error);
    }
    genericCode = answers?.question_3?.value || '';
    locationValue = answers?.question_4?.value || 'any';
  } else {
    const genericInput = document.querySelector('#generic-code');
    const locationInput = document.querySelector('#location');
    genericCode = genericInput ? genericInput.value.trim() : '';
    locationValue = locationInput ? locationInput.value.trim() : 'any';
  }

  return {
    genericCode,
    location: normalizeLocationValue(locationValue),
  };
}

function createCharityCard(charity) {
  const card = document.createElement('article');
  card.className = 'charity-card';

  const title = document.createElement('h3');
  const name = charity.name || 'Unknown charity';
  if (charity.profileUrl) {
    const link = document.createElement('a');
    link.href = charity.profileUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = name;
    title.appendChild(link);
  } else {
    title.textContent = name;
  }
  card.appendChild(title);

  const meta = document.createElement('p');
  meta.className = 'charity-meta';
  const bits = [];
  if (charity.location) bits.push(charity.location);
  if (charity.nteeCode) bits.push(charity.nteeCode);
  meta.textContent = bits.join(' • ');
  card.appendChild(meta);

  const desc = document.createElement('p');
  desc.className = 'charity-description';
  const fullDescription = charity.description || 'No description available.';
  desc.textContent = fullDescription.length > 300 ? `${fullDescription.slice(0, 300)}…` : fullDescription;
  card.appendChild(desc);

  if (charity.websiteUrl) {
    const websiteLink = document.createElement('a');
    websiteLink.href = charity.websiteUrl;
    websiteLink.target = '_blank';
    websiteLink.rel = 'noopener noreferrer';
    websiteLink.textContent = 'Visit website';
    websiteLink.className = 'charity-website-link';
    card.appendChild(websiteLink);
  }

  return card;
}

function renderResults() {
  if (!resultsContainer || !resultsSection) return;

  resultsContainer.innerHTML = '';
  const toShow = allCharities.slice(0, visibleCount);
  toShow.forEach((charity) => {
    resultsContainer.appendChild(createCharityCard(charity));
  });

  if (!toShow.length) {
    if (resultsMessage) {
      resultsMessage.textContent = 'No charities to show yet.';
    }
    if (loadMoreBtn) {
      loadMoreBtn.classList.add('hidden');
    }
    return;
  }

  if (loadMoreBtn) {
    if (visibleCount >= allCharities.length) {
      loadMoreBtn.classList.add('hidden');
    } else {
      loadMoreBtn.classList.remove('hidden');
    }
  }

  if (resultsMessage) {
    resultsMessage.textContent = `Showing ${Math.min(visibleCount, allCharities.length)} of ${allCharities.length} charities.`;
  }
  resultsSection.classList.remove('hidden');
}

function handleLoadMore() {
  visibleCount = Math.min(visibleCount + PAGE_SIZE, allCharities.length);
  renderResults();
}

async function handleSurveySubmit(event) {
  event.preventDefault();
  clearError();
  resetResultsUI();

  let surveyValues;
  try {
    surveyValues = getSurveyValues();
  } catch (err) {
    showError(err.message || 'Please complete the required questions before submitting.');
    return;
  }

  const { genericCode, location } = surveyValues;
  if (!genericCode) {
    showError('Please choose a focus for question 3.');
    return;
  }

  setLoadingState(true);
  if (resultsSection) {
    resultsSection.classList.remove('hidden');
  }
  if (resultsMessage) {
    resultsMessage.textContent = 'Fetching charity recommendations…';
  }

  try {
    const endpoint = `${trimTrailingSlash(BACKEND_BASE_URL)}/recommend`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ generic_code: genericCode, location }),
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      // Ignore JSON parse errors; handled below.
    }

    if (!response.ok) {
      const detail = data?.detail || 'Unable to fetch recommendations.';
      throw new Error(detail);
    }

    allCharities = Array.isArray(data?.charities) ? data.charities : [];
    if (!allCharities.length) {
      if (resultsMessage) {
        resultsMessage.textContent = 'No charities matched your answers. Try adjusting your selections.';
      }
      if (loadMoreBtn) {
        loadMoreBtn.classList.add('hidden');
      }
      return;
    }

    visibleCount = Math.min(PAGE_SIZE, allCharities.length);
    renderResults();
  } catch (error) {
    console.error(error);
    showError(error.message || 'Sorry, we could not load recommendations right now. Please try again later.');
    if (resultsSection) {
      resultsSection.classList.add('hidden');
    }
  } finally {
    setLoadingState(false);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  surveyForm = document.getElementById('survey-form');
  submitButton = cloneSubmitButton(document.getElementById('submit-survey'));
  if (!submitButton) {
    submitButton = document.getElementById('submit-survey');
  }
  resultsSection = document.getElementById('results-section');
  resultsContainer = document.getElementById('results-container');
  loadMoreBtn = document.getElementById('load-more-btn');
  errorMessage = document.getElementById('error-message');
  resultsMessage = document.getElementById('results-message');

  if (surveyForm) {
    surveyForm.addEventListener('submit', handleSurveySubmit);
  }
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', handleLoadMore);
  }
});
