(function (root) {
  'use strict';

  // This module keeps only a small, explicit set of local interaction facts.
  // It never receives media, filenames, captions, or the creator's own words.
  const STORAGE_KEY = 'pianyu-local-events-v1';
  const LIMIT = 300;
  const SCOPE = 'local_demo';
  const EVENT_LABELS = Object.freeze({
    task_started: '开始整理',
    draft_generated: '初稿已呈现',
    rewrite_suggested: '查看改写建议',
    caption_saved: '保存字幕修改',
    caption_visibility_changed: '调整字幕显示',
    segment_locked: '调整片段锁定',
    segment_reordered: '调整片段顺序',
    draft_feedback: '反馈初稿感受',
    draft_accepted: '确认初稿可用',
    generation_failed: '本次整理中断',
    video_render_succeeded: '视频文件已生成',
    download_requested: '发起文件下载',
    export_cancelled: '取消视频导出',
    export_interrupted: '视频导出中断',
    copy_requested: '请求复制文案',
    template_changed: '切换创作模板',
    new_task: '新建创作草稿'
  });
  const EVENT_NAMES = new Set(Object.keys(EVENT_LABELS));
  const MODES = new Set(['sample', 'custom']);
  const TEMPLATES = new Set(['diary', 'coast']);
  const SAMPLE_IDS = new Set(['tram', 'coffee', 'sea', 'dog', 'sand', 'dusk']);
  const REASONS = new Set([
    'too_generic', 'mismatch', 'pacing', 'factual_error', 'not_like_me', 'other',
    'user_cancelled', 'tab_hidden', 'simulated_failure', 'service_unavailable',
    'asset_unavailable', 'unsupported_browser', 'render_error', 'copy_failed', 'unknown'
  ]);
  const STATUSES = new Set([
    'started', 'generated', 'suggested', 'saved', 'locked', 'unlocked',
    'shown', 'hidden', 'accepted', 'needs_edit', 'rejected', 'success',
    'failed', 'cancelled', 'interrupted', 'requested', 'copied', 'changed',
    'pending', 'complete'
  ]);
  const FIELDS = [
    'task_id', 'mode', 'template', 'attempt', 'is_simulated', 'reason',
    'status', 'revision', 'segment_id', 'music', 'duration'
  ];
  const SAFE_TASK_ID = /^(?:(?:task|draft|demo|pianyu|session)-[a-z0-9_-]{1,64}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/i;

  function ownValues(context) {
    const values = Object.create(null);
    if (!context || typeof context !== 'object' || Array.isArray(context)) return values;
    for (const key of FIELDS) {
      // Ignore getters and inherited values as well as unknown keys.
      let descriptor;
      try { descriptor = Object.getOwnPropertyDescriptor(context, key); } catch (_) { continue; }
      if (descriptor && Object.prototype.hasOwnProperty.call(descriptor, 'value')) {
        values[key] = descriptor.value;
      }
    }
    return values;
  }

  function cleanContext(context) {
    const values = ownValues(context);
    const clean = {};
    if (typeof values.task_id === 'string' && SAFE_TASK_ID.test(values.task_id)) clean.task_id = values.task_id;
    if (MODES.has(values.mode)) clean.mode = values.mode;
    if (TEMPLATES.has(values.template)) clean.template = values.template;
    if (Number.isInteger(values.attempt) && values.attempt >= 0 && values.attempt <= 1000000) clean.attempt = values.attempt;
    if (typeof values.is_simulated === 'boolean') clean.is_simulated = values.is_simulated;
    if (REASONS.has(values.reason)) clean.reason = values.reason;
    if (STATUSES.has(values.status)) clean.status = values.status;
    if (Number.isInteger(values.revision) && values.revision >= 0 && values.revision <= 1000000) clean.revision = values.revision;
    if (values.mode === 'sample' && SAMPLE_IDS.has(values.segment_id)) clean.segment_id = values.segment_id;
    if (values.mode === 'custom' && typeof values.segment_id === 'string') clean.segment_id = 'local';
    if (typeof values.music === 'boolean') clean.music = values.music;
    if (typeof values.duration === 'number' && Number.isFinite(values.duration) && values.duration >= 0 && values.duration <= 3600) clean.duration = values.duration;
    return clean;
  }

  function readSaved() {
    try {
      const payload = JSON.parse(root.localStorage.getItem(STORAGE_KEY) || 'null');
      const saved = payload && payload.scope === SCOPE && Array.isArray(payload.events) ? payload.events : [];
      return saved.filter(event => event && EVENT_NAMES.has(event.type) &&
        typeof event.timestamp === 'string' && Number.isFinite(Date.parse(event.timestamp)))
        .slice(-LIMIT)
        .map(event => ({
          type: event.type,
          timestamp: new Date(event.timestamp).toISOString(),
          scope: SCOPE,
          ...cleanContext(event)
        }));
    } catch (_) { return []; }
  }

  let events = readSaved();

  function persist() {
    try {
      root.localStorage.setItem(STORAGE_KEY, JSON.stringify({ schema_version: 1, scope: SCOPE, events }));
    } catch (_) {
      // Browsers can deny storage. The current session continues in memory.
    }
  }

  function getEvents() {
    return events.map(event => ({ ...event }));
  }

  function record(type, context) {
    try {
      if (!EVENT_NAMES.has(type)) return null;
      const event = { type, timestamp: new Date().toISOString(), scope: SCOPE, ...cleanContext(context) };
      events.push(event);
      if (events.length > LIMIT) events = events.slice(-LIMIT);
      persist();
      return { ...event };
    } catch (_) { return null; }
  }

  function download() {
    try {
      if (!root.document || !root.URL || typeof root.URL.createObjectURL !== 'function' || typeof root.Blob !== 'function') return false;
      const payload = { schema_version: 1, scope: SCOPE, generated_at: new Date().toISOString(), events: getEvents() };
      const blob = new root.Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = root.URL.createObjectURL(blob);
      const anchor = root.document.createElement('a');
      anchor.href = url;
      anchor.download = '片语-本次操作记录.json';
      root.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      if (typeof root.setTimeout === 'function') root.setTimeout(() => root.URL.revokeObjectURL(url), 10000);
      else root.URL.revokeObjectURL(url);
      return true;
    } catch (_) { return false; }
  }

  function renderList(element) {
    try {
      if (!element || !root.document || typeof element.appendChild !== 'function') return false;
      element.textContent = '';
      const recent = events.slice(-8).reverse();
      if (!recent.length) {
        const empty = root.document.createElement('p');
        empty.className = 'telemetry-empty';
        empty.textContent = '还没有操作记录。只记录本机的操作类型，不记录创作文字和素材。';
        element.appendChild(empty);
        return true;
      }
      const list = root.document.createElement('ol');
      list.className = 'telemetry-events';
      for (const event of recent) {
        const row = root.document.createElement('li');
        const label = root.document.createElement('span');
        const time = root.document.createElement('time');
        label.textContent = EVENT_LABELS[event.type];
        time.dateTime = event.timestamp;
        time.textContent = new Date(event.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        row.appendChild(label);
        row.appendChild(time);
        list.appendChild(row);
      }
      element.appendChild(list);
      return true;
    } catch (_) { return false; }
  }

  root.PianyuTelemetry = Object.freeze({ record, getEvents, download, renderList });
})(window);
