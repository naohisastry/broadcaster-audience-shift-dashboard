// シリーズA ダッシュボード v1.10.0 — 描画ロジック
// 数値はすべて window.SERIES_A_DATA（data_v1100.js）から読む。ここに数値を直書きしない。
(function () {
  const D = window.SERIES_A_DATA;
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const C = () => ({
    s1: css('--series-1'), s2: css('--series-2'), s3: css('--series-3'),
    s4: css('--series-4'), s5: css('--series-5'), jp: css('--jp'), fr: css('--fr'), uk: css('--uk'), de: css('--de'),
    text: css('--text-primary'), text2: css('--text-secondary'), muted: css('--text-muted'),
    grid: css('--grid'), surface: css('--surface-1'), brk: css('--break-line')
  });
  const fmt = (v, d = 1) => (v == null ? '—' : Number(v).toLocaleString('ja-JP', { minimumFractionDigits: d, maximumFractionDigits: d }));
  const charts = {};

  // ---------- 共通プラグイン ----------
  // 断絶線：xラベル a と b の間に破線と注記
  const breakPlugin = {
    id: 'breakLine',
    afterDatasetsDraw(chart, args, opts) {
      if (!opts || !opts.after) return;
      const x = chart.scales.x; const area = chart.chartArea;
      const labels = chart.data.labels.map(String);
      const i = labels.indexOf(String(opts.after));
      if (i < 0 || i + 1 >= labels.length) return;
      const px = (x.getPixelForValue(i) + x.getPixelForValue(i + 1)) / 2;
      const ctx = chart.ctx; const c = C();
      ctx.save();
      ctx.strokeStyle = c.brk; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(px, area.top); ctx.lineTo(px, area.bottom); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = c.text2; ctx.font = '11px system-ui, sans-serif';
      ctx.textAlign = 'right'; ctx.fillText(opts.label || '調査枠組みの変更', px - 4, area.top + 12);
      ctx.restore();
    }
  };
  // 基準線：y = value
  const refLinePlugin = {
    id: 'refLine',
    afterDatasetsDraw(chart, args, opts) {
      if (!opts || opts.value == null) return;
      const y = chart.scales.y.getPixelForValue(opts.value); const area = chart.chartArea;
      const ctx = chart.ctx; const c = C();
      ctx.save(); ctx.strokeStyle = c.text2; ctx.lineWidth = 1; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(area.left, y); ctx.lineTo(area.right, y); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = c.text2; ctx.font = '11px system-ui, sans-serif';
      ctx.textAlign = 'left'; ctx.fillText(opts.label || '', area.left + 4, y - 4);
      ctx.restore();
    }
  };
  Chart.register(breakPlugin, refLinePlugin);

  function baseOptions(extra = {}) {
    const c = C();
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.08)';
    Chart.defaults.font.family = '"Plus Jakarta Sans", "Noto Sans JP", sans-serif';
    return Object.assign({
      responsive: true, maintainAspectRatio: false, animation: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', align: 'start', labels: { color: c.text, boxWidth: 12, boxHeight: 12, usePointStyle: true } },
        tooltip: { backgroundColor: c.surface, titleColor: c.text, bodyColor: c.text, borderColor: c.grid, borderWidth: 1, padding: 10 }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: c.text2 } },
        y: { grid: { color: c.grid }, ticks: { color: c.text2 }, border: { display: false } }
      }
    }, extra);
  }
  const line = (label, data, color, o = {}) => Object.assign({ type: 'line', label, data, borderColor: color, backgroundColor: color, borderWidth: 2, pointRadius: 3, pointHoverRadius: 6, spanGaps: false, tension: 0 }, o);
  const bar = (label, data, color, o = {}) => Object.assign({ type: 'bar', label, data, backgroundColor: color, borderColor: C().surface, borderWidth: { top: 2 }, borderRadius: 0 }, o);
  function render(id, cfg) { if (!cfg.type) cfg.type = cfg.data.datasets[0].type || 'line'; if (charts[id]) charts[id].destroy(); charts[id] = new Chart(document.getElementById(id), cfg); }

  // ---------- テキスト差し込み ----------
  function fillCard(key) {
    const f = D[key];
    const card = document.querySelector(`[data-fig="${key}"]`);
    card.querySelector('.fig-id').textContent = `図${f.id}`;
    card.querySelector('.fig-title').textContent = f.title;
    card.querySelector('.fig-chapter').textContent = `原稿：${f.chapter}`;
    const notes = card.querySelector('.fig-notes');
    notes.innerHTML = f.notes.map(n => `<li>${n}</li>`).join('');
    const src = [];
    const collect = (o) => { if (!o || typeof o !== 'object') return; if (o.source) src.push(o.source); Object.values(o).forEach(v => { if (v && typeof v === 'object' && !Array.isArray(v)) collect(v); }); };
    collect(f);
    card.querySelector('.fig-source').innerHTML = '出典：' + [...new Set(src)].join('／');
  }
  function table(el, head, rows) {
    el.innerHTML = `<table class="evidence-table"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((v, i) => `<td class="${i ? 'num' : ''}">${v}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }
  function toggles(card, onChange) {
    card.querySelectorAll('.pill-btn-group .pill-btn:not(.age-chip)').forEach(b => b.addEventListener('click', () => {
      b.parentElement.querySelectorAll('.pill-btn').forEach(x => x.classList.remove('active'));
      b.classList.add('active'); onChange(b.dataset.view);
    }));
  }

  // ---------- 図1-1 ----------
  function fig1_1(view = 'index') {
    const f = D.fig1_1; const c = C();
    const years = [...f.japan.years, ...f.japan.ref2024.years];
    const jpBase = f.japan.minutes[0]; const frBase = f.france.minutes[0];
    const pad = (arr, n) => arr.concat(Array(n).fill(null));
    const jp = view === 'index' ? f.japan.minutes.map(v => +(v / jpBase * 100).toFixed(1)) : f.japan.minutes;
    const jpRef = view === 'index' ? f.japan.ref2024.minutes.map(v => +(v / jpBase * 100).toFixed(1)) : f.japan.ref2024.minutes;
    const fr = view === 'index' ? f.france.minutes.map(v => +(v / frBase * 100).toFixed(1)) : f.france.minutes;
    const unit = view === 'index' ? '' : '分';
    render('c1_1', {
      data: { labels: years, datasets: [
        line(f.japan.label, pad(jp, 2), c.jp),
        line(f.japan.ref2024.label, Array(10).fill(null).concat(jpRef), c.jp, { borderDash: [5, 4], pointStyle: 'rectRot', pointRadius: 4 }),
        line(f.france.label, pad(fr, 2), c.fr)
      ] },
      options: baseOptions({
        plugins: Object.assign(baseOptions().plugins, {
          breakLine: { after: 2023, label: '2024年〜 調査対象の変更' },
          refLine: view === 'index' ? { value: 100, label: '2014年＝100' } : {},
          tooltip: Object.assign(baseOptions().plugins.tooltip, { callbacks: { label: (x) => x.raw == null ? null : `${x.dataset.label}：${fmt(x.raw)}${unit}` } })
        }),
        scales: Object.assign(baseOptions().scales, { y: Object.assign(baseOptions().scales.y, { title: { display: true, text: view === 'index' ? '指数（2014年＝100）' : '分／日' }, suggestedMin: view === 'index' ? 70 : 100 }) })
      })
    });
    table(document.querySelector('[data-fig="fig1_1"] .fig-table'), ['年', '日本（分）', '日本 指数', 'フランス（分）', 'フランス 指数'],
      years.map((y, i) => {
        const jm = i < 10 ? f.japan.minutes[i] : f.japan.ref2024.minutes[i - 10];
        const fm = i < 10 ? f.france.minutes[i] : null;
        return [y + (i >= 10 ? '（13〜79歳）' : ''), fmt(jm), fmt(jm / jpBase * 100), fm == null ? '—' : fmt(fm, 0), fm == null ? '—' : fmt(fm / frBase * 100)];
      }));
  }

  // ---------- 図1-2 ----------
  function fig1_2(view = 'japan') {
    const f = D.fig1_2; const c = C(); const js = f.japanSeries;
    const el = document.querySelector('[data-fig="fig1_2"] .fig-table');
    if (view === 'japan') {
      render('c1_2', {
        data: { labels: js.years, datasets: [
          bar('テレビ（リアルタイム＋録画）', js.tv, c.s1, { stack: 's' }),
          bar('動画共有（YouTube等）', js.sharing, c.s2, { stack: 's' }),
          bar('配信サービス（TVer・Netflix等）', js.streaming, c.s3, { stack: 's' })
        ] },
        options: baseOptions({
          plugins: Object.assign(baseOptions().plugins, {
            breakLine: { after: js.breakAfter, label: '2024年〜 70代を追加' },
            tooltip: Object.assign(baseOptions().plugins.tooltip, { callbacks: { label: (x) => `${x.dataset.label}：${fmt(x.raw)}分`, footer: (items) => `総動画：${fmt(js.total[items[0].dataIndex])}分` } })
          }),
          scales: { x: Object.assign(baseOptions().scales.x, { stacked: true }), y: Object.assign(baseOptions().scales.y, { stacked: true, title: { display: true, text: '分／日（週平均）' } }) }
        })
      });
      table(el, ['年度', 'テレビ', '動画共有', '配信', '総動画', 'オンデマンド比率'], js.years.map((y, i) => [y, fmt(js.tv[i]), fmt(js.sharing[i]), fmt(js.streaming[i]), fmt(js.total[i]), fmt((js.sharing[i] + js.streaming[i]) / js.total[i] * 100) + '%']));
    } else if (view === 'snapshot') {
      const s = f.snapshot2025;
      const pct = (arr) => { const t = arr.reduce((a, b) => a + b, 0); return arr.map(v => +(v / t * 100).toFixed(1)); };
      const jp = pct(s.japan.minutes); const fr = pct(s.france.minutes);
      const mins = [s.japan.minutes, s.france.minutes];
      render('c1_2', {
        type: 'bar',
        data: { labels: [s.japan.label, s.france.label], datasets: s.categories.map((cat, k) => bar(cat, [jp[k], fr[k]], [c.s1, c.s2, c.s3][k], { borderWidth: { right: 2 } })) },
        options: baseOptions({
          indexAxis: 'y',
          interaction: { mode: 'nearest', intersect: true },
          plugins: Object.assign(baseOptions().plugins, {
            tooltip: Object.assign(baseOptions().plugins.tooltip, { callbacks: { label: (x) => {
              const m = mins[x.dataIndex][x.datasetIndex];
              let t = `${x.dataset.label}：${fmt(x.raw)}%（${fmt(m)}分）`;
              if (x.dataIndex === 1 && x.datasetIndex === 2) t += `　うちSVOD等 ${s.france.detail.svod}分・放送局配信 ${s.france.detail.bvod}分`;
              if (x.dataIndex === 1 && x.datasetIndex === 1) t += `　動画共有 ${s.france.detail.sharing}分・SNS ${s.france.detail.social}分`;
              return t; } } })
          }),
          scales: { x: Object.assign(baseOptions().scales.x, { stacked: true, max: 100, grid: { color: c.grid }, ticks: { callback: v => v + '%' } }), y: Object.assign(baseOptions().scales.y, { stacked: true, grid: { display: false } }) }
        })
      });
      table(el, ['区分', '日本 分', '日本 %', 'フランス 分', 'フランス %'], s.categories.map((cat, k) => [cat, fmt(s.japan.minutes[k]), fmt(jp[k]) + '%', fmt(s.france.minutes[k], 0), fmt(fr[k]) + '%'])
        .concat([['うちフランス：放送局の配信（TF1+等）', '—', '—', fmt(s.france.detail.bvod, 0), fmt(s.france.detail.bvod / s.france.minutes.reduce((a, b) => a + b, 0) * 100) + '%']]));
    } else {
      const share = js.years.map((y, i) => +((js.sharing[i] + js.streaming[i]) / js.total[i] * 100).toFixed(1));
      const frMap = Object.fromEntries(f.franceOnDemandShare.points);
      render('c1_2', {
        data: { labels: js.years, datasets: [
          line('日本（総務省・週平均）', share, c.jp),
          line('フランス（Médiamétrie・公表4時点）', js.years.map(y => frMap[y] ?? null), c.fr, { showLine: false, pointRadius: 6, pointStyle: 'rectRot' })
        ] },
        options: baseOptions({
          plugins: Object.assign(baseOptions().plugins, {
            breakLine: { after: js.breakAfter, label: '2024年〜 日仏とも調査枠組みの変更' },
            tooltip: Object.assign(baseOptions().plugins.tooltip, { callbacks: { label: (x) => x.raw == null ? null : `${x.dataset.label}：${fmt(x.raw)}%` } })
          }),
          scales: Object.assign(baseOptions().scales, { y: Object.assign(baseOptions().scales.y, { min: 0, title: { display: true, text: '総動画に占めるオンデマンド比率（%）' }, ticks: { callback: v => v + '%' } }) })
        })
      });
      table(el, ['年', '日本', 'フランス'], js.years.map((y, i) => [y, fmt(share[i]) + '%', frMap[y] != null ? frMap[y] + '%' : '—']));
    }
  }

  // ---------- 図1-3 ----------
  const fig13On = new Set(D.fig1_3.defaultOn);
  function fig1_3() {
    const f = D.fig1_3; const c = C();
    const colors = { '10代': c.s1, '20代': c.s2, '30代': c.s3, '40代': c.s4, '50代': c.s5 };
    const ds = Object.entries(f.ages).filter(([k]) => fig13On.has(k)).map(([k, a]) => {
      const r = a.tv.map((t, i) => +(a.net[i] / t).toFixed(2));
      return line(k + (a.crossover ? `（${a.crossover}年に逆転）` : '（未逆転）'), r, colors[k], {
        pointRadius: f.years.map(y => (y === a.crossover ? 7 : 2.5)),
        pointBackgroundColor: f.years.map(y => (y === a.crossover ? c.surface : colors[k])), pointBorderWidth: 2
      });
    });
    render('c1_3', {
      data: { labels: f.years, datasets: ds },
      options: baseOptions({
        plugins: Object.assign(baseOptions().plugins, {
          refLine: { value: 1, label: '1.0倍＝ネット動画とテレビが同じ' },
          tooltip: Object.assign(baseOptions().plugins.tooltip, { callbacks: { label: (x) => { const k = x.dataset.label.slice(0, 3); const a = f.ages[k]; const i = x.dataIndex; return `${k}：${fmt(x.raw, 2)}倍（ネット${fmt(a.net[i])}分／テレビ${fmt(a.tv[i])}分）`; } } })
        }),
        scales: Object.assign(baseOptions().scales, { y: Object.assign(baseOptions().scales.y, { min: 0, title: { display: true, text: 'ネット動画 ÷ テレビ（倍）' } }) })
      })
    });
    table(document.querySelector('[data-fig="fig1_3"] .fig-table'), ['年', ...Object.keys(f.ages)],
      f.years.map((y, i) => [y, ...Object.values(f.ages).map(a => fmt(a.net[i] / a.tv[i], 2) + '倍')]));
  }

  // ---------- 図1-4 ----------
  function fig1_4() {
    const f = D.fig1_4; const c = C(); const j = f.japan;
    render('c1_4a', {
      data: { labels: j.years, datasets: [
        line('インターネット広告費', j.internet, c.s2),
        line('テレビメディア（地上波＋衛星）', j.tvMedia, c.s1, { borderDash: [5, 4], pointRadius: 2 }),
        line('地上波テレビ', j.terrestrial, c.s1)
      ] },
      options: baseOptions({
        plugins: Object.assign(baseOptions().plugins, {
          breakLine: { after: 2018, label: '2019年〜 EC広告を追加' },
          tooltip: Object.assign(baseOptions().plugins.tooltip, { callbacks: { label: (x) => `${x.dataset.label}：${fmt(x.raw, 0)}億円` } })
        }),
        scales: Object.assign(baseOptions().scales, { y: Object.assign(baseOptions().scales.y, { min: 0, title: { display: true, text: '億円' }, ticks: { callback: v => v.toLocaleString() } }) })
      })
    });
    const years = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
    const fyears = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
    const tvMap = Object.fromEntries(f.france.tv);
    const segs = f.france.digitalSeries.map(s => ({ edition: s.edition, map: Object.fromEntries(s.points) }));
    const single = Object.fromEntries(f.france.digitalSingle.map(d => [d[0], d]));
    const dgAll = {}; segs.forEach(s => Object.assign(dgAll, s.map)); Object.values(single).forEach(d => { dgAll[d[0]] = d[1]; });
    const dgSrc = {}; segs.forEach(s => Object.keys(s.map).forEach(y => { dgSrc[y] = s.edition; })); Object.values(single).forEach(d => { dgSrc[d[0]] = d[2]; });
    render('c1_4b', {
      data: { labels: fyears, datasets: [
        line('デジタル（SRI 2022年版）', fyears.map(y => segs[0].map[y] ?? null), c.s2),
        line('デジタル（BUMP 2025年版）', fyears.map(y => segs[1].map[y] ?? null), c.s2, { borderDash: [6, 3] }),
        line('デジタル（別の年版・点のみ）', fyears.map(y => single[y] ? single[y][1] : null), c.s2, { showLine: false, pointRadius: 6, pointStyle: 'rectRot' }),
        line('テレビ', fyears.map(y => tvMap[y] ?? null), c.s1, { spanGaps: true })
      ] },
      options: baseOptions({
        plugins: Object.assign(baseOptions().plugins, {
          tooltip: Object.assign(baseOptions().plugins.tooltip, { callbacks: { label: (x) => x.raw == null ? null : (x.datasetIndex === 3 ? `テレビ：${fmt(x.raw, 0)}百万€` : `デジタル：${fmt(x.raw, 0)}百万€（${dgSrc[fyears[x.dataIndex]]}）`) } })
        }),
        scales: Object.assign(baseOptions().scales, { y: Object.assign(baseOptions().scales.y, { min: 0, title: { display: true, text: '百万ユーロ' }, ticks: { callback: v => v.toLocaleString() } }) })
      })
    });
    table(document.querySelector('[data-fig="fig1_4"] .fig-table'), ['年', '日本 地上波', '日本 テレビメディア', '日本 ネット', '仏 テレビ', '仏 デジタル（年版）'],
      years.map((y, i) => [y, fmt(j.terrestrial[i], 0), fmt(j.tvMedia[i], 0), fmt(j.internet[i], 0), tvMap[y] ? fmt(tvMap[y], 0) : '—', dgAll[y] ? `${fmt(dgAll[y], 0)}（${dgSrc[y]}）` : '—']));
  }

  // ---------- 図1-5 ウォーターフォール（増減のみ） ----------
  const wfPlugin = {
    id: 'wfNotes',
    afterDatasetsDraw(chart, args, opts) {
      if (!opts || !opts.steps) return;
      const { ctx, scales: { y }, chartArea: area } = chart; const c = C();
      const meta = chart.getDatasetMeta(0);
      ctx.save(); ctx.textAlign = 'center';
      // 0の基準線
      const y0 = y.getPixelForValue(0);
      ctx.strokeStyle = c.text2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(area.left, y0); ctx.lineTo(area.right, y0); ctx.stroke();
      opts.steps.forEach((s, i) => {
        const b = meta.data[i]; if (!b) return;
        // 値ラベル：減少・純減は棒の下端、増加は棒の上端の外側
        const lo = Math.max(b.y, b.base), hi = Math.min(b.y, b.base);
        ctx.fillStyle = c.text; ctx.font = (s.kind === 'net' ? 'bold ' : '') + '12px system-ui, sans-serif';
        if (s.kind === 'up') { ctx.textBaseline = 'bottom'; ctx.fillText(s.text, b.x, hi - 4); }
        else { ctx.textBaseline = 'top'; ctx.fillText(s.text, b.x, lo + 4); }
        // 次の棒へのつなぎ線
        if (i < opts.steps.length - 1) {
          const n = meta.data[i + 1]; const lvl = y.getPixelForValue(s.end);
          ctx.strokeStyle = c.text2; ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.moveTo(b.x + b.width / 2, lvl); ctx.lineTo(n.x - n.width / 2, lvl); ctx.stroke(); ctx.setLineDash([]);
        }
      });
      // 補完率を上部に
      ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillStyle = c.text; ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText(opts.rateText, area.left + 4, area.top + 2);
      ctx.restore();
    }
  };
  Chart.register(wfPlugin);

  function fig1_5() {
    const f = D.fig1_5; const c = C(); const an = f.annual; const n = an.years.length - 1;
    const lin = an.total.map((t, i) => t - an.tf1plus[i]);
    const loss = +(lin[0] - lin[n]).toFixed(1), plus = +(an.tf1plus[n] - an.tf1plus[0]).toFixed(1), net = +(plus - loss).toFixed(1);
    const rate = plus / loss * 100;
    const steps = [
      { label: ['リニア広告', 'の減少'], range: [0, -loss], end: -loss, kind: 'down', text: `−€${fmt(loss, 0)}m` },
      { label: ['TF1+広告', 'の増加'], range: [-loss, -loss + plus], end: -loss + plus, kind: 'up', text: `+€${fmt(plus, 0)}m` },
      { label: ['差し引き', '（埋まらなかった分）'], range: [0, net], end: net, kind: 'net', text: `−€${fmt(Math.abs(net), 0)}m` }
    ];
    const col = { down: c.s1, up: c.s2, net: c.muted };
    render('c1_5', {
      type: 'bar',
      data: { labels: steps.map(s => s.label), datasets: [{ label: '増減', data: steps.map(s => s.range), backgroundColor: steps.map(s => col[s.kind]), borderColor: c.surface, borderWidth: 2, borderSkipped: false, barPercentage: 0.55 }] },
      options: baseOptions({
        interaction: { mode: 'nearest', intersect: true },
        plugins: Object.assign(baseOptions().plugins, {
          legend: { display: false },
          wfNotes: { steps, rateText: `補完率 ${fmt(rate, 0)}%（€${fmt(plus, 0)}m ÷ €${fmt(loss, 0)}m）` },
          tooltip: Object.assign(baseOptions().plugins.tooltip, { callbacks: {
            title: (it) => steps[it[0].dataIndex].label.join(''),
            label: (x) => x.dataIndex === 0 ? `リニア €${fmt(lin[0], 1)}m→€${fmt(lin[n], 1)}m` : x.dataIndex === 1 ? `TF1+ €${fmt(an.tf1plus[0], 1)}m→€${fmt(an.tf1plus[n], 1)}m` : `広告収入計 €${fmt(an.total[0], 1)}m→€${fmt(an.total[n], 1)}m`
          } })
        }),
        scales: {
          x: Object.assign(baseOptions().scales.x, { ticks: { color: c.text } }),
          y: Object.assign(baseOptions().scales.y, { min: -Math.ceil(loss * 1.2 / 20) * 20, max: 20, ticks: { callback: (t) => t === 0 ? '0' : (t > 0 ? '+' : '−') + Math.abs(t) }, title: { display: true, text: '2023→2025年の増減（百万ユーロ）' } })
        }
      })
    });
    table(document.querySelector('[data-fig="fig1_5"] .fig-table'), ['年', '広告収入計', 'TF1+広告', 'リニア（概算）'],
      an.years.map((y, i) => [y, fmt(an.total[i], 1), fmt(an.tf1plus[i], 1), fmt(lin[i], 1)])
        .concat([['増減（2023→2025年）', fmt(an.total[n] - an.total[0], 1), '+' + fmt(plus, 1), '−' + fmt(loss, 1) + `（補完率 ${fmt(rate, 1)}%）`]]));
    document.querySelector('[data-fig="fig1_5"] .fig-derived').textContent = '※ ' + an.derivedNote;
  }

  // ================= #2 =================
  // 値ラベル（棒の端に数値）
  const barLabelPlugin = {
    id: 'barLabels',
    afterDatasetsDraw(chart, args, opts) {
      if (!opts || !opts.format) return;
      const { ctx } = chart; const c = C();
      ctx.save(); ctx.font = '11px system-ui, sans-serif'; ctx.fillStyle = c.text; ctx.textBaseline = 'middle';
      chart.data.datasets.forEach((ds, di) => {
        if (opts.only && !opts.only.includes(di)) return;
        chart.getDatasetMeta(di).data.forEach((b, i) => {
          const v = ds.data[i]; if (v == null) return;
          const t = opts.format(v, di, i); if (!t) return;
          if (chart.options.indexAxis === 'y') { ctx.textAlign = 'left'; ctx.fillText(t, b.x + 6, b.y); }
          else if (v < 0) { ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(t, b.x, Math.max(b.y, b.base) + 3); ctx.textBaseline = 'middle'; }
          else { ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; const ls = Array.isArray(t) ? t : [t]; ls.slice().reverse().forEach((l, k) => ctx.fillText(l, b.x, Math.min(b.y, b.base) - 3 - k * 14)); ctx.textBaseline = 'middle'; }
        });
      });
      ctx.restore();
    }
  };
  Chart.register(barLabelPlugin);

  function fig2_1(view = 'annual') {
    const f = D.fig2_1; const c = C(); const el = document.querySelector('[data-fig="fig2_1"] .fig-table');
    const inc = (arr) => arr.slice(1).map((v, i) => v - arr[i]);
    if (view === 'annual') {
      const yrs = f.years.slice(1), dm = inc(f.mediaSpend), dv = inc(f.tvVideo);
      render('c2_1', {
        type: 'bar',
        data: { labels: yrs, datasets: [
          bar('インターネット広告媒体費の増加', dm, c.s1, { borderWidth: 0, borderRadius: 3 }),
          bar('テレビメディア関連動画広告（TVer等）の増加', dv, c.s2, { borderWidth: 0, borderRadius: 3 })
        ] },
        options: baseOptions({
          plugins: Object.assign(baseOptions().plugins, {
            barLabels: { only: [1], format: (v) => `+${fmt(v, 0)}` },
            tooltip: Object.assign(baseOptions().plugins.tooltip, { callbacks: { label: (x) => `${x.dataset.label}：+${fmt(x.raw, 0)}億円`, footer: (it) => { const i = it[0].dataIndex; return `増加分に占める配信の割合：${fmt(dv[i] / dm[i] * 100, 1)}%`; } } })
          }),
          scales: Object.assign(baseOptions().scales, { y: Object.assign(baseOptions().scales.y, { min: 0, title: { display: true, text: '前年からの増加額（億円）' }, ticks: { callback: v => v.toLocaleString() } }) })
        })
      });
      table(el, ['年', '媒体費の増加', '配信広告の増加', '増加分に占める配信の割合'], yrs.map((y, i) => [y, '+' + fmt(dm[i], 0), '+' + fmt(dv[i], 0), fmt(dv[i] / dm[i] * 100, 1) + '%']));
    } else {
      const n = f.years.length - 1;
      const dm = f.mediaSpend[n] - f.mediaSpend[0], dv = f.tvVideo[n] - f.tvVideo[0];
      render('c2_1', {
        type: 'bar',
        data: { labels: ['インターネット広告媒体費', 'テレビメディア関連動画広告（TVer等）'], datasets: [
          bar('2019→2025年の増加額', [dm, dv], [c.s1, c.s2], { borderWidth: 0, borderRadius: 3 })
        ] },
        options: baseOptions({
          indexAxis: 'y',
          interaction: { mode: 'nearest', intersect: true },
          layout: { padding: { right: 90 } },
          plugins: Object.assign(baseOptions().plugins, {
            legend: { display: false },
            barLabels: { format: (v) => `+${fmt(v, 0)}億円` },
            tooltip: Object.assign(baseOptions().plugins.tooltip, { callbacks: { label: (x) => `+${fmt(x.raw, 0)}億円` } })
          }),
          scales: { x: Object.assign(baseOptions().scales.x, { min: 0, grid: { color: c.grid }, title: { display: true, text: '2019→2025年の増加額（億円）' }, ticks: { callback: v => v.toLocaleString() } }), y: Object.assign(baseOptions().scales.y, { grid: { display: false }, ticks: { color: c.text } }) }
        })
      });
      table(el, ['項目', '2019年', '2025年', '増加額', '倍率', '年平均成長率'], [
        ['インターネット広告媒体費', fmt(f.mediaSpend[0], 0), fmt(f.mediaSpend[n], 0), '+' + fmt(dm, 0), fmt(f.mediaSpend[n] / f.mediaSpend[0], 2) + '倍', fmt((Math.pow(f.mediaSpend[n] / f.mediaSpend[0], 1 / n) - 1) * 100, 1) + '%'],
        ['テレビメディア関連動画広告', fmt(f.tvVideo[0], 0), fmt(f.tvVideo[n], 0), '+' + fmt(dv, 0), fmt(f.tvVideo[n] / f.tvVideo[0], 2) + '倍', fmt((Math.pow(f.tvVideo[n] / f.tvVideo[0], 1 / n) - 1) * 100, 1) + '%'],
        ['配信広告の割合（①÷②）', fmt(f.tvVideo[0] / f.mediaSpend[0] * 100, 2) + '%', fmt(f.tvVideo[n] / f.mediaSpend[n] * 100, 2) + '%', `増加分に占める割合 ${fmt(dv / dm * 100, 2)}%`, '', '']
      ]);
    }
  }

  function fig2_2() {
    const f = D.fig2_2; const c = C();
    const ukShare = f.uk.bvod.map((b, i) => +(b / f.uk.online[i] * 100).toFixed(2));
    const est = f.years.map(y => y >= f.uk.estimatedFrom);
    const frMap = Object.fromEntries(f.franceTVR.years.map((y, i) => [y, +(f.franceTVR.tvr[i] / f.franceTVR.digital[i] * 100).toFixed(2)]));
    render('c2_2', {
      data: { labels: f.years, datasets: [
        line('英国（Ofcom）', ukShare, css('--uk'), { segment: { borderDash: (ctx) => (est[ctx.p1DataIndex] ? [5, 4] : undefined) }, pointStyle: f.years.map((y, i) => est[i] ? 'rectRot' : 'circle'), pointRadius: f.years.map((y, i) => est[i] ? 5 : 3.5) }),
        line('フランス 見逃し配信（CNC推計）', f.years.map(y => frMap[y] ?? null), c.fr),
        line('フランス 2025年（テレビのデジタル全般・定義が広い）', f.years.map(y => (y === 2025 ? f.france2025.value : null)), c.fr, { showLine: false, pointStyle: 'triangle', pointRadius: 7 }),
        line('日本（電通）', f.japan.values, c.jp, { borderWidth: 3 })
      ] },
      options: baseOptions({
        plugins: Object.assign(baseOptions().plugins, {
          tooltip: Object.assign(baseOptions().plugins.tooltip, { callbacks: { label: (x) => x.raw == null ? null : `${x.dataset.label}：${fmt(x.raw, 2)}%` + (x.datasetIndex === 0 && est[x.dataIndex] ? '（概算）' : '') } })
        }),
        scales: Object.assign(baseOptions().scales, { y: Object.assign(baseOptions().scales.y, { min: 0, max: 4.5, title: { display: true, text: 'ネット広告全体に占める割合（%）' }, ticks: { callback: v => v + '%' } }) })
      })
    });
    table(document.querySelector('[data-fig="fig2_2"] .fig-table'), ['年', '日本', '英国', '英国 配信広告／ネット広告（£m）', 'フランス'],
      f.years.map((y, i) => [y, f.japan.values[i] == null ? '—' : fmt(f.japan.values[i], 2) + '%', fmt(ukShare[i], 2) + '%' + (est[i] ? '（概算）' : ''), `${fmt(f.uk.bvod[i], 0)}／${fmt(f.uk.online[i], 0)}`,
        frMap[y] != null ? fmt(frMap[y], 2) + '%（見逃し配信）' : (y === 2025 ? fmt(f.france2025.value, 2) + '%（定義が広い）' : '—')]));
  }

  function fig2_3() {
    const f = D.fig2_3; const u = D.fig2_2.uk; const c = C();
    const online = u.bvod.map((b, i) => +(b / u.online[i] * 100).toFixed(2));
    const tv = u.bvod.map((b, i) => +(b / (b + f.linear[i]) * 100).toFixed(1));
    const est = f.years.map(y => y >= f.linearEstimatedFrom);
    const dash = { segment: { borderDash: (ctx) => (est[ctx.p1DataIndex] ? [5, 4] : undefined) } };
    render('c2_3', {
      data: { labels: f.years, datasets: [
        line('テレビ広告（リニア＋配信）に占める配信の割合', tv, c.s2, Object.assign({ borderWidth: 3 }, dash)),
        line('ネット広告全体に占める配信の割合', online, css('--uk'), dash)
      ] },
      options: baseOptions({
        plugins: Object.assign(baseOptions().plugins, {
          barLabels: {},
          tooltip: Object.assign(baseOptions().plugins.tooltip, { callbacks: { label: (x) => `${x.dataset.label}：${fmt(x.raw, x.datasetIndex ? 2 : 1)}%` + (est[x.dataIndex] ? '（概算）' : '') } })
        }),
        scales: Object.assign(baseOptions().scales, { y: Object.assign(baseOptions().scales.y, { min: 0, max: 30, title: { display: true, text: '割合（%）' }, ticks: { callback: v => v + '%' } }) })
      })
    });
    table(document.querySelector('[data-fig="fig2_3"] .fig-table'), ['年', '配信広告（£m）', 'リニア（£m）', 'テレビ広告に占める配信', 'ネット広告に占める配信'],
      f.years.map((y, i) => [y + (est[i] ? '（概算）' : ''), fmt(u.bvod[i], 0), fmt(f.linear[i], 0), fmt(tv[i], 1) + '%', fmt(online[i], 2) + '%']));
  }

  function fig2_4(view = 'uk') {
    const f = D.fig2_4; const c = C(); const b = f.base;
    const media35 = b.mediaSpend2025 * Math.pow(1 + b.mediaGrowth, 10);
    const decl = (r) => Math.round(b.terrestrial2025 * (1 - Math.pow(1 - r, 10)));
    const loss = decl(f.declines[view].rate);
    const gains = f.shares.map(s => Math.round(media35 * s.share - b.tvVideo2025));
    const labels = [`地上波の減少（${f.declines[view].label}）`, ...f.shares.map(s => `配信の増加：${s.label}`)];
    render('c2_4', {
      type: 'bar',
      data: { labels, datasets: [ bar('2025→2035年の増減（億円）', [loss, ...gains], [c.muted, c.s2, c.s2, c.s2], { borderWidth: 0, borderRadius: 3 }) ] },
      options: baseOptions({
        indexAxis: 'y',
        interaction: { mode: 'nearest', intersect: true },
        layout: { padding: { right: 150 } },
        plugins: Object.assign(baseOptions().plugins, {
          legend: { display: false },
          barLabels: { format: (v, di, i) => i === 0 ? `−${fmt(v, 0)}億円` : `+${fmt(v, 0)}億円（補完率 ${fmt(v / loss * 100, 1)}%）` },
          tooltip: Object.assign(baseOptions().plugins.tooltip, { callbacks: { label: (x) => x.dataIndex === 0 ? `地上波 ${fmt(b.terrestrial2025, 0)}億円 → ${fmt(b.terrestrial2025 - loss, 0)}億円` : `2035年の配信広告 ${fmt(gains[x.dataIndex - 1] + b.tvVideo2025, 0)}億円（媒体費 ${fmt(media35, 0)}億円 × ${f.shares[x.dataIndex - 1].share * 100}%）` } })
        }),
        scales: { x: Object.assign(baseOptions().scales.x, { min: 0, max: 4000, grid: { color: c.grid }, title: { display: true, text: '2025→2035年の増減の大きさ（億円）' }, ticks: { callback: v => v.toLocaleString() } }), y: Object.assign(baseOptions().scales.y, { grid: { display: false }, ticks: { color: c.text } }) }
      })
    });
    const rows = [];
    f.shares.forEach((s, k) => {
      const g = gains[k];
      rows.push([s.label, fmt(media35 * s.share, 0), '+' + fmt(g, 0), fmt(g / decl(f.declines.uk.rate) * 100, 1) + '%', fmt(g / decl(f.declines.jp.rate) * 100, 1) + '%']);
    });
    table(document.querySelector('[data-fig="fig2_4"] .fig-table'), ['配信広告の割合', '2035年の配信広告', '10年間の増加', `補完率（英国並み −${fmt(decl(f.declines.uk.rate), 0)}）`, `補完率（日本の現状延長 −${fmt(decl(f.declines.jp.rate), 0)}）`], rows);
  }

  // ================= #3 =================
  const CO = () => Object.fromEntries(D.fig3_common.companies.map(o => [o.key, o]));
  const at = (o, y) => {
    const i = o.years.indexOf(y); if (i < 0) return null;
    const dg = o.digital[i];
    const lin = o.linear ? o.linear[i] : (o.total[i] != null && dg != null ? +(o.total[i] - dg).toFixed(1) : null);
    const tot = o.linear ? o.linear[i] + dg : o.total[i];
    const share = tot != null && dg != null ? dg / tot * 100 : (y === 2024 && o.share2024 ? o.share2024 : null);
    return { lin, dg, tot, share, est: o.digitalEstimated ? o.digitalEstimated[i] : false };
  };
  const money = (o, v, sign = true) => { const a = fmt(Math.abs(v), 0); const sg = sign ? (v < 0 ? '−' : '+') : ''; return o.cur === '億円' ? `${sg}${a}億円` : `${sg}${o.cur}${a}m`; };
  const narrow = () => window.innerWidth < 600;

  function fig3_1() {
    const f = D.fig3_1; const co = CO(); const c = C();
    // 行＝グループ見出し（値なし）＋各社。期間はグループ見出しに書き、会社名の行には書かない
    const rows = [];
    f.groups.forEach((g, gi) => {
      rows.push({ head: true, g, gi });
      g.keys.forEach(k => {
        const o = co[k]; const A = at(o, g.from), B = at(o, g.to);
        const loss = A.lin - B.lin, gain = B.dg - A.dg;
        rows.push({ o, a: g.from, b: g.to, gi, loss, gain, rate: gain / loss * 100, net: gain - loss, est: A.est || B.est });
      });
    });
    const labels = rows.map(r => r.head ? (narrow() ? r.g.label.split('：')[0] : r.g.label) : (narrow() ? r.o.name : `${r.o.flag} ${r.o.name}`));
    const val = (fn) => rows.map(r => r.head ? null : fn(r));
    // 右側の数値表：列見出し（補完率／デジタルの増加／リニアの減少）をグループ見出しの行に置き、
    // 各社の行に数値を右揃えで並べる。補完率は通常ラベル（11px）の120%・太字で強調
    const rateLabels = {
      id: 'rateLabels',
      afterDatasetsDraw(chart) {
        const ctx = chart.ctx; const cc = C(); const meta = chart.getDatasetMeta(1); const y = chart.scales.y;
        const x0 = chart.chartArea.right;
        const cols = narrow()
          ? [{ key: 'rate', head: '補完率', x: x0 + 52 }]
          : [{ key: 'rate', head: '補完率', x: x0 + 72 }, { key: 'gain', head: 'デジタルの増加', x: x0 + 170 }, { key: 'loss', head: 'リニアの減少', x: x0 + 262 }];
        ctx.save(); ctx.textBaseline = 'middle'; ctx.textAlign = 'right';
        rows.forEach((r, i) => {
          const py = y.getPixelForValue(i);
          if (r.head) {
            ctx.font = 'bold 11px system-ui, sans-serif'; ctx.fillStyle = cc.text2;
            cols.forEach(cl => ctx.fillText(cl.head, cl.x, py));
            return;
          }
          cols.forEach(cl => {
            if (cl.key === 'rate') { ctx.font = 'bold 13.2px system-ui, sans-serif'; ctx.fillStyle = cc.text; ctx.fillText(`${fmt(r.rate, 1)}%`, cl.x, py); }
            else { ctx.font = '11px system-ui, sans-serif'; ctx.fillStyle = cc.text2; ctx.fillText(cl.key === 'gain' ? money(r.o, r.gain) : money(r.o, -r.loss), cl.x, py); }
          });
        });
        ctx.restore();
      }
    };
    const groupSep = {
      id: 'groupSep',
      afterDatasetsDraw(chart) {
        const y = chart.scales.y; const area = chart.chartArea; const ctx = chart.ctx; const cc = C();
        ctx.save(); ctx.strokeStyle = cc.brk; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
        rows.forEach((r, i) => { if (r.head && i > 0) { const py = (y.getPixelForValue(i) + y.getPixelForValue(i - 1)) / 2; ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(chart.width, py); ctx.stroke(); } });
        ctx.restore();
      }
    };
    render('c3_1', {
      type: 'bar',
      data: { labels, datasets: [
        bar('デジタルで埋めた分（補完率）', val(r => +r.rate.toFixed(1)), rows.map(r => r.head ? 'transparent' : (c[r.o.country] || c.s2)), { borderWidth: 0, stack: 's' }),
        bar('埋まらなかった分', val(r => +(100 - r.rate).toFixed(1)), 'rgba(148,163,184,0.18)', { borderWidth: 0, stack: 's' })
      ] },
      plugins: [groupSep, rateLabels],
      options: baseOptions({
        indexAxis: 'y',
        interaction: { mode: 'nearest', axis: 'y', intersect: false },
        layout: { padding: { right: narrow() ? 58 : 275 } },
        plugins: Object.assign(baseOptions().plugins, {
          tooltip: Object.assign(baseOptions().plugins.tooltip, {
            filter: (x) => !rows[x.dataIndex].head,
            callbacks: {
              title: (it) => { const r = rows[it[0].dataIndex]; return `${r.o.name}（${r.a}→${r.b}年）`; },
              label: (x) => { const r = rows[x.dataIndex]; return x.datasetIndex === 0 ? `補完率 ${fmt(r.rate, 1)}%：デジタル ${money(r.o, r.gain)} ÷ リニア ${money(r.o, -r.loss)}` : `埋まらなかった分 ${money(r.o, r.net)}`; }
            } })
        }),
        scales: {
          x: Object.assign(baseOptions().scales.x, { stacked: true, min: 0, max: 100, grid: { color: c.grid }, title: { display: true, text: 'リニア広告の減少額＝100' }, ticks: { callback: v => v + '%' } }),
          y: Object.assign(baseOptions().scales.y, { stacked: true, grid: { display: false },
            ticks: { color: (ctx) => rows[ctx.index] && rows[ctx.index].head ? c.s2 : c.text,
                     font: (ctx) => rows[ctx.index] && rows[ctx.index].head ? { weight: 'bold' } : { weight: 'normal' } } })
        }
      })
    });
    table(document.querySelector('[data-fig="fig3_1"] .fig-table'), ['会社', 'リニアの減少', 'デジタルの増加', '差し引き', '補完率'],
      rows.map(r => r.head ? [`<strong>${r.g.label}</strong>`, '', '', '', ''] : [`${r.o.name}${r.est ? '※' : ''}`, money(r.o, -r.loss), money(r.o, r.gain), money(r.o, r.net), fmt(r.rate, 1) + '%']));
    document.querySelector('[data-fig="fig3_1"] .fig-derived').textContent = '※ 期間の違う比較を混ぜないよう、2つのグループに分けています。日本は2023→2025年にリニアが増えたため、2021→2025年でITVと比べます。リニア＝総広告収入−デジタル広告。ProSiebenSat.1の2023年デジタルは推計値。';
    document.querySelector('[data-fig="fig3_1"] .fig-table').insertAdjacentHTML('beforeend', '<ul class="fig-defs">' + D.fig3_common.companies.map(o => `<li>${o.name}：${o.note}（${o.source}）</li>`).join('') + '</ul>');
  }

  function fig3_2() {
    const f = D.fig3_2; const co = CO(); const c = C();
    const pct = (o, p) => { if (!p) return null; const A = at(o, p[0]), B = at(o, p[1]); return +((B.lin / A.lin - 1) * 100).toFixed(1); };
    const rows = f.rows.map(([k, p4, p2]) => ({ o: co[k], v4: pct(co[k], p4), v2: pct(co[k], p2) }));
    const labels = rows.map(r => narrow() ? r.o.name : `${r.o.flag} ${r.o.name}`);
    const fmtP = v => v == null ? '' : (v > 0 ? '+' : '−') + fmt(Math.abs(v), 1) + '%';
    render('c3_2', {
      type: 'bar',
      data: { labels, datasets: [
        bar('2021→2025年（4年）', rows.map(r => r.v4), c.s1, { borderWidth: 0, borderRadius: 3 }),
        bar('2023→2025年（2年）', rows.map(r => r.v2), c.s2, { borderWidth: 0, borderRadius: 3 })
      ] },
      options: baseOptions({
        interaction: { mode: 'index', intersect: false },
        plugins: Object.assign(baseOptions().plugins, {
          barLabels: { format: (v) => fmtP(v) },
          tooltip: Object.assign(baseOptions().plugins.tooltip, { callbacks: { label: (x) => x.raw == null ? `${x.dataset.label}：比較できない` : `${x.dataset.label}：${fmtP(x.raw)}` } })
        }),
        scales: {
          x: Object.assign(baseOptions().scales.x, { ticks: { color: c.text } }),
          y: Object.assign(baseOptions().scales.y, { min: -35, max: 5, grace: 0, title: { display: true, text: 'リニア広告の増減率（%）' }, ticks: { callback: v => v + '%' } })
        }
      })
    });
    const jp = co.jp;
    table(document.querySelector('[data-fig="fig3_2"] .fig-table'), ['会社', '2021→2025年', '2023→2025年', 'リニアの金額（起点→2025年）'],
      rows.map(r => { const o = r.o; const s = at(o, r.v4 != null ? 2021 : 2023), e = at(o, 2025); return [o.name, r.v4 == null ? '―' : fmtP(r.v4), fmtP(r.v2), `${money(o, s.lin, false)} → ${money(o, e.lin, false)}`]; })
        .concat([['日本・地上波のみ', fmtP(+((jp.terrestrial[5] / jp.terrestrial[1] - 1) * 100).toFixed(1)), fmtP(+((jp.terrestrial[5] / jp.terrestrial[3] - 1) * 100).toFixed(1)), `${fmt(jp.terrestrial[1], 0)}億円 → ${fmt(jp.terrestrial[5], 0)}億円`]]));
  }

  function fig3_3() {
    const f = D.fig3_3; const co = CO(); const c = C();
    const order = ['itv', 'rtl', 'p7s1', 'tf1', 'jp'];
    const col = { itv: c.uk, rtl: c.de, p7s1: c.s4, tf1: c.fr, jp: c.jp };
    const series = order.map(k => ({ o: co[k], v: f.years.map(y => { const r = at(co[k], y); return r && r.share != null ? +r.share.toFixed(1) : null; }), est: f.years.map(y => { const r = at(co[k], y); return r ? r.est : false; }) }));
    render('c3_3', {
      data: { labels: f.years, datasets: series.map(s => line(s.o.name, s.v, col[s.o.key], { borderWidth: s.o.key === 'itv' || s.o.key === 'jp' ? 3 : 2, segment: { borderDash: (ctx) => (s.est[ctx.p0DataIndex] || s.est[ctx.p1DataIndex] ? [5, 4] : undefined) } })) },
      options: baseOptions({
        plugins: Object.assign(baseOptions().plugins, {
          tooltip: Object.assign(baseOptions().plugins.tooltip, { callbacks: { label: (x) => `${x.dataset.label}：${fmt(x.raw, 1)}%` + (series[x.datasetIndex].est[x.dataIndex] ? '（推計を含む）' : '') } })
        }),
        scales: Object.assign(baseOptions().scales, { y: Object.assign(baseOptions().scales.y, { min: 0, max: 35, title: { display: true, text: 'デジタル広告 ÷ 総広告収入（%）' }, ticks: { callback: v => v + '%' } }) })
      })
    });
    table(document.querySelector('[data-fig="fig3_3"] .fig-table'), ['会社', ...f.years.map(String)],
      series.map(s => [s.o.name, ...s.v.map((v, i) => v == null ? '―' : fmt(v, 1) + '%' + (s.est[i] ? '※' : ''))]));
    document.querySelector('[data-fig="fig3_3"] .fig-derived').textContent = '※ 推計値を含む（点線）。ProSiebenSat.1の2024年は同社開示の比率。';
  }

  function fig3_4() {
    const f = D.fig3_4; const co = CO(); const c = C();
    const bars = f.bars.map(([k, y]) => { const o = co[k]; const r = at(o, y); return { o, y, lin: r.lin / r.tot * 100, dg: r.dg / r.tot * 100, r }; });
    const flat = k => { const o = co[k]; const [a, b] = f.flat[k]; return (at(o, b).tot / at(o, a).tot - 1) * 100; };
    const labels = bars.map(b => [`${b.o.name} ${b.y}年`, b.y === 2025 ? `（2019年比 ${fmt(flat(b.o.key), 2)}%）` : '']);
    render('c3_4', {
      type: 'bar',
      data: { labels, datasets: [
        bar('リニア（テレビ放送）の広告', bars.map(b => +b.lin.toFixed(1)), c.s1, { borderWidth: 0, stack: 's' }),
        bar('デジタル（配信）の広告', bars.map(b => +b.dg.toFixed(1)), c.s2, { borderWidth: 0, stack: 's' })
      ] },
      options: baseOptions({
        indexAxis: 'y',
        interaction: { mode: 'index', axis: 'y', intersect: false },
        layout: { padding: { right: narrow() ? 8 : 70 } },
        plugins: Object.assign(baseOptions().plugins, {
          barLabels: { only: [1], format: (v) => narrow() ? '' : `${fmt(v, 1)}%` },
          tooltip: Object.assign(baseOptions().plugins.tooltip, { callbacks: { label: (x) => { const b = bars[x.dataIndex]; return `${x.dataset.label}：${fmt(x.raw, 1)}%（${money(b.o, x.datasetIndex ? b.r.dg : b.r.lin, false)}）`; } } })
        }),
        scales: {
          x: Object.assign(baseOptions().scales.x, { stacked: true, min: 0, max: 100, grid: { color: c.grid }, title: { display: true, text: '総広告収入に占める割合（%）' }, ticks: { callback: v => v + '%' } }),
          y: Object.assign(baseOptions().scales.y, { stacked: true, grid: { display: false }, ticks: { color: c.text } })
        }
      })
    });
    const jp = co.jp; const j25 = at(jp, 2025); const loss = j25.lin * f.whatIf.rate;
    table(document.querySelector('[data-fig="fig3_4"] .fig-table'), ['', '総広告収入（2019年→2025年）', '2019年比', 'リニアの増減（2021→2025年）', 'デジタル比率（2025年）'],
      ['itv', 'jp'].map(k => { const o = co[k]; const a = at(o, 2019), b = at(o, 2025), l = at(o, 2021); return [o.name, `${money(o, a.tot, false)} → ${money(o, b.tot, false)}`, fmt(flat(k), 2) + '%', fmt((b.lin / l.lin - 1) * 100, 1) + '%', fmt(b.share, 1) + '%']; }));
    document.querySelector('[data-fig="fig3_4"] .fig-derived').textContent = `※ 日本のテレビメディア広告費（${fmt(j25.lin, 0)}億円）がITV並み（−${fmt(f.whatIf.rate * 100, 1)}%）に減った場合の減少額は約${fmt(Math.round(loss), 0)}億円（地上波だけで約${fmt(Math.round(jp.terrestrial[5] * f.whatIf.rate), 0)}億円）。2025年のテレビメディアデジタルは${fmt(j25.dg, 0)}億円。`;
  }

  // ================= #4 =================
  const hbarScales = (c, xo = {}) => ({
    x: Object.assign(baseOptions().scales.x, { grid: { color: c.grid } }, xo),
    y: Object.assign(baseOptions().scales.y, { grid: { display: false }, ticks: { color: c.text } })
  });

  function fig4_1() {
    const f = D.fig4_1; const c = C();
    const cols = [c.muted, c.s2];
    render('c4_1', {
      type: 'bar',
      data: { labels: f.rows.map(r => r.label), datasets: f.periods.map((p, k) => bar(p, f.rows.map(r => r.values[k]), f.rows.map(r => r.highlight ? (k ? '#ef4444' : 'rgba(239,68,68,0.45)') : (k ? c.s1 : 'rgba(59,130,246,0.45)')), { borderWidth: 0, borderRadius: 3 })) },
      options: baseOptions({
        interaction: { mode: 'index', intersect: false },
        plugins: Object.assign(baseOptions().plugins, {
          legend: { display: false },
          barLabels: { format: (v, di) => narrow() ? fmt(v, 1) : [f.periods[di].replace('年', '/').replace('月', ''), `${fmt(v, 1)}%`] },
          tooltip: Object.assign(baseOptions().plugins.tooltip, { callbacks: { label: (x) => `${x.dataset.label}：${fmt(x.raw, 1)}%` } })
        }),
        scales: {
          x: Object.assign(baseOptions().scales.x, { ticks: { color: c.text } }),
          y: Object.assign(baseOptions().scales.y, { min: 0, max: 30, title: { display: true, text: 'テレビ視聴時間に占める割合（%）' }, ticks: { callback: v => v + '%' } })
        }
      })
    });
    table(document.querySelector('[data-fig="fig4_1"] .fig-table'), ['区分', ...f.periods],
      f.rows.map(r => [r.label, ...r.values.map(v => fmt(v, 1) + '%')]).concat([['（参考）配信計', ...f.streaming.map(v => fmt(v, 1) + '%')]]));
    document.querySelector('[data-fig="fig4_1"] .fig-derived').textContent = `※ 各区分の左の棒が${f.periods[0]}、右の棒が${f.periods[1]}。YouTubeが配信計に占める割合は${f.periods[1]}に${fmt(f.rows[2].values[1] / f.streaming[1] * 100, 1)}%。`;
  }

  function fig4_2() {
    const f = D.fig4_2; const c = C();
    render('c4_2', {
      type: 'bar',
      data: { labels: f.rows.map(r => r[0]), datasets: [bar('テレビ受像機での視聴シェア', f.rows.map(r => r[1]), f.rows.map(r => r[2] ? '#ef4444' : c.uk), { borderWidth: 0, borderRadius: 3 })] },
      options: baseOptions({
        indexAxis: 'y', interaction: { mode: 'nearest', intersect: true },
        layout: { padding: { right: 50 } },
        plugins: Object.assign(baseOptions().plugins, { legend: { display: false }, barLabels: { format: (v) => fmt(v, v % 1 && String(v).split('.')[1].length > 1 ? 2 : 1) + '%' },
          tooltip: Object.assign(baseOptions().plugins.tooltip, { callbacks: { label: (x) => `${fmt(x.raw, 2)}%` } }) }),
        scales: hbarScales(c, { min: 0, max: 25, title: { display: true, text: 'テレビ受像機での視聴に占める割合（%）' }, ticks: { callback: v => v + '%' } })
      })
    });
    const o = f.ofcom;
    table(document.querySelector('[data-fig="fig4_2"] .fig-table'), ['', '割合'], f.rows.map(r => [r[0], fmt(r[1], 2) + '%']));
    document.querySelector('[data-fig="fig4_2"] .fig-derived').textContent = `※ Ofcom：YouTube視聴は1日${o.total2025}分（2025年）、うちテレビ受像機で${o.tvset2025}分（2022年は${o.tvset2022}分）。`;
  }

  function fig4_3() {
    const f = D.fig4_3; const c = C();
    render('c4_3', {
      type: 'bar',
      data: { labels: f.rows.map(r => narrow() ? r[0].replace('Amazon ', '') : r[0]), datasets: f.years.map((y, k) => bar(`${y}年`, f.rows.map(r => r[1 + k]), f.rows.map(r => r[3] ? (k ? '#ef4444' : 'rgba(239,68,68,0.45)') : (k ? c.jp : 'rgba(16,185,129,0.45)')), { borderWidth: 0, borderRadius: 3 })) },
      options: baseOptions({
        indexAxis: 'y', interaction: { mode: 'index', axis: 'y', intersect: false },
        layout: { padding: { right: narrow() ? 30 : 70 } },
        plugins: Object.assign(baseOptions().plugins, { legend: { display: false },
          barLabels: { format: (v, di) => narrow() ? fmt(v, 1) : `${f.years[di]}年 ${fmt(v, 1)}分` },
          tooltip: Object.assign(baseOptions().plugins.tooltip, { callbacks: { label: (x) => `${x.dataset.label}：${fmt(x.raw, 1)}分` } }) }),
        scales: hbarScales(c, { min: 0, max: 60, title: { display: true, text: 'テレビ画面での1日あたり視聴時間（分）' } })
      })
    });
    table(document.querySelector('[data-fig="fig4_3"] .fig-table'), ['', '2024年', '2025年', '増減'],
      f.rows.map(r => [r[0], fmt(r[1], 1), fmt(r[2], 1), (r[2] - r[1] >= 0 ? '+' : '−') + fmt(Math.abs(r[2] - r[1]), 1)]));
    document.querySelector('[data-fig="fig4_3"] .fig-derived').textContent = '※ 各サービスの上の棒が2024年（薄い色）、下の棒が2025年。';
  }

  function fig4_4() {
    const f = D.fig4_4; const c = C();
    render('c4_4', {
      type: 'bar',
      data: { labels: f.years.map(y => `${y}年`), datasets: [bar('YouTubeでの本編視聴回数（百万回）', f.views, f.estimated.map(e => e ? 'rgba(59,130,246,0.35)' : c.uk), { borderWidth: 0, borderRadius: 3 })] },
      options: baseOptions({
        interaction: { mode: 'nearest', intersect: true },
        plugins: Object.assign(baseOptions().plugins, { legend: { display: false },
          barLabels: { format: (v, di, i) => (v < 100 ? `約${fmt(v * 100, 0)}万回` : `${fmt(v / 100, 2).replace(/0$/, '')}億回${i === 1 ? '超' : ''}`) + (narrow() ? '' : (f.growth[i] ? `（+${f.growth[i]}%）` : '（推計）')) },
          tooltip: Object.assign(baseOptions().plugins.tooltip, { callbacks: { label: (x) => `${fmt(x.raw, 0)}百万回` + (f.estimated[x.dataIndex] ? '（推計）' : '') } }) }),
        scales: {
          x: Object.assign(baseOptions().scales.x, { ticks: { color: c.text } }),
          y: Object.assign(baseOptions().scales.y, { min: 0, max: 200, title: { display: true, text: '視聴回数（百万回）' } })
        }
      })
    });
    table(document.querySelector('[data-fig="fig4_4"] .fig-table'), ['年', '視聴回数（百万回）', '前年比'],
      f.years.map((y, i) => [y + (f.estimated[i] ? '（推計）' : ''), (f.estimated[i] ? '約' : '') + fmt(f.views[i], 0) + (i === 1 ? '超' : ''), f.growth[i] ? `+${f.growth[i]}%` : '―']));
  }

  function fig4_5() {
    const f = D.fig4_5; const c = C();
    const ad = f.rows.map(r => +(r[2] / r[1] * 100).toFixed(1));
    render('c4_5', {
      type: 'bar',
      data: { labels: f.rows.map(r => r[0]), datasets: [
        bar('地上波テレビ広告収入', ad, c.s1, { borderWidth: 0, stack: 's' }),
        bar('それ以外（コンテンツ・配信・イベント・不動産など）', ad.map(v => +(100 - v).toFixed(1)), c.s2, { borderWidth: 0, stack: 's' })
      ] },
      options: baseOptions({
        indexAxis: 'y', interaction: { mode: 'index', axis: 'y', intersect: false },
        plugins: Object.assign(baseOptions().plugins, {
          tooltip: Object.assign(baseOptions().plugins.tooltip, { callbacks: { label: (x) => `${x.dataset.label}：${fmt(x.raw, 1)}%` } }) }),
        scales: {
          x: Object.assign(baseOptions().scales.x, { stacked: true, min: 0, max: 100, grid: { color: c.grid }, title: { display: true, text: '連結売上高に占める割合（%）' }, ticks: { callback: v => v + '%' } }),
          y: Object.assign(baseOptions().scales.y, { stacked: true, grid: { display: false }, ticks: { color: c.text } })
        }
      }),
      plugins: [{ id: 'inLabels', afterDatasetsDraw(chart) { const ctx = chart.ctx; ctx.save(); ctx.font = 'bold 12px system-ui, sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        chart.data.datasets.forEach((ds, di) => chart.getDatasetMeta(di).data.forEach((b, i) => { ctx.fillText(fmt(ds.data[i], 1) + '%', (b.x + b.base) / 2, b.y); })); ctx.restore(); } }]
    });
    table(document.querySelector('[data-fig="fig4_5"] .fig-table'), ['', '連結売上高（億円）', '地上波テレビ広告収入（億円）', '広告収入の割合'],
      f.rows.map((r, i) => [r[0], fmt(r[1], 0), fmt(r[2], 0), fmt(ad[i], 1) + '%']));
  }

  function fig4_6() {
    const f = D.fig4_6; const c = C();
    render('c4_6', {
      type: 'bar',
      data: { labels: f.years.map(y => `${y}`), datasets: [bar('放送コンテンツ海外輸出額（億円）', f.values, f.years.map((y, i) => i === f.years.length - 1 ? c.s2 : c.s1), { borderWidth: 0, borderRadius: 3 })] },
      options: baseOptions({
        interaction: { mode: 'nearest', intersect: true },
        plugins: Object.assign(baseOptions().plugins, { legend: { display: false },
          refLine: { value: f.target.value, label: `政府目標：${f.target.year}年度 ${fmt(f.target.value, 0)}億円` },
          barLabels: { format: (v) => fmt(v, 0) },
          tooltip: Object.assign(baseOptions().plugins.tooltip, { callbacks: { title: (it) => `${it[0].label}年度`, label: (x) => `${fmt(x.raw, 1)}億円` } }) }),
        scales: {
          x: Object.assign(baseOptions().scales.x, { title: { display: true, text: '年度' } }),
          y: Object.assign(baseOptions().scales.y, { min: 0, max: 1300, title: { display: true, text: '海外輸出額（億円）' }, ticks: { callback: v => v.toLocaleString() } })
        }
      })
    });
    table(document.querySelector('[data-fig="fig4_6"] .fig-table'), ['年度', '海外輸出額（億円）'], f.years.map((y, i) => [y, fmt(f.values[i], 1)]));
    document.querySelector('[data-fig="fig4_6"] .fig-derived').textContent = '※ 2023年度のジャンル別：' + f.genre2023.map(g => `${g[0]} ${g[1]}%`).join('、') + '。';
  }

  // ---------- 起動 ----------
  const draw = {
    fig1_1: () => fig1_1(document.querySelector('[data-fig="fig1_1"] .pill-btn-group .pill-btn.active').dataset.view),
    fig1_2: () => fig1_2(document.querySelector('[data-fig="fig1_2"] .pill-btn-group .pill-btn.active').dataset.view),
    fig1_3, fig1_4, fig1_5,
    fig2_1: () => fig2_1(document.querySelector('[data-fig="fig2_1"] .pill-btn-group .pill-btn.active').dataset.view),
    fig2_2, fig2_3,
    fig2_4: () => fig2_4(document.querySelector('[data-fig="fig2_4"] .pill-btn-group .pill-btn.active').dataset.view),
    fig3_1, fig3_2, fig3_3, fig3_4,
    fig4_1, fig4_2, fig4_3, fig4_4, fig4_5, fig4_6
  };
  function drawAll() {
    Object.entries(draw).forEach(([k, fn]) => { const card = document.querySelector(`[data-fig="${k}"]`); if (card && card.offsetParent !== null) fn(); });
  }
  function showTab(id) {
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('active', p.id === id));
    document.querySelectorAll('.nav-tab-btn[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
    drawAll();
  }
  document.addEventListener('DOMContentLoaded', () => {
    Object.keys(draw).forEach(k => { fillCard(k); const card = document.querySelector(`[data-fig="${k}"]`); toggles(card, draw[k]); });
    document.querySelectorAll('.age-chip').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.age; const on = b.classList.contains('active');
      if (on && fig13On.size === 1) return;
      on ? fig13On.delete(k) : fig13On.add(k); b.classList.toggle('active', !on); fig1_3();
    }));
    document.getElementById('footer-line').textContent = `© 2026 Naohisa Hashimoto’S Update date:${D.updated.replace(/-/g, '/')}`;
    document.querySelectorAll('.nav-tab-btn[data-tab]').forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); showTab(b.dataset.tab); history.replaceState(null, '', '#' + b.dataset.tab); }));
    showTab(['#tab-2', '#tab-3', '#tab-4'].includes(location.hash) ? location.hash.slice(1) : 'tab-1');
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', drawAll);
  });
})();
