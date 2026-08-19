  // ---------- Nav shadow on scroll ----------
  const navEl = document.querySelector('header.nav');
  window.addEventListener('scroll', () => {
    navEl.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });

  // ---------- Dark mode (all-or-nothing) ----------
  const root = document.documentElement;
  const toggleBtn = document.getElementById('themeToggle');
  function applyTheme(dark) {
    root.classList.toggle('dark', dark);
    toggleBtn.textContent = dark ? '☀' : '☾';
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark);
  toggleBtn.addEventListener('click', () => applyTheme(!root.classList.contains('dark')));

  // ---------- Hero signature demo: type "/" -> menu -> insert block ----------
  const typedTextEl = document.getElementById('typedText');
  const slashMenu = document.getElementById('slashMenu');
  const sandbox = document.getElementById('editorSandbox');
  const sandboxCanvas = document.getElementById('sandboxCanvas');
  const demoStatus = document.getElementById('demoStatus');
  const slashItems = () => Array.from(document.querySelectorAll('.slash-item'));

  let isUserActive = false;
  let idleTimer = null;
  let selectedMenuIndex = 0;
  let isMenuOpen = false;

  function setStatus(userActive) {
    isUserActive = userActive;
    if (userActive) {
      demoStatus.textContent = 'INTERACTIVE';
      demoStatus.classList.add('interactive');
      const instructions = document.getElementById('sandboxInstructions');
      if (instructions) instructions.style.opacity = '0.2';
    } else {
      demoStatus.textContent = 'AUTOPLAY';
      demoStatus.classList.remove('interactive');
      const instructions = document.getElementById('sandboxInstructions');
      if (instructions) instructions.style.opacity = '1';
    }
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      setStatus(false);
    }, 8000); // 8 seconds of inactivity will resume autoplay
  }

  async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function runDemoLoop() {
    while (true) {
      if (isUserActive) {
        await sleep(1000);
        continue;
      }
      
      // reset
      if (sandboxCanvas) sandboxCanvas.innerHTML = '';
      if (typedTextEl) typedTextEl.textContent = '';
      if (slashMenu) slashMenu.classList.remove('show');
      isMenuOpen = false;
      slashItems().forEach(i => i.classList.remove('active'));
      if (slashItems()[0]) slashItems()[0].classList.add('active');
      selectedMenuIndex = 0;
      
      if (isUserActive) continue;
      await sleep(1200);

      // type "/"
      if (isUserActive) continue;
      if (typedTextEl) typedTextEl.textContent = '/';
      await sleep(350);
      
      if (isUserActive) continue;
      isMenuOpen = true;
      if (slashMenu) slashMenu.classList.add('show');
      await sleep(650);

      // cycle highlight through items
      const order = [0, 1, 2, 1];
      for (const idx of order) {
        if (isUserActive) break;
        slashItems().forEach(i => i.classList.remove('active'));
        if (slashItems()[idx]) {
          slashItems()[idx].classList.add('active');
          selectedMenuIndex = idx;
        }
        await sleep(420);
      }
      if (isUserActive) continue;
      await sleep(300);

      // "select" checklist item -> insert
      if (isUserActive) continue;
      if (slashMenu) slashMenu.classList.remove('show');
      isMenuOpen = false;
      if (typedTextEl) typedTextEl.textContent = '';
      
      insertSandboxBlock('checklist', 'Draft press outreach list');

      if (isUserActive) continue;
      await sleep(1500);

      // type another "/"
      if (isUserActive) continue;
      if (typedTextEl) typedTextEl.textContent = '/';
      await sleep(350);

      if (isUserActive) continue;
      isMenuOpen = true;
      if (slashMenu) slashMenu.classList.add('show');
      slashItems().forEach(i => i.classList.remove('active'));
      if (slashItems()[3]) {
        slashItems()[3].classList.add('active');
        selectedMenuIndex = 3;
      }
      await sleep(600);

      if (isUserActive) continue;
      if (slashMenu) slashMenu.classList.remove('show');
      isMenuOpen = false;
      if (typedTextEl) typedTextEl.textContent = '';

      insertSandboxBlock('callout', '📌 Legal review is required before outreach.');

      if (isUserActive) continue;
      await sleep(3500);
    }
  }

  function insertSandboxBlock(type, text) {
    if (!sandboxCanvas) return;
    const block = document.createElement('div');
    block.className = 'sandbox-block';
    
    if (type === 'heading') {
      block.innerHTML = `<h4 style="font-family:'Newsreader',serif; font-weight:600; font-size:18px; margin: 8px 0 4px; outline:none;" contenteditable="true" spellcheck="false">${text}</h4>`;
    } else if (type === 'checklist') {
      block.className = 'sandbox-block check-row';
      block.innerHTML = `
        <span class="checkbox"></span>
        <span class="label" contenteditable="true" spellcheck="false">${text}</span>
      `;
      const checkbox = block.querySelector('.checkbox');
      checkbox.addEventListener('click', () => {
        checkbox.classList.toggle('checked');
        block.classList.toggle('done');
        checkbox.textContent = checkbox.classList.contains('checked') ? '✓' : '';
      });
    } else if (type === 'table') {
      block.innerHTML = `
        <table class="mini-table" style="margin-top:6px;">
          <tr><th contenteditable="true">Item</th><th contenteditable="true">Status</th></tr>
          <tr><td contenteditable="true">Task A</td><td contenteditable="true">Done</td></tr>
          <tr><td contenteditable="true">Task B</td><td contenteditable="true">In progress</td></tr>
        </table>
      `;
    } else if (type === 'callout') {
      block.className = 'sandbox-block callout';
      block.setAttribute('contenteditable', 'true');
      block.setAttribute('spellcheck', 'false');
      block.style.outline = 'none';
      block.textContent = text;
    } else {
      // standard text
      block.innerHTML = `<p style="margin:4px 0; font-size:15px; outline:none;" contenteditable="true" spellcheck="false">${text}</p>`;
    }
    
    sandboxCanvas.appendChild(block);
    // Auto scroll to bottom
    const demoBody = sandbox.querySelector('.demo-body');
    if (demoBody) demoBody.scrollTop = demoBody.scrollHeight;
  }

  function updateSlashMenuHighlight() {
    const items = slashItems();
    items.forEach(i => i.classList.remove('active'));
    if (items[selectedMenuIndex]) {
      items[selectedMenuIndex].classList.add('active');
    }
  }

  function openSlashMenu() {
    isMenuOpen = true;
    if (slashMenu) slashMenu.classList.add('show');
  }

  function closeSlashMenu() {
    isMenuOpen = false;
    if (slashMenu) slashMenu.classList.remove('show');
  }

  function selectSlashMenuItem(idx) {
    if (typedTextEl) typedTextEl.textContent = '';
    closeSlashMenu();
    
    if (idx === 0) {
      insertSandboxBlock('heading', 'New Heading');
    } else if (idx === 1) {
      insertSandboxBlock('checklist', 'New Checklist Item');
    } else if (idx === 2) {
      insertSandboxBlock('table', '');
    } else if (idx === 3) {
      insertSandboxBlock('callout', '📌 New Callout text...');
    }
  }

  // Event listener for sandbox keyboard capture
  if (sandbox) {
    sandbox.addEventListener('click', (e) => {
      if (e.target.closest('.checkbox') || e.target.closest('input') || e.target.closest('table') || e.target.closest('[contenteditable="true"]')) {
        // let the target handle clicks natively
        resetIdleTimer();
      } else {
        setStatus(true);
        resetIdleTimer();
      }
    });

    sandbox.addEventListener('keydown', (e) => {
      if (e.target.getAttribute('contenteditable') === 'true' || e.target.tagName === 'INPUT') {
        resetIdleTimer();
        return;
      }
      
      setStatus(true);
      resetIdleTimer();
      
      const key = e.key;
      
      if (isMenuOpen) {
        if (key === 'ArrowDown') {
          e.preventDefault();
          selectedMenuIndex = (selectedMenuIndex + 1) % 4;
          updateSlashMenuHighlight();
          return;
        } else if (key === 'ArrowUp') {
          e.preventDefault();
          selectedMenuIndex = (selectedMenuIndex - 1 + 4) % 4;
          updateSlashMenuHighlight();
          return;
        } else if (key === 'Enter') {
          e.preventDefault();
          selectSlashMenuItem(selectedMenuIndex);
          return;
        } else if (key === 'Escape') {
          e.preventDefault();
          closeSlashMenu();
          return;
        }
      }
      
      if (key === 'Enter') {
        e.preventDefault();
        const text = typedTextEl.textContent;
        if (text.trim() === '/') {
          openSlashMenu();
        } else if (text.length > 0) {
          insertSandboxBlock('text', text);
          typedTextEl.textContent = '';
        }
      } else if (key === 'Backspace') {
        e.preventDefault();
        const current = typedTextEl.textContent;
        if (current.length > 0) {
          typedTextEl.textContent = current.slice(0, -1);
          if (typedTextEl.textContent === '') {
            closeSlashMenu();
          }
        }
      } else if (key === '/') {
        e.preventDefault();
        typedTextEl.textContent += '/';
        openSlashMenu();
      } else if (key.length === 1) {
        e.preventDefault();
        typedTextEl.textContent += key;
      }
    });

    // Make slash menu items clickable
    document.querySelectorAll('.slash-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        setStatus(true);
        resetIdleTimer();
        const idx = parseInt(item.getAttribute('data-idx'));
        selectSlashMenuItem(idx);
      });
    });
  }

  // Start the automated loop
  runDemoLoop();


  // ---------- Showcase Interactivity ----------
  const showcaseChecklist = document.getElementById('showcaseChecklist');
  if (showcaseChecklist) {
    showcaseChecklist.addEventListener('click', (e) => {
      const checkbox = e.target.closest('.checkbox');
      if (checkbox) {
        const row = checkbox.parentElement;
        checkbox.classList.toggle('checked');
        row.classList.toggle('done');
        checkbox.textContent = checkbox.classList.contains('checked') ? '✓' : '';
      }
    });
  }

  // Properties Dropdowns
  const ownerBtn = document.getElementById('propOwnerBtn');
  const ownerDropdown = document.getElementById('propOwnerDropdown');
  const ownerVal = document.getElementById('propOwnerVal');
  
  const statusBtn = document.getElementById('propStatusBtn');
  const statusDropdown = document.getElementById('propStatusDropdown');
  const statusVal = document.getElementById('propStatusVal');
  
  const dueBtn = document.getElementById('propDueBtn');
  const dueDropdown = document.getElementById('propDueDropdown');
  const dueVal = document.getElementById('propDueVal');
  const dueInput = document.getElementById('propDueInput');
  
  function closeAllDropdowns() {
    if (ownerDropdown) ownerDropdown.classList.remove('show');
    if (statusDropdown) statusDropdown.classList.remove('show');
    if (dueDropdown) dueDropdown.classList.remove('show');
  }
  
  if (ownerBtn) {
    ownerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const show = ownerDropdown.classList.contains('show');
      closeAllDropdowns();
      if (!show) ownerDropdown.classList.add('show');
    });
  }
  
  if (ownerDropdown) {
    ownerDropdown.addEventListener('click', (e) => {
      const item = e.target.closest('.dropdown-item');
      if (item) {
        ownerVal.textContent = item.textContent;
        closeAllDropdowns();
      }
    });
  }
  
  if (statusBtn) {
    statusBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const show = statusDropdown.classList.contains('show');
      closeAllDropdowns();
      if (!show) statusDropdown.classList.add('show');
    });
  }
  
  if (statusDropdown) {
    statusDropdown.addEventListener('click', (e) => {
      const item = e.target.closest('.dropdown-item');
      if (item) {
        statusVal.textContent = item.textContent;
        // set status colors
        statusBtn.className = 'prop-pill';
        const status = item.getAttribute('data-status');
        statusBtn.classList.add('status-' + status);
        closeAllDropdowns();
      }
    });
    // Set initial status color class
    if (statusBtn) statusBtn.classList.add('status-in-progress');
  }
  
  if (dueBtn) {
    dueBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const show = dueDropdown.classList.contains('show');
      closeAllDropdowns();
      if (!show) {
        dueDropdown.classList.add('show');
        if (dueInput) dueInput.focus();
      }
    });
  }
  
  if (dueInput) {
    dueInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        dueVal.textContent = dueInput.value;
        closeAllDropdowns();
      }
    });
    dueInput.addEventListener('blur', () => {
      dueVal.textContent = dueInput.value;
    });
    dueInput.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
  
  document.addEventListener('click', () => {
    closeAllDropdowns();
  });

  // Table add row
  const addRowBtn = document.getElementById('addRowBtn');
  const showcaseTable = document.getElementById('showcaseTable');
  if (addRowBtn && showcaseTable) {
    addRowBtn.addEventListener('click', () => {
      const tbody = showcaseTable.querySelector('tbody');
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td contenteditable="true" spellcheck="false">New channel</td>
        <td contenteditable="true" spellcheck="false">-</td>
        <td contenteditable="true" spellcheck="false">Not started</td>
      `;
      tbody.appendChild(newRow);
      newRow.querySelector('td').focus();
    });
  }


  // ---------- Pricing Yearly Toggle Switch ----------
  const pricingToggle = document.getElementById('pricingToggle');
  const patronPrice = document.getElementById('patronPrice');
  const patronPeriod = document.getElementById('patronPeriod');
  
  if (pricingToggle) {
    pricingToggle.addEventListener('change', () => {
      if (pricingToggle.checked) {
        patronPrice.textContent = '$3.20';
        patronPeriod.textContent = 'billed yearly ($38/yr)';
      } else {
        patronPrice.textContent = '$4';
        patronPeriod.textContent = 'per month';
      }
    });
  }


  // ---------- Hero Mouse Move Parallax Glow ----------
  const hero = document.querySelector('.hero');
  if (hero) {
    const orb = document.createElement('div');
    orb.className = 'hero-glow-orb';
    hero.appendChild(orb);
    
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      hero.style.setProperty('--mouse-x', `${x}px`);
      hero.style.setProperty('--mouse-y', `${y}px`);
    });
  }


  // ---------- Scroll reveal ----------
  const revealEls = document.querySelectorAll('.feature-card, .honest-list li');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('reveal'), i * 70);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  // ---------- Easter egg: Konami code ----------
  const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let progress = 0;
  const eggColors = ['#2B4C7E', '#E8A93D', '#B8543F', '#15171A'];

  window.addEventListener('keydown', (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === konami[progress]) {
      progress++;
      if (progress === konami.length) {
        triggerEgg();
        progress = 0;
      }
    } else {
      progress = (key === konami[0]) ? 1 : 0;
    }
  });

  function triggerEgg() {
    const toast = document.getElementById('egg-toast');
    if (toast) {
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2600);
    }

    for (let i = 0; i < 24; i++) {
      setTimeout(() => {
        const b = document.createElement('div');
        b.className = 'egg-block';
        b.style.left = Math.random() * 100 + 'vw';
        b.style.background = eggColors[Math.floor(Math.random() * eggColors.length)];
        b.style.transform = `rotate(${Math.random()*360}deg)`;
        document.body.appendChild(b);
        const duration = 1800 + Math.random() * 1200;
        b.animate([
          { top: '-40px', transform: b.style.transform },
          { top: '110vh', transform: `rotate(${Math.random()*720}deg)` }
        ], { duration, easing: 'cubic-bezier(.4,0,.6,1)' });
        setTimeout(() => b.remove(), duration + 100);
      }, i * 60);
    }
  }
