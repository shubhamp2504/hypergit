/**
 * Git Surgery — Interactive Git Visualizer & Conflict Solver
 * Modern UI Engine & Visual Swimlane Controller
 */

// ==========================================================================
// 1. Audio Feedback Synthesizer (Web Audio API)
// ==========================================================================
class SoundFX {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx && typeof AudioContext !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  play(freq, type = 'sine', duration = 0.12, vol = 0.08) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio fails gracefully if user hasn't interacted with page
    }
  }

  click() { this.play(550, 'sine', 0.04, 0.05); }
  commit() {
    this.play(440, 'triangle', 0.1, 0.08);
    setTimeout(() => this.play(660, 'sine', 0.15, 0.08), 50);
  }
  success() {
    this.play(523.25, 'triangle', 0.1, 0.08); // C5
    setTimeout(() => this.play(659.25, 'triangle', 0.1, 0.08), 80); // E5
    setTimeout(() => this.play(783.99, 'sine', 0.22, 0.1), 160); // G5
  }
}

const sfx = new SoundFX();

// ==========================================================================
// 2. Scenario Data & Graph State
// ==========================================================================
const SCENARIOS = {
  'rebase-conflict': {
    badge: '⚠️ Merge Conflict Detected',
    badgeClass: 'dot-warn',
    heading: 'Two branches edited the exact same file (src/auth.ts) differently.',
    subheading: 'Git paused because it doesn\'t know which teammate\'s code is correct. Use the visual solver on the right or click below to resolve it.',
    primaryFixText: 'Fix Conflict with Smart Merge',
    lanes: [
      {
        name: 'main',
        color: '#38bdf8',
        commits: [
          { hash: 'a1b2c3d', msg: 'Initial repo setup & core server', author: 'Alex', time: '2h ago' },
          { hash: 'd4e5f6a', msg: 'feat(core): router & middleware baseline', author: 'Sam', time: '1h ago' },
          { hash: '7b8c9d0', msg: 'feat(auth): Redis token session caching', author: 'Taylor', time: '35m ago' }
        ]
      },
      {
        name: 'feature/auth',
        color: '#f472b6',
        commits: [
          { hash: 'e2f3a4b', msg: 'wip(auth): JWT token verification schema', author: 'You', time: '25m ago' },
          { hash: '9c8d7e6', msg: 'feat(auth): JWT secret rotation validator', author: 'You', time: '10m ago', isHead: true }
        ]
      }
    ],
    conflict: {
      file: 'src/auth.ts',
      status: 'unresolved',
      currentCode: `export const validateSession = (token: string) => {\n  // Direct JWT cryptographic verify\n  return jwt.verify(token, process.env.JWT_SECRET);\n};`,
      incomingCode: `export const validateSession = async (token: string) => {\n  // Fast Redis key-value cache lookup\n  const session = await redis.get(\`sess:\${token}\`);\n  return session ? JSON.parse(session) : null;\n};`,
      bothCode: `export const validateSession = async (token: string) => {\n  // 1. Check ultra-fast Redis cache first\n  const cached = await redis.get(\`sess:\${token}\`);\n  if (cached) return JSON.parse(cached);\n  // 2. Fallback to cryptographic JWT verify\n  return jwt.verify(token, process.env.JWT_SECRET);\n};`
    },
    commands: [
      { step: 1, cmd: 'git checkout feature/auth', note: 'Ensure you are on your working feature branch.' },
      { step: 2, cmd: 'git merge main', note: 'Git attempts to merge and stops at line 4 in src/auth.ts.' },
      { step: 3, cmd: 'git add src/auth.ts', note: 'Marks the conflict as resolved after you pick the code.' },
      { step: 4, cmd: 'git commit -m "Merge branch \'main\' (combined JWT + Redis)"', note: 'Creates clean merge commit!' }
    ]
  },

  'accidental-main': {
    badge: '🚨 Accidental Commit on Main',
    badgeClass: 'dot-danger',
    heading: 'You accidentally made an experimental commit directly on main instead of a feature branch.',
    subheading: 'No panic needed! You can effortlessly move that commit to a new branch and rewind main cleanly in seconds.',
    primaryFixText: 'Move Commit to Feature Branch',
    lanes: [
      {
        name: 'main',
        color: '#38bdf8',
        commits: [
          { hash: '1111111', msg: 'v1.0.0 Stable production release', author: 'DevLead', time: '3h ago' },
          { hash: '2222222', msg: 'chore: bump dependencies to latest', author: 'Bot', time: '2h ago' },
          { hash: '3333333', msg: '🔥 ACCIDENTAL: experimental web-socket streaming on main', author: 'You', time: '5m ago', isHead: true }
        ]
      }
    ],
    conflict: null,
    commands: [
      { step: 1, cmd: 'git branch feature/websocket-streaming', note: 'Saves your new commit safely onto a new branch name.' },
      { step: 2, cmd: 'git reset --hard HEAD~1', note: 'Rewinds local main back 1 commit to match origin/main.' },
      { step: 3, cmd: 'git checkout feature/websocket-streaming', note: 'Switches you over to continue work safely.' }
    ]
  },

  'squash-pr': {
    badge: '📦 4 Messy Commits Ready for PR',
    badgeClass: 'dot-purple',
    heading: 'Your branch has 4 WIP / typo commits. Clean them up into 1 atomic commit before opening your PR.',
    subheading: 'Squashing combines all intermediate steps into one single clean commit so your team\'s git history stays pristine.',
    primaryFixText: 'Squash 4 Commits into 1',
    lanes: [
      {
        name: 'main',
        color: '#38bdf8',
        commits: [
          { hash: 'a000001', msg: 'chore: baseline production setup', author: 'Team', time: '4h ago' }
        ]
      },
      {
        name: 'feature/payment',
        color: '#a855f7',
        commits: [
          { hash: 'b000002', msg: 'WIP payment integration', author: 'You', time: '2h ago' },
          { hash: 'b000003', msg: 'fix typo in stripe secret key', author: 'You', time: '1h ago' },
          { hash: 'b000004', msg: 'oops remove leftover console.log', author: 'You', time: '30m ago' },
          { hash: 'b000005', msg: 'it works now final webhook test', author: 'You', time: '5m ago', isHead: true }
        ]
      }
    ],
    conflict: null,
    squashItems: [
      { hash: 'b000002', action: 'pick', msg: 'WIP payment integration' },
      { hash: 'b000003', action: 'squash', msg: 'fix typo in stripe secret key' },
      { hash: 'b000004', action: 'squash', msg: 'oops remove leftover console.log' },
      { hash: 'b000005', action: 'squash', msg: 'it works now final webhook test' }
    ],
    commands: [
      { step: 1, cmd: 'git checkout feature/payment', note: 'Switch to feature branch.' },
      { step: 2, cmd: 'git reset --soft main', note: 'Rewinds commit history to main but keeps all your code changes in staging.' },
      { step: 3, cmd: 'git commit -m "feat(payment): integrate Stripe checkout with webhooks"', note: 'Creates one single clean atomic commit!' }
    ]
  },

  'reflog-rescue': {
    badge: '⏳ Reflog Time Travel',
    badgeClass: 'dot-cyan',
    heading: 'A dangerous `git reset --hard` wiped an unpushed commit from your branch!',
    subheading: 'Don\'t worry: Git never immediately deletes anything. The reflog keeps a record of every HEAD movement.',
    primaryFixText: 'Rescue Lost Commit from Reflog',
    lanes: [
      {
        name: 'main (after accidental reset)',
        color: '#38bdf8',
        commits: [
          { hash: '7770001', msg: 'Stable commit before dangerous reset', author: 'You', time: '1h ago', isHead: true }
        ]
      },
      {
        name: 'orphaned (in reflog memory)',
        color: '#64748b',
        commits: [
          { hash: '7770002', msg: '⚠️ Crucial lost work: cryptographic key generator', author: 'You', time: '20m ago' }
        ]
      }
    ],
    conflict: null,
    commands: [
      { step: 1, cmd: 'git reflog', note: 'Displays history: HEAD@{1} was commit 7770002 before reset.' },
      { step: 2, cmd: 'git branch rescue-branch 7770002', note: 'Creates a new branch pointing directly to the lost commit.' },
      { step: 3, cmd: 'git checkout rescue-branch', note: 'All lost code is instantly recovered!' }
    ]
  }
};

// ==========================================================================
// 3. UI App Controller
// ==========================================================================
class GitSurgeryApp {
  constructor() {
    this.currentScenarioKey = 'rebase-conflict';
    this.scenarioData = null;
    this.selectedCommit = null;

    this.initDOMElements();
    this.bindEvents();
    this.loadScenario('rebase-conflict');
  }

  initDOMElements() {
    // Top Nav
    this.missionTabs = document.querySelectorAll('.mission-tab');
    this.btnSoundToggle = document.getElementById('btnSoundToggle');
    this.sfxIconOn = document.getElementById('sfxIconOn');
    this.sfxIconOff = document.getElementById('sfxIconOff');
    this.btnOpenGuide = document.getElementById('btnOpenGuide');
    this.btnResetAll = document.getElementById('btnResetAll');
    this.guideDialog = document.getElementById('guideDialog');

    // Hero Banner
    this.situationBanner = document.getElementById('situationBanner');
    this.bannerBadge = document.getElementById('bannerBadge');
    this.bannerBadgeText = document.getElementById('bannerBadgeText');
    this.bannerHeading = document.getElementById('bannerHeading');
    this.bannerSubheading = document.getElementById('bannerSubheading');
    this.btnPrimaryFix = document.getElementById('btnPrimaryFix');
    this.btnPrimaryFixText = document.getElementById('btnPrimaryFixText');

    // Swimlane Tracks
    this.swimlaneTracks = document.getElementById('swimlaneTracks');

    // Conflict Resolver Card
    this.conflictCard = document.getElementById('conflictCard');
    this.diffContainer = document.getElementById('diffContainer');
    this.smartCombineBox = document.getElementById('smartCombineBox');
    this.resolvedResultBox = document.getElementById('resolvedResultBox');
    this.resolvedCodePreview = document.getElementById('resolvedCodePreview');
    this.statusPill = document.getElementById('statusPill');
    this.btnPickCurrent = document.getElementById('btnPickCurrent');
    this.btnPickIncoming = document.getElementById('btnPickIncoming');
    this.btnPickBoth = document.getElementById('btnPickBoth');

    // Rebase Card
    this.rebaseCard = document.getElementById('rebaseCard');
    this.rebaseStepperList = document.getElementById('rebaseStepperList');
    this.btnExecuteSquash = document.getElementById('btnExecuteSquash');

    // Terminal Assistant
    this.terminalFlow = document.getElementById('terminalFlow');
    this.btnCopyCommands = document.getElementById('btnCopyCommands');

    // Quick Bar
    this.inputCommitMsg = document.getElementById('inputCommitMsg');
    this.btnAddCommit = document.getElementById('btnAddCommit');
    this.btnBranchOut = document.getElementById('btnBranchOut');

    // Toast Container
    this.toastBox = document.getElementById('toastBox');
  }

  bindEvents() {
    // Mission Tabs
    this.missionTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        sfx.click();
        const scenario = tab.dataset.scenario;
        this.loadScenario(scenario);
      });
    });

    // Sound Toggle
    this.btnSoundToggle.addEventListener('click', () => {
      sfx.enabled = !sfx.enabled;
      this.sfxIconOn.classList.toggle('hidden', !sfx.enabled);
      this.sfxIconOff.classList.toggle('hidden', sfx.enabled);
      if (sfx.enabled) sfx.click();
    });

    // Guide Dialog
    this.btnOpenGuide.addEventListener('click', () => {
      sfx.click();
      this.guideDialog.showModal();
    });

    // Reset Scenario
    this.btnResetAll.addEventListener('click', () => {
      sfx.click();
      this.loadScenario(this.currentScenarioKey);
      this.showToast('Scenario reloaded to fresh state', 'info');
    });

    // Primary Fix CTA (Top Banner)
    this.btnPrimaryFix.addEventListener('click', () => {
      sfx.success();
      if (this.currentScenarioKey === 'rebase-conflict') {
        this.resolveConflict('both');
      } else if (this.currentScenarioKey === 'accidental-main') {
        this.fixAccidentalMain();
      } else if (this.currentScenarioKey === 'squash-pr') {
        this.executeSquash();
      } else if (this.currentScenarioKey === 'reflog-rescue') {
        this.executeReflogRescue();
      }
    });

    // Conflict Resolution Buttons
    this.btnPickCurrent.addEventListener('click', () => this.resolveConflict('current'));
    this.btnPickIncoming.addEventListener('click', () => this.resolveConflict('incoming'));
    this.btnPickBoth.addEventListener('click', () => this.resolveConflict('both'));

    // Squash Action
    this.btnExecuteSquash.addEventListener('click', () => this.executeSquash());

    // Copy Terminal Script
    this.btnCopyCommands.addEventListener('click', () => this.copyCommands());

    // Quick Injections
    this.btnAddCommit.addEventListener('click', () => this.injectCommit());
    this.btnBranchOut.addEventListener('click', () => this.injectBranch());

    // Dialog Light Dismiss Fallback
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      this.guideDialog.addEventListener('click', (e) => {
        if (e.target !== this.guideDialog) return;
        const rect = this.guideDialog.getBoundingClientRect();
        const inDialog = (
          rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX && e.clientX <= rect.left + rect.width
        );
        if (!inDialog) this.guideDialog.close();
      });
    }
  }

  loadScenario(scenarioKey) {
    this.currentScenarioKey = scenarioKey;
    // Deep clone scenario data so mutations don't dirty template
    this.scenarioData = JSON.parse(JSON.stringify(SCENARIOS[scenarioKey]));

    // Update Tab states
    this.missionTabs.forEach(t => {
      t.classList.toggle('active', t.dataset.scenario === scenarioKey);
    });

    // Update Hero Banner
    this.situationBanner.classList.remove('resolved');
    this.bannerBadgeText.textContent = this.scenarioData.badge;
    this.bannerHeading.textContent = this.scenarioData.heading;
    this.bannerSubheading.textContent = this.scenarioData.subheading;
    this.btnPrimaryFixText.textContent = this.scenarioData.primaryFixText;

    // Render Swimlane
    this.renderSwimlane();

    // Toggle Panels
    if (scenarioKey === 'rebase-conflict') {
      this.conflictCard.classList.remove('hidden');
      this.rebaseCard.classList.add('hidden');
      this.diffContainer.classList.remove('hidden');
      this.smartCombineBox.classList.remove('hidden');
      this.resolvedResultBox.classList.add('hidden');
      this.statusPill.className = 'status-pill status-unresolved';
      this.statusPill.textContent = 'Needs Decision';
    } else if (scenarioKey === 'squash-pr') {
      this.conflictCard.classList.add('hidden');
      this.rebaseCard.classList.remove('hidden');
      this.renderRebaseStepper();
    } else {
      this.conflictCard.classList.add('hidden');
      this.rebaseCard.classList.add('hidden');
    }

    // Render Terminal Assistant
    this.renderTerminalCommands(this.scenarioData.commands);
  }

  renderSwimlane() {
    this.swimlaneTracks.innerHTML = '';

    this.scenarioData.lanes.forEach(lane => {
      const laneRow = document.createElement('div');
      laneRow.className = 'branch-lane-row';

      // Header Bar for the lane
      const labelBar = document.createElement('div');
      labelBar.className = 'lane-label-bar';
      labelBar.innerHTML = `
        <span class="lane-name-badge" style="color: ${lane.color};">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>
          ${lane.name}
        </span>
        <span style="font-size: 0.7rem; color: var(--text-muted);">${lane.commits.length} commits</span>
      `;
      laneRow.appendChild(labelBar);

      // Commit Chain
      const chain = document.createElement('div');
      chain.className = 'commit-chain';

      lane.commits.forEach((c, idx) => {
        // Connector Arrow between commits
        if (idx > 0) {
          const arrow = document.createElement('div');
          arrow.className = 'node-connector-arrow';
          arrow.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
          chain.appendChild(arrow);
        }

        const card = document.createElement('div');
        card.className = `commit-node-card ${c.isHead ? 'is-head' : ''} ${this.selectedCommit === c.hash ? 'selected' : ''}`;
        card.innerHTML = `
          <div class="node-card-top">
            <span class="node-hash">${c.hash}</span>
            ${c.isHead ? '<span class="node-tag-head">HEAD</span>' : ''}
          </div>
          <div class="node-msg">${c.msg}</div>
          <div class="node-card-footer">
            <span class="node-author">
              <span class="author-dot"></span>
              ${c.author}
            </span>
            <span>${c.time}</span>
          </div>
        `;

        card.addEventListener('click', () => {
          sfx.click();
          this.selectedCommit = c.hash;
          this.renderSwimlane();
          this.showToast(`Selected commit ${c.hash}: "${c.msg}"`, 'info');
        });

        chain.appendChild(card);
      });

      laneRow.appendChild(chain);
      this.swimlaneTracks.appendChild(laneRow);
    });
  }

  resolveConflict(choice) {
    sfx.success();
    const conflict = this.scenarioData.conflict;
    if (!conflict) return;

    let code = '';
    let explanation = '';
    if (choice === 'current') {
      code = conflict.currentCode;
      explanation = 'Kept your branch\'s JWT cryptographic logic only.';
    } else if (choice === 'incoming') {
      code = conflict.incomingCode;
      explanation = 'Accepted teammate\'s Redis cache lookup only.';
    } else {
      code = conflict.bothCode;
      explanation = 'Combined: Redis cache first, with JWT cryptographic fallback.';
    }

    // Hide choices, show resolved block
    this.diffContainer.classList.add('hidden');
    this.smartCombineBox.classList.add('hidden');
    this.resolvedResultBox.classList.remove('hidden');
    this.resolvedCodePreview.textContent = code;

    this.statusPill.className = 'status-pill status-resolved';
    this.statusPill.textContent = 'Conflict Resolved ✓';

    this.situationBanner.classList.add('resolved');
    this.bannerBadgeText.textContent = '✓ Merge Successful';
    this.bannerHeading.textContent = `All conflicts in src/auth.ts are cleanly resolved (${explanation})`;
    this.bannerSubheading.textContent = 'The merge commit has been created and your working tree is 100% clean!';

    // Inject Merge Commit into swimlane
    const featureLane = this.scenarioData.lanes.find(l => l.name === 'feature/auth');
    if (featureLane) {
      featureLane.commits.forEach(c => c.isHead = false);
      featureLane.commits.push({
        hash: 'm3rg3d1',
        msg: `Merge branch 'main' into feature/auth (${explanation})`,
        author: 'You',
        time: 'just now',
        isHead: true
      });
      this.renderSwimlane();
    }

    // Update Terminal Flow
    this.renderTerminalCommands([
      { step: 1, cmd: 'git add src/auth.ts', note: 'Notifies Git the conflict is solved.' },
      { step: 2, cmd: `git commit -m "Merge branch 'main' (${explanation})"`, note: 'Creates the clean merge commit.' },
      { step: 3, cmd: 'git status', note: 'nothing to commit, working tree clean!' }
    ]);

    this.showToast('Conflict solved! Merge commit created.', 'success');
  }

  renderRebaseStepper() {
    this.rebaseStepperList.innerHTML = '';
    const items = this.scenarioData.squashItems || [];

    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'rebase-step-card';
      row.innerHTML = `
        <div class="rebase-step-left">
          <span class="rebase-badge ${item.action === 'pick' ? 'badge-pick' : 'badge-squash'}">${item.action}</span>
          <span class="node-hash">${item.hash}</span>
          <span class="rebase-step-msg">${item.msg}</span>
        </div>
        <span style="font-size: 0.7rem; color: var(--text-muted);">${item.action === 'pick' ? 'Base Commit' : 'Folds into base'}</span>
      `;
      this.rebaseStepperList.appendChild(row);
    });
  }

  executeSquash() {
    sfx.success();
    const lane = this.scenarioData.lanes.find(l => l.name === 'feature/payment');
    if (lane) {
      lane.commits = [
        {
          hash: 'sq99999',
          msg: 'feat(payment): integrate Stripe checkout with webhooks (squashed PR)',
          author: 'You',
          time: 'just now',
          isHead: true
        }
      ];
      this.renderSwimlane();
    }

    this.situationBanner.classList.add('resolved');
    this.bannerBadgeText.textContent = '✓ Squashed Cleanly';
    this.bannerHeading.textContent = '4 WIP commits squashed into 1 clean atomic commit!';
    this.bannerSubheading.textContent = 'Ready to open your GitHub Pull Request with a professional history.';

    this.renderTerminalCommands([
      { step: 1, cmd: 'git checkout feature/payment', note: 'Switch to feature branch.' },
      { step: 2, cmd: 'git reset --soft main', note: 'Folds intermediate history while keeping all code in staging.' },
      { step: 3, cmd: 'git commit -m "feat(payment): integrate Stripe checkout with webhooks"', note: 'Atomic single commit ready for PR.' },
      { step: 4, cmd: 'git push --force-with-lease origin feature/payment', note: 'Pushes cleanly to remote.' }
    ]);

    this.showToast('4 commits squashed into 1 atomic PR commit!', 'success');
  }

  fixAccidentalMain() {
    sfx.success();
    const mainLane = this.scenarioData.lanes.find(l => l.name === 'main');
    if (mainLane) {
      const movedCommit = mainLane.commits.pop();
      mainLane.commits[mainLane.commits.length - 1].isHead = true;

      this.scenarioData.lanes.push({
        name: 'feature/websocket-streaming',
        color: '#f43f5e',
        commits: [
          { ...movedCommit, isHead: true }
        ]
      });
      this.renderSwimlane();
    }

    this.situationBanner.classList.add('resolved');
    this.bannerBadgeText.textContent = '✓ Rescue Successful';
    this.bannerHeading.textContent = 'Commit moved to feature/websocket-streaming & main rewound cleanly!';
    this.bannerSubheading.textContent = 'Main branch is now 100% untouched and matches production.';

    this.renderTerminalCommands([
      { step: 1, cmd: 'git branch feature/websocket-streaming', note: 'Creates branch with your commit.' },
      { step: 2, cmd: 'git reset --hard HEAD~1', note: 'Rewinds main back 1 commit safely.' },
      { step: 3, cmd: 'git checkout feature/websocket-streaming', note: 'Continue working happily on your feature!' }
    ]);

    this.showToast('Main restored & feature branch created!', 'success');
  }

  executeReflogRescue() {
    sfx.success();
    this.scenarioData.lanes = [
      {
        name: 'main',
        color: '#38bdf8',
        commits: [
          { hash: '7770001', msg: 'Stable commit before dangerous reset', author: 'You', time: '1h ago' }
        ]
      },
      {
        name: 'rescue-branch (restored!)',
        color: '#10b981',
        commits: [
          { hash: '7770001', msg: 'Stable commit before dangerous reset', author: 'You', time: '1h ago' },
          { hash: '7770002', msg: '✨ Rescued: cryptographic key generator', author: 'You', time: 'just now', isHead: true }
        ]
      }
    ];
    this.renderSwimlane();

    this.situationBanner.classList.add('resolved');
    this.bannerBadgeText.textContent = '✓ Lost Commit Rescued';
    this.bannerHeading.textContent = 'Reflog successfully restored commit 7770002!';
    this.bannerSubheading.textContent = 'Branch rescue-branch created with all your cryptographic key work intact.';

    this.renderTerminalCommands([
      { step: 1, cmd: 'git reflog', note: 'Found orphaned commit 7770002 at HEAD@{1}.' },
      { step: 2, cmd: 'git branch rescue-branch 7770002', note: 'Spawns branch directly on the lost commit.' },
      { step: 3, cmd: 'git checkout rescue-branch', note: 'Work recovered! Zero data loss.' }
    ]);

    this.showToast('Reflog rescue completed with zero data loss!', 'success');
  }

  injectCommit() {
    const msg = this.inputCommitMsg.value.trim();
    if (!msg) return;
    sfx.commit();

    const targetLane = this.scenarioData.lanes[this.scenarioData.lanes.length - 1];
    targetLane.commits.forEach(c => c.isHead = false);

    const hash = 'c_' + Math.random().toString(16).substr(2, 6);
    targetLane.commits.push({
      hash,
      msg,
      author: 'You',
      time: 'just now',
      isHead: true
    });

    this.renderSwimlane();
    this.showToast(`Injected commit ${hash}!`, 'success');
  }

  injectBranch() {
    sfx.commit();
    const branchName = `experiment/vibe-${Math.floor(Math.random() * 100)}`;
    const mainLane = this.scenarioData.lanes[0];
    const baseCommit = mainLane.commits[mainLane.commits.length - 1];

    this.scenarioData.lanes.push({
      name: branchName,
      color: '#a855f7',
      commits: [
        {
          hash: 'br_' + Math.random().toString(16).substr(2, 6),
          msg: `Spawned ${branchName}`,
          author: 'You',
          time: 'just now',
          isHead: true
        }
      ]
    });

    this.renderSwimlane();
    this.showToast(`Spawned branch ${branchName}!`, 'success');
  }

  renderTerminalCommands(commands) {
    this.terminalFlow.innerHTML = '';
    commands.forEach(c => {
      const row = document.createElement('div');
      row.className = 'command-row';
      row.innerHTML = `
        <span class="step-circle">${c.step}</span>
        <div class="command-details">
          <span class="command-bash">$ ${c.cmd}</span>
          <span class="command-explain">${c.note}</span>
        </div>
      `;
      this.terminalFlow.appendChild(row);
    });
  }

  copyCommands() {
    const lines = Array.from(this.terminalFlow.querySelectorAll('.command-bash'))
      .map(el => el.textContent.replace('$ ', ''))
      .join('\n');

    navigator.clipboard.writeText(lines).then(() => {
      sfx.click();
      this.showToast('Copied safe command sequence to clipboard!', 'success');
    }).catch(() => {
      this.showToast('Failed to copy to clipboard', 'warn');
    });
  }

  showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    this.toastBox.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }
}

// Global App Initialization
window.addEventListener('DOMContentLoaded', () => {
  window.gitApp = new GitSurgeryApp();
});
