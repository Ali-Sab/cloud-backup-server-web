import { useEffect, useMemo, useState } from 'react';
import { api, API_URL } from './api';
import './styles.css';

const TEST_ACCOUNT = { email: 'user@email.com', password: 'password' };

const iconPaths = {
  home: 'M3 10.5 12 3l9 7.5v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z',
  files: 'M4 5.5A2.5 2.5 0 0 1 6.5 3H10l2 2h5.5A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-11Z',
  activity: 'M4 12h3l2-7 4 14 2-7h5',
  settings: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm0-6v2m0 15v2M3.5 12h2m13 0h2M5.99 5.99l1.42 1.42m9.18 9.18 1.42 1.42m0-12.02-1.42 1.42m-9.18 9.18-1.42 1.42',
  arrow: 'M5 12h13m-6-6 6 6-6 6',
  chevron: 'm9 18 6-6-6-6',
  shield: 'M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z',
  plus: 'M12 5v14M5 12h14',
  search: 'm20 20-4.2-4.2m1.2-5.3a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z',
  logout: 'M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10m4-4 3-3-3-3m3 3H9',
  close: 'm6 6 12 12M18 6 6 18',
};

function Icon({ name, size = 20 }) {
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={iconPaths[name]} /></svg>;
}

function extractList(payload, key) {
  if (Array.isArray(payload)) return payload;
  return payload?.[key] || [];
}

function formatSize(bytes = 0) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDate(value, fallback = 'Not yet') {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
}

function relativeTime(value) {
  if (!value) return 'No activity yet';
  const time = new Date(value).getTime();
  const minutes = Math.max(1, Math.round((Date.now() - time) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} days ago`;
}

function totalForFolder(folder) {
  return folder.file_count ?? folder.fileCount ?? folder.files ?? 0;
}

function sizeForFolder(folder) {
  return folder.total_size ?? folder.totalSize ?? folder.size ?? 0;
}

function lastBackupForFolder(folder) {
  return folder.last_backup_at ?? folder.lastBackupAt ?? folder.last_backed_up_at;
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'login' && email.trim().toLowerCase() === TEST_ACCOUNT.email && password === TEST_ACCOUNT.password) {
        onAuthenticated({ email: TEST_ACCOUNT.email, mock: true });
        return;
      }
      const result = mode === 'login' ? await api.login(email, password) : await api.register(email, password);
      onAuthenticated(result?.user || { email });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  function useDemoAccount() {
    setEmail(TEST_ACCOUNT.email);
    setPassword(TEST_ACCOUNT.password);
    setError('');
    setMode('login');
    onAuthenticated({ email: TEST_ACCOUNT.email, mock: true });
  }

  return <div className="auth-page">
    <div className="auth-brand"><span className="brand-mark"><Icon name="shield" size={22} /></span><span>Cloud Backup</span></div>
    <div className="auth-hero">
      <p className="eyebrow">Your files, in your hands</p>
      <h1>Backup confidence<br /><em>wherever you are.</em></h1>
      <p className="auth-copy">Keep an eye on your backup health and reach your protected files from any screen.</p>
    </div>
    <form className="auth-card" onSubmit={submit}>
      <div className="auth-card-heading"><h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p>{mode === 'login' ? 'Sign in to see your backup status.' : 'Start keeping your cloud backups organized.'}</p></div>
      <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required placeholder="you@example.com" /></label>
      <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={6} placeholder="At least 6 characters" /></label>
      {error && <div className="form-error">{error}</div>}
      <button className="primary-button wide" disabled={busy}>{busy ? 'Connecting…' : mode === 'login' ? 'Sign in' : 'Create account'} <Icon name="arrow" size={18} /></button>
      {mode === 'login' && <button type="button" className="demo-button" onClick={useDemoAccount}>Use demo account</button>}
      <button type="button" className="text-button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button>
    </form>
    <p className="mock-note">Demo login: user@email.com / password. This stays local to the PWA.</p>
    <p className="auth-endpoint">Connected to <strong>{API_URL}</strong></p>
  </div>;
}

function AppHeader({ user, onProfile }) {
  const initials = (user?.email || 'U').slice(0, 1).toUpperCase();
  return <header className="topbar"><div className="brand"><span className="brand-mark"><Icon name="shield" size={18} /></span><span>Cloud Backup</span></div><button className="avatar" onClick={onProfile} aria-label="Open account menu">{initials}</button></header>;
}

function StatusCard({ folders, activity }) {
  const files = folders.reduce((total, folder) => total + Number(totalForFolder(folder)), 0);
  const size = folders.reduce((total, folder) => total + Number(sizeForFolder(folder)), 0);
  const latest = folders.map(lastBackupForFolder).filter(Boolean).sort().pop();
  return <section className="status-card">
    <div className="status-card-top"><span className="status-icon"><Icon name="shield" size={22} /></span><span className="status-pill"><span className="status-dot" /> Connected</span></div>
    <p className="status-label">Backup status</p>
    <h2>{folders.length ? 'Your backups are ready' : 'No folders yet'}</h2>
    <p className="status-subtitle">{latest ? `Last backup ${relativeTime(latest)}.` : 'Add a folder from the desktop client to start backing up.'}</p>
    <div className="status-metrics"><div><strong>{folders.length}</strong><span>Folders</span></div><div><strong>{files.toLocaleString()}</strong><span>Files</span></div><div><strong>{formatSize(size)}</strong><span>Protected</span></div></div>
    {activity?.length > 0 && <div className="status-foot"><span>Latest activity</span><strong>{relativeTime(activity[0].backed_up_at)}</strong></div>}
  </section>;
}

function FolderCard({ folder, onOpen }) {
  const lastBackup = lastBackupForFolder(folder);
  return <button className="folder-card" onClick={() => onOpen(folder)}><div className="folder-card-top"><span className="folder-icon"><Icon name="files" size={18} /></span><span className="health-label"><span className="health-dot" /> Protected</span></div><div className="folder-name">{folder.name || folder.path || 'Unnamed folder'}</div><div className="folder-path">{folder.path || 'Cloud folder'}</div><div className="folder-card-bottom"><span>{Number(totalForFolder(folder)).toLocaleString()} files · {formatSize(sizeForFolder(folder))}</span><span>{lastBackup ? relativeTime(lastBackup) : 'Not backed up'}</span><Icon name="chevron" size={16} /></div></button>;
}

function HomeView({ folders, activity, loading, error, onOpenFolder, onRetry }) {
  return <div className="view home-view"><div className="page-heading"><div><p className="eyebrow">Overview</p><h1>Good to see you</h1></div><span className="live-indicator"><span className="status-dot" /> Live</span></div>{error && <InlineError message={error} onRetry={onRetry} />}{loading ? <LoadingState label="Loading your backup health…" /> : <><StatusCard folders={folders} activity={activity} /><div className="section-heading"><div><p className="eyebrow">Your library</p><h2>Folders</h2></div><span className="section-count">{folders.length} total</span></div>{folders.length ? <div className="folder-list">{folders.map((folder) => <FolderCard key={folder.id ?? folder.path} folder={folder} onOpen={onOpenFolder} />)}</div> : <EmptyState title="No folders connected" copy="Folders are added from the desktop client. Once connected, their backup health will appear here." />}</>}</div>;
}

function FilesView({ folders, selectedFolder, onSelectFolder }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!selectedFolder) return;
    setLoading(true);
    setError('');
    api.folderFiles(selectedFolder.id).then((payload) => setFiles(extractList(payload, 'files'))).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, [selectedFolder]);

  const filteredFiles = useMemo(() => files.filter((file) => (file.relative_path || file.relativePath || file.name || '').toLowerCase().includes(query.toLowerCase())), [files, query]);
  return <div className="view"><div className="page-heading compact"><div><p className="eyebrow">Cloud files</p><h1>Files</h1></div><span className="read-only-tag">Read only</span></div>{folders.length > 0 && <div className="folder-select-wrap"><label htmlFor="folder-select">Folder</label><select id="folder-select" value={selectedFolder?.id ?? ''} onChange={(event) => onSelectFolder(folders.find((folder) => String(folder.id) === event.target.value))}>{folders.map((folder) => <option value={folder.id} key={folder.id}>{folder.name || folder.path}</option>)}</select></div>}{!selectedFolder ? <EmptyState title="No cloud folders" copy="Once a folder is connected, its protected files will be available here." /> : <><div className="search-box"><Icon name="search" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search files" aria-label="Search files" /></div>{error && <InlineError message={error} onRetry={() => onSelectFolder({ ...selectedFolder })} />}{loading ? <LoadingState label="Loading files…" /> : filteredFiles.length ? <div className="file-list">{filteredFiles.map((file, index) => <div className="file-row" key={`${file.relative_path || file.relativePath}-${index}`}><span className="file-type"><Icon name={file.isDirectory ? 'files' : 'files'} size={18} /></span><div className="file-info"><strong>{(file.relative_path || file.relativePath || file.name || 'Untitled').split('/').pop()}</strong><span>{file.relative_path || file.relativePath || 'Protected file'}</span></div><div className="file-meta">{file.isDirectory ? 'Folder' : formatSize(file.size)}<Icon name="chevron" size={15} /></div></div>)}</div> : <EmptyState title="No files found" copy={query ? 'Try another search term.' : 'This folder has no synced files yet.'} />}</>}</div>;
}

function ActivityView({ activity, folders, loading, error, onRetry }) {
  const [folderId, setFolderId] = useState('');
  const visible = folderId ? activity.filter((item) => String(item.watched_path_id ?? item.folder_id) === folderId) : activity;
  return <div className="view"><div className="page-heading compact"><div><p className="eyebrow">Backup history</p><h1>Activity</h1></div><span className="section-count">{activity.length} recent</span></div><div className="folder-select-wrap"><label htmlFor="activity-filter">Filter</label><select id="activity-filter" value={folderId} onChange={(event) => setFolderId(event.target.value)}><option value="">All folders</option>{folders.map((folder) => <option value={folder.id} key={folder.id}>{folder.name || folder.path}</option>)}</select></div>{error && <InlineError message={error} onRetry={onRetry} />}{loading ? <LoadingState label="Loading activity…" /> : visible.length ? <div className="activity-list">{visible.map((item, index) => <div className="activity-row" key={`${item.id}-${index}`}><span className="activity-icon"><Icon name="shield" size={17} /></span><div className="activity-info"><strong>{(item.relative_path || 'File backup').split('/').pop()}</strong><span>{item.folder_name || item.folder_path || 'Cloud folder'} · v{item.version || 1}</span></div><div className="activity-meta"><strong>{formatSize(item.size)}</strong><span>{relativeTime(item.backed_up_at)}</span></div></div>)}</div> : <EmptyState title="No activity yet" copy="Completed backups will appear here as your files are protected." />}</div>;
}

function SettingsView({ user, onSignOut, onManageAccount }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('cloud-backup-theme') || 'light');
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('cloud-backup-theme', theme); }, [theme]);
  return <div className="view"><div className="page-heading compact"><div><p className="eyebrow">Preferences</p><h1>Settings</h1></div></div><section className="settings-card"><div className="settings-card-heading"><span className="settings-icon"><Icon name="settings" size={18} /></span><div><h2>Appearance</h2><p>Choose how Cloud Backup feels on your device.</p></div></div><div className="segmented"><button className={theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')}>Light</button><button className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')}>Dark</button></div></section><section className="settings-card"><div className="settings-card-heading"><span className="settings-icon"><Icon name="shield" size={18} /></span><div><h2>Connection</h2><p>Requests use secure browser cookies and the configured API server.</p></div></div><div className="connection-row"><span>API server</span><strong>{API_URL}</strong></div></section><section className="settings-card"><div className="settings-card-heading"><span className="avatar large">{(user?.email || 'U').slice(0, 1).toUpperCase()}</span><div><h2>Account</h2><p>{user?.email || 'Signed-in user'}</p></div></div><button className="secondary-button wide" onClick={onManageAccount}>Manage account</button><button className="secondary-button wide" onClick={onSignOut}><Icon name="logout" size={17} /> Sign out</button></section><p className="deferred-note">Account management is currently a local mock and does not change backend data.</p></div>;
}

function AccountManagementPanel({ user, onClose }) {
  const [action, setAction] = useState('overview');
  const [submitted, setSubmitted] = useState(false);

  function chooseAction(nextAction) {
    setAction(nextAction);
    setSubmitted(false);
  }

  function submit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  const actionDetails = {
    reset: { title: 'Reset password', copy: 'Send a mock reset link to your account email.' },
    email: { title: 'Change email', copy: 'Update the email address used for this mock account.' },
    password: { title: 'Change password', copy: 'Set a new password for this mock account.' },
    delete: { title: 'Delete account', copy: 'This mock confirmation does not delete any data.' },
  };
  const details = actionDetails[action];

  return <div className="modal-backdrop" onClick={onClose}><div className="profile-panel account-panel" onClick={(event) => event.stopPropagation()}><div className="panel-handle" /><div className="profile-header"><div className="avatar large">{(user?.email || 'U').slice(0, 1).toUpperCase()}</div><div><p className="eyebrow">Account management</p><h2>{user?.email || 'Cloud Backup user'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close account management"><Icon name="close" size={19} /></button></div>{action === 'overview' ? <div className="account-actions"><button className="account-action" onClick={() => chooseAction('reset')}><strong>Reset password</strong><span>Request a mock password reset link</span><Icon name="chevron" size={17} /></button><button className="account-action" onClick={() => chooseAction('email')}><strong>Change email</strong><span>Preview the email change flow</span><Icon name="chevron" size={17} /></button><button className="account-action" onClick={() => chooseAction('password')}><strong>Change password</strong><span>Preview the password change flow</span><Icon name="chevron" size={17} /></button><button className="account-action danger" onClick={() => chooseAction('delete')}><strong>Delete account</strong><span>Preview the deletion confirmation</span><Icon name="chevron" size={17} /></button></div> : <div className="account-form-wrap"><button className="back-button" onClick={() => chooseAction('overview')}>Back to account options</button><h3>{details.title}</h3><p>{details.copy}</p>{submitted ? <div className="account-success"><strong>Mock action complete</strong><span>No account data was changed.</span><button className="secondary-button wide" onClick={() => chooseAction('overview')}>Done</button></div> : <form className="account-form" onSubmit={submit}>{action === 'reset' && <label>Email address<input type="email" value={user?.email || ''} readOnly /></label>}{action === 'email' && <label>New email address<input type="email" placeholder="new@example.com" required /></label>}{action === 'password' && <><label>Current password<input type="password" required /></label><label>New password<input type="password" minLength="6" required /></label></>}{action === 'delete' && <label>Type DELETE to confirm<input pattern="DELETE" placeholder="DELETE" required /></label>}<button className={`primary-button wide ${action === 'delete' ? 'danger-button' : ''}`}>{action === 'reset' ? 'Send reset link' : action === 'email' ? 'Save email' : action === 'password' ? 'Save password' : 'Confirm deletion'}</button></form>}</div>}</div></div>;
}

function ProfilePanel({ user, onClose, onSignOut }) {
  return <div className="modal-backdrop" onClick={onClose}><div className="profile-panel" onClick={(event) => event.stopPropagation()}><div className="panel-handle" /><div className="profile-header"><div className="avatar large">{(user?.email || 'U').slice(0, 1).toUpperCase()}</div><div><p className="eyebrow">Signed in as</p><h2>{user?.email || 'Cloud Backup user'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close profile"><Icon name="close" size={19} /></button></div><button className="panel-action" onClick={onSignOut}><Icon name="logout" size={18} /> Sign out</button></div></div>;
}

function InlineError({ message, onRetry }) {
  return <div className="inline-error"><span>{message}</span><button onClick={onRetry}>Retry</button></div>;
}

function LoadingState({ label }) {
  return <div className="loading-state"><span className="spinner" />{label}</div>;
}

function EmptyState({ title, copy }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name="files" size={22} /></span><h3>{title}</h3><p>{copy}</p></div>;
}

function BottomNav({ activeView, onChange }) {
  const items = [['home', 'Home'], ['files', 'Files'], ['activity', 'Activity'], ['settings', 'Settings']];
  return <nav className="bottom-nav" aria-label="Primary navigation">{items.map(([key, label]) => <button key={key} className={activeView === key ? 'active' : ''} onClick={() => onChange(key)}><Icon name={key} size={20} /><span>{label}</span></button>)}</nav>;
}

export default function App() {
  const [session, setSession] = useState({ loading: true, user: null, error: '' });
  const [view, setView] = useState('home');
  const [folders, setFolders] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [accountManagementOpen, setAccountManagementOpen] = useState(false);

  async function loadData() {
    setLoadingData(true);
    setDataError('');
    try {
      const [folderPayload, historyPayload] = await Promise.all([api.folders(), api.history()]);
      const nextFolders = extractList(folderPayload, 'folders');
      setFolders(nextFolders);
      setActivity(extractList(historyPayload, 'items'));
      setSelectedFolder((current) => current && nextFolders.find((folder) => folder.id === current.id) ? current : nextFolders[0] || null);
    } catch (requestError) {
      setDataError(requestError.message);
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => { api.session().then((payload) => setSession({ loading: false, user: payload?.user || null, error: '' })).catch((requestError) => setSession({ loading: false, user: null, error: requestError.message })); }, []);
  useEffect(() => { if (session.user) loadData(); }, [session.user]);

  async function signOut() {
    await api.logout().catch(() => {});
    setProfileOpen(false);
    setSession({ loading: false, user: null, error: '' });
  }

  if (session.loading) return <div className="splash"><span className="brand-mark"><Icon name="shield" size={22} /></span><span>Loading Cloud Backup</span></div>;
  if (!session.user) return <AuthScreen onAuthenticated={(user) => setSession({ loading: false, user, error: '' })} />;

  return <div className="app-shell"><AppHeader user={session.user} onProfile={() => setProfileOpen(true)} /><main>{view === 'home' && <HomeView folders={folders} activity={activity} loading={loadingData} error={dataError} onOpenFolder={(folder) => { setSelectedFolder(folder); setView('files'); }} onRetry={loadData} />}{view === 'files' && <FilesView folders={folders} selectedFolder={selectedFolder} onSelectFolder={setSelectedFolder} />}{view === 'activity' && <ActivityView activity={activity} folders={folders} loading={loadingData} error={dataError} onRetry={loadData} />}{view === 'settings' && <SettingsView user={session.user} onSignOut={signOut} onManageAccount={() => setAccountManagementOpen(true)} />}</main><BottomNav activeView={view} onChange={setView} />{profileOpen && <ProfilePanel user={session.user} onClose={() => setProfileOpen(false)} onSignOut={signOut} />}{accountManagementOpen && <AccountManagementPanel user={session.user} onClose={() => setAccountManagementOpen(false)} />}</div>;
}
