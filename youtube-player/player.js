'use strict';

/**
 * Ya-ho! 유튜브 플레이어 — 독립 추출본
 * 원본 app.js의 YouTube IFrame API + 재생 UI 부분만 분리
 */

const $ = (id) => document.getElementById(id);
const STORAGE_KEY = 'yaho.player.v1';

const DEFAULT = {
  playlist: [],
  cur: 0,
  volume: 70,
  repeat: 'all', // all | one | off
};

let S = load();
let yt = null;
let ytReady = false;
let pendingPlay = null;
let progTimer = null;
let ytLoaded = false;
let seeking = false;
let toastT = null;

function load() {
  try {
    return Object.assign({}, DEFAULT, JSON.parse(localStorage.getItem(STORAGE_KEY)) || {});
  } catch {
    return { ...DEFAULT };
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(S));
}

function fmt(t) {
  t = Math.max(0, Math.floor(t || 0));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastT);
  toastT = setTimeout(() => { el.hidden = true; }, 1900);
}

function loadYT() {
  if (ytLoaded) return;
  ytLoaded = true;
  const script = document.createElement('script');
  script.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(script);
}

window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
  yt = new YT.Player('ytPlayer', {
    height: '1',
    width: '1',
    playerVars: { playsinline: 1 },
    events: {
      onReady() {
        ytReady = true;
        try { yt.setVolume(S.volume == null ? 70 : S.volume); } catch {}
        if (pendingPlay != null) {
          const i = pendingPlay;
          pendingPlay = null;
          playTrack(i);
        }
      },
      onStateChange: onState,
    },
  });
};

function onState(e) {
  if (e.data === YT.PlayerState.ENDED) {
    if (S.repeat === 'one') {
      try { yt.seekTo(0, true); yt.playVideo(); } catch {}
    } else if (S.repeat === 'all') {
      next();
    } else if (S.cur < S.playlist.length - 1) {
      next();
    } else {
      setPlaying(false);
    }
  } else if (e.data === YT.PlayerState.PLAYING) {
    setPlaying(true);
    startProg();
  } else if (e.data === YT.PlayerState.PAUSED) {
    setPlaying(false);
  }
}

function cycleRepeat() {
  S.repeat = S.repeat === 'all' ? 'one' : S.repeat === 'one' ? 'off' : 'all';
  save();
  updateRepeatUI();
  toast(S.repeat === 'all' ? '🔁 전체 반복' : S.repeat === 'one' ? '🔂 한 곡 반복' : '반복 끄기');
}

function updateRepeatUI() {
  const btn = $('pRepeat');
  if (!btn) return;
  btn.textContent = S.repeat === 'one' ? '🔂' : '🔁';
  btn.classList.toggle('on', S.repeat !== 'off');
}

function setPlaying(playing) {
  $('player').classList.toggle('playing', playing);
  $('pPlay').textContent = playing ? '⏸' : '▶';
}

function startProg() {
  clearInterval(progTimer);
  progTimer = setInterval(() => {
    if (seeking || !ytReady || !yt.getDuration) return;
    const cur = yt.getCurrentTime();
    const dur = yt.getDuration();
    $('pCur').textContent = fmt(cur);
    $('pDur').textContent = fmt(dur);
    $('pFill').style.width = dur ? `${(cur / dur) * 100}%` : '0%';
  }, 250);
}

function parseId(url) {
  if (!url) return null;
  url = url.trim();
  const patterns = [
    /[?&]v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /\/(?:embed|shorts|v|live)\/([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return /^[\w-]{11}$/.test(url) ? url : null;
}

async function addSong(url) {
  const id = parseId(url);
  if (!id) {
    toast('유튜브 링크가 아니야 🥲');
    return;
  }

  const song = {
    vid: id,
    title: '유튜브 노래',
    artist: 'YouTube',
    art: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
  };

  S.playlist.push(song);
  save();
  renderPlaylist();
  $('songUrl').value = '';
  toast('🎵 노래 추가!');
  loadYT();

  try {
    const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`);
    const meta = await res.json();
    if (meta?.title) {
      song.title = meta.title;
      song.artist = meta.author_name || 'YouTube';
      save();
      renderPlaylist();
      if (S.cur === S.playlist.length - 1) updatePlayerMeta();
    }
  } catch {}
}

function updatePlayerMeta() {
  const song = S.playlist[S.cur];
  if (!song) {
    $('playerTitle').textContent = '노래를 추가해 주세요';
    $('playerArtist').textContent = '아래에 유튜브 링크 붙여넣기 ↓';
    $('playerArt').style.backgroundImage = '';
    return;
  }
  $('playerTitle').textContent = song.title;
  $('playerArtist').textContent = song.artist;
  $('playerArt').style.backgroundImage = `url(${song.art})`;
}

function showPlayer() { $('player').hidden = false; }
function hidePlayer() { $('player').hidden = true; }

function playTrack(i) {
  if (!S.playlist.length) {
    showPlayer();
    updatePlayerMeta();
    return;
  }
  S.cur = ((i % S.playlist.length) + S.playlist.length) % S.playlist.length;
  save();
  updatePlayerMeta();
  showPlayer();
  renderPlaylist();
  if (ytReady) yt.loadVideoById(S.playlist[S.cur].vid);
  else {
    pendingPlay = S.cur;
    loadYT();
  }
}

function togglePlay() {
  showPlayer();
  if (!S.playlist.length) {
    updatePlayerMeta();
    toast('노래를 먼저 추가해줘! 🎧');
    return;
  }
  if (!ytReady) {
    playTrack(S.cur || 0);
    return;
  }
  const st = yt.getPlayerState();
  if (st === YT.PlayerState.PLAYING) yt.pauseVideo();
  else if ([YT.PlayerState.PAUSED, YT.PlayerState.CUED, YT.PlayerState.ENDED].includes(st)) yt.playVideo();
  else playTrack(S.cur || 0);
}

function openPlayer() {
  showPlayer();
  if (!S.playlist.length) {
    updatePlayerMeta();
    toast('노래를 먼저 추가해줘! 🎧');
    return;
  }
  if (!ytReady) {
    playTrack(S.cur || 0);
    return;
  }
  const st = yt.getPlayerState();
  if (st === YT.PlayerState.PLAYING) return;
  if (st === YT.PlayerState.PAUSED || st === YT.PlayerState.CUED) {
    yt.playVideo();
    return;
  }
  playTrack(S.cur || 0);
}

function next() { if (S.playlist.length) playTrack(S.cur + 1); }
function prev() { if (S.playlist.length) playTrack(S.cur - 1); }

function renderPlaylist() {
  const ul = $('playlist');
  if (!S.playlist.length) {
    ul.innerHTML = '<li class="empty">아직 노래가 없어요 🎵</li>';
    return;
  }
  ul.innerHTML = '';
  S.playlist.forEach((song, i) => {
    const li = document.createElement('li');
    li.className = i === S.cur ? 'cur' : '';
    li.innerHTML =
      `<span class="pl-art" style="background-image:url(${song.art})"></span>` +
      `<span class="pl-title">${song.title}</span>` +
      `<button class="pl-del" data-i="${i}">×</button>`;
    li.querySelector('.pl-title').onclick = () => playTrack(i);
    li.querySelector('.pl-art').onclick = () => playTrack(i);
    li.querySelector('.pl-del').onclick = (e) => {
      e.stopPropagation();
      S.playlist.splice(i, 1);
      if (S.cur >= S.playlist.length) S.cur = Math.max(0, S.playlist.length - 1);
      save();
      renderPlaylist();
      updatePlayerMeta();
    };
    ul.appendChild(li);
  });
}

function bind() {
  $('openBtn').onclick = openPlayer;

  document.addEventListener('click', (e) => {
    const pl = $('player');
    if (!pl || pl.hidden) return;
    if (pl.contains(e.target) || $('openBtn').contains(e.target)) return;
    hidePlayer();
  });

  $('playerClose').onclick = hidePlayer;
  $('playerMin').onclick = (e) => {
    e.stopPropagation();
    $('player').classList.toggle('collapsed');
  };
  $('pPlay').onclick = togglePlay;
  $('pNext').onclick = next;
  $('pPrev').onclick = prev;
  $('pRepeat').onclick = cycleRepeat;
  updateRepeatUI();

  const vol = $('pVol');
  vol.value = S.volume == null ? 70 : S.volume;
  $('pVolVal').textContent = vol.value;
  vol.oninput = () => {
    const val = +vol.value;
    S.volume = val;
    $('pVolVal').textContent = val;
    save();
    if (ytReady) {
      try {
        yt.setVolume(val);
        if (val > 0 && yt.isMuted?.()) yt.unMute();
      } catch {}
    }
  };

  const pbar = $('pBar');
  const barRatio = (cx) => {
    const r = pbar.getBoundingClientRect();
    return Math.max(0, Math.min(1, (cx - r.left) / r.width));
  };
  const preview = (cx) => {
    const ratio = barRatio(cx);
    $('pFill').style.width = `${ratio * 100}%`;
    if (ytReady && yt.getDuration) $('pCur').textContent = fmt(yt.getDuration() * ratio);
    return ratio;
  };

  pbar.addEventListener('pointerdown', (e) => {
    seeking = true;
    try { pbar.setPointerCapture(e.pointerId); } catch {}
    preview(e.clientX);
  });
  pbar.addEventListener('pointermove', (e) => { if (seeking) preview(e.clientX); });
  const endSeek = (e) => {
    if (!seeking) return;
    const ratio = preview(e.clientX);
    seeking = false;
    try { pbar.releasePointerCapture(e.pointerId); } catch {}
    if (ytReady && yt.getDuration) yt.seekTo(yt.getDuration() * ratio, true);
  };
  pbar.addEventListener('pointerup', endSeek);
  pbar.addEventListener('pointercancel', () => { seeking = false; });

  $('songForm').onsubmit = (e) => {
    e.preventDefault();
    addSong($('songUrl').value);
  };
}

bind();
updatePlayerMeta();
renderPlaylist();
