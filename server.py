#!/usr/bin/env python3
"""
Git Surgery — Real-Time Git Bridge & Web Server
Enhanced with Reverse-Engineered Diagnostics & Tools inspired by REA:
- Git Doctor (Automated repository health checks & self-healing)
- Deep Diff Inspector (Visual syntax diffs)
- Safety Snapshot / Checkpoint Engine (Zero-risk rollback)
- Full Git CLI Bridge & Pure Python standard library
"""

import os
import sys
import json
import time
import subprocess
import urllib.parse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = 4321
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, '..'))

def run_git_cmd(repo_path, cmd_args):
    """Executes a git command in the target repository directory safely."""
    try:
        if isinstance(cmd_args, str):
            cmd_list = cmd_args.strip().split()
        else:
            cmd_list = list(cmd_args)
            
        if cmd_list and cmd_list[0] != 'git':
            cmd_list.insert(0, 'git')

        result = subprocess.run(
            cmd_list,
            cwd=repo_path,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding='utf-8',
            errors='replace',
            timeout=30
        )
        return {
            'stdout': result.stdout,
            'stderr': result.stderr,
            'returncode': result.returncode,
            'success': result.returncode == 0
        }
    except Exception as e:
        return {
            'stdout': '',
            'stderr': str(e),
            'returncode': -1,
            'success': False
        }

PROJECTS_CACHE_FILE = os.path.join(CURRENT_DIR, '.projects.json')

def load_cached_custom_projects():
    if os.path.isfile(PROJECTS_CACHE_FILE):
        try:
            with open(PROJECTS_CACHE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_custom_project(path, name=None):
    projects = load_cached_custom_projects()
    norm_path = os.path.normpath(path)
    if not any(p['path'].lower() == norm_path.lower() for p in projects):
        projects.append({
            'name': name or os.path.basename(norm_path),
            'path': norm_path
        })
        try:
            with open(PROJECTS_CACHE_FILE, 'w', encoding='utf-8') as f:
                json.dump(projects, f, indent=2)
        except Exception:
            pass

def find_git_projects():
    """Scans parent directory, current directory, and cached custom projects."""
    projects = []
    if os.path.isdir(os.path.join(CURRENT_DIR, '.git')):
        projects.append({
            'name': 'git-surgery-simulator (Current)',
            'path': CURRENT_DIR
        })

    if os.path.isdir(PARENT_DIR):
        try:
            for item in sorted(os.listdir(PARENT_DIR)):
                full_path = os.path.join(PARENT_DIR, item)
                if os.path.isdir(full_path) and os.path.isdir(os.path.join(full_path, '.git')):
                    if full_path != CURRENT_DIR:
                        projects.append({
                            'name': item,
                            'path': full_path
                        })
        except Exception:
            pass

    # Add custom user projects (avoiding duplicates)
    for cp in load_cached_custom_projects():
        if os.path.isdir(cp['path']) and not any(p['path'].lower() == cp['path'].lower() for p in projects):
            projects.append(cp)

    return projects

def open_folder_picker():
    """Opens native OS folder chooser dialog via PowerShell without blocking or crashing Tkinter."""
    try:
        ps_cmd = (
            "[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms') | Out-Null; "
            "$f = New-Object System.Windows.Forms.FolderBrowserDialog; "
            "$f.Description = 'Select Git Repository Folder'; "
            "$f.ShowNewFolderButton = $true; "
            "if ($f.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { Write-Output $f.SelectedPath }"
        )
        res = subprocess.run(
            ['powershell', '-NoProfile', '-Command', ps_cmd],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=120
        )
        selected = res.stdout.strip()
        if selected and os.path.isdir(selected):
            norm = os.path.normpath(selected)
            is_git = os.path.isdir(os.path.join(norm, '.git'))
            name = os.path.basename(norm) or norm
            if is_git:
                save_custom_project(norm, name)
            return {
                'selected': True,
                'path': norm,
                'name': name,
                'isGit': is_git
            }
        return {'selected': False}
    except Exception as e:
        return {'selected': False, 'error': str(e)}

def explore_directory(path=None):
    """Explores directory structure on disk for the in-app repository navigation."""
    if not path or path == 'roots':
        roots = []
        for letter in 'CDEFGHIJKLMNOPQRSTUVWXYZ':
            drive = f"{letter}:\\"
            if os.path.exists(drive):
                roots.append({
                    'name': f"Drive ({letter}:)",
                    'path': drive,
                    'isGit': os.path.isdir(os.path.join(drive, '.git'))
                })
        return {
            'currentPath': '',
            'parentPath': '',
            'isDriveRoot': True,
            'entries': roots
        }

    norm = os.path.normpath(path)
    if not os.path.isdir(norm):
        return {'error': f'Folder does not exist: {norm}', 'entries': []}

    parent = os.path.dirname(norm)
    if not parent or parent == norm:
        parent = 'roots'

    entries = []
    try:
        with os.scandir(norm) as it:
            for entry in it:
                try:
                    if entry.is_dir(follow_symlinks=False):
                        if entry.name.startswith('.') and entry.name != '.git':
                            continue
                        is_git = os.path.isdir(os.path.join(entry.path, '.git'))
                        entries.append({
                            'name': entry.name,
                            'path': entry.path,
                            'isGit': is_git
                        })
                except (PermissionError, OSError):
                    continue
    except Exception as e:
        return {'error': str(e), 'currentPath': norm, 'parentPath': parent, 'entries': []}

    entries.sort(key=lambda x: (not x['isGit'], x['name'].lower()))
    return {
        'currentPath': norm,
        'parentPath': parent,
        'isGit': os.path.isdir(os.path.join(norm, '.git')),
        'entries': entries
    }


def get_repo_status(repo_path):
    """Gets detailed live Git status: branch, changed files, conflicts."""
    status_res = run_git_cmd(repo_path, ['status', '--porcelain=v1', '-b'])
    lines = status_res['stdout'].splitlines()
    
    current_branch = 'HEAD (detached)'
    tracking = ''
    ahead = 0
    behind = 0
    staged = []
    unstaged = []
    untracked = []
    conflicted = []

    if lines:
        header = lines[0]
        if header.startswith('## '):
            branch_info = header[3:]
            if '...' in branch_info:
                parts = branch_info.split('...')
                current_branch = parts[0]
                rest = parts[1]
                if '[' in rest and ']' in rest:
                    tracking = rest.split('[')[0].strip()
                    meta = rest[rest.find('[')+1 : rest.find(']')]
                    if 'ahead' in meta:
                        try: ahead = int(meta.split('ahead')[1].split()[0].replace(',', ''))
                        except: pass
                    if 'behind' in meta:
                        try: behind = int(meta.split('behind')[1].split()[0].replace(',', ''))
                        except: pass
                else:
                    tracking = rest.strip()
            else:
                current_branch = branch_info.strip()

        for line in lines[1:]:
            if len(line) < 3: continue
            code = line[:2]
            filepath = line[3:].strip()
            
            if code in ['UU', 'AA', 'DD', 'AU', 'UD', 'UA', 'DU']:
                conflicted.append(filepath)
            elif code[0] in ['M', 'A', 'D', 'R', 'C']:
                staged.append(filepath)
            elif code[1] in ['M', 'D']:
                unstaged.append(filepath)
            elif code == '??':
                untracked.append(filepath)

    return {
        'repoPath': repo_path,
        'branch': current_branch,
        'tracking': tracking,
        'ahead': ahead,
        'behind': behind,
        'stagedCount': len(staged),
        'unstagedCount': len(unstaged),
        'untrackedCount': len(untracked),
        'stagedFiles': staged,
        'unstagedFiles': unstaged,
        'untrackedFiles': untracked,
        'conflictedFiles': conflicted,
        'isClean': len(staged) == 0 and len(unstaged) == 0 and len(untracked) == 0 and len(conflicted) == 0
    }

def get_repo_commits(repo_path, count=30):
    """Fetches recent commits as a structured DAG."""
    log_res = run_git_cmd(repo_path, [
        'log', f'-n{count}',
        '--pretty=format:%H|%h|%an|%ar|%s|%P',
        '--branches', '--tags', '--remotes', 'HEAD'
    ])
    
    commits = []
    if log_res['success']:
        for line in log_res['stdout'].splitlines():
            parts = line.split('|')
            if len(parts) >= 5:
                parents = parts[5].split() if len(parts) > 5 and parts[5].strip() else []
                commits.append({
                    'id': parts[0],
                    'hash': parts[1],
                    'author': parts[2],
                    'time': parts[3],
                    'msg': parts[4],
                    'parents': parents
                })
    return commits

def get_repo_reflog(repo_path, count=20):
    """Fetches recent git reflog entries for safe time-travel."""
    ref_res = run_git_cmd(repo_path, [
        'reflog', f'-n{count}',
        '--pretty=format:%gD|%h|%gs|%cr'
    ])
    entries = []
    if ref_res['success']:
        for line in ref_res['stdout'].splitlines():
            parts = line.split('|')
            if len(parts) >= 4:
                entries.append({
                    'ref': parts[0],
                    'hash': parts[1],
                    'action': parts[2],
                    'time': parts[3]
                })
    return entries

# ==========================================================================
# Reverse-Engineered Doctor & Diagnostics (Inspired by REA Doctor Pattern)
# ==========================================================================
def run_git_doctor(repo_path):
    """Diagnoses common Git health issues and proposes 1-click remedies."""
    git_dir = os.path.join(repo_path, '.git')
    checks = []
    score = 100

    # 1. Check for stuck index.lock
    lock_file = os.path.join(git_dir, 'index.lock')
    if os.path.exists(lock_file):
        score -= 25
        checks.append({
            'id': 'stuck-lock',
            'status': 'error',
            'title': 'Stuck Index Lock Detected',
            'desc': 'A stale .git/index.lock file is preventing Git operations.',
            'repairAction': 'remove_lock',
            'repairLabel': 'Remove index.lock'
        })
    else:
        checks.append({
            'id': 'stuck-lock',
            'status': 'ok',
            'title': 'Index Lock Status',
            'desc': 'No lingering lock files blocking operations.'
        })

    # 2. Check for interrupted rebase
    rebase_merge = os.path.join(git_dir, 'rebase-merge')
    rebase_apply = os.path.join(git_dir, 'rebase-apply')
    if os.path.exists(rebase_merge) or os.path.exists(rebase_apply):
        score -= 20
        checks.append({
            'id': 'rebase-in-progress',
            'status': 'warn',
            'title': 'Rebase Currently in Progress / Paused',
            'desc': 'A rebase was paused due to conflict or manual edit.',
            'repairAction': 'abort_rebase',
            'repairLabel': 'Abort Rebase (git rebase --abort)'
        })
    else:
        checks.append({
            'id': 'rebase-in-progress',
            'status': 'ok',
            'title': 'Rebase State',
            'desc': 'No interrupted rebase session.'
        })

    # 3. Check for interrupted merge
    merge_head = os.path.join(git_dir, 'MERGE_HEAD')
    if os.path.exists(merge_head):
        score -= 20
        checks.append({
            'id': 'merge-in-progress',
            'status': 'warn',
            'title': 'Merge Conflict / Incomplete Merge',
            'desc': 'Repository is waiting for conflict resolution or commit.',
            'repairAction': 'abort_merge',
            'repairLabel': 'Abort Merge (git merge --abort)'
        })
    else:
        checks.append({
            'id': 'merge-in-progress',
            'status': 'ok',
            'title': 'Merge State',
            'desc': 'No unmerged conflict states.'
        })

    # 4. Check for detached HEAD
    status = get_repo_status(repo_path)
    if 'detached' in status['branch'].lower():
        score -= 15
        checks.append({
            'id': 'detached-head',
            'status': 'warn',
            'title': 'Detached HEAD State',
            'desc': 'You are currently not on any named branch. Commits may be orphaned!',
            'repairAction': 'create_branch_from_head',
            'repairLabel': 'Create Branch to Save Commits'
        })
    else:
        checks.append({
            'id': 'detached-head',
            'status': 'ok',
            'title': 'Branch Alignment',
            'desc': f"On named branch: {status['branch']}"
        })

    # 5. Remote sync health
    if status['behind'] > 0:
        checks.append({
            'id': 'remote-behind',
            'status': 'info',
            'title': 'Remote Commits Pending',
            'desc': f"Your branch is {status['behind']} commit(s) behind remote.",
            'repairAction': 'git_pull',
            'repairLabel': 'Pull Remote Changes'
        })

    return {
        'score': max(0, score),
        'checks': checks,
        'timestamp': time.strftime('%H:%M:%S')
    }

def execute_doctor_repair(repo_path, action, extra_data=None):
    """Executes 1-click self-healing repair."""
    git_dir = os.path.join(repo_path, '.git')

    if action == 'remove_lock':
        lock_file = os.path.join(git_dir, 'index.lock')
        if os.path.exists(lock_file):
            os.remove(lock_file)
            return {'success': True, 'msg': 'Successfully removed .git/index.lock'}
        return {'success': True, 'msg': 'Lock file already removed'}

    if action == 'abort_rebase':
        return run_git_cmd(repo_path, ['rebase', '--abort'])

    if action == 'abort_merge':
        return run_git_cmd(repo_path, ['merge', '--abort'])

    if action == 'git_pull':
        return run_git_cmd(repo_path, ['pull'])

    if action == 'clean_untracked':
        return run_git_cmd(repo_path, ['clean', '-fd'])

    if action == 'create_branch_from_head':
        name = extra_data.get('branchName', f'saved-work-{int(time.time())}')
        return run_git_cmd(repo_path, ['checkout', '-b', name])

    return {'success': False, 'error': f'Unknown repair action: {action}'}

# ==========================================================================
# Deep Diff Inspector (Visual syntax diffs with line numbering)
# ==========================================================================
def get_file_diff(repo_path, file_path=None, commit_hash=None):
    """Retrieves parsed diff lines with old/new line numbers and addition/deletion metadata."""
    if commit_hash:
        cmd = ['show', '--format=', commit_hash]
    elif file_path:
        cmd = ['diff', 'HEAD', '--', file_path]
    else:
        cmd = ['diff', 'HEAD']

    res = run_git_cmd(repo_path, cmd)
    raw_output = res['stdout']

    # Fallback for untracked or newly created files
    if file_path and (not raw_output or not raw_output.strip()):
        full_path = os.path.join(repo_path, file_path)
        # Check staged diff first
        res_staged = run_git_cmd(repo_path, ['diff', '--cached', '--', file_path])
        if res_staged['stdout'] and res_staged['stdout'].strip():
            raw_output = res_staged['stdout']
            res = res_staged
        elif os.path.isfile(full_path):
            try:
                with open(full_path, 'r', encoding='utf-8', errors='replace') as f:
                    untracked_lines = f.readlines()
                diff_lines = [{
                    'type': 'meta',
                    'text': f'+++ b/{file_path} (New Untracked File)',
                    'oldLine': None,
                    'newLine': None
                }]
                for idx, ul in enumerate(untracked_lines, start=1):
                    diff_lines.append({
                        'type': 'add',
                        'text': '+' + ul.rstrip('\r\n'),
                        'oldLine': None,
                        'newLine': idx
                    })
                return {
                    'lines': diff_lines,
                    'raw': ''.join(untracked_lines),
                    'success': True,
                    'stats': {'add': len(untracked_lines), 'del': 0}
                }
            except Exception:
                pass

    diff_lines = []
    add_count = 0
    del_count = 0
    cur_old = 1
    cur_new = 1

    import re
    hunk_re = re.compile(r'^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@')

    for line in raw_output.splitlines():
        line_type = 'context'
        old_num = None
        new_num = None

        if line.startswith('+++') or line.startswith('---'):
            line_type = 'meta'
        elif line.startswith('@@'):
            line_type = 'chunk'
            m = hunk_re.match(line)
            if m:
                cur_old = int(m.group(1))
                cur_new = int(m.group(2))
        elif line.startswith('+'):
            line_type = 'add'
            add_count += 1
            new_num = cur_new
            cur_new += 1
        elif line.startswith('-'):
            line_type = 'del'
            del_count += 1
            old_num = cur_old
            cur_old += 1
        else:
            old_num = cur_old
            new_num = cur_new
            cur_old += 1
            cur_new += 1

        diff_lines.append({
            'type': line_type,
            'text': line,
            'oldLine': old_num,
            'newLine': new_num
        })

    return {
        'lines': diff_lines,
        'raw': raw_output,
        'success': res['success'],
        'stats': {
            'add': add_count,
            'del': del_count
        }
    }

# ==========================================================================
# Safety Checkpoints / Snapshots (Inspired by REA Captures)
# ==========================================================================
def create_safety_checkpoint(repo_path, name=None):
    """Creates a local tag checkpoint for instant zero-risk rollback."""
    tag_name = name or f"checkpoint-{int(time.time())}"
    res = run_git_cmd(repo_path, ['tag', '-a', tag_name, '-m', f"Safety Checkpoint: {tag_name}"])
    return {
        'success': res['success'],
        'checkpoint': tag_name,
        'error': res['stderr']
    }

def list_checkpoints(repo_path):
    """Lists all created safety checkpoints."""
    res = run_git_cmd(repo_path, ['tag', '-l', 'checkpoint-*', '--sort=-creatordate'])
    tags = res['stdout'].splitlines() if res['success'] else []
    return tags

def restore_checkpoint(repo_path, checkpoint_tag):
    """Restores working tree and branch directly to a safety checkpoint."""
    return run_git_cmd(repo_path, ['reset', '--hard', checkpoint_tag])

# ==========================================================================
# Core Surgery Actions: Squash, Undo, Move Branch, Conflict Solver
# ==========================================================================
def real_squash_commits(repo_path, count, message):
    reset_res = run_git_cmd(repo_path, ['reset', '--soft', f'HEAD~{count}'])
    if not reset_res['success']:
        return reset_res
    return run_git_cmd(repo_path, ['commit', '-m', message])

def real_undo_commit(repo_path, mode='soft'):
    flag = '--soft' if mode == 'soft' else '--mixed'
    return run_git_cmd(repo_path, ['reset', flag, 'HEAD~1'])

def real_move_to_branch(repo_path, branch_name, count=1):
    b_res = run_git_cmd(repo_path, ['branch', branch_name])
    if not b_res['success']:
        return b_res
    r_res = run_git_cmd(repo_path, ['reset', '--hard', f'HEAD~{count}'])
    if not r_res['success']:
        return r_res
    return run_git_cmd(repo_path, ['checkout', branch_name])

def parse_file_conflict(repo_path, file_path):
    full_path = os.path.join(repo_path, file_path)
    if not os.path.isfile(full_path):
        return None
    try:
        with open(full_path, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()

        current_block = []
        incoming_block = []
        in_current = False
        in_incoming = False

        for line in content.splitlines():
            if line.startswith('<<<<<<<'):
                in_current = True
                continue
            elif line.startswith('=======') and in_current:
                in_current = False
                in_incoming = True
                continue
            elif line.startswith('>>>>>>>') and in_incoming:
                in_incoming = False
                break
            elif in_current:
                current_block.append(line)
            elif in_incoming:
                incoming_block.append(line)

        return {
            'filePath': file_path,
            'currentCode': '\n'.join(current_block),
            'incomingCode': '\n'.join(incoming_block),
            'raw': content
        }
    except Exception as e:
        return {'error': str(e)}

def resolve_file_conflict(repo_path, file_path, resolution_code):
    full_path = os.path.join(repo_path, file_path)
    if not os.path.isfile(full_path):
        return {'success': False, 'error': 'File not found'}
    try:
        with open(full_path, 'r', encoding='utf-8', errors='replace') as f:
            lines = f.readlines()

        new_lines = []
        skip = False

        for line in lines:
            if line.startswith('<<<<<<<'):
                skip = True
                new_lines.append(resolution_code + '\n')
            elif line.startswith('>>>>>>>') and skip:
                skip = False
            elif not skip:
                new_lines.append(line)

        with open(full_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)

        add_res = run_git_cmd(repo_path, ['add', file_path])
        return {'success': add_res['success'], 'error': add_res['stderr']}
    except Exception as e:
        return {'success': False, 'error': str(e)}


def get_repo_branches(repo_path):
    """Lists local and remote branches with current marker and tracking info."""
    res = run_git_cmd(repo_path, ['branch', '-a', '-vv'])
    branches = []
    if res['success']:
        for line in res['stdout'].splitlines():
            line_str = line.strip()
            if not line_str or '->' in line_str:
                continue
            is_current = line.startswith('*')
            clean = line_str.lstrip('* ').strip()
            name = clean.split()[0]
            is_remote = name.startswith('remotes/')
            branches.append({
                'name': name,
                'isCurrent': is_current,
                'isRemote': is_remote,
                'raw': line_str
            })
    return branches

def execute_branch_action(repo_path, action, branch_name):
    if action == 'checkout':
        clean_name = branch_name.replace('remotes/origin/', '')
        return run_git_cmd(repo_path, ['checkout', clean_name])
    elif action == 'create':
        return run_git_cmd(repo_path, ['checkout', '-b', branch_name])
    elif action == 'merge':
        return run_git_cmd(repo_path, ['merge', branch_name])
    elif action == 'delete':
        return run_git_cmd(repo_path, ['branch', '-D', branch_name])
    return {'success': False, 'error': f'Unknown branch action: {action}'}

def execute_file_action(repo_path, action, file_path=None):
    if action == 'stage_all':
        return run_git_cmd(repo_path, ['add', '-A'])
    elif action == 'unstage_all':
        return run_git_cmd(repo_path, ['reset'])
    elif action == 'stage' and file_path:
        return run_git_cmd(repo_path, ['add', file_path])
    elif action == 'unstage' and file_path:
        return run_git_cmd(repo_path, ['reset', 'HEAD', file_path])
    elif action == 'discard_all':
        r1 = run_git_cmd(repo_path, ['checkout', '--', '.'])
        r2 = run_git_cmd(repo_path, ['clean', '-fd'])
        return {'success': True, 'stdout': (r1.get('stdout', '') + '\n' + r2.get('stdout', '')).strip()}
    elif action == 'discard' and file_path:
        full = os.path.join(repo_path, file_path)
        if os.path.exists(full):
            res = run_git_cmd(repo_path, ['checkout', '--', file_path])
            if not res['success']:
                res = run_git_cmd(repo_path, ['clean', '-f', file_path])
            return res
        return {'success': False, 'error': 'File not found'}
    return {'success': False, 'error': f'Unknown file action: {action}'}

def get_repo_stashes(repo_path):
    res = run_git_cmd(repo_path, ['stash', 'list'])
    stashes = []
    if res['success']:
        for line in res['stdout'].splitlines():
            line = line.strip()
            if not line: continue
            parts = line.split(':', 2)
            ref = parts[0].strip()
            summary = parts[2].strip() if len(parts) > 2 else (parts[1].strip() if len(parts) > 1 else line)
            stashes.append({
                'ref': ref,
                'summary': summary,
                'raw': line
            })
    return stashes

def execute_stash_action(repo_path, action, extra=''):
    if action == 'save':
        msg = extra or f"Stash on {time.strftime('%Y-%m-%d %H:%M:%S')}"
        return run_git_cmd(repo_path, ['stash', 'push', '-m', msg])
    elif action == 'pop':
        ref = extra or 'stash@{0}'
        return run_git_cmd(repo_path, ['stash', 'pop', ref])
    elif action == 'apply':
        ref = extra or 'stash@{0}'
        return run_git_cmd(repo_path, ['stash', 'apply', ref])
    elif action == 'drop':
        ref = extra or 'stash@{0}'
        return run_git_cmd(repo_path, ['stash', 'drop', ref])
    return {'success': False, 'error': f'Unknown stash action: {action}'}

def execute_commit_action(repo_path, action, commit_hash=None, extra=None):
    extra = extra or {}
    if action == 'cherry_pick' and commit_hash:
        return run_git_cmd(repo_path, ['cherry-pick', commit_hash])
    elif action == 'revert' and commit_hash:
        return run_git_cmd(repo_path, ['revert', '--no-edit', commit_hash])
    elif action == 'reset_soft' and commit_hash:
        return run_git_cmd(repo_path, ['reset', '--soft', commit_hash])
    elif action == 'reset_hard' and commit_hash:
        return run_git_cmd(repo_path, ['reset', '--hard', commit_hash])
    elif action == 'amend':
        msg = extra.get('message', '').strip()
        cmd = ['commit', '--amend', '--no-edit'] if not msg else ['commit', '--amend', '-m', msg]
        return run_git_cmd(repo_path, cmd)
    return {'success': False, 'error': f'Unknown commit action: {action}'}


def analyze_user_intent(repo_path, query=""):
    """
    Analyzes user intent in natural language against the live repository state
    and recommends the safest, most effective Git action with plain-English explanation.
    """
    status = get_repo_status(repo_path)
    doctor = run_git_doctor(repo_path)
    commits = get_repo_commits(repo_path, count=5)
    stashes = get_repo_stashes(repo_path)
    
    q = (query or '').lower().strip()
    branch = status.get('branch', 'unknown')
    is_main_or_master = branch.lower() in ['master', 'main', 'production', 'release']
    unstaged_cnt = status.get('unstagedCount', 0)
    staged_cnt = status.get('stagedCount', 0)
    untracked_cnt = status.get('untrackedCount', 0)
    conflicted = status.get('conflictedFiles', [])
    behind_cnt = status.get('behind', 0)
    ahead_cnt = status.get('ahead', 0)
    has_lock = any(c['id'] == 'index-lock' and c['status'] == 'error' for c in doctor.get('checks', []))
    rebase_in_progress = any(c['id'] == 'rebase-in-progress' and c['status'] == 'error' for c in doctor.get('checks', []))
    
    # Diagnosis summary
    diagnosis_parts = []
    diagnosis_parts.append(f"Branch: '{branch}'" + (" (Protected/Default Branch)" if is_main_or_master else ""))
    if conflicted:
        diagnosis_parts.append(f"⚠️ {len(conflicted)} active merge conflict(s)")
    if has_lock:
        diagnosis_parts.append("🚨 Frozen index.lock detected")
    if rebase_in_progress:
        diagnosis_parts.append("⚠️ Rebase/merge currently in progress")
    if unstaged_cnt or staged_cnt or untracked_cnt:
        diagnosis_parts.append(f"{unstaged_cnt} unstaged, {staged_cnt} staged, {untracked_cnt} untracked files")
    else:
        diagnosis_parts.append("Working tree is completely clean")
    if ahead_cnt > 0:
        diagnosis_parts.append(f"{ahead_cnt} commit(s) ahead of remote")
    if behind_cnt > 0:
        diagnosis_parts.append(f"{behind_cnt} commit(s) behind remote")
    
    diagnosis_str = " • ".join(diagnosis_parts)
    
    # Recommendation calculation based on query or condition
    recommendation = None
    alternatives = []

    # Priority 1: Git Lock issue
    if has_lock or any(k in q for k in ['lock', 'index.lock', 'stuck lock', 'unlock', 'frozen']):
        recommendation = {
            'actionId': 'doctor_remove_lock',
            'title': 'Remove Stuck .git/index.lock',
            'safety': 'safe',
            'safetyLabel': '🟢 100% Safe (No Code Lost)',
            'summary': 'Removes the abandoned lock file so Git commands can run normally again.',
            'whatWillHappen': [
                'Deletes the hidden .git/index.lock file left behind by a previous interrupted command or background IDE scan.',
                'Unfreezes your repository immediately.',
                'None of your code or git history is altered.'
            ],
            'command': 'rm .git/index.lock',
            'executionType': 'doctor_repair',
            'executionPayload': {'action': 'remove_lock'},
            'buttonText': '⚡ Remove Lock Now'
        }
    
    # Priority 2: Merge Conflicts
    elif conflicted or any(k in q for k in ['conflict', 'collide', 'resolve conflict', 'both modified']):
        recommendation = {
            'actionId': 'resolve_conflicts',
            'title': 'Open 3-Way Visual Conflict Resolver',
            'safety': 'safe',
            'safetyLabel': '🟢 Safe Guided Surgery',
            'summary': f"Found {len(conflicted) if conflicted else 'pending'} file(s) with conflict markers (<<<<<<< / ======= / >>>>>>>).",
            'whatWillHappen': [
                'Opens the full-width side-by-side collision inspector.',
                'You can choose Your version (HEAD), Incoming version, or cleanly Combine both with 1 click.',
                'Automatically cleans conflict markers and stages the file (git add) to finish the merge.'
            ],
            'command': f'git add {conflicted[0] if conflicted else "<file>"}',
            'executionType': 'open_conflict_resolver',
            'executionPayload': {'filePath': conflicted[0] if conflicted else ''},
            'buttonText': '🔍 Open Visual Conflict Solver'
        }
        if rebase_in_progress:
            alternatives.append({
                'title': 'Abort Rebase / Merge',
                'desc': 'Cancel the merge completely and return to your pre-merge state.',
                'actionId': 'abort_merge',
                'command': 'git merge --abort'
            })

    # Priority 3: Committed to main/master by mistake
    elif any(k in q for k in ['main', 'master', 'wrong branch', 'accidental', 'accident']) or ('move' in q and 'branch' in q) or (is_main_or_master and ahead_cnt > 0 and ('undo' in q or 'move' in q or 'save' in q)):
        new_br_name = f"feature/work-{time.strftime('%b%d').lower()}"
        recommendation = {
            'actionId': 'move_to_new_branch',
            'title': 'Move Commit(s) to New Feature Branch & Restore Main',
            'safety': 'safe',
            'safetyLabel': '🟢 100% Safe (All Commits Preserved)',
            'summary': f"Moves your recent commit(s) onto a new branch '{new_br_name}' and safely rolls '{branch}' back so production remains clean.",
            'whatWillHappen': [
                f"Creates a new branch '{new_br_name}' pointing to your latest commit, preserving 100% of your code.",
                f"Rewinds '{branch}' back 1 commit so '{branch}' stays clean.",
                f"Switches your working directory to '{new_br_name}' so you can continue working smoothly."
            ],
            'command': f'git branch {new_br_name} && git reset --hard HEAD~1 && git checkout {new_br_name}',
            'executionType': 'move_branch',
            'executionPayload': {'branchName': new_br_name, 'count': 1},
            'buttonText': '🌿 Move to New Branch & Restore Main'
        }
        alternatives.append({
            'title': 'Soft Undo Commit',
            'desc': 'Keep your changes in staging and remove the commit from main.',
            'actionId': 'soft_undo',
            'command': 'git reset --soft HEAD~1'
        })

    # Priority 4: Undo last commit
    elif any(k in q for k in ['undo', 'uncommit', 'revert commit', 'cancel commit', 'rewind']):
        recommendation = {
            'actionId': 'soft_undo_commit',
            'title': 'Soft Undo Last Commit (Keep All Code)',
            'safety': 'safe',
            'safetyLabel': '🟢 100% Safe (No Code Lost)',
            'summary': 'Erases the commit snapshot from history, but keeps all your modified code untouched in your staging area.',
            'whatWillHappen': [
                'Removes the latest commit from the branch history.',
                'Places all files and edits from that commit back into your Staging area.',
                'Zero lines of code are lost or deleted. You can re-edit and commit again anytime.'
            ],
            'command': 'git reset --soft HEAD~1',
            'executionType': 'undo_commit',
            'executionPayload': {'mode': 'soft'},
            'buttonText': '⏪ Soft Undo Latest Commit'
        }
        alternatives.append({
            'title': 'Mixed Undo',
            'desc': 'Unstages the files so they become regular unstaged edits in your folder.',
            'actionId': 'mixed_undo',
            'command': 'git reset --mixed HEAD~1'
        })

    # Priority 5: Discard uncommitted changes
    elif any(k in q for k in ['discard', 'throw away', 'delete change', 'drop change', 'clean unstaged', 'trash', 'scrap']):
        recommendation = {
            'actionId': 'discard_unstaged',
            'title': 'Discard All Local Unstaged Modifications',
            'safety': 'destructive',
            'safetyLabel': '🔴 Destructive (Unsaved Edits Will Be Lost)',
            'summary': f"Restores all {unstaged_cnt} modified file(s) back to the clean committed version on disk.",
            'whatWillHappen': [
                'Reverts all unstaged edits back to the last commit.',
                'Permanently removes untracked scratch files with git clean.',
                'WARNING: Any unsaved work in these files will be permanently overwritten.'
            ],
            'command': 'git checkout -- . && git clean -fd',
            'executionType': 'discard_all',
            'executionPayload': {},
            'buttonText': '✕ Discard All Unstaged Changes'
        }
        alternatives.append({
            'title': 'Save to Stash First (Recommended for safety)',
            'desc': 'Tuck changes into git stash instead of permanently losing them.',
            'actionId': 'stash_save',
            'command': 'git stash push -m "Backup before clean"'
        })

    # Priority 6: Stash / Save temporary work / Switch branch
    elif any(k in q for k in ['stash', 'temporary', 'temp', 'switch', 'pause', 'hide', 'shelve', 'save work']):
        recommendation = {
            'actionId': 'stash_save',
            'title': 'Stash All Modified Files Safely',
            'safety': 'safe',
            'safetyLabel': '🟢 100% Safe (Stored on Local Stash Stack)',
            'summary': 'Safely tucks your uncommitted edits away into a hidden shelf and restores a clean working tree.',
            'whatWillHappen': [
                'Saves all staged and unstaged edits into Git’s internal stash stack.',
                'Makes your working directory completely clean so you can switch branches or pull without collision.',
                'You can restore your work at any time by clicking "Stash Pop".'
            ],
            'command': 'git stash push -m "Temporary work saved via Copilot"',
            'executionType': 'stash_save',
            'executionPayload': {'message': 'Temporary work saved via Copilot'},
            'buttonText': '📦 Stash All Work Safely'
        }
        if len(stashes) > 0:
            alternatives.append({
                'title': 'Pop Most Recent Stash',
                'desc': 'Re-apply previously stashed changes back into your workspace.',
                'actionId': 'stash_pop',
                'command': 'git stash pop'
            })

    # Priority 7: Squash / Combine WIP commits
    elif any(k in q for k in ['squash', 'combine', 'collapse', 'wip', 'tidy', 'clean up history']):
        recommendation = {
            'actionId': 'open_squash_modal',
            'title': 'Interactive Commit Squash',
            'safety': 'reversible',
            'safetyLabel': '🟡 Reversible History Rewrite',
            'summary': 'Combines multiple messy WIP commits into 1 clean, atomic PR commit.',
            'whatWillHappen': [
                'Rewinds the branch HEAD by 2 or more commits using git reset --soft.',
                'Keeps all code differences staged and ready.',
                'Creates a single unified commit with a descriptive conventional title.'
            ],
            'command': 'git reset --soft HEAD~2 && git commit -m "feat: unified commit"',
            'executionType': 'open_squash_modal',
            'executionPayload': {'count': 2},
            'buttonText': '📦 Open Interactive Squash Suite'
        }

    # Priority 8: Remote Sync / Pull / Push
    elif any(k in q for k in ['pull', 'sync', 'update', 'behind', 'download']):
        recommendation = {
            'actionId': 'git_pull',
            'title': 'Pull & Fast-Forward Remote Commits',
            'safety': 'safe',
            'safetyLabel': '🟢 Safe Remote Sync',
            'summary': f"Fetches and fast-forwards your local branch with origin/{branch}.",
            'whatWillHappen': [
                'Contacts the remote server (origin) and downloads newly pushed commits.',
                'Fast-forwards your branch to the newest commit.',
                'If you have local modifications, Git will safely alert you to stash them first.'
            ],
            'command': f'git pull origin {branch}',
            'executionType': 'sync',
            'executionPayload': {'action': 'pull'},
            'buttonText': '⬇️ Pull Remote Changes Now'
        }

    elif any(k in q for k in ['push', 'publish', 'upload', 'ahead']):
        recommendation = {
            'actionId': 'git_push',
            'title': 'Push Local Commits to Remote',
            'safety': 'safe',
            'safetyLabel': '🟢 Safe Branch Publication',
            'summary': f"Publishes your {ahead_cnt} local commit(s) to origin/{branch}.",
            'whatWillHappen': [
                f"Sends your local commits to the remote repository on branch '{branch}'.",
                'Colleagues and CI/CD pipelines will immediately see your updates.',
                'Cannot overwrite existing remote history unless forced.'
            ],
            'command': f'git push origin {branch}',
            'executionType': 'sync',
            'executionPayload': {'action': 'push', 'branch': branch},
            'buttonText': '⬆️ Push to Remote'
        }

    # Priority 9: Reflog / Recover lost commits
    elif any(k in q for k in ['reflog', 'lost', 'recover', 'deleted', 'bring back', 'time machine', 'accidentally deleted']):
        recommendation = {
            'actionId': 'open_reflog',
            'title': 'Reflog Time Machine (Revive Lost Commits)',
            'safety': 'safe',
            'safetyLabel': '🟢 100% Safe (Non-Destructive Time Travel)',
            'summary': 'Git secretly remembers every commit and branch jump for 30+ days in the local Reflog.',
            'whatWillHappen': [
                'Opens the visual Reflog Time Machine drawer.',
                'Lists every commit hash before reset, rebase, or deletion.',
                'Allows you to restore your workspace directly to any past moment.'
            ],
            'command': 'git reflog',
            'executionType': 'open_reflog',
            'executionPayload': {},
            'buttonText': '⏳ Open Reflog Time Machine'
        }

    # Priority 10: Commit staged / Stage all & commit
    elif any(k in q for k in ['commit', 'save', 'stage', 'record']):
        recommendation = {
            'actionId': 'stage_all_and_commit',
            'title': 'Stage All Changes & Commit Atomically',
            'safety': 'safe',
            'safetyLabel': '🟢 100% Safe (Permanent Snapshot)',
            'summary': f"Takes all {unstaged_cnt + staged_cnt} changed file(s) and records a new commit.",
            'whatWillHappen': [
                'Runs git add -A to stage all modified, deleted, and untracked files.',
                'Creates a new permanent commit snapshot in your branch DAG.',
                'Your working tree becomes clean.'
            ],
            'command': 'git add -A && git commit -m "feat: updates"',
            'executionType': 'stage_and_commit',
            'executionPayload': {'message': 'feat: save progress'},
            'buttonText': '⚡ Stage All & Commit'
        }

    # Default / Condition-Based Proactive Fallback
    else:
        # Determine based on current state
        if behind_cnt > 0:
            recommendation = {
                'actionId': 'git_pull',
                'title': f'Pull Remote Updates ({behind_cnt} behind)',
                'safety': 'safe',
                'safetyLabel': '🟢 Safe Sync Recommended',
                'summary': f"Your branch '{branch}' is {behind_cnt} commit(s) behind remote.",
                'whatWillHappen': [
                    'Synchronizes your local files with latest remote work.',
                    'Merges cleanly or fast-forwards your branch.'
                ],
                'command': f'git pull origin {branch}',
                'executionType': 'sync',
                'executionPayload': {'action': 'pull'},
                'buttonText': '⬇️ Pull Remote Changes'
            }
        elif unstaged_cnt > 0 or untracked_cnt > 0:
            recommendation = {
                'actionId': 'create_checkpoint_or_stage',
                'title': f'Stage & Commit Work ({unstaged_cnt + untracked_cnt} uncommitted files)',
                'safety': 'safe',
                'safetyLabel': '🟢 Recommended Best Practice',
                'summary': f"You have {unstaged_cnt + untracked_cnt} uncommitted file(s) in '{branch}'.",
                'whatWillHappen': [
                    'Stages your modifications to protect them from accidental loss.',
                    'Creates an atomic commit snapshot in your local history.'
                ],
                'command': 'git add -A && git commit -m "feat: work in progress"',
                'executionType': 'stage_and_commit',
                'executionPayload': {'message': 'feat: save progress'},
                'buttonText': '⚡ Stage All & Commit'
            }
            alternatives.append({
                'title': 'Take Safety Snapshot',
                'desc': 'Creates an instant zero-risk rollback tag before continuing.',
                'actionId': 'take_checkpoint',
                'command': 'git tag checkpoint-...'
            })
        elif ahead_cnt > 0:
            recommendation = {
                'actionId': 'git_push',
                'title': f'Push Local Commits ({ahead_cnt} ahead)',
                'safety': 'safe',
                'safetyLabel': '🟢 Ready to Publish',
                'summary': f"You have {ahead_cnt} commit(s) ready to push to origin/{branch}.",
                'whatWillHappen': [
                    'Uploads your commits to the central remote server so your team can access them.'
                ],
                'command': f'git push origin {branch}',
                'executionType': 'sync',
                'executionPayload': {'action': 'push', 'branch': branch},
                'buttonText': '⬆️ Push to Remote'
            }
        else:
            recommendation = {
                'actionId': 'create_feature_branch',
                'title': 'Create New Feature Branch',
                'safety': 'safe',
                'safetyLabel': '🟢 100% Safe & Clean',
                'summary': f"Repository is completely clean on branch '{branch}'.",
                'whatWillHappen': [
                    'Creates a fresh branch for your new feature or bugfix.',
                    'Keeps production branches completely isolated.'
                ],
                'command': 'git checkout -b feature/new-task',
                'executionType': 'branch_create',
                'executionPayload': {'branchName': 'feature/new-task'},
                'buttonText': '🌿 Create New Branch'
            }

    return {
        'query': query,
        'diagnosis': diagnosis_str,
        'status': {
            'branch': branch,
            'isClean': status.get('isClean', True),
            'stagedCount': staged_cnt,
            'unstagedCount': unstaged_cnt,
            'untrackedCount': untracked_cnt,
            'conflictedCount': len(conflicted),
            'ahead': ahead_cnt,
            'behind': behind_cnt
        },
        'recommendation': recommendation,
        'alternatives': alternatives
    }


class GitSurgeryRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=CURRENT_DIR, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # Explore disk directory
        if path == '/api/explore-dir':
            target_path = query.get('path', [None])[0]
            self.send_json_response(explore_directory(target_path))
            return

        # Projects list
        if path == '/api/projects':
            self.send_json_response(find_git_projects())
            return

        # Repo status
        if path == '/api/status':
            repo_path = query.get('path', [CURRENT_DIR])[0]
            self.send_json_response(get_repo_status(repo_path))
            return

        # Branches list
        if path == '/api/branches':
            repo_path = query.get('path', [CURRENT_DIR])[0]
            self.send_json_response(get_repo_branches(repo_path))
            return

        # Stashes list
        if path == '/api/stashes':
            repo_path = query.get('path', [CURRENT_DIR])[0]
            self.send_json_response(get_repo_stashes(repo_path))
            return

        # Commits DAG
        if path == '/api/commits':
            repo_path = query.get('path', [CURRENT_DIR])[0]
            count = int(query.get('count', [30])[0])
            self.send_json_response(get_repo_commits(repo_path, count))
            return

        # Reflog history
        if path == '/api/reflog':
            repo_path = query.get('path', [CURRENT_DIR])[0]
            self.send_json_response(get_repo_reflog(repo_path))
            return

        # Git Doctor Health Diagnostics (REA pattern)
        if path == '/api/doctor':
            repo_path = query.get('path', [CURRENT_DIR])[0]
            self.send_json_response(run_git_doctor(repo_path))
            return

        # Visual Diff Inspector
        if path == '/api/diff':
            repo_path = query.get('path', [CURRENT_DIR])[0]
            file_path = query.get('file', [None])[0]
            commit_hash = query.get('commit', [None])[0]
            self.send_json_response(get_file_diff(repo_path, file_path, commit_hash))
            return

        # List Checkpoints
        if path == '/api/checkpoints':
            repo_path = query.get('path', [CURRENT_DIR])[0]
            self.send_json_response(list_checkpoints(repo_path))
            return

        # Browse folder dialog
        if path == '/api/browse-folder':
            self.send_json_response(open_folder_picker())
            return

        # Conflict inspection
        if path == '/api/conflict':
            repo_path = query.get('path', [CURRENT_DIR])[0]
            file_path = query.get('file', [''])[0]
            self.send_json_response(parse_file_conflict(repo_path, file_path))
            return

        # Smart Intent & Recommendation Copilot
        if path == '/api/analyze-intent':
            repo_path = query.get('path', [CURRENT_DIR])[0]
            user_query = query.get('query', [''])[0]
            self.send_json_response(analyze_user_intent(repo_path, user_query))
            return

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length).decode('utf-8')

        try:
            body = json.loads(post_data) if post_data else {}
        except:
            body = {}

        repo_path = body.get('repoPath', CURRENT_DIR)
        if repo_path and isinstance(repo_path, str) and repo_path.startswith('browser://'):
            folder_name = repo_path.replace('browser://', '').strip('/')
            resolved = None
            if os.path.basename(CURRENT_DIR).lower() == folder_name.lower():
                resolved = CURRENT_DIR
            else:
                for p in find_git_projects():
                    if os.path.basename(p['path']).lower() == folder_name.lower():
                        resolved = p['path']
                        break
            if resolved:
                repo_path = resolved
            else:
                repo_path = CURRENT_DIR

        # Open custom path directly
        if parsed.path == '/api/open-path':
            raw_path = body.get('path', '').strip()
            if not raw_path:
                self.send_json_response({'success': False, 'error': 'No folder path provided.'})
                return
            norm_path = os.path.normpath(raw_path)
            if not os.path.isdir(norm_path):
                self.send_json_response({'success': False, 'error': f'Directory does not exist: {norm_path}'})
                return
            is_git = os.path.isdir(os.path.join(norm_path, '.git'))
            if not is_git:
                self.send_json_response({'success': False, 'error': f'Selected folder is not a Git repository (no .git folder in {norm_path}).'})
                return
            name = os.path.basename(norm_path) or norm_path
            save_custom_project(norm_path, name)
            self.send_json_response({'success': True, 'path': norm_path, 'name': name})
            return

        # CLI execution
        if parsed.path == '/api/exec':
            command = body.get('command', 'git status')
            res = run_git_cmd(repo_path, command)
            self.send_json_response(res)
            return

        # Doctor 1-click self-repair
        if parsed.path == '/api/doctor-repair':
            action = body.get('action', '')
            res = execute_doctor_repair(repo_path, action, body)
            self.send_json_response(res)
            return

        # Squash
        if parsed.path == '/api/squash':
            count = int(body.get('count', 2))
            message = body.get('message', 'squash: combined PR commits')
            res = real_squash_commits(repo_path, count, message)
            self.send_json_response(res)
            return

        # Undo
        if parsed.path == '/api/undo':
            mode = body.get('mode', 'soft')
            res = real_undo_commit(repo_path, mode)
            self.send_json_response(res)
            return

        # Move to Branch
        if parsed.path == '/api/move-branch':
            branch_name = body.get('branchName', '')
            count = int(body.get('count', 1))
            res = real_move_to_branch(repo_path, branch_name, count)
            self.send_json_response(res)
            return

        # Create Safety Checkpoint
        if parsed.path == '/api/checkpoint':
            name = body.get('name')
            res = create_safety_checkpoint(repo_path, name)
            self.send_json_response(res)
            return

        # Restore Safety Checkpoint
        if parsed.path == '/api/restore-checkpoint':
            tag = body.get('checkpoint')
            res = restore_checkpoint(repo_path, tag)
            self.send_json_response(res)
            return

        # Branch actions (checkout, create, merge, delete)
        if parsed.path == '/api/branch-action':
            action = body.get('action', 'checkout')
            branch_name = body.get('branchName', '')
            res = execute_branch_action(repo_path, action, branch_name)
            self.send_json_response(res)
            return

        # File actions (stage, unstage, discard, stage_all, unstage_all)
        if parsed.path == '/api/file-action':
            action = body.get('action', 'stage')
            file_path = body.get('filePath', None)
            res = execute_file_action(repo_path, action, file_path)
            self.send_json_response(res)
            return

        # Stash actions (save, pop, apply, drop)
        if parsed.path == '/api/stash-action':
            action = body.get('action', 'save')
            extra = body.get('extra', '')
            res = execute_stash_action(repo_path, action, extra)
            self.send_json_response(res)
            return

        # Commit actions (cherry_pick, revert, reset_soft, reset_hard, amend)
        if parsed.path == '/api/commit-action':
            action = body.get('action', '')
            commit_hash = body.get('hash', None)
            res = execute_commit_action(repo_path, action, commit_hash, body)
            self.send_json_response(res)
            return

        # Remote Sync actions (pull, push, fetch)
        if parsed.path == '/api/git-sync':
            action = body.get('action', 'fetch')
            if action == 'pull':
                res = run_git_cmd(repo_path, ['pull'])
                if not res.get('stdout') and res.get('stderr'):
                    res['stdout'] = res['stderr']
            elif action == 'push':
                branch = body.get('branch', 'HEAD')
                res = run_git_cmd(repo_path, ['push', 'origin', branch])
                if not res.get('stdout') and res.get('stderr'):
                    res['stdout'] = res['stderr']
            else: # fetch
                res = run_git_cmd(repo_path, ['fetch', '--all', '--verbose'])
                if not res.get('stdout') and res.get('stderr'):
                    res['stdout'] = res['stderr']
                if not res.get('stdout'):
                    res['stdout'] = 'Fetched references from origin. Remote tracking branches updated.'
            self.send_json_response(res)
            return

        # Resolve conflict
        if parsed.path == '/api/resolve':
            file_path = body.get('filePath', '')
            resolution_code = body.get('code', '')
            res = resolve_file_conflict(repo_path, file_path, resolution_code)
            self.send_json_response(res)
            return

        # Smart Intent & Recommendation Copilot
        if parsed.path == '/api/analyze-intent':
            user_query = body.get('query', '')
            res = analyze_user_intent(repo_path, user_query)
            self.send_json_response(res)
            return

        self.send_error(404, 'Endpoint not found')

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Allow-Private-Network', 'true')
        self.send_header('Content-Length', '0')
        self.end_headers()

    def send_json_response(self, data, status=200):
        body = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Allow-Private-Network', 'true')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        pass


def main():
    server = ThreadingHTTPServer(('127.0.0.1', PORT), GitSurgeryRequestHandler)
    print("============================================================")
    print(f">> Git Surgery Live Bridge running at: http://localhost:{PORT}")
    print(f">> Managing Git Repositories in: {PARENT_DIR}")
    print("============================================================")
    sys.stdout.flush()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        server.server_close()


if __name__ == '__main__':
    main()
