/* ADHS-Diagnosemappe – App-Logik (ohne Abhängigkeiten, Daten nur lokal im Browser) */
'use strict';
(function () {
  const STORE_KEY = 'adhs-diagnosemappe-v1';
  const FRAMED = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  const $ = (s, r = document) => r.querySelector(s);
  const dec = (x) => Number(x).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const MOD = Object.fromEntries(MODULES.map((m) => [m.id, m]));

  /* ---------- Zustand ---------- */
  let state = blank();
  function blank() { return { v: 1, answers: {}, ablauf: {}, praxen: [], demo: false, updated: null }; }
  function load() {
    try { const raw = localStorage.getItem(STORE_KEY); if (raw) state = Object.assign(blank(), JSON.parse(raw)); } catch (e) { /* Speicher nicht verfügbar */ }
  }
  let saveTimer = null; let storageOk = true;
  function save() {
    state.updated = new Date().toISOString();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); storageOk = true; } catch (e) { storageOk = false; }
      const s = $('#save-state'); if (s) s.textContent = storageOk ? 'Lokal gespeichert' : 'Speichern nicht möglich – bitte exportieren';
    }, 250);
  }
  const A = (mid) => (state.answers[mid] = state.answers[mid] || {});
  const val = (mid, key) => (state.answers[mid] || {})[key];
  const filled = (v) => Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && String(v).trim() !== '';

  /* ---------- Item-Listen je Modul ---------- */
  function itemsOf(m) {
    if (m.type === 'scale') return m.items;
    if (m.type === 'dsm' || m.type === 'fremd') return DSM_ITEMS;
    return [];
  }
  const FREMD_FIELDS = [
    { id: 'rater', label: 'Wer füllt diesen Bogen aus? (Vorname oder Rolle)', type: 'text', req: true },
    { id: 'relation', label: 'Beziehung zur beurteilten Person', type: 'select', req: true, options: ['Mutter', 'Vater', 'Geschwister', 'Partner/in', 'Freund/in', 'Andere Verwandte', 'Sonstige'] },
    { id: 'kennt', label: 'Wie gut kennen Sie die Person im beurteilten Zeitraum?', type: 'select', req: true, options: ['Sehr gut', 'Gut', 'Mittel', 'Eher wenig'] }
  ];
  function fieldsOf(m) {
    if (m.type === 'form') return m.sections.flatMap((s) => s.fields);
    if (m.type === 'dsm') return m.extra || [];
    if (m.type === 'fremd') return FREMD_FIELDS;
    return [];
  }

  function progress(m) {
    let total = 0, done = 0;
    if (m.type === 'checklist') {
      m.groups.forEach((g) => g.items.forEach((it) => { total++; const s = val(m.id, it.id); if (s && s !== 'offen') done++; }));
      return { total, done };
    }
    itemsOf(m).forEach((it) => { total++; if (filled(val(m.id, it.id))) done++; });
    fieldsOf(m).forEach((f) => { if (!f.req) return; total++; if (filled(val(m.id, f.id))) done++; });
    return { total, done };
  }
  const complete = (m) => { const p = progress(m); return p.total > 0 && p.done === p.total; };
  const requiredMods = () => MODULES.filter((m) => m.required);
  const allRequiredDone = () => requiredMods().every(complete);

  /* ---------- Auswertung ---------- */
  function countDsm(mid) {
    let ia = 0, hi = 0, sIa = 0, sHi = 0;
    DSM_ITEMS.forEach((it) => {
      const v = Number(val(mid, it.id)); if (isNaN(v)) return;
      if (it.dom === 'IA') { sIa += v; if (v >= 2) ia++; } else { sHi += v; if (v >= 2) hi++; }
    });
    return { ia, hi, sIa, sHi, done: complete(MOD[mid]) };
  }
  const sumOf = (mid, items) => items.reduce((s, it) => s + (Number(val(mid, it.id)) || 0), 0);
  const yes = (k) => val('differenzial', k) === 'ja';
  const optIndex = (mid, fid) => { const f = fieldsOf(MOD[mid]).find((x) => x.id === fid); return f ? f.options.indexOf(val(mid, fid)) : -1; };

  function compute() {
    const r = {};
    // ASRS-Typ
    const asA = ASRS_ITEMS.filter((i) => i.part === 'A' && Number(val('asrs', i.id)) >= i.thr).length;
    const asAll = ASRS_ITEMS.filter((i) => Number(val('asrs', i.id)) >= i.thr).length;
    r.asrs = { partA: asA, shaded: asAll, sum: sumOf('asrs', ASRS_ITEMS), pos: asA >= 4, done: complete(MOD.asrs) };
    r.adult = countDsm('dsm-aktuell');
    r.child = countDsm('dsm-kindheit');
    r.fremdA = countDsm('fremd-aktuell');
    r.fremdK = countDsm('fremd-kindheit');
    r.wurs = { sum: sumOf('kindheit-skala', WURS_ITEMS), max: 100, cut: 36, done: complete(MOD['kindheit-skala']) };
    r.wurs.pos = r.wurs.sum >= r.wurs.cut;
    // Emotion
    const groups = {};
    EMO_ITEMS.forEach((it) => { const v = Number(val('emotion', it.id)); (groups[it.grp] = groups[it.grp] || []).push(isNaN(v) ? 0 : v); });
    r.emo = { sum: sumOf('emotion', EMO_ITEMS), mean: sumOf('emotion', EMO_ITEMS) / EMO_ITEMS.length, groups: Object.fromEntries(Object.entries(groups).map(([g, a]) => [g, a.reduce((x, y) => x + y, 0) / a.length])), done: complete(MOD.emotion) };
    // Funktion
    const doms = {};
    FUNC_ITEMS.forEach((it) => { const v = Number(val('alltag', it.id)); if (!doms[it.dom]) doms[it.dom] = -1; if (!isNaN(v)) doms[it.dom] = Math.max(doms[it.dom], v); });
    r.func = { doms, impaired: Object.values(doms).filter((v) => v >= 2).length, done: complete(MOD.alltag) };
    // PHQ / GAD
    const phq = sumOf('phq9', PHQ9_ITEMS), gad = sumOf('gad7', GAD7_ITEMS);
    r.phq = { sum: phq, item9: Number(val('phq9', 'p9')) || 0, label: phq >= 20 ? 'schwer' : phq >= 15 ? 'mittelschwer' : phq >= 10 ? 'mittelgradig' : phq >= 5 ? 'leicht' : 'minimal', done: complete(MOD.phq9) };
    r.gad = { sum: gad, label: gad >= 15 ? 'schwer' : gad >= 10 ? 'mittelgradig' : gad >= 5 ? 'leicht' : 'minimal', done: complete(MOD.gad7) };
    // AUDIT-C
    const audit = ['au1', 'au2', 'au3'].reduce((s, k) => s + Math.max(0, optIndex('differenzial', k)), 0);
    const female = val('person', 'geschlecht') === 'weiblich';
    r.audit = { sum: audit, cut: female ? 4 : 5, pos: audit >= (female ? 4 : 5) };
    // Kriterien B–E
    const bereiche = (val('dsm-aktuell', 'bereiche') || []).filter((b) => b !== 'Keinem Bereich');
    r.crit = {
      beginn: val('dsm-aktuell', 'beginn') || '–',
      dauer: val('dsm-aktuell', 'dauer') || '–',
      bereiche, C: bereiche.length >= 2,
      beeintr: val('dsm-aktuell', 'beeintr') || '–',
      D: r.func.impaired >= 2 || ['Deutlich', 'Schwer'].includes(val('dsm-aktuell', 'beeintr')),
      phasen: val('dsm-aktuell', 'phasen') || '–'
    };
    // Differenzialdiagnostische Hinweise
    const f = [];
    if (r.phq.done && r.phq.sum >= 10) f.push({ lvl: 'warn', t: `Depressive Symptome (PHQ-9: ${r.phq.sum} Punkte, ${r.phq.label})`, d: 'Kann Konzentrations- und Antriebsprobleme erklären oder zusätzlich zu ADHS bestehen. Die Abgrenzung ist ärztliche Aufgabe.' });
    if (r.phq.item9 > 0) f.push({ lvl: 'crit', t: 'Gedanken an Tod oder Selbstverletzung angegeben (PHQ-9, Frage 9)', d: 'Bitte unbedingt im Termin ansprechen. Bei akuter Gefahr: Notruf 112 oder TelefonSeelsorge 0800 111 0 111.' });
    if (r.gad.done && r.gad.sum >= 10) f.push({ lvl: 'warn', t: `Angstsymptome (GAD-7: ${r.gad.sum} Punkte, ${r.gad.label})`, d: 'Angst kann Unruhe und Konzentrationsprobleme verursachen oder zusätzlich bestehen.' });
    const bp = ['bp1', 'bp2', 'bp3'].filter(yes).length;
    if (bp >= 2) f.push({ lvl: 'warn', t: 'Hinweise auf abgegrenzte Phasen gehobener Stimmung', d: 'Abklärung einer bipolaren Störung ist wichtig, auch für die Wahl einer Medikation.' + (yes('bp4') ? ' Die Phasen wurden als klar abgegrenzt beschrieben.' : '') });
    const as = ['as1', 'as2', 'as3', 'as4', 'as5'].filter(yes).length;
    if (as >= 3) f.push({ lvl: 'info', t: `Merkmale aus dem Autismus-Spektrum (${as} von 5)`, d: 'ADHS und Autismus treten häufig gemeinsam auf. Eine gezielte Autismus-Diagnostik kann sinnvoll sein.' + (yes('as6') ? ' Laut Angabe bereits seit der Kindheit.' : '') });
    const bl = ['bl1', 'bl2', 'bl3', 'bl4', 'bl5'].filter(yes).length;
    if (bl >= 3) f.push({ lvl: 'warn', t: `Merkmale emotionaler Instabilität (${bl} von 5)`, d: 'Überschneidungen mit einer Borderline-Persönlichkeitsstörung sind häufig und sollten abgegrenzt werden.' });
    const sl = ['sl1', 'sl3', 'sl4'].filter(yes);
    if (sl.length || yes('sl2')) f.push({ lvl: 'info', t: 'Schlafbezogene Beschwerden', d: (yes('sl1') ? 'Schnarchen/Atemaussetzer: Schlafapnoe ausschließen lassen. ' : '') + (yes('sl4') ? 'Unruhige Beine: Restless-Legs und Ferritin prüfen lassen. ' : '') + 'Schlafmangel allein kann ADHS-ähnliche Beschwerden verursachen.' });
    if (yes('tr1') || (yes('tr2') && yes('tr1'))) f.push({ lvl: 'warn', t: 'Belastende Erlebnisse mit anhaltenden Folgen', d: 'Traumafolgestörungen können Konzentration und Unruhe stark beeinflussen und sollten mitbetrachtet werden.' });
    if (yes('zw1')) f.push({ lvl: 'info', t: 'Zwangssymptome angegeben', d: 'Im Gespräch abklären.' });
    const ko = [['ko1', 'Schilddrüse'], ['ko2', 'Krampfanfälle/Epilepsie'], ['ko3', 'Schädel-Hirn-Trauma'], ['ko4', 'Eisen-/B12-Mangel']].filter(([k]) => yes(k)).map(([, l]) => l);
    if (ko.length) f.push({ lvl: 'info', t: 'Körperliche Faktoren: ' + ko.join(', '), d: 'Diese Befunde können Aufmerksamkeit beeinflussen und sollten vor einer Diagnose berücksichtigt werden.' });
    if (r.audit.pos) f.push({ lvl: 'warn', t: `Riskanter Alkoholkonsum möglich (AUDIT-C: ${r.audit.sum}, Grenzwert ${r.audit.cut})`, d: 'Substanzkonsum kann Symptome verursachen, verstärken oder überdecken. Viele Menschen mit ADHS nutzen Substanzen zur Selbstregulation.' });
    if (['Wöchentlich', 'Täglich oder fast täglich'].includes(val('differenzial', 'can'))) f.push({ lvl: 'warn', t: 'Regelmäßiger Cannabiskonsum', d: 'Beeinflusst Aufmerksamkeit und Antrieb. Im Termin offen ansprechen.' });
    if (['Gelegentlich', 'Regelmäßig'].includes(val('differenzial', 'drog')) || yes('stim')) f.push({ lvl: 'warn', t: 'Aktueller Konsum anderer Substanzen oder nicht verordneter Medikamente', d: 'Wichtig für Diagnostik und Behandlungssicherheit.' });
    if (yes('le1')) f.push({ lvl: 'info', t: 'Lese-Rechtschreib- oder Rechenschwäche', d: 'Häufige Begleiterscheinung; kann Schulprobleme teilweise erklären.' });
    if (yes('ti1')) f.push({ lvl: 'info', t: 'Tics', d: 'Häufige Begleiterscheinung von ADHS; relevant für die Behandlungsplanung.' });
    const herz = (val('anamnese', 'herz') || []).filter((x) => x !== 'Nichts davon');
    if (herz.length) f.push({ lvl: 'info', t: 'Herz-Kreislauf-Risiken: ' + herz.join(', '), d: 'Wichtig vor einer möglichen Stimulanzienbehandlung (kardiologische Abklärung).' });
    r.flags = f;
    return r;
  }

  function recommend(r) {
    const maxA = Math.max(r.adult.ia, r.adult.hi);
    const A = maxA >= 5 ? 'erfüllt' : maxA === 4 ? 'grenzwertig' : 'nicht erfüllt';
    const kStrong = r.child.ia >= 6 || r.child.hi >= 6;
    const kSome = r.child.ia >= 3 || r.child.hi >= 3;
    const early = r.crit.beginn === 'Vor dem 12. Lebensjahr';
    const child = (kStrong || (kSome && r.wurs.pos)) ? 'deutlich' : (kSome || r.wurs.pos || early) ? 'teilweise' : 'kaum';
    const onlyPhases = r.crit.phasen === 'Ja, nur in bestimmten Phasen';
    const points = [];
    const add = (p, label) => points.push({ p, label });
    add(A === 'erfüllt' ? 3 : A === 'grenzwertig' ? 1.5 : 0, `Kriterium A heute (≥ 5 von 9 in einem Bereich): ${A} – Unaufmerksamkeit ${r.adult.ia}/9, Hyperaktivität/Impulsivität ${r.adult.hi}/9`);
    add(r.asrs.pos ? 1 : 0, `Screening Teil A: ${r.asrs.partA} von 6 auffällig (Schwelle 4) – ${r.asrs.pos ? 'positiv' : 'negativ'}`);
    add(child === 'deutlich' ? 2 : child === 'teilweise' ? 1 : 0, `Hinweise aus der Kindheit: ${child} – Checkliste ${r.child.ia}/9 bzw. ${r.child.hi}/9, Kindheitsskala ${r.wurs.sum}/${r.wurs.max}, Beginn: ${r.crit.beginn}`);
    add(r.crit.C ? 1 : 0, `Mehrere Lebensbereiche betroffen (Kriterium C): ${r.crit.bereiche.length}`);
    add(r.crit.D ? 1 : 0, `Deutliche Beeinträchtigung (Kriterium D): ${r.func.impaired} Bereiche mit „oft“ oder häufiger, Selbsteinschätzung „${r.crit.beeintr}“`);
    add(r.emo.mean >= 1.5 ? 0.5 : 0, `Emotionale Dysregulation/Desorganisation: Mittelwert ${dec(r.emo.mean)} von 3`);
    if (r.fremdA.done) { const m = Math.max(r.fremdA.ia, r.fremdA.hi); add(m >= 5 ? 0.5 : m < 3 ? -0.5 : 0, `Fremdbeurteilung heute: ${r.fremdA.ia}/9 bzw. ${r.fremdA.hi}/9 – ${m >= 5 ? 'bestätigt' : m < 3 ? 'bestätigt eher nicht' : 'teilweise'}`); }
    if (r.fremdK.done) { const m = Math.max(r.fremdK.ia, r.fremdK.hi); add(m >= 6 ? 0.5 : m < 3 ? -0.5 : 0, `Fremdbeurteilung Kindheit: ${r.fremdK.ia}/9 bzw. ${r.fremdK.hi}/9 – ${m >= 6 ? 'bestätigt' : m < 3 ? 'bestätigt eher nicht' : 'teilweise'}`); }
    const score = points.reduce((s, x) => s + x.p, 0);
    const max = 8.5 + (r.fremdA.done ? 0.5 : 0) + (r.fremdK.done ? 0.5 : 0);
    let level;
    if (A === 'erfüllt' && child !== 'kaum' && r.crit.C && r.crit.D && !onlyPhases) level = 'hoch';
    else if (A !== 'nicht erfüllt' || r.asrs.pos) level = 'mittel';
    else level = 'gering';
    let pres = null;
    if (r.adult.ia >= 5 && r.adult.hi >= 5) pres = 'gemischtes Erscheinungsbild (Unaufmerksamkeit und Hyperaktivität/Impulsivität)';
    else if (r.adult.ia >= 5) pres = 'vorwiegend unaufmerksames Erscheinungsbild';
    else if (r.adult.hi >= 5) pres = 'vorwiegend hyperaktiv-impulsives Erscheinungsbild';
    const notes = [];
    if (r.crit.beginn === 'Erst im Erwachsenenalter') notes.push('Sie geben einen Beginn erst im Erwachsenenalter an. Die Diagnosekriterien verlangen mehrere Symptome vor dem 12. Lebensjahr. Häufig zeigen sich Symptome in der Kindheit nur abgeschwächt oder wurden durch Struktur ausgeglichen – das muss im Interview genau geklärt werden.');
    if (onlyPhases) notes.push('Die Merkmale treten laut Ihrer Angabe nur in bestimmten Phasen auf. Das spricht eher dafür, dass eine andere Ursache die Beschwerden (mit) erklärt (Kriterium E).');
    if (r.crit.dauer === 'Nein') notes.push('Die Merkmale bestehen laut Angabe nicht seit mindestens 6 Monaten durchgehend.');
    if (r.flags.some((x) => x.lvl !== 'info')) notes.push('Es gibt Hinweise auf weitere Beschwerdebilder (siehe unten). Diese können ADHS-ähnliche Symptome erzeugen oder zusätzlich bestehen und machen eine sorgfältige Abgrenzung nötig.');
    if (!r.fremdA.done || !r.fremdK.done) notes.push('Nicht alle Fremdbeurteilungen liegen vor. Ihre Einschätzung wird aussagekräftiger, wenn Bezugspersonen ihre Sicht ergänzen.');
    return { A, child, level, score, max, points, pres, notes };
  }

  const LEVEL_TEXT = {
    hoch: { h: 'Deutliche Tendenz zu einem ADHS-typischen Beschwerdebild', d: 'Ihre Angaben erfüllen in der Selbsteinschätzung die wesentlichen Kriterien: genügend Symptome heute, Hinweise aus der Kindheit, mehrere betroffene Lebensbereiche und eine spürbare Beeinträchtigung. Eine fachärztliche Diagnostik ist klar zu empfehlen.' },
    mittel: { h: 'Teilweise ADHS-typische Merkmale – fachärztliche Abklärung sinnvoll', d: 'Einige, aber nicht alle Kriterien sind in Ihrer Selbsteinschätzung erfüllt oder liegen im Grenzbereich. Das kann auf ADHS hindeuten, aber auch auf andere Ursachen. Eine fachärztliche Einschätzung kann das klären.' },
    gering: { h: 'Wenige ADHS-typische Merkmale', d: 'Ihre Angaben erfüllen die Kernkriterien in der Selbsteinschätzung nicht. Wenn Sie trotzdem stark belastet sind, lohnt sich eine Abklärung – die Ursache kann eine andere sein, die ebenfalls gut behandelbar ist.' }
  };

  /* ---------- Rendering: Felder ---------- */
  function fieldHtml(mid, f) {
    const v = val(mid, f.id);
    const id = `f-${mid}-${f.id}`;
    const req = f.req ? '<span class="req" aria-hidden="true">*</span>' : '';
    const help = f.help ? `<p class="help">${esc(f.help)}</p>` : '';
    const data = `data-mod="${mid}" data-key="${f.id}"`;
    let input = '';
    switch (f.type) {
      case 'text':
        input = `<input type="text" id="${id}" ${data} value="${esc(v)}" autocomplete="off">`; break;
      case 'number':
        input = `<input type="number" inputmode="numeric" id="${id}" ${data} value="${esc(v)}" ${f.min != null ? `min="${f.min}"` : ''} ${f.max != null ? `max="${f.max}"` : ''}>`; break;
      case 'textarea':
        input = `<textarea id="${id}" ${data} rows="3">${esc(v)}</textarea>`; break;
      case 'select':
        input = `<select id="${id}" ${data}><option value="">Bitte wählen …</option>${f.options.map((o) => `<option ${v === o ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`; break;
      case 'range':
        input = `<div class="range"><input type="range" id="${id}" ${data} min="${f.min}" max="${f.max}" step="1" value="${v == null ? 0 : esc(v)}" data-touched="${v == null ? '0' : '1'}"><output for="${id}">${v == null ? '–' : esc(v)}</output></div>`; break;
      case 'checks': {
        const arr = Array.isArray(v) ? v : [];
        input = `<div class="checks" role="group" aria-labelledby="${id}-l">${f.options.map((o, i) => `<label class="chk"><input type="checkbox" id="${id}-${i}" ${data} data-kind="checks" value="${esc(o)}" ${arr.includes(o) ? 'checked' : ''}><span>${esc(o)}</span></label>`).join('')}</div>`;
        return `<div class="field"><span class="lbl" id="${id}-l">${esc(f.label)}${req}</span>${help}${input}</div>`;
      }
      case 'yn':
        input = `<div class="seg" role="radiogroup" aria-labelledby="${id}-l">${SCALES.yn.map((o) => `<label><input type="radio" name="${id}" id="${id}-${o.v}" ${data} value="${o.v}" ${v === o.v ? 'checked' : ''}><span>${o.l}</span></label>`).join('')}</div>`;
        return `<div class="field yn"><span class="lbl" id="${id}-l">${esc(f.label)}${req}</span>${help}${input}</div>`;
    }
    return `<div class="field"><label class="lbl" for="${id}">${esc(f.label)}${req}</label>${help}${input}</div>`;
  }

  function scaleItemHtml(mid, it, n, text, scale, opts = {}) {
    const v = val(mid, it.id);
    const name = `r-${mid}-${it.id}`;
    const badge = opts.badge ? `<span class="code">${esc(opts.badge)}</span>` : '';
    const ex = opts.example ? `<details class="ex" ${filled(val(mid, it.id + '_ex')) ? 'open' : ''}><summary>Beispiel aus dem Alltag notieren</summary><textarea id="${name}-ex" data-mod="${mid}" data-key="${it.id}_ex" rows="2" placeholder="${esc(opts.placeholder || 'Konkretes Beispiel …')}">${esc(val(mid, it.id + '_ex'))}</textarea></details>` : '';
    return `<fieldset class="item ${filled(v) ? 'is-done' : ''}" id="it-${mid}-${it.id}">
      <legend><span class="num">${n}</span><span class="q">${badge}${esc(text)}</span></legend>
      <div class="opts" style="--n:${SCALES[scale].length}">${SCALES[scale].map((o) => `<label><input type="radio" name="${name}" id="${name}-${o.v}" data-mod="${mid}" data-key="${it.id}" value="${o.v}" ${String(v) === String(o.v) ? 'checked' : ''}><span>${esc(o.l)}</span></label>`).join('')}</div>${ex}</fieldset>`;
  }

  /* ---------- Rendering: Ansichten ---------- */
  function header(m) {
    const p = progress(m);
    const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
    const tag = m.required ? '<span class="pill pill-req">Pflicht für die Auswertung</span>' : m.recommended ? '<span class="pill pill-rec">Empfohlen</span>' : '';
    const mins = MODULE_MINUTES[m.id] ? `<span class="pill">ca. ${MODULE_MINUTES[m.id]} Min.</span>` : '';
    return `<header class="mod-head"><p class="eyebrow">${esc(m.group)}</p><h1>${esc(m.title)}</h1>
      <div class="pills">${tag}${mins}</div>
      ${m.instrument ? `<p class="instrument">${esc(m.instrument)}</p>` : ''}
      ${m.intro ? `<p class="intro">${esc(m.intro)}</p>` : ''}
      ${p.total ? `<div class="mod-progress" data-prog="${m.id}"><div class="bar"><span style="width:${pct}%"></span></div><span class="ptxt">${p.done} von ${p.total} beantwortet</span></div>` : ''}
    </header>`;
  }
  function navFooter(m) {
    const order = MODULES.filter((x) => x.type !== 'dashboard');
    const i = order.findIndex((x) => x.id === m.id);
    const prev = order[i - 1], next = order[i + 1];
    return `<nav class="pager" aria-label="Weiter">${prev ? `<a class="btn ghost" href="#${prev.id}">← ${esc(prev.title)}</a>` : '<span></span>'}${next ? `<a class="btn primary" href="#${next.id}">${esc(next.title)} →</a>` : ''}</nav>`;
  }

  function viewForm(m) {
    return header(m) + m.sections.map((s) => `<section class="card"><h2>${esc(s.title)}</h2><div class="fields">${s.fields.map((f) => fieldHtml(m.id, f)).join('')}</div></section>`).join('') + navFooter(m);
  }
  function viewScale(m) {
    let html = header(m) + '<div class="items">';
    let lastGrp = null;
    m.items.forEach((it, i) => {
      if (m.grouped && it[m.grouped] !== lastGrp) { lastGrp = it[m.grouped]; html += `<h2 class="grp">${esc(lastGrp)}</h2>`; }
      html += scaleItemHtml(m.id, it, i + 1, it.text, m.scale);
    });
    html += '</div>';
    if (m.id === 'phq9') html += crisisBox(true);
    return html + navFooter(m);
  }
  function viewDsm(m) {
    const adult = m.which === 'adult';
    let html = header(m) + '<div class="items">';
    DSM_ITEMS.forEach((it, i) => {
      if (i === 0) html += '<h2 class="grp">Unaufmerksamkeit (A1)</h2>';
      if (i === 9) html += '<h2 class="grp">Hyperaktivität und Impulsivität (A2)</h2>';
      html += scaleItemHtml(m.id, it, i + 1, adult ? it.adult : it.child, m.scale, { badge: it.code, example: true, placeholder: adult ? 'Z. B. „Ich habe letzten Monat zweimal die Kfz-Steuer vergessen.“' : 'Z. B. „Laut Zeugnis Klasse 3: träumt im Unterricht.“ (Quelle notieren)' });
    });
    html += '</div>';
    if (m.extra) html += `<section class="card"><h2>Zusatzkriterien B bis E</h2><div class="fields">${m.extra.map((f) => fieldHtml(m.id, f)).join('')}</div></section>`;
    return html + navFooter(m);
  }
  function viewFremd(m) {
    const adult = m.which === 'adult';
    let html = header(m);
    html += `<section class="card"><h2>Angaben zur beurteilenden Person</h2><div class="fields">${FREMD_FIELDS.map((f) => fieldHtml(m.id, f)).join('')}</div></section>`;
    html += `<p class="note">${adult ? 'Bitte beurteilen Sie, wie sehr die folgenden Aussagen in den letzten 6 Monaten auf die Person zutrafen. Die Person …' : 'Bitte beurteilen Sie, wie die Person als Kind im Alter von etwa 5 bis 12 Jahren war. Die Person …'}</p><div class="items">`;
    DSM_ITEMS.forEach((it, i) => {
      if (i === 0) html += '<h2 class="grp">Aufmerksamkeit</h2>';
      if (i === 9) html += '<h2 class="grp">Unruhe und Impulsivität</h2>';
      html += scaleItemHtml(m.id, it, i + 1, '… ' + DSM_SHORT[it.id][adult ? 0 : 1], m.scale, { example: true, placeholder: 'Optional: ein Beispiel, an das Sie sich erinnern' });
    });
    html += '</div>';
    html += `<section class="card"><div class="fields">${fieldHtml(m.id, { id: 'kommentar', label: 'Was möchten Sie der Ärztin/dem Arzt sonst noch mitteilen?', type: 'textarea' })}</div></section>`;
    return html + navFooter(m);
  }
  const STATUS = ['offen', 'angefragt', 'vorhanden', 'nicht verfügbar', 'nicht nötig'];
  function viewChecklist(m) {
    return header(m) + m.groups.map((g) => `<section class="card"><h2>${esc(g.title)}</h2><ul class="clist">${g.items.map((it) => {
      const s = val(m.id, it.id) || 'offen';
      return `<li class="st-${s.replace(/\s/g, '-')}"><div class="ctext"><span>${esc(it.text)}</span>${it.help ? `<small>${esc(it.help)}</small>` : ''}</div><select aria-label="Status: ${esc(it.text)}" id="c-${it.id}" data-mod="${m.id}" data-key="${it.id}" data-kind="status">${STATUS.map((o) => `<option ${o === s ? 'selected' : ''}>${o}</option>`).join('')}</select></li>`;
    }).join('')}</ul></section>`).join('') + navFooter(m);
  }

  function viewAblauf(m) {
    const steps = ABLAUF.map((s, i) => `<li class="step ${state.ablauf[s.id] ? 'is-done' : ''}">
      <div class="step-n" aria-hidden="true">${i + 1}</div>
      <div class="step-b"><h3>${esc(s.title)}</h3><p class="who">${esc(s.who)}</p><p>${esc(s.text)}</p>
      <label class="chk"><input type="checkbox" id="ab-${s.id}" data-ablauf="${s.id}" ${state.ablauf[s.id] ? 'checked' : ''}><span>Erledigt</span></label></div></li>`).join('');
    const rows = state.praxen.map((p, i) => `<tr>
      <td><input type="text" aria-label="Praxis" id="px-${i}-name" data-px="${i}" data-pk="name" value="${esc(p.name)}" placeholder="Praxis / Ambulanz"></td>
      <td><input type="date" aria-label="Kontaktiert am" id="px-${i}-datum" data-px="${i}" data-pk="datum" value="${esc(p.datum)}"></td>
      <td><select aria-label="Status" id="px-${i}-status" data-px="${i}" data-pk="status">${['angefragt', 'Warteliste', 'Termin vereinbart', 'abgesagt', 'keine Antwort'].map((o) => `<option ${p.status === o ? 'selected' : ''}>${o}</option>`).join('')}</select></td>
      <td><input type="text" aria-label="Termin / Notiz" id="px-${i}-notiz" data-px="${i}" data-pk="notiz" value="${esc(p.notiz)}" placeholder="Termin, Wartezeit …"></td>
      <td><button class="icon-btn" data-act="px-del" data-i="${i}" aria-label="Zeile löschen">✕</button></td></tr>`).join('');
    return `<header class="mod-head"><p class="eyebrow">Überblick</p><h1>Der Weg zur Diagnose in Deutschland</h1>
      <p class="intro">Die Diagnostik bei Erwachsenen folgt der S3-Leitlinie ADHS. Sie ist eine klinische Diagnose: Kein einzelner Test beweist oder widerlegt ADHS. Entscheidend sind das ausführliche Gespräch, Ihre Lebensgeschichte, Belege aus der Kindheit, Fremdauskünfte und der Ausschluss anderer Ursachen. Die Kosten trägt bei medizinischer Notwendigkeit die gesetzliche Krankenversicherung.</p></header>
      <ol class="steps">${steps}</ol>
      <section class="card"><h2>Was die Diagnose voraussetzt (DSM-5)</h2>
        <dl class="crit">
          <div><dt>A</dt><dd>Ab 17 Jahren mindestens 5 von 9 Merkmalen der Unaufmerksamkeit und/oder 5 von 9 Merkmalen der Hyperaktivität/Impulsivität, seit mindestens 6 Monaten</dd></div>
          <div><dt>B</dt><dd>Mehrere Merkmale bestanden bereits vor dem 12. Lebensjahr</dd></div>
          <div><dt>C</dt><dd>Die Merkmale zeigen sich in mindestens zwei Lebensbereichen (z. B. Arbeit und Familie)</dd></div>
          <div><dt>D</dt><dd>Sie beeinträchtigen das soziale, schulische oder berufliche Leben deutlich</dd></div>
          <div><dt>E</dt><dd>Sie lassen sich nicht besser durch eine andere psychische Erkrankung erklären</dd></div>
        </dl></section>
      <section class="card"><h2>Welche Instrumente Sie beim Facharzt erwarten können</h2>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Instrument</th><th>Art</th><th>In dieser App vorbereitet durch</th></tr></thead><tbody>
          <tr><td>ASRS v1.1</td><td>Screening, Selbstbeurteilung</td><td>Screening (ASRS-Typ)</td></tr>
          <tr><td>WURS-K (Teil der HASE)</td><td>Kindheit, Selbstbeurteilung</td><td>Kindheitsskala (WURS-Typ)</td></tr>
          <tr><td>ADHS-SB / ADHS-FB</td><td>DSM-/ICD-Kriterien, Selbst- und Fremdbeurteilung</td><td>Symptomcheckliste heute, Fremdbeurteilungen</td></tr>
          <tr><td>DIVA-5 oder IDA-R</td><td>Strukturiertes Interview mit Beispielen aus Kindheit und Erwachsenenalter</td><td>Symptomchecklisten mit Beispielfeldern</td></tr>
          <tr><td>WRI (Wender-Reimherr-Interview)</td><td>Interview zu Emotionen, Temperament, Desorganisation</td><td>Emotionen &amp; Organisation</td></tr>
          <tr><td>CAARS</td><td>Ausführliche Selbst- und Fremdbeurteilung</td><td>Symptomcheckliste, Fremdbeurteilungen</td></tr>
          <tr><td>WFIRS-S</td><td>Funktionelle Beeinträchtigung</td><td>Beeinträchtigung im Alltag</td></tr>
          <tr><td>BDI-II, PHQ-9, GAD-7 u. a.</td><td>Depression und Angst</td><td>PHQ-9, GAD-7</td></tr>
          <tr><td>TAP, QbTest, d2-R, CPT</td><td>Neuropsychologische Tests (optional, nur in der Praxis)</td><td>Nicht möglich – nur Durchführung vor Ort</td></tr>
        </tbody></table></div>
        <p class="help">Die Originalfragebögen sind urheberrechtlich geschützt und werden von der Praxis ausgegeben. Diese App bildet ihre Inhalte mit eigenen Formulierungen ab, damit Sie die Fragen vorab durchdenken und Beispiele sammeln können.</p></section>
      <section class="card"><h2>Ihre Facharztsuche</h2>
        <p class="help">Notieren Sie, wo Sie angefragt haben. Tipp: Die Terminservicestelle erreichen Sie unter 116117 oder online über 116117.de.</p>
        <div class="tbl-wrap"><table class="tbl px"><thead><tr><th>Praxis</th><th>Kontakt am</th><th>Status</th><th>Notiz</th><th><span class="sr">Löschen</span></th></tr></thead><tbody>${rows || '<tr><td colspan="5" class="empty">Noch keine Praxis eingetragen.</td></tr>'}</tbody></table></div>
        <button class="btn" data-act="px-add">+ Praxis hinzufügen</button></section>` + navFooter(m);
  }

  function crisisBox(onlyIfNeeded) {
    if (onlyIfNeeded && !(Number(val('phq9', 'p9')) > 0)) return '<div id="crisis-slot"></div>';
    return `<div id="crisis-slot"><aside class="crisis" role="note"><strong>Wenn es Ihnen gerade sehr schlecht geht</strong>
      <p>Sie müssen damit nicht allein bleiben. Die TelefonSeelsorge ist kostenlos und rund um die Uhr erreichbar: <b>0800 111 0 111</b> oder <b>0800 111 0 222</b>. Ärztlicher Bereitschaftsdienst: <b>116117</b>. In akuter Gefahr: <b>112</b> oder die nächste psychiatrische Klinik.</p></aside></div>`;
  }

  function viewDashboard() {
    const groups = [...new Set(MODULES.filter((m) => !['dashboard', 'ablauf', 'report'].includes(m.type)).map((m) => m.group))];
    const req = requiredMods();
    const reqDone = req.filter(complete).length;
    const allProg = MODULES.reduce((acc, m) => { const p = progress(m); acc.t += p.total; acc.d += p.done; return acc; }, { t: 0, d: 0 });
    const pct = Math.round((allProg.d / allProg.t) * 100);
    const card = (m) => {
      const p = progress(m); const c = complete(m);
      const st = c ? '<span class="pill pill-ok">Fertig</span>' : p.done ? `<span class="pill pill-wip">${p.done}/${p.total}</span>` : '<span class="pill">Offen</span>';
      return `<a class="mcard ${c ? 'is-done' : ''}" href="#${m.id}"><span class="mt">${esc(m.title)}</span><span class="mm">${m.required ? 'Pflicht' : 'Empfohlen'} · ca. ${MODULE_MINUTES[m.id] || 3} Min.</span>${st}</a>`;
    };
    return `<header class="hero"><p class="eyebrow">Vorbereitung auf die Facharzt-Diagnostik</p>
      <h1>Ihre ADHS-Diagnosemappe</h1>
      <p class="intro">Alles, was bei der ADHS-Diagnostik von Erwachsenen in Deutschland abgefragt wird, an einem Ort: Screening, Symptomchecklisten für heute und die Kindheit, Fremdbeurteilungen, Abgrenzung zu anderen Erkrankungen, Lebensgeschichte und Unterlagen. Am Ende steht ein Bericht für Ihre Ärztin oder Ihren Arzt und eine unverbindliche Einschätzung.</p>
      <div class="hero-stats">
        <div class="stat"><span class="sv">${pct} %</span><span class="sl">insgesamt beantwortet</span></div>
        <div class="stat"><span class="sv">${reqDone} / ${req.length}</span><span class="sl">Pflichtmodule fertig</span></div>
        <div class="stat"><span class="sv">${MODULES.filter((m) => m.recommended && complete(m)).length} / ${MODULES.filter((m) => m.recommended).length}</span><span class="sl">empfohlene Module</span></div>
      </div>
      <div class="hero-actions"><a class="btn primary" href="#${(req.find((m) => !complete(m)) || MOD.auswertung).id}">${reqDone === 0 ? 'Jetzt beginnen' : reqDone === req.length ? 'Zur Auswertung' : 'Weitermachen'}</a><a class="btn ghost" href="#ablauf">Diagnoseweg ansehen</a></div>
    </header>
    ${state.demo ? '<aside class="demo-banner">Es sind <b>Beispieldaten</b> geladen. Sie sind erfunden und nicht Ihre Angaben. <button class="btn small" data-act="reset-ask">Beispieldaten entfernen</button></aside>' : ''}
    ${groups.map((g) => `<section class="mgroup"><h2>${esc(g)}</h2><div class="mgrid">${MODULES.filter((m) => m.group === g && !['dashboard', 'ablauf', 'report'].includes(m.type)).map(card).join('')}</div></section>`).join('')}
    <section class="card two">
      <div><h2>So nutzen Sie die Mappe</h2><ul class="plain">
        <li>Sie können in beliebiger Reihenfolge arbeiten und jederzeit pausieren.</li>
        <li>Nehmen Sie sich für die Symptomchecklisten Zeit und notieren Sie konkrete Beispiele.</li>
        <li>Geben Sie die Fremdbeurteilungen Ihren Bezugspersonen, ohne Ihre Antworten zu zeigen.</li>
        <li>Die Einschätzung erscheint, sobald alle Pflichtmodule vollständig sind.</li></ul></div>
      <div><h2>Ihre Daten</h2><ul class="plain">
        <li>Alle Angaben bleiben ausschließlich in diesem Browser auf diesem Gerät.</li>
        <li>Es werden keine Daten an Server übertragen.</li>
        <li>Sichern Sie Ihre Angaben über „Daten sichern“, bevor Sie Browserdaten löschen.</li></ul>
        <div class="row"><button class="btn small" data-act="demo">Beispieldaten laden</button><a class="btn small ghost" href="#auswertung">Daten sichern / laden</a></div></div>
    </section>
    <p class="disclaimer">Diese Mappe ersetzt keine Diagnose. Eine ADHS-Diagnose kann nur eine Fachärztin, ein Facharzt oder eine approbierte Psychotherapeutin bzw. ein approbierter Psychotherapeut nach ausführlicher Untersuchung stellen.</p>`;
  }

  /* ---------- Bericht ---------- */
  const lvlLabel = (v) => (v === undefined || v === '' ? '–' : ['0', '1', '2', '3'].includes(String(v)) ? ['–', 'leicht', 'deutlich', 'stark'][Number(v)] : v);
  function viewReport() {
    const r = compute();
    const missing = requiredMods().filter((m) => !complete(m));
    const ready = missing.length === 0;
    const rec = ready ? recommend(r) : null;
    let html = `<header class="mod-head"><p class="eyebrow">Ergebnis</p><h1>Auswertung &amp; Bericht</h1>
      <p class="intro">Oben steht die unverbindliche Einschätzung. Darunter folgt der Bericht für Ihre Ärztin oder Ihren Arzt mit allen Ergebnissen, Ihren Beispielen und Ihrer Lebensgeschichte.</p></header>`;
    if (state.demo) html += '<aside class="demo-banner">Beispieldaten: Diese Auswertung beruht auf erfundenen Angaben.</aside>';
    if (!ready) {
      html += `<section class="card gate"><h2>Noch ${missing.length} Pflichtmodul${missing.length > 1 ? 'e' : ''} offen</h2>
        <p>Die Einschätzung erscheint, sobald alle Pflichtmodule vollständig beantwortet sind. Erst dann sind die Ergebnisse untereinander vergleichbar.</p>
        <ul class="miss">${missing.map((m) => { const p = progress(m); return `<li><a href="#${m.id}">${esc(m.title)}</a><span>${p.done} von ${p.total}</span></li>`; }).join('')}</ul></section>`;
    } else {
      const L = LEVEL_TEXT[rec.level];
      html += `<section class="verdict lvl-${rec.level}" aria-live="polite">
        <div class="v-scale" role="img" aria-label="Einschätzung: ${esc(L.h)}"><span class="${rec.level === 'gering' ? 'on' : ''}">gering</span><span class="${rec.level === 'mittel' ? 'on' : ''}">teilweise</span><span class="${rec.level === 'hoch' ? 'on' : ''}">deutlich</span></div>
        <p class="eyebrow">Unverbindliche Einschätzung</p><h2>${esc(L.h)}</h2><p>${esc(L.d)}</p>
        ${rec.pres ? `<p><b>Muster Ihrer Angaben:</b> ${esc(rec.pres)}.</p>` : ''}
        <details open><summary>Wie diese Einschätzung zustande kommt (${rec.score.toLocaleString('de-DE')} von ${rec.max.toLocaleString('de-DE')} Punkten)</summary>
          <ul class="pts">${rec.points.map((p) => `<li><span class="pp ${p.p > 0 ? 'plus' : p.p < 0 ? 'minus' : ''}">${p.p > 0 ? '+' : ''}${p.p.toLocaleString('de-DE')}</span>${esc(p.label)}</li>`).join('')}</ul>
          <p class="help">Die Stufe „deutlich“ setzt voraus, dass Kriterium A, Hinweise aus der Kindheit sowie die Kriterien C und D gleichzeitig erfüllt sind. Die Punkte dienen nur der Transparenz.</p></details>
        ${rec.notes.length ? `<div class="notes">${rec.notes.map((n) => `<p>${esc(n)}</p>`).join('')}</div>` : ''}
        <p class="disclaimer">Diese Einschätzung ist keine Diagnose und nicht validiert. Sie fasst nur Ihre eigenen Angaben nach den Diagnosekriterien zusammen. Viele Merkmale kommen auch bei Menschen ohne ADHS vor. Umgekehrt schließt ein niedriges Ergebnis ADHS nicht sicher aus.</p></section>`;
    }
    if (r.phq.item9 > 0) html += crisisBox(false);

    // Werkzeuge
    html += `<section class="card tools no-print"><h2>Bericht und Daten</h2>
      <div class="row">
        <button class="btn primary" data-act="copy-report">Bericht als Text kopieren</button>
        ${FRAMED ? '' : '<button class="btn" data-act="print">Drucken / als PDF speichern</button>'}
        ${FRAMED ? '' : '<button class="btn" data-act="export">Daten als Datei sichern</button>'}
        <button class="btn" data-act="copy-json">Daten als Code kopieren</button>
      </div>
      <details class="imp"><summary>Gesicherte Daten laden</summary>
        <div class="fields"><label class="lbl" for="imp-file">Datei auswählen (.json)</label><input type="file" id="imp-file" accept="application/json,.json">
        <label class="lbl" for="imp-text">oder gesicherten Code einfügen</label><textarea id="imp-text" rows="3" placeholder='{"v":1, …}'></textarea>
        <button class="btn" data-act="import-text">Code laden</button></div></details>
      <div class="row danger-row"><button class="btn danger" data-act="reset-ask">Alle Angaben löschen</button><span id="reset-confirm"></span></div>
      <p class="help" id="tool-msg" role="status"></p></section>`;

    html += `<article class="report" id="report">${reportHtml(r, rec)}</article>`;
    return html;
  }

  function reportHtml(r, rec) {
    const p = state.answers.person || {};
    const t = (v) => (filled(v) ? esc(Array.isArray(v) ? v.join(', ') : v) : '<span class="muted">–</span>');
    const row = (k, v) => `<tr><th scope="row">${esc(k)}</th><td>${v}</td></tr>`;
    const st = (done) => (done ? '' : ' <span class="muted">(unvollständig)</span>');
    let h = `<header class="rep-head"><h2>Vorbereitungsbericht ADHS-Diagnostik (Erwachsene)</h2><p class="muted">Selbstauskunft, erstellt am ${new Date().toLocaleDateString('de-DE')}${state.demo ? ' · BEISPIELDATEN' : ''}</p></header>`;
    h += `<h3>1. Person und Anliegen</h3><div class="tbl-wrap"><table class="tbl kv"><tbody>
      ${row('Name', t(p.name))}${row('Geburtsjahr', t(p.geburt))}${row('Geschlecht', t(p.geschlecht))}${row('Versicherung', t(p.versicherung))}${row('Tätigkeit', t(p.taetigkeit))}${row('Hausarztpraxis', t(p.hausarzt))}
      ${row('Anlass', t(p.anlass))}${row('Auslöser des Verdachts', t(p.ausloeser))}${row('Hauptbeschwerden', t(p.beschwerden))}${row('Beschwerden seit', t(p.seit))}${row('Leidensdruck (0–10)', t(p.leidensdruck))}${row('Ziele', t(p.ziele))}
      ${row('Fremdauskunft Kindheit möglich', t(p.eltern))}${row('Fremdauskunft heute möglich', t(p.partner))}</tbody></table></div>`;

    h += `<h3>2. Ergebnisse der Fragebögen</h3><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Bereich</th><th>Ergebnis</th><th>Orientierung</th></tr></thead><tbody>
      <tr><td>Screening (ASRS-Typ)${st(r.asrs.done)}</td><td>Teil A: ${r.asrs.partA}/6 auffällig · gesamt ${r.asrs.shaded}/18 auffällig · Summe ${r.asrs.sum}/72</td><td>Teil A ab 4 auffälligen Antworten positiv</td></tr>
      <tr><td>Symptomcheckliste heute${st(r.adult.done)}</td><td>Unaufmerksamkeit ${r.adult.ia}/9 · Hyperaktivität/Impulsivität ${r.adult.hi}/9</td><td>Erwachsene: ≥ 5 in einem Bereich (Stufe „deutlich“ oder „stark“)</td></tr>
      <tr><td>Symptomcheckliste Kindheit${st(r.child.done)}</td><td>Unaufmerksamkeit ${r.child.ia}/9 · Hyperaktivität/Impulsivität ${r.child.hi}/9</td><td>Kinder: ≥ 6 in einem Bereich; Kriterium B: „mehrere“ vor 12 J.</td></tr>
      <tr><td>Kindheitsskala (WURS-Typ)${st(r.wurs.done)}</td><td>${r.wurs.sum}/100</td><td>Orientierungswert ≥ 36 (aus WURS-K-Grenzwert umgerechnet, nicht validiert)</td></tr>
      <tr><td>Emotionen &amp; Organisation${st(r.emo.done)}</td><td>Mittelwert ${dec(r.emo.mean)}/3 · ${Object.entries(r.emo.groups).map(([g, v]) => `${esc(g)} ${dec(v)}`).join(' · ')}</td><td>Kein Grenzwert; ab 1,5 deutlich ausgeprägt</td></tr>
      <tr><td>Beeinträchtigung im Alltag${st(r.func.done)}</td><td>${r.func.impaired} Bereiche mit „oft“ oder häufiger: ${Object.entries(r.func.doms).filter(([, v]) => v >= 2).map(([d]) => esc(d)).join(', ') || 'keine'}</td><td>≥ 2 Bereiche spricht für Kriterium D</td></tr>
      <tr><td>Fremdbeurteilung heute${r.fremdA.done ? ` (${esc(val('fremd-aktuell', 'relation'))})` : ''}</td><td>${r.fremdA.done ? `Unaufmerksamkeit ${r.fremdA.ia}/9 · Hyperaktivität/Impulsivität ${r.fremdA.hi}/9` : '<span class="muted">nicht vorliegend</span>'}</td><td>≥ 5 in einem Bereich</td></tr>
      <tr><td>Fremdbeurteilung Kindheit${r.fremdK.done ? ` (${esc(val('fremd-kindheit', 'relation'))})` : ''}</td><td>${r.fremdK.done ? `Unaufmerksamkeit ${r.fremdK.ia}/9 · Hyperaktivität/Impulsivität ${r.fremdK.hi}/9` : '<span class="muted">nicht vorliegend</span>'}</td><td>≥ 6 in einem Bereich</td></tr>
      <tr><td>PHQ-9 (Depression)${st(r.phq.done)}</td><td>${r.phq.sum}/27 – ${r.phq.label}${r.phq.item9 > 0 ? ' · <b>Frage 9 positiv</b>' : ''}</td><td>5 / 10 / 15 / 20 = leicht / mittelgradig / mittelschwer / schwer</td></tr>
      <tr><td>GAD-7 (Angst)${st(r.gad.done)}</td><td>${r.gad.sum}/21 – ${r.gad.label}</td><td>5 / 10 / 15 = leicht / mittelgradig / schwer</td></tr>
      <tr><td>AUDIT-C (Alkohol)</td><td>${r.audit.sum}/12</td><td>Auffällig ab ${r.audit.cut} (S3-Leitlinie Alkohol: Frauen ≥ 4, Männer ≥ 5)</td></tr>
    </tbody></table></div>`;

    h += `<h3>3. Zusatzkriterien</h3><div class="tbl-wrap"><table class="tbl kv"><tbody>
      ${row('B – Beginn mehrerer Merkmale', t(r.crit.beginn))}${row('Dauer ≥ 6 Monate', t(r.crit.dauer))}${row('C – Betroffene Bereiche', t(r.crit.bereiche))}${row('D – Beeinträchtigung insgesamt', t(r.crit.beeintr))}${row('E – Nur in bestimmten Phasen?', t(r.crit.phasen))}</tbody></table></div>`;

    // Symptomtabelle
    const ex = (mid, id) => filled(val(mid, id + '_ex')) ? `<div class="exq">${esc(val(mid, id + '_ex'))}</div>` : '';
    const cell = (mid, id) => { const v = val(mid, id); const n = Number(v); return `<td class="lv lv${filled(v) ? n : 'x'}">${filled(v) ? lvlLabel(n) : '–'}</td>`; };
    h += `<h3>4. Die 18 Symptomkriterien im Vergleich</h3><p class="muted small">Stufen: leicht · deutlich · stark. „Deutlich“ und „stark“ zählen als erfülltes Kriterium.</p>
      <div class="tbl-wrap"><table class="tbl sym"><thead><tr><th>Kriterium</th><th>Heute selbst</th><th>Kindheit selbst</th><th>Heute fremd</th><th>Kindheit fremd</th></tr></thead><tbody>
      ${DSM_ITEMS.map((it) => `<tr><td><b>${it.code}</b> ${esc(DSM_SHORT[it.id][0])}${ex('dsm-aktuell', it.id) ? `<div class="exl">Heute:</div>${ex('dsm-aktuell', it.id)}` : ''}${ex('dsm-kindheit', it.id) ? `<div class="exl">Kindheit:</div>${ex('dsm-kindheit', it.id)}` : ''}${ex('fremd-aktuell', it.id) ? `<div class="exl">Fremd heute:</div>${ex('fremd-aktuell', it.id)}` : ''}${ex('fremd-kindheit', it.id) ? `<div class="exl">Fremd Kindheit:</div>${ex('fremd-kindheit', it.id)}` : ''}</td>${cell('dsm-aktuell', it.id)}${cell('dsm-kindheit', it.id)}${cell('fremd-aktuell', it.id)}${cell('fremd-kindheit', it.id)}</tr>`).join('')}
      </tbody></table></div>`;
    ['fremd-aktuell', 'fremd-kindheit'].forEach((mid) => { if (filled(val(mid, 'kommentar'))) h += `<p><b>Anmerkung ${mid === 'fremd-aktuell' ? 'Fremdbeurteilung heute' : 'Fremdbeurteilung Kindheit'}:</b> ${esc(val(mid, 'kommentar'))}</p>`; });

    h += `<h3>5. Hinweise für die Abgrenzung</h3>`;
    h += r.flags.length ? `<ul class="flags">${r.flags.map((f) => `<li class="fl-${f.lvl}"><b>${esc(f.t)}</b><span>${esc(f.d)}</span></li>`).join('')}</ul>` : '<p>Keine Hinweise aus den Abgrenzungsfragen.</p>';
    const d = state.answers.differenzial || {};
    const dm = MOD.differenzial;
    const yesList = dm.sections.flatMap((s) => s.fields.filter((f) => f.type === 'yn' && d[f.id] && d[f.id] !== 'nein').map((f) => `${f.label} – <b>${esc(d[f.id])}</b>`));
    if (yesList.length) h += `<details class="rep-det"><summary>Alle Antworten „Ja“ oder „Unsicher“ (${yesList.length})</summary><ul class="plain">${yesList.map((x) => `<li>${x}</li>`).join('')}</ul></details>`;
    h += `<p class="small">Substanzen: Cannabis ${t(d.can)} · andere Drogen ${t(d.drog)} · Nikotin ${t(d.nik)} · Kaffee/Energydrinks pro Tag ${t(d.koff)}</p>`;

    // Anamnese
    h += '<h3>6. Lebensgeschichte und Gesundheit</h3>';
    MOD.anamnese.sections.forEach((s) => { h += `<h4>${esc(s.title)}</h4><div class="tbl-wrap"><table class="tbl kv"><tbody>${s.fields.map((f) => row(f.label, t(val('anamnese', f.id)))).join('')}</tbody></table></div>`; });

    // Unterlagen
    const ul = MOD.unterlagen.groups.flatMap((g) => g.items.map((it) => ({ t: it.text, s: val('unterlagen', it.id) || 'offen' })));
    h += `<h3>7. Unterlagen</h3><div class="tbl-wrap"><table class="tbl"><tbody>${ul.map((u) => `<tr><td>${esc(u.t)}</td><td class="nowrap">${esc(u.s)}</td></tr>`).join('')}</tbody></table></div>`;

    // Fragen
    const q = state.answers.arztfragen || {};
    const qs = [...(q.q_diag || []), ...(q.q_beh || []), ...(q.q_folge || [])];
    h += `<h3>8. Fragen für den Termin</h3>${qs.length || filled(q.q_eigen) ? `<ul class="plain">${qs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>${filled(q.q_eigen) ? `<p>${esc(q.q_eigen)}</p>` : ''}` : '<p class="muted">Keine Fragen ausgewählt.</p>'}`;
    if (rec) h += `<h3>9. Unverbindliche Einschätzung aus der Selbstauskunft</h3><p>${esc(LEVEL_TEXT[rec.level].h)}${rec.pres ? ` – ${esc(rec.pres)}` : ''}.</p>`;
    h += `<p class="disclaimer">Selbstauskunft zur Vorbereitung. Die Fragebögen dieser Mappe sind eigene Formulierungen in Anlehnung an DSM-5 und etablierte Instrumente (ASRS, WURS-K, DIVA-5, WRI, WFIRS) und ersetzen diese nicht. PHQ-9, GAD-7 und AUDIT-C entsprechen den frei verwendbaren Originalen.</p>`;
    h += `<h3>Quellen</h3><ul class="plain src">${SOURCES.map((s) => `<li>${esc(s.t)}: <a href="${s.u}" target="_blank" rel="noopener">${esc(s.u)}</a></li>`).join('')}</ul>`;
    return h;
  }

  /* Klartext-Bericht für die Zwischenablage */
  function reportText() {
    const tmp = document.createElement('div');
    const r = compute(); const rec = allRequiredDone() ? recommend(r) : null;
    tmp.innerHTML = reportHtml(r, rec);
    tmp.querySelectorAll('tr').forEach((tr) => { tr.insertAdjacentText('beforeend', '\n'); tr.querySelectorAll('th,td').forEach((c, i) => { if (i) c.insertAdjacentText('afterbegin', ' | '); }); });
    tmp.querySelectorAll('h2,h3,h4').forEach((x) => { x.insertAdjacentText('afterbegin', '\n\n' + (x.tagName === 'H3' ? '## ' : x.tagName === 'H4' ? '### ' : '# ')); x.insertAdjacentText('beforeend', '\n'); });
    tmp.querySelectorAll('li,p,.exq,.exl').forEach((x) => { x.insertAdjacentText('afterbegin', x.tagName === 'LI' ? '\n- ' : '\n'); });
    return tmp.textContent.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  /* ---------- Navigation ---------- */
  function navHtml(current) {
    const groups = [...new Set(MODULES.map((m) => m.group))];
    return groups.map((g) => `<div class="ngroup"><p class="nlabel">${esc(g)}</p>${MODULES.filter((m) => m.group === g).map((m) => {
      const p = progress(m); const c = complete(m);
      const badge = m.type === 'report' ? (allRequiredDone() ? '<span class="dot ok" aria-label="bereit"></span>' : '') : p.total ? `<span class="nb ${c ? 'ok' : p.done ? 'wip' : ''}" data-nb="${m.id}">${c ? '✓' : p.done + '/' + p.total}</span>` : '';
      return `<a href="#${m.id}" class="nlink ${m.id === current ? 'active' : ''}" ${m.id === current ? 'aria-current="page"' : ''}><span>${esc(m.title)}</span>${badge}</a>`;
    }).join('')}</div>`).join('');
  }
  function current() { const h = (location.hash || '').slice(1); return MOD[h] ? h : 'start'; }
  function render() {
    const id = current(); const m = MOD[id];
    $('#nav').innerHTML = navHtml(id);
    const views = { dashboard: viewDashboard, ablauf: () => viewAblauf(m), form: () => viewForm(m), scale: () => viewScale(m), dsm: () => viewDsm(m), fremd: () => viewFremd(m), checklist: () => viewChecklist(m), report: viewReport };
    $('#main').innerHTML = views[m.type]();
    $('#mobile-title').textContent = m.title;
    document.body.classList.remove('nav-open');
    updateTopProgress();
  }
  function updateTopProgress() {
    const req = requiredMods(); const done = req.filter(complete).length;
    $('#top-prog').style.width = Math.round((done / req.length) * 100) + '%';
    $('#top-prog-txt').textContent = `${done}/${req.length} Pflichtmodule`;
  }
  function refreshProgress(mid) {
    const m = MOD[mid]; const p = progress(m); const c = complete(m);
    const pb = document.querySelector(`[data-prog="${mid}"]`);
    if (pb) { pb.querySelector('.bar span').style.width = Math.round((p.done / p.total) * 100) + '%'; pb.querySelector('.ptxt').textContent = `${p.done} von ${p.total} beantwortet`; }
    const nb = document.querySelector(`[data-nb="${mid}"]`);
    if (nb) { nb.textContent = c ? '✓' : `${p.done}/${p.total}`; nb.className = `nb ${c ? 'ok' : p.done ? 'wip' : ''}`; }
    updateTopProgress();
  }

  /* ---------- Eingaben ---------- */
  function onInput(e) {
    const el = e.target;
    if (el.dataset.ablauf) { state.ablauf[el.dataset.ablauf] = el.checked; el.closest('.step').classList.toggle('is-done', el.checked); save(); return; }
    if (el.dataset.px !== undefined) { state.praxen[Number(el.dataset.px)][el.dataset.pk] = el.value; save(); return; }
    const mid = el.dataset.mod, key = el.dataset.key; if (!mid || !key) return;
    const a = A(mid);
    if (el.dataset.kind === 'checks') {
      const set = new Set(a[key] || []);
      el.checked ? set.add(el.value) : set.delete(el.value);
      // „Nichts davon“/„Keine“-Optionen schließen andere aus
      const excl = ['Nichts davon', 'Keinem Bereich', 'Niemand bekannt', 'Keine bekannt'];
      if (el.checked && excl.includes(el.value)) { set.clear(); set.add(el.value); }
      else if (el.checked) excl.forEach((x) => set.delete(x));
      a[key] = [...set];
      el.closest('.checks').querySelectorAll('input').forEach((c) => { c.checked = set.has(c.value); });
    } else if (el.type === 'radio') {
      a[key] = isNaN(Number(el.value)) ? el.value : Number(el.value);
      const fs = el.closest('.item'); if (fs) fs.classList.add('is-done');
      if (mid === 'phq9' && key === 'p9') { const slot = $('#crisis-slot'); if (slot) slot.outerHTML = crisisBox(true); }
      if (e.type === 'change' && fs) autoAdvance(fs);
    } else if (el.type === 'range') {
      a[key] = Number(el.value); el.dataset.touched = '1'; const o = el.parentElement.querySelector('output'); if (o) o.textContent = el.value;
    } else {
      a[key] = el.value;
    }
    save(); refreshProgress(mid);
  }
  function autoAdvance(fs) {
    // nächste unbeantwortete Frage sanft in den Blick holen
    let n = fs.nextElementSibling;
    while (n && !(n.classList && n.classList.contains('item'))) n = n.nextElementSibling;
    if (n && !n.classList.contains('is-done')) {
      const r = n.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.75) n.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    }
  }

  function msg(t) { const m = $('#tool-msg'); if (m) m.textContent = t; }
  async function copy(text, okMsg) {
    try { await navigator.clipboard.writeText(text); msg(okMsg); }
    catch (e) {
      const ta = $('#imp-text'); if (ta) { ta.closest('details').open = true; ta.value = text; ta.select(); }
      msg('Kopieren wurde blockiert. Der Text ist unten markiert – bitte mit Strg+C bzw. „Kopieren“ übernehmen.');
    }
  }
  function importData(obj) {
    if (!obj || typeof obj !== 'object' || !obj.answers) throw new Error('Kein gültiger Datensatz');
    state = Object.assign(blank(), obj); save(); render(); msg('Daten geladen.');
  }

  function onClick(e) {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const act = b.dataset.act;
    if (act === 'px-add') { state.praxen.push({ name: '', datum: new Date().toISOString().slice(0, 10), status: 'angefragt', notiz: '' }); save(); render(); }
    if (act === 'px-del') { state.praxen.splice(Number(b.dataset.i), 1); save(); render(); }
    if (act === 'copy-report') copy(reportText(), 'Bericht kopiert. Sie können ihn z. B. in eine E-Mail oder ein Dokument einfügen.');
    if (act === 'copy-json') copy(JSON.stringify(state), 'Daten kopiert. Bewahren Sie den Code sicher auf – er enthält Gesundheitsdaten.');
    if (act === 'print') window.print();
    if (act === 'export') {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `adhs-diagnosemappe-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }
    if (act === 'import-text') { try { importData(JSON.parse($('#imp-text').value)); } catch (err) { msg('Der Code konnte nicht gelesen werden. Bitte den vollständigen Code einfügen.'); } }
    if (act === 'reset-ask') {
      const slot = $('#reset-confirm');
      if (slot) slot.innerHTML = 'Wirklich alles löschen? <button class="btn small danger" data-act="reset">Ja, löschen</button> <button class="btn small ghost" data-act="reset-no">Abbrechen</button>';
      else { state = blank(); save(); render(); }
    }
    if (act === 'reset-no') $('#reset-confirm').innerHTML = '';
    if (act === 'reset') { state = blank(); try { localStorage.removeItem(STORE_KEY); } catch (err) { /* */ } render(); msg('Alle Angaben wurden gelöscht.'); }
    if (act === 'demo') { loadDemo(); render(); }
    if (act === 'menu') document.body.classList.toggle('nav-open');
  }

  /* ---------- Beispieldaten (erfunden) ---------- */
  function loadDemo() {
    const s = blank(); s.demo = true; const a = s.answers;
    const pick = (arr, i) => arr[i % arr.length];
    a.person = { name: 'Beispielperson', geburt: 1991, geschlecht: 'weiblich', versicherung: 'Gesetzlich (GKV)', taetigkeit: 'Projektkoordinatorin', anlass: 'Mein Sohn wurde letztes Jahr diagnostiziert, ich erkenne mich in vielem wieder.', ausloeser: ['Eigenes Kind oder Verwandte mit ADHS-Diagnose', 'Probleme in Beruf/Studium'], beschwerden: '1. Ich verpasse Fristen, obwohl ich sie kenne. 2. Ich verliere ständig Schlüssel und Unterlagen. 3. Ich bin abends innerlich so unruhig, dass ich nicht einschlafen kann.', seit: 'Schon immer / seit der Kindheit', leidensdruck: 7, eltern: 'Ja, ein Elternteil', partner: 'Ja' };
    a.asrs = {}; ASRS_ITEMS.forEach((it, i) => { a.asrs[it.id] = pick([3, 3, 4, 3, 2, 2, 3, 4, 3, 4, 3, 1, 3, 3, 2, 2, 2, 2], i); });
    a['dsm-aktuell'] = { beginn: 'Vor dem 12. Lebensjahr', dauer: 'Ja', bereiche: ['Beruf / Ausbildung / Studium', 'Partnerschaft / Familie', 'Haushalt / Alltagsorganisation'], beeintr: 'Deutlich', phasen: 'Nein, sie sind durchgehend da' };
    DSM_ITEMS.forEach((it, i) => { a['dsm-aktuell'][it.id] = pick([2, 3, 2, 2, 3, 3, 3, 3, 2, 1, 0, 2, 2, 1, 1, 1, 1, 1], i); });
    a['dsm-aktuell'].a1e_ex = 'Steuererklärung seit zwei Jahren nicht abgegeben, Mahnung vom Finanzamt.';
    a['dsm-aktuell'].a1g_ex = 'Schlüsseldienst dreimal in diesem Jahr gerufen.';
    a['dsm-kindheit'] = {}; DSM_ITEMS.forEach((it, i) => { a['dsm-kindheit'][it.id] = pick([2, 2, 3, 2, 2, 2, 3, 3, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1], i); });
    a['dsm-kindheit'].a1h_ex = 'Zeugnis Klasse 2: „Sie träumt oft und lässt sich leicht ablenken.“';
    a['kindheit-skala'] = {}; WURS_ITEMS.forEach((it, i) => { a['kindheit-skala'][it.id] = pick([3, 3, 1, 1, 3, 3, 3, 2, 1, 1, 1, 1, 2, 2, 0, 0, 0, 1, 2, 2, 2, 3, 1, 1, 3], i); });
    a.emotion = {}; EMO_ITEMS.forEach((it, i) => { a.emotion[it.id] = pick([2, 1, 1, 1, 2, 1, 2, 3, 2, 3, 3, 3, 2, 1, 0, 3, 2], i); });
    a.alltag = {}; FUNC_ITEMS.forEach((it, i) => { a.alltag[it.id] = pick([2, 3, 1, 1, 2, 2, 1, 2, 1, 0, 2, 3, 2, 2, 1, 1, 0, 0, 3, 3], i); });
    a['fremd-aktuell'] = { rater: 'Partner', relation: 'Partner/in', kennt: 'Sehr gut' }; DSM_ITEMS.forEach((it, i) => { a['fremd-aktuell'][it.id] = pick([2, 2, 3, 2, 3, 2, 3, 2, 3, 1, 0, 1, 1, 1, 1, 1, 2, 1], i); });
    a.phq9 = {}; PHQ9_ITEMS.forEach((it, i) => { a.phq9[it.id] = pick([1, 1, 2, 2, 0, 1, 2, 0, 0], i); });
    a.gad7 = {}; GAD7_ITEMS.forEach((it, i) => { a.gad7[it.id] = pick([1, 1, 1, 2, 1, 1, 0], i); });
    a.differenzial = {}; MOD.differenzial.sections.forEach((sec) => sec.fields.forEach((f) => { if (f.type === 'yn') a.differenzial[f.id] = 'nein'; }));
    Object.assign(a.differenzial, { sl2: 'ja', as4: 'unsicher', au1: '2- bis 4-mal im Monat', au2: '1–2 (oder nie)', au3: 'Seltener als einmal im Monat', can: 'Nie', drog: 'Nie', nik: 'Nein', koff: 5 });
    a.anamnese = { ss: ['Keine bekannt'], quelle: 'Eltern/Verwandte befragt', schulform: 'Grundschule, Realschule, Fachabitur', wiederholt: 'keine', zeugnis: '„träumt viel“, „könnte mehr leisten“', ausb: 'Studium BWL abgebrochen, Ausbildung Kauffrau für Büromanagement', jobs: 5, stand: 'Verheiratet', kinder: '1 Sohn (9), ADHS diagnostiziert', diag: 'Depressive Episode 2019', suizid: 'Nein', vorerk: 'keine', medis: 'keine', herz: ['Nichts davon'], fam_adhs: ['Eigene Kinder', 'Vater'] };
    a.unterlagen = { egk: 'vorhanden', gszeug: 'vorhanden', uheft: 'angefragt', labor: 'angefragt', fb_partner: 'vorhanden' };
    a.arztfragen = { q_diag: ['Wie viele Termine sind geplant und wie lange dauert die Diagnostik insgesamt?'], q_beh: ['Welche Medikamente kommen in Frage, welche Nebenwirkungen gibt es?'] };
    s.praxen = [{ name: 'Beispiel: Psychiatrische Institutsambulanz', datum: '2026-10-02', status: 'Warteliste', notiz: 'ca. 5 Monate' }];
    state = s; save();
  }

  /* ---------- Start ---------- */
  load();
  document.addEventListener('change', onInput);
  document.addEventListener('input', (e) => { if (['text', 'number', 'textarea', 'range', 'date'].includes(e.target.type) || e.target.tagName === 'TEXTAREA') onInput(e); });
  document.addEventListener('click', onClick);
  document.addEventListener('change', (e) => {
    if (e.target.id !== 'imp-file' || !e.target.files[0]) return;
    const fr = new FileReader();
    fr.onload = () => { try { importData(JSON.parse(fr.result)); } catch (err) { msg('Die Datei konnte nicht gelesen werden.'); } };
    fr.readAsText(e.target.files[0]);
  });
  window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
  render();
})();
