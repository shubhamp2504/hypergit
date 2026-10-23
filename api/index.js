// Vercel Serverless Function: Cloud Mock & Real-Time Engine for HyperGit
// Ensures every /api/* route returns 200 OK with realistic Git responses on Vercel.

const MOCK_REPOS = {
  'hypergit': {
    name: '⚡ HyperGit Core Engine',
    path: 'hypergit',
    branch: 'main',
    isClean: false,
    stagedCount: 1,
    unstagedCount: 2,
    untrackedCount: 1,
    ahead: 1,
    behind: 0,
    stagedFiles: ['src/core/dag_engine.js'],
    unstagedFiles: ['src/ui/terminal.js', 'package.json'],
    untrackedFiles: ['debug_trace.log'],
    conflictedFiles: [],
    commits: [
      { id: 'c3', hash: '8e4f1a2', author: 'Shubham P.', time: '12m ago', msg: 'feat: add spatial commit visualization and doctor diagnostics', parents: ['c2'], branches: ['main'] },
      { id: 'c2', hash: '5b92c10', author: 'Shubham P.', time: '2 hours ago', msg: 'fix: optimize DAG layout algorithms for large branches', parents: ['c1'], branches: [] },
      { id: 'c1', hash: '1a09d3e', author: 'Team', time: '1 day ago', msg: 'chore: initial repository scaffolding', parents: [], branches: [] }
    ],
    branches: [
      { name: 'main', isCurrent: true, isRemote: false, upstream: 'origin/main', ahead: 1, behind: 0, lastCommit: '8e4f1a2' },
      { name: 'feature/spatial-zoom', isCurrent: false, isRemote: false, upstream: null, ahead: 0, behind: 0, lastCommit: '5b92c10' },
      { name: 'fix/reflog-parser', isCurrent: false, isRemote: false, upstream: null, ahead: 0, behind: 0, lastCommit: '1a09d3e' }
    ],
    stashes: [
      { index: 0, ref: 'stash@{0}', branch: 'main', msg: 'WIP on terminal autocomplete', time: '45m ago' }
    ],
    reflog: [
      { hash: '8e4f1a2', selector: 'HEAD@{0}', action: 'commit', message: 'feat: add spatial commit visualization', time: '12m ago' },
      { hash: '5b92c10', selector: 'HEAD@{1}', action: 'checkout', message: 'moving from feature/spatial-zoom to main', time: '1 hour ago' },
      { hash: '5b92c10', selector: 'HEAD@{2}', action: 'commit', message: 'fix: optimize DAG layout algorithms', time: '2 hours ago' },
      { hash: '1a09d3e', selector: 'HEAD@{3}', action: 'commit (initial)', message: 'chore: initial scaffolding', time: '1 day ago' }
    ],
    doctor: {
      score: 85,
      checks: [
        { id: 'uncommitted-changes', status: 'warn', title: 'Uncommitted Working Tree Files', desc: 'You have 2 unstaged and 1 untracked file. Consider committing or stashing.', repairAction: 'stage_and_commit', repairLabel: 'Stage & Commit All' },
        { id: 'branch-ahead', status: 'ok', title: 'Branch Tracking', desc: 'Active branch "main" is tracking origin/main with 1 unpushed commit.' },
        { id: 'git-lock', status: 'ok', title: 'Lock Files Clean', desc: 'No frozen .git/index.lock detected.' }
      ]
    }
  },
  'demo-conflict': {
    name: '⚔️ Auth Service (3-Way Merge Conflict)',
    path: 'demo-conflict',
    branch: 'feature/auth-refresh',
    isClean: false,
    stagedCount: 0,
    unstagedCount: 0,
    untrackedCount: 0,
    ahead: 2,
    behind: 1,
    stagedFiles: [],
    unstagedFiles: [],
    untrackedFiles: [],
    conflictedFiles: ['src/auth/jwt_service.js'],
    commits: [
      { id: 'c202', hash: 'f3a9012', author: 'Alex Dev', time: '1 hour ago', msg: 'feat: add RSA256 signature verification', parents: ['c200'], branches: ['feature/auth-refresh'] },
      { id: 'c201', hash: 'e9b1103', author: 'Colleague', time: '2 hours ago', msg: 'fix: update token expiration to 24h', parents: ['c200'], branches: [] },
      { id: 'c200', hash: '11a0b33', author: 'Team', time: '1 day ago', msg: 'feat: base authentication tokens', parents: [], branches: [] }
    ],
    branches: [
      { name: 'main', isCurrent: false, isRemote: false, upstream: 'origin/main', ahead: 0, behind: 0, lastCommit: 'e9b1103' },
      { name: 'feature/auth-refresh', isCurrent: true, isRemote: false, upstream: null, ahead: 2, behind: 1, lastCommit: 'f3a9012' }
    ],
    stashes: [],
    reflog: [
      { hash: 'f3a9012', selector: 'HEAD@{0}', action: 'merge main: conflict', message: 'conflict in src/auth/jwt_service.js', time: '10m ago' }
    ],
    conflict: {
      filePath: 'src/auth/jwt_service.js',
      currentCode: "const token = await generateJWT(user, { algorithm: 'RS256', expiresIn: '1h' });\nconsole.log('Token created securely for user:', user.id);",
      incomingCode: "const token = await createSecureSession(user, req.ip, { sessionTimeout: 86400 });\nawait auditLog.recordAuthEvent(user.id, 'session_start');"
    },
    doctor: {
      score: 45,
      checks: [
        { id: 'conflict', status: 'error', title: 'Unresolved Merge Conflict', desc: 'File src/auth/jwt_service.js has colliding edits. Use the 3-Way Conflict Resolver.', repairAction: 'resolve_conflict', repairLabel: 'Open 3-Way Resolver' }
      ]
    }
  },
  'demo-accident-main': {
    name: '🌿 Incident: Committed to Main by Mistake',
    path: 'demo-accident-main',
    branch: 'main',
    isClean: false,
    stagedCount: 1,
    unstagedCount: 1,
    untrackedCount: 0,
    ahead: 1,
    behind: 0,
    stagedFiles: ['src/payments/stripe.js'],
    unstagedFiles: ['config/secrets.env'],
    untrackedFiles: [],
    conflictedFiles: [],
    commits: [
      { id: 'cm1', hash: 'c81e9f0', author: 'Alex Dev', time: '15m ago', msg: 'fix: patch critical stripe webhook handler (accidentally on main!)', parents: ['cm0'], branches: ['main'] },
      { id: 'cm0', hash: 'a10b981', author: 'Team Lead', time: '3 days ago', msg: 'release: v2.1.0 stable release', parents: [], branches: [] }
    ],
    branches: [
      { name: 'main', isCurrent: true, isRemote: false, upstream: 'origin/main', ahead: 1, behind: 0, lastCommit: 'c81e9f0' }
    ],
    stashes: [],
    reflog: [
      { hash: 'c81e9f0', selector: 'HEAD@{0}', action: 'commit', message: 'fix: patch critical stripe webhook handler', time: '15m ago' }
    ],
    doctor: {
      score: 60,
      checks: [
        { id: 'unpushed-main', status: 'warn', title: 'Unpushed Commit on Protected Main', desc: 'Direct commits on main violate branch policies. Move to a new feature branch.', repairAction: 'move_to_new_branch', repairLabel: 'Move to Feature Branch' }
      ]
    }
  },
  'demo-locked': {
    name: '🔒 Incident: Frozen .git/index.lock',
    path: 'demo-locked',
    branch: 'feature/checkout',
    isClean: false,
    stagedCount: 0,
    unstagedCount: 2,
    untrackedCount: 0,
    ahead: 0,
    behind: 0,
    stagedFiles: [],
    unstagedFiles: ['src/cart.js', 'src/checkout.js'],
    untrackedFiles: [],
    conflictedFiles: [],
    commits: [
      { id: 'clk1', hash: '9b2c3d4', author: 'Alex Dev', time: '40m ago', msg: 'feat: add shipping estimate widget', parents: [], branches: ['feature/checkout'] }
    ],
    branches: [
      { name: 'feature/checkout', isCurrent: true, isRemote: false, upstream: null, ahead: 0, behind: 0, lastCommit: '9b2c3d4' }
    ],
    stashes: [],
    reflog: [],
    doctor: {
      score: 30,
      checks: [
        { id: 'index-lock', status: 'error', title: 'Corrupted .git/index.lock File', desc: 'An abandoned lock file is freezing all Git commands in this workspace.', repairAction: 'remove_lock', repairLabel: 'Remove Lock File' }
      ]
    }
  },
  'demo-squash': {
    name: '📦 Incident: 4 Messy WIP Commits',
    path: 'demo-squash',
    branch: 'feature/user-profile',
    isClean: true,
    stagedCount: 0,
    unstagedCount: 0,
    untrackedCount: 0,
    ahead: 4,
    behind: 0,
    stagedFiles: [],
    unstagedFiles: [],
    untrackedFiles: [],
    conflictedFiles: [],
    commits: [
      { id: 'sq4', hash: '44a1b2c', author: 'Alex Dev', time: '5m ago', msg: 'fix typo in profile avatar', parents: ['sq3'], branches: ['feature/user-profile'] },
      { id: 'sq3', hash: '33b2c3d', author: 'Alex Dev', time: '15m ago', msg: 'wip testing again', parents: ['sq2'], branches: [] },
      { id: 'sq2', hash: '22c3d4e', author: 'Alex Dev', time: '30m ago', msg: 'temp save profile styles', parents: ['sq1'], branches: [] },
      { id: 'sq1', hash: '11d4e5f', author: 'Alex Dev', time: '1 hour ago', msg: 'feat: add user profile page initial component', parents: [], branches: [] }
    ],
    branches: [
      { name: 'feature/user-profile', isCurrent: true, isRemote: false, upstream: null, ahead: 4, behind: 0, lastCommit: '44a1b2c' }
    ],
    stashes: [],
    reflog: [],
    doctor: {
      score: 70,
      checks: [
        { id: 'wip-commits', status: 'warn', title: 'Messy Commit History', desc: '4 small WIP commits detected. Consider squashing before merging to main.', repairAction: 'squash_wip', repairLabel: 'Squash Last 4 Commits' }
      ]
    }
  }
};

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const host = (req.headers && req.headers.host) ? req.headers.host : 'hypergit.vercel.app';
  const url = new URL(req.url, `https://${host}`);
  const pathname = url.pathname.replace(/^\/api/, '');
  const query = Object.fromEntries(url.searchParams.entries());
  const body = req.body || {};

  const repoKey = query.path || body.repoPath || body.path || 'hypergit';
  const repo = MOCK_REPOS[repoKey] || MOCK_REPOS['hypergit'];

  // ── /api/projects ──────────────────────────────────────────────────────────
  if (pathname === '/projects' || pathname === '') {
    return res.json(Object.values(MOCK_REPOS).map(r => ({
      name: r.name,
      path: r.path,
      branch: r.branch,
      isClean: r.isClean,
      stagedCount: r.stagedCount,
      unstagedCount: r.unstagedCount,
      untrackedCount: r.untrackedCount,
      ahead: r.ahead || 0,
      behind: r.behind || 0,
      isDemo: true
    })));
  }

  // ── /api/status ────────────────────────────────────────────────────────────
  if (pathname === '/status') {
    return res.json({
      branch: repo.branch,
      isClean: repo.isClean,
      stagedCount: repo.stagedCount,
      unstagedCount: repo.unstagedCount,
      untrackedCount: repo.untrackedCount,
      stagedFiles: repo.stagedFiles || [],
      unstagedFiles: repo.unstagedFiles || [],
      untrackedFiles: repo.untrackedFiles || [],
      conflictedFiles: repo.conflictedFiles || [],
      ahead: repo.ahead || 0,
      behind: repo.behind || 0,
      lastCommitHash: repo.commits[0] ? repo.commits[0].hash : '8e4f1a2',
      lastCommitMsg: repo.commits[0] ? repo.commits[0].msg : 'initial commit'
    });
  }

  // ── /api/commits ───────────────────────────────────────────────────────────
  if (pathname === '/commits') {
    return res.json(repo.commits || []);
  }

  // ── /api/branches — return flat array (client uses Array.isArray check) ────
  if (pathname === '/branches') {
    return res.json(repo.branches || []);
  }

  // ── /api/stashes ───────────────────────────────────────────────────────────
  if (pathname === '/stashes') {
    // Ensure every stash has a `summary` field (client falls back to msg/message)
    return res.json((repo.stashes || []).map(s => ({
      ...s,
      summary: s.summary || s.msg || s.message || 'WIP stash'
    })));
  }

  // ── /api/reflog ────────────────────────────────────────────────────────────
  if (pathname === '/reflog') {
    // Ensure every entry has `ref` + `selector` so renderReflogList is safe
    return res.json((repo.reflog || []).map(e => ({
      ...e,
      ref: e.ref || e.selector || 'HEAD',
      selector: e.selector || e.ref || 'HEAD'
    })));
  }

  // ── /api/doctor ────────────────────────────────────────────────────────────
  if (pathname === '/doctor') {
    return res.json(repo.doctor || { score: 90, checks: [] });
  }

  // ── /api/diff ──────────────────────────────────────────────────────────────
  if (pathname === '/diff') {
    const file = query.file || 'src/ui/terminal.js';
    if (repo.diffs && repo.diffs[file]) return res.json(repo.diffs[file]);
    return res.json({
      path: file,
      diff: `--- a/${file}\n+++ b/${file}\n@@ -14,4 +14,6 @@\n export function renderPrompt() {\n-  return "$ ";\n+  const prefix = getActiveBranch();\n+  return \`hypergit(\${prefix}) $ \`;\n }`,
      lines: [
        { type: 'chunk', text: '@@ -14,4 +14,6 @@' },
        { type: 'normal', text: ' export function renderPrompt() {' },
        { type: 'del', text: '-  return "$ ";', oldLine: 15 },
        { type: 'add', text: '+  const prefix = getActiveBranch();', newLine: 15 },
        { type: 'add', text: '+  return `hypergit(${prefix}) $ `;', newLine: 16 },
        { type: 'normal', text: ' }' }
      ],
      stats: { add: 2, del: 1 }
    });
  }

  // ── /api/conflict ──────────────────────────────────────────────────────────
  if (pathname === '/conflict') {
    return res.json(repo.conflict || {
      filePath: 'src/auth/jwt_service.js',
      currentCode: "// HEAD version\nconst token = generateJWT(user, { expiresIn: '1h' });",
      incomingCode: "// Incoming version\nconst token = createSecureSession(user, req.ip);"
    });
  }

  // ── /api/resolve ───────────────────────────────────────────────────────────
  if (pathname === '/resolve') {
    repo.conflictedFiles = [];
    repo.isClean = true;
    return res.json({ success: true, message: 'Conflict resolved cleanly.' });
  }

  // ── /api/checkpoints — return flat array of tag name strings ───────────────
  if (pathname === '/checkpoints') {
    const tags = (repo.checkpoints || []).map(c => typeof c === 'string' ? c : (c.name || c.tag || 'checkpoint'));
    return res.json(tags);
  }

  if (pathname === '/checkpoint') {
    if (!repo.checkpoints) repo.checkpoints = [];
    repo.checkpoints.push(body.name || ('checkpoint-' + Date.now()));
    return res.json({ success: true, message: `Safety checkpoint "${body.name || 'checkpoint'}" created!` });
  }

  if (pathname === '/restore-checkpoint') {
    return res.json({ success: true, message: 'Checkpoint restored successfully.' });
  }

  // ── /api/exec — return { success, stdout, stderr, exitCode } ───────────────
  if (pathname === '/exec') {
    const cmd = (body.command || '').trim();
    let stdout = '';
    if (cmd === 'git status' || cmd === 'status') {
      stdout = `On branch ${repo.branch}\n`;
      if ((repo.conflictedFiles || []).length > 0) {
        stdout += `You have unmerged paths.\n  (fix conflicts and run "git commit")\n\nUnmerged paths:\n`;
        (repo.conflictedFiles || []).forEach(f => { stdout += `\tboth modified:   ${f}\n`; });
      }
      if ((repo.stagedFiles || []).length > 0) {
        stdout += `Changes to be committed:\n`;
        (repo.stagedFiles || []).forEach(f => { stdout += `\tmodified:   ${f}\n`; });
      }
      if ((repo.unstagedFiles || []).length > 0) {
        stdout += `Changes not staged for commit:\n`;
        (repo.unstagedFiles || []).forEach(f => { stdout += `\tmodified:   ${f}\n`; });
      }
      if ((repo.untrackedFiles || []).length > 0) {
        stdout += `Untracked files:\n`;
        (repo.untrackedFiles || []).forEach(f => { stdout += `\t${f}\n`; });
      }
      if (repo.isClean) stdout += 'nothing to commit, working tree clean\n';
    } else if (cmd === 'git log' || cmd.startsWith('git log')) {
      stdout = (repo.commits || []).map(c => {
        const branches = (c.branches || []).length > 0 ? ` (${c.branches.join(', ')})` : '';
        return `* ${c.hash}${branches} ${c.msg} (${c.time}) <${c.author}>`;
      }).join('\n');
    } else if (cmd === 'git branch' || cmd === 'git branch -a' || cmd === 'git branch -v') {
      stdout = (repo.branches || []).map(b => `${b.isCurrent ? '* ' : '  '}${b.name}`).join('\n');
    } else if (cmd === 'git diff') {
      stdout = `diff --git a/src/ui/terminal.js b/src/ui/terminal.js\nindex 3d2a4..8f1e9 100644\n--- a/src/ui/terminal.js\n+++ b/src/ui/terminal.js\n@@ -14,4 +14,6 @@ export function renderPrompt() {\n-  return "$ ";\n+  const prefix = getActiveBranch();\n+  return \`hypergit(\${prefix}) $ \`;\n }`;
    } else if (cmd === 'git stash list') {
      stdout = (repo.stashes || []).map(s => `${s.ref}: WIP on ${s.branch || repo.branch}: ${s.msg}`).join('\n');
    } else if (cmd === 'git reflog') {
      stdout = (repo.reflog || []).map(r => `${r.hash} ${r.selector || r.ref}: ${r.action}: ${r.message}`).join('\n');
    } else if (cmd.startsWith('git checkout -b ')) {
      const bName = cmd.replace('git checkout -b ', '').trim();
      stdout = `Switched to a new branch '${bName}'`;
    } else if (cmd.startsWith('git checkout ')) {
      const bName = cmd.replace('git checkout ', '').trim();
      stdout = `Switched to branch '${bName}'`;
    } else if (cmd === 'git add .' || cmd === 'git add -A') {
      stdout = '';
    } else if (cmd.startsWith('git commit')) {
      const m = cmd.match(/-m\s+"([^"]+)"/) || cmd.match(/-m\s+'([^']+)'/) || cmd.match(/-m\s+(\S+)/);
      const msg = m ? m[1] : 'commit';
      stdout = `[${repo.branch} ${repo.commits[0] ? repo.commits[0].hash : 'abc1234'}] ${msg}\n 1 file changed, 8 insertions(+)`;
    } else if (cmd === 'git stash') {
      stdout = `Saved working directory and index state WIP on ${repo.branch}`;
    } else if (cmd === 'git stash pop') {
      stdout = `On branch ${repo.branch}\nDropped stash@{0}`;
    } else if (cmd === 'git pull' || cmd.startsWith('git pull')) {
      stdout = 'Already up to date.';
    } else if (cmd === 'git push' || cmd.startsWith('git push')) {
      stdout = `Everything up-to-date on branch '${repo.branch}'.`;
    } else if (cmd === 'git fetch' || cmd.startsWith('git fetch')) {
      stdout = `Fetched references from origin.`;
    } else {
      stdout = `[HyperGit Cloud Engine]\n$ ${cmd}\nCommand executed on ${repo.name}.`;
    }
    return res.json({ success: true, stdout, stderr: '', exitCode: 0 });
  }

  // ── /api/analyze-intent ────────────────────────────────────────────────────
  if (pathname === '/analyze-intent') {
    const q = (body.query || query.query || '').toLowerCase();
    let diagnosis = `Working on branch "${repo.branch}".`;
    let recommendation = {
      title: 'Repository Status Normal',
      desc: 'No urgent repairs needed.',
      command: 'git status',
      buttonText: 'Check Status'
    };
    if ((repo.conflictedFiles || []).length > 0 || q.includes('conflict')) {
      diagnosis = `Merge conflict detected in "${(repo.conflictedFiles || [])[0] || 'files'}".`;
      recommendation = { title: 'Resolve Merge Collision', desc: 'Review colliding chunks.', command: 'hypergit:resolve_conflict', buttonText: 'Open 3-Way Conflict Resolver' };
    } else if (q.includes('mistake') || q.includes('accident') || repo.branch === 'main') {
      diagnosis = `Working directly on branch "${repo.branch}".`;
      recommendation = { title: 'Create Feature Branch', desc: 'Isolate work on a new branch.', command: 'git checkout -b feature/work', buttonText: '🌿 Create Branch' };
    } else if (repo.stagedCount > 0 || repo.unstagedCount > 0 || q.includes('commit') || q.includes('stage')) {
      diagnosis = `You have ${repo.unstagedCount || 0} modified files.`;
      recommendation = { title: 'Stage and Commit', desc: 'Stage all and snapshot.', command: 'git add . && git commit -m "update"', buttonText: 'Stage & Commit All' };
    }
    return res.json({ query: body.query || '', diagnosis, status: { branch: repo.branch, isClean: repo.isClean }, recommendation, alternatives: [] });
  }

  // ── /api/git-sync ──────────────────────────────────────────────────────────
  if (pathname === '/git-sync') {
    const action = body.action || 'fetch';
    return res.json({ success: true, stdout: `git ${action} completed on ${repo.name}.`, stderr: '' });
  }

  // ── /api/explore-dir ───────────────────────────────────────────────────────
  if (pathname === '/explore-dir') {
    const list = Object.values(MOCK_REPOS).map(r => ({
      name: r.name, path: r.path, isGit: true,
      branches: r.branches.map(b => b.name), activeBranch: r.branch
    }));
    return res.json({ currentPath: 'HyperGit Cloud Workspaces', parentPath: null, entries: list, folders: list });
  }

  if (pathname === '/browse-folder') {
    return res.json({ selected: true, path: 'hypergit', name: '⚡ HyperGit Core Engine', isGit: true });
  }

  if (pathname === '/open-path') {
    return res.json({ success: true, path: body.path || 'hypergit', name: '⚡ HyperGit Core Engine' });
  }

  // ── /api/* action endpoints (squash, undo, move-branch, etc.) ──────────────
  if (['/squash', '/undo', '/move-branch', '/doctor-repair', '/file-action',
       '/commit-action', '/branch-action', '/stash-action'].includes(pathname)) {
    return res.json({ success: true, stdout: `Action '${pathname.slice(1)}' applied on ${repo.name}.`, message: `Action '${pathname.slice(1)}' completed.` });
  }

  return res.json({ success: true, message: 'HyperGit API online.' });
};

