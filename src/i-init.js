
/* ================= START ================= */
S.installed=S.installed.filter(i=>APPS[i]);
VFS.syncApps(); applySettings(); buildMenubar(); refreshDock(); drawIcons();
if(S.wall==='auto')setInterval(applySettings,600000);
boot();
