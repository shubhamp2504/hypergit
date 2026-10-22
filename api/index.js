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

  const url = new URL(req.url, `https://${req.headers.host || 'hypergit.vercel.app'}`);
  const pathname = url.pathname.replace(/^\/api/, '');
  const query = Object.fromEntries(url.searchParams.entries());
  const body = req.body || {};

  const repoKey = query.path || body.repoPath || 'hypergit';
  const repo = MOCK_REPOS[repoKey] || MOCK_REPOS['hypergit'];

  // Route handlers
  if (pathname === '/projects' || pathname === '') {
    return res.json(Object.values(MOCK_REPOS).map(r => ({
      name: r.name,
      path: r.path,
      branch: r.branch,
      isClean: r.isClean,
      stagedCount: r.stagedCount,
      unstagedCount: r.unstagedCount,
      untrackedCount: r.untrackedCount,
      ahead: r.ahead,
      behind: r.behind,
      isDemo: true
    })));
  }

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

  if (pathname === '/commits') {
    return res.json(repo.commits || []);
  }

  if (pathname === '/branches') {
    return res.json({
      current: repo.branch,
      branches: repo.branches || []
    });
  }

  if (pathname === '/stashes') {
    return res.json(repo.stashes || []);
  }

  if (pathname === '/reflog') {
    return res.json(repo.reflog || []);
  }

  if (pathname === '/doctor') {
    return res.json(repo.doctor || { score: 90, checks: [] });
  }

  if (pathname === '/diff') {
    return res.json({
      path: query.file || 'src/ui/terminal.js',
      diff: '--- a/src/ui/terminal.js\n+++ b/src/ui/terminal.js\n@@ -14,4 +14,6 @@\n export function renderPrompt() {\n-  return "$ ";\n+  const prefix = getActiveBranch();\n+  return `hypergit(${prefix}) $ `;\n }',
      lines: [
        { type: 'hunk', content: '@@ -14,4 +14,6 @@' },
        { type: 'normal', content: ' export function renderPrompt() {' },
        { type: 'del', content: '-  return "$ ";', oldNo: 15 },
        { type: 'add', content: '+  const prefix = getActiveBranch();', newNo: 15 },
        { type: 'add', content: '+  return `hypergit(${prefix}) $ `;', newNo: 16 },
        { type: 'normal', content: ' }' }
      ]
    });
  }

  if (pathname === '/conflict') {
    return res.json(repo.conflict || {
      filePath: 'src/auth/jwt_service.js',
      currentCode: "// HEAD version\nconst token = generateJWT(user, { expiresIn: '1h' });",
      incomingCode: "// Incoming version\nconst token = createSecureSession(user, req.ip);"
    });
  }

  if (pathname === '/resolve') {
    repo.conflictedFiles = [];
    repo.isClean = true;
    return res.json({ success: true, message: 'Conflict resolved cleanly.' });
  }

  if (pathname === '/explore-dir') {
    const list = Object.values(MOCK_REPOS).map(r => ({
      name: r.name,
      path: r.path,
      isGit: true,
      branches: r.branches.map(b => b.name),
      activeBranch: r.branch
    }));
    return res.json({
      currentPath: 'HyperGit Cloud Workspaces',
      parentPath: null,
      entries: list,
      folders: list
    });
  }

  if (pathname === '/browse-folder') {
    return res.json({
      selected: true,
      path: 'hypergit',
      name: '⚡ HyperGit Core Engine',
      isGit: true
    });
  }

  if (pathname === '/open-path') {
    return res.json({
      success: true,
      path: body.path || 'hypergit',
      name: '⚡ HyperGit Core Engine'
    });
  }

  if (pathname === '/exec') {
    const cmd = (body.command || 'git status').trim();
    return res.json({
      exitCode: 0,
      output: `[HyperGit Cloud Engine]\n$ ${cmd}\nCommand executed successfully on ${repo.name}.`,
      status: 'success'
    });
  }

  if (pathname === '/squash' || pathname === '/undo' || pathname === '/move-branch' || pathname === '/doctor-repair' || pathname === '/file-action' || pathname === '/commit-action' || pathname === '/branch-action' || pathname === '/stash-action' || pathname === '/git-sync') {
    return res.json({
      success: true,
      message: `Action '${pathname}' applied successfully on ${repo.name}.`
    });
  }

  return res.json({ success: true, message: 'HyperGit API online.' });
};
