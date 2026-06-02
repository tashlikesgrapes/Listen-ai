console.log('Hello!');

document.addEventListener('DOMContentLoaded', () => {
  const page = document.getElementById('journalPage');
  if (!page) return;

  const STORAGE_KEY = 'listenAIJournalEntries';
  const entryText = document.getElementById('entryText');
  const moodSelect = document.getElementById('moodSelect');
  const entryDateLabel = document.getElementById('entryDate');
  const entriesList = document.getElementById('entriesList');
  const promptButtons = document.querySelectorAll('.prompt-button');
  const saveEntryButton = document.getElementById('saveEntryButton');
  const entryMessage = document.getElementById('entryMessage');

  const today = new Date();
  entryDateLabel.textContent = `Entry date: ${today.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })}`;

  const loadEntries = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error('Unable to load journal entries', error);
      return [];
    }
  };

  const saveEntries = (entries) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  };

  const formatShortDate = (iso) => new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const renderEntries = () => {
    const entries = loadEntries();

    if (entries.length === 0) {
      entriesList.innerHTML = '<p class="opacity-75">Your journal is empty. Save an entry to see it here.</p>';
      return;
    }

    entriesList.innerHTML = entries
      .map((entry, index) => `
        <article class="entry-card p-3 mb-3">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <div class="small opacity-75">${formatShortDate(entry.createdAt)}</div>
              <div class="fw-bold">${entry.mood}</div>
            </div>
            <button class="btn btn-sm btn-outline-light text-danger delete-entry" data-index="${index}" type="button">Delete</button>
          </div>
          <p class="opacity-75 mb-0">${entry.text.replace(/\n/g, '<br/>')}</p>
        </article>
      `)
      .join('');

    entriesList.querySelectorAll('.delete-entry').forEach((button) => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.index);
        const stored = loadEntries();
        stored.splice(index, 1);
        saveEntries(stored);
        renderEntries();
      });
    });
  };

  promptButtons.forEach((button) => {
    button.addEventListener('click', () => {
      entryText.value = button.textContent;
      entryText.focus();
    });
  });

  saveEntryButton.addEventListener('click', () => {
    const text = entryText.value.trim();
    if (!text) {
      entryMessage.textContent = 'Please write something before saving.';
      entryMessage.classList.remove('text-success');
      entryMessage.classList.add('text-warning');
      return;
    }

    const entries = loadEntries();
    entries.unshift({
      createdAt: new Date().toISOString(),
      mood: moodSelect.value,
      text,
    });

    saveEntries(entries.slice(0, 20));
    entryText.value = '';
    entryMessage.textContent = 'Entry saved locally.';
    entryMessage.classList.remove('text-warning');
    entryMessage.classList.add('text-success');
    renderEntries();

    setTimeout(() => {
      entryMessage.textContent = '';
    }, 3000);
  });

  renderEntries();
});
