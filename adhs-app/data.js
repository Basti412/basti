/* ADHS-Diagnosevorbereitung – Inhalte & Fragebögen
 * Alle Items sind eigene Formulierungen, angelehnt an die Kriterien von DSM-5 / ICD-10
 * und an die Themen etablierter Instrumente. Ausnahmen: PHQ-9 und GAD-7 (frei verwendbar,
 * deutschsprachige Fassung nach PHQ-D) sowie AUDIT-C (WHO).
 */
'use strict';

const SCALES = {
  freq5: [
    { v: 0, l: 'Nie' }, { v: 1, l: 'Selten' }, { v: 2, l: 'Manchmal' }, { v: 3, l: 'Oft' }, { v: 4, l: 'Sehr oft' }
  ],
  sev4: [
    { v: 0, l: 'Trifft nicht zu' }, { v: 1, l: 'Leicht' }, { v: 2, l: 'Deutlich' }, { v: 3, l: 'Stark' }
  ],
  wurs5: [
    { v: 0, l: 'Gar nicht' }, { v: 1, l: 'Kaum' }, { v: 2, l: 'Mäßig' }, { v: 3, l: 'Deutlich' }, { v: 4, l: 'Stark' }
  ],
  func4: [
    { v: -1, l: 'Betrifft mich nicht' }, { v: 0, l: 'Nie/kaum' }, { v: 1, l: 'Manchmal' }, { v: 2, l: 'Oft' }, { v: 3, l: 'Sehr oft' }
  ],
  phq4: [
    { v: 0, l: 'Überhaupt nicht' }, { v: 1, l: 'An einzelnen Tagen' }, { v: 2, l: 'An mehr als der Hälfte der Tage' }, { v: 3, l: 'Beinahe jeden Tag' }
  ],
  yn: [
    { v: 'ja', l: 'Ja' }, { v: 'nein', l: 'Nein' }, { v: 'unsicher', l: 'Unsicher' }
  ]
};

/* DSM-5-Kriterium A – 18 Symptome, eigene Formulierung.
 * adult: Erwachsenenalter, child: Kindheit (ca. 5–12 Jahre) */
const DSM_ITEMS = [
  // A1 Unaufmerksamkeit
  { id: 'a1a', dom: 'IA', code: 'A1a', adult: 'Ich übersehe Details oder mache Flüchtigkeitsfehler, z. B. bei der Arbeit, in E-Mails, Formularen oder beim Ausfüllen von Unterlagen.', child: 'Ich machte Flüchtigkeitsfehler in Schularbeiten und Hausaufgaben, übersah Details oder las Aufgaben nicht genau.' },
  { id: 'a1b', dom: 'IA', code: 'A1b', adult: 'Es fällt mir schwer, die Aufmerksamkeit längere Zeit bei einer Sache zu halten (Besprechungen, Vorträge, Lesen, längere Gespräche).', child: 'Ich konnte mich beim Spielen, im Unterricht oder bei Hausaufgaben nur kurz konzentrieren.' },
  { id: 'a1c', dom: 'IA', code: 'A1c', adult: 'Andere sagen, ich würde nicht zuhören, obwohl sie mich direkt ansprechen; meine Gedanken schweifen ab.', child: 'Ich wirkte abwesend, wenn ich direkt angesprochen wurde („Hörst du überhaupt zu?“).' },
  { id: 'a1d', dom: 'IA', code: 'A1d', adult: 'Ich bringe Aufgaben, Projekte oder Pflichten häufig nicht zu Ende; ich fange an und verliere dann den Faden.', child: 'Ich führte Anweisungen nicht vollständig aus und brachte Aufgaben (Hausaufgaben, Aufräumen) oft nicht zu Ende.' },
  { id: 'a1e', dom: 'IA', code: 'A1e', adult: 'Ich habe Schwierigkeiten, Aufgaben und Abläufe zu organisieren: Reihenfolge planen, Fristen einhalten, Ordnung halten, Zeit einschätzen.', child: 'Ich hatte Mühe, Sachen und Aufgaben zu organisieren (Schulranzen, Hefte, Zeiteinteilung, Zimmer).' },
  { id: 'a1f', dom: 'IA', code: 'A1f', adult: 'Aufgaben, die länger andauernde geistige Anstrengung erfordern (Steuererklärung, Berichte, Anträge), schiebe ich auf oder vermeide sie.', child: 'Ich vermied oder verabscheute Aufgaben, bei denen ich mich lange anstrengen musste (Hausaufgaben, Lernen, Aufsätze).' },
  { id: 'a1g', dom: 'IA', code: 'A1g', adult: 'Ich verlege oder verliere häufig Dinge, die ich brauche (Schlüssel, Handy, Geldbeutel, Unterlagen, Brille).', child: 'Ich verlor oder vergaß oft Dinge (Mäppchen, Turnbeutel, Jacke, Hausaufgabenheft, Spielsachen).' },
  { id: 'a1h', dom: 'IA', code: 'A1h', adult: 'Ich lasse mich leicht durch äußere Reize (Geräusche, Bewegungen, Handy) oder eigene Gedanken ablenken.', child: 'Ich ließ mich im Unterricht leicht ablenken (Geräusche, Mitschüler, Blick aus dem Fenster, Tagträume).' },
  { id: 'a1i', dom: 'IA', code: 'A1i', adult: 'Ich bin im Alltag vergesslich: Termine, Rückrufe, Rechnungen, Verabredungen oder Erledigungen gehen unter.', child: 'Ich war bei alltäglichen Dingen vergesslich (Aufträge der Eltern, Termine, Dinge mitbringen).' },
  // A2 Hyperaktivität/Impulsivität
  { id: 'a2a', dom: 'HI', code: 'A2a', adult: 'Ich zapple mit Händen oder Füßen, wippe, spiele mit Gegenständen oder rutsche auf dem Stuhl herum.', child: 'Ich zappelte mit Händen oder Füßen und rutschte auf dem Stuhl herum.' },
  { id: 'a2b', dom: 'HI', code: 'A2b', adult: 'Ich stehe in Situationen auf, in denen Sitzenbleiben erwartet wird (Meetings, Kino, Restaurant), oder halte das Sitzen nur mit Mühe aus.', child: 'Ich stand im Unterricht oder beim Essen auf, obwohl ich sitzen bleiben sollte.' },
  { id: 'a2c', dom: 'HI', code: 'A2c', adult: 'Ich fühle mich innerlich unruhig, getrieben oder „unter Strom“.', child: 'Ich rannte oder kletterte herum, auch wenn es unpassend war.' },
  { id: 'a2d', dom: 'HI', code: 'A2d', adult: 'Es fällt mir schwer, ruhigen Freizeitbeschäftigungen nachzugehen oder einfach zu entspannen.', child: 'Ich konnte nur schwer ruhig spielen oder mich still beschäftigen.' },
  { id: 'a2e', dom: 'HI', code: 'A2e', adult: 'Ich bin ständig „auf Achse“, wie von einem Motor angetrieben; längere Ruhe ist mir unangenehm.', child: 'Ich war ständig in Bewegung, „wie aufgezogen“ – andere fanden mich anstrengend.' },
  { id: 'a2f', dom: 'HI', code: 'A2f', adult: 'Ich rede übermäßig viel, auch wenn ich merke, dass andere das stört.', child: 'Ich redete übermäßig viel.' },
  { id: 'a2g', dom: 'HI', code: 'A2g', adult: 'Ich platze mit Antworten heraus, bevor Fragen zu Ende gestellt sind, oder beende Sätze anderer.', child: 'Ich platzte mit Antworten heraus, bevor die Frage fertig war (z. B. in der Klasse reinrufen).' },
  { id: 'a2h', dom: 'HI', code: 'A2h', adult: 'Warten fällt mir schwer (Schlange stehen, Stau, Wartezimmer, in Gesprächen an der Reihe sein).', child: 'Ich konnte schlecht abwarten, bis ich an der Reihe war (Spiele, Schlange, Melden).' },
  { id: 'a2i', dom: 'HI', code: 'A2i', adult: 'Ich unterbreche andere, mische mich in Gespräche ein oder übernehme ungefragt, was andere tun.', child: 'Ich störte oder unterbrach andere, mischte mich in Spiele oder Gespräche ein.' }
];

/* Screening angelehnt an ASRS v1.1 (WHO), 18 Items, Teil A = Items 1–6.
 * thr: ab welchem Skalenwert das Item als „auffällig“ zählt (2 = manchmal, 3 = oft) –
 * entspricht der Logik der schattierten Felder im Original. */
const ASRS_ITEMS = [
  { id: 's1', part: 'A', thr: 2, text: 'Wie oft fällt es Ihnen schwer, bei einer Aufgabe die letzten Details abzuschließen, wenn der herausfordernde Teil erledigt ist?' },
  { id: 's2', part: 'A', thr: 2, text: 'Wie oft haben Sie Mühe, Dinge in die richtige Reihenfolge zu bringen, wenn eine Aufgabe Organisation erfordert?' },
  { id: 's3', part: 'A', thr: 2, text: 'Wie oft haben Sie Schwierigkeiten, sich an Termine oder Verpflichtungen zu erinnern?' },
  { id: 's4', part: 'A', thr: 3, text: 'Wie oft vermeiden oder verschieben Sie den Beginn einer Aufgabe, die viel Nachdenken erfordert?' },
  { id: 's5', part: 'A', thr: 3, text: 'Wie oft zappeln Sie mit Händen oder Füßen oder winden sich, wenn Sie längere Zeit sitzen müssen?' },
  { id: 's6', part: 'A', thr: 3, text: 'Wie oft fühlen Sie sich übermäßig aktiv und gedrängt, Dinge zu tun – als würden Sie von einem Motor angetrieben?' },
  { id: 's7', part: 'B', thr: 3, text: 'Wie oft machen Sie Flüchtigkeitsfehler, wenn Sie an einer langweiligen oder schwierigen Aufgabe arbeiten?' },
  { id: 's8', part: 'B', thr: 3, text: 'Wie oft fällt es Ihnen schwer, bei langweiliger oder wiederholender Arbeit aufmerksam zu bleiben?' },
  { id: 's9', part: 'B', thr: 2, text: 'Wie oft haben Sie Schwierigkeiten, sich auf das zu konzentrieren, was Ihr Gegenüber sagt – auch wenn es direkt mit Ihnen spricht?' },
  { id: 's10', part: 'B', thr: 3, text: 'Wie oft verlegen Sie Dinge zu Hause oder bei der Arbeit oder haben Mühe, sie wiederzufinden?' },
  { id: 's11', part: 'B', thr: 3, text: 'Wie oft werden Sie durch Aktivität oder Geräusche in Ihrer Umgebung abgelenkt?' },
  { id: 's12', part: 'B', thr: 2, text: 'Wie oft verlassen Sie in Besprechungen oder anderen Situationen Ihren Platz, obwohl Sitzenbleiben erwartet wird?' },
  { id: 's13', part: 'B', thr: 3, text: 'Wie oft fühlen Sie sich unruhig oder zappelig?' },
  { id: 's14', part: 'B', thr: 3, text: 'Wie oft fällt es Ihnen schwer, in der Freizeit abzuschalten und sich zu entspannen?' },
  { id: 's15', part: 'B', thr: 3, text: 'Wie oft reden Sie in Gesellschaft zu viel?' },
  { id: 's16', part: 'B', thr: 2, text: 'Wie oft beenden Sie Sätze anderer, bevor diese sie selbst beenden können?' },
  { id: 's17', part: 'B', thr: 3, text: 'Wie oft fällt es Ihnen schwer zu warten, bis Sie an der Reihe sind?' },
  { id: 's18', part: 'B', thr: 2, text: 'Wie oft unterbrechen Sie andere, wenn diese beschäftigt sind?' }
];

/* Retrospektive Kindheitsskala (8–10 Jahre), eigene Items zu den Themen der WURS-K */
const WURS_ITEMS = [
  'hatte ich Schwierigkeiten, mich zu konzentrieren, und ließ mich leicht ablenken.',
  'war ich verträumt und mit den Gedanken oft woanders.',
  'war ich zappelig und konnte nicht stillsitzen.',
  'war ich ständig in Bewegung, „wie aufgezogen“.',
  'habe ich vieles angefangen und nicht beendet.',
  'war ich vergesslich (Hausaufgaben, Turnbeutel, verlorene Sachen).',
  'war ich unordentlich (Schulranzen, Hefte, Zimmer).',
  'habe ich schnell und unüberlegt gehandelt.',
  'konnte ich schlecht abwarten, bis ich an der Reihe war.',
  'habe ich andere oft unterbrochen oder dazwischengeredet.',
  'hatte ich Wutausbrüche.',
  'war ich leicht reizbar und hitzköpfig.',
  'hatte ich starke Stimmungsschwankungen.',
  'war ich schnell frustriert und gab bei Schwierigkeiten auf.',
  'war ich ungehorsam und hatte oft Ärger mit Eltern oder Lehrkräften.',
  'hatte ich Probleme mit Regeln und Autoritäten.',
  'bin ich häufig in Streit oder Raufereien geraten.',
  'hatte ich Schwierigkeiten, Freundschaften zu halten.',
  'fühlte ich mich anders als die anderen oder als Außenseiter.',
  'hatte ich ein geringes Selbstwertgefühl.',
  'waren meine Schulleistungen schlechter, als es meinen Fähigkeiten entsprach.',
  'bemängelten Lehrkräfte meine Aufmerksamkeit oder mein Verhalten („könnte mehr, wenn …“).',
  'hatte ich Unfälle oder Verletzungen durch Unvorsichtigkeit.',
  'ging ich Risiken ein und war waghalsig.',
  'waren Hausaufgaben ein ständiger Kampf und dauerten sehr lange.'
].map((t, i) => ({ id: 'w' + (i + 1), text: 'Als Kind (ca. 8–10 Jahre) ' + t }));

/* Emotionale Dysregulation & Wender-Utah-Merkmale (Themen des WRI/WRAADDS) */
const EMO_ITEMS = [
  { id: 'e1', grp: 'Affektlabilität', text: 'Meine Stimmung wechselt mehrmals am Tag, oft ohne erkennbaren Anlass.' },
  { id: 'e2', grp: 'Affektlabilität', text: 'Ich habe kurze Phasen (Stunden), in denen ich mich leer, gelangweilt oder niedergeschlagen fühle.' },
  { id: 'e3', grp: 'Affektlabilität', text: 'Ich bin schnell aufgekratzt oder euphorisch, das kippt aber ebenso schnell wieder.' },
  { id: 'e4', grp: 'Temperament', text: 'Ich werde schnell wütend und „explodiere“, auch bei Kleinigkeiten.' },
  { id: 'e5', grp: 'Temperament', text: 'Mein Ärger verfliegt schnell wieder; hinterher bereue ich, was ich gesagt oder getan habe.' },
  { id: 'e6', grp: 'Temperament', text: 'Meine Wutausbrüche belasten Beziehungen, Familie oder Arbeitsklima.' },
  { id: 'e7', grp: 'Emotionale Überreagibilität', text: 'Kleinigkeiten stressen mich unverhältnismäßig stark.' },
  { id: 'e8', grp: 'Emotionale Überreagibilität', text: 'Kritik oder (vermutete) Zurückweisung trifft mich sehr tief und lange.' },
  { id: 'e9', grp: 'Emotionale Überreagibilität', text: 'Unter Druck werde ich schnell kopflos und überfordert.' },
  { id: 'e10', grp: 'Desorganisation', text: 'Papiere, Finanzen oder Haushalt sind bei mir chronisch chaotisch.' },
  { id: 'e11', grp: 'Desorganisation', text: 'Ich unterschätze ständig, wie lange etwas dauert, und komme deshalb häufig zu spät.' },
  { id: 'e12', grp: 'Desorganisation', text: 'Ich schiebe Wichtiges bis zur letzten Minute auf und arbeite dann unter Hochdruck.' },
  { id: 'e13', grp: 'Impulsivität', text: 'Ich treffe spontane Entscheidungen oder Käufe, die ich später bereue.' },
  { id: 'e14', grp: 'Impulsivität', text: 'Ich sage Dinge, ohne nachzudenken, und trete damit anderen auf die Füße.' },
  { id: 'e15', grp: 'Impulsivität', text: 'Ich verhalte mich riskant (z. B. schnelles Fahren, Extremsport, ungeplante Unternehmungen).' },
  { id: 'e16', grp: 'Hyperfokus & Reizoffenheit', text: 'Bei Dingen, die mich interessieren, vertiefe ich mich stundenlang und vergesse alles um mich herum.' },
  { id: 'e17', grp: 'Hyperfokus & Reizoffenheit', text: 'Viele Reize gleichzeitig (Großraumbüro, Feiern, Einkaufszentrum) erschöpfen mich schnell.' }
];

/* Beeinträchtigung im Alltag – eigene Items, Struktur angelehnt an die WFIRS-S-Bereiche */
const FUNC_ITEMS = [
  { id: 'f1', dom: 'Beruf / Ausbildung', text: 'Meine Leistung bleibt hinter meinen Fähigkeiten zurück.' },
  { id: 'f2', dom: 'Beruf / Ausbildung', text: 'Ich habe Probleme mit Fristen, Pünktlichkeit oder Arbeitsorganisation.' },
  { id: 'f3', dom: 'Beruf / Ausbildung', text: 'Es kommt zu Konflikten mit Vorgesetzten oder Kollegen, Abmahnungen oder Kündigungen.' },
  { id: 'f4', dom: 'Beruf / Ausbildung', text: 'Ich habe Ausbildungen, Studiengänge oder Jobs abgebrochen bzw. häufig gewechselt.' },
  { id: 'f5', dom: 'Familie / Partnerschaft', text: 'Meine Vergesslichkeit oder Unzuverlässigkeit führt zu Streit.' },
  { id: 'f6', dom: 'Familie / Partnerschaft', text: 'Mein/e Partner/in übernimmt einen Großteil der Organisation, weil ich es nicht schaffe.' },
  { id: 'f7', dom: 'Familie / Partnerschaft', text: 'Impulsive Reaktionen oder Gereiztheit belasten das Familienleben.' },
  { id: 'f8', dom: 'Soziales Leben', text: 'Ich vergesse Verabredungen, Geburtstage oder melde mich nicht zurück.' },
  { id: 'f9', dom: 'Soziales Leben', text: 'Freundschaften gehen verloren oder schlafen ein.' },
  { id: 'f10', dom: 'Soziales Leben', text: 'Ich ecke in Gesprächen an (unterbrechen, abschweifen, unpassende Bemerkungen).' },
  { id: 'f11', dom: 'Alltag / Haushalt / Finanzen', text: 'Haushalt, Wäsche und Einkäufe bleiben liegen.' },
  { id: 'f12', dom: 'Alltag / Haushalt / Finanzen', text: 'Post, Behördenangelegenheiten oder Anträge bleiben unerledigt.' },
  { id: 'f13', dom: 'Alltag / Haushalt / Finanzen', text: 'Ich habe Mahnungen, Schulden oder Geldprobleme durch Impulskäufe oder versäumte Zahlungen.' },
  { id: 'f14', dom: 'Gesundheit / Selbstfürsorge', text: 'Mein Schlafrhythmus ist unregelmäßig (z. B. zu spät ins Bett, weil ich nicht abschalten kann).' },
  { id: 'f15', dom: 'Gesundheit / Selbstfürsorge', text: 'Ich vergesse Arzttermine oder die Einnahme von Medikamenten.' },
  { id: 'f16', dom: 'Gesundheit / Selbstfürsorge', text: 'Ernährung und Bewegung sind chaotisch oder unregelmäßig.' },
  { id: 'f17', dom: 'Straßenverkehr / Risiken', text: 'Ich habe Bußgelder, Punkte oder Unfälle durch Unaufmerksamkeit oder zu schnelles Fahren.' },
  { id: 'f18', dom: 'Straßenverkehr / Risiken', text: 'Ich nutze Alkohol, Cannabis oder andere Substanzen, um runterzukommen oder mich zu konzentrieren.' },
  { id: 'f19', dom: 'Selbstbild', text: 'Ich fühle mich als Versager/in oder „faul“, obwohl ich mich sehr anstrenge.' },
  { id: 'f20', dom: 'Selbstbild', text: 'Ich muss viel Kraft aufwenden, um nach außen „normal“ zu funktionieren, und bin danach erschöpft.' }
];

const PHQ9_ITEMS = [
  'Wenig Interesse oder Freude an Ihren Tätigkeiten',
  'Niedergeschlagenheit, Schwermut oder Hoffnungslosigkeit',
  'Schwierigkeiten, ein- oder durchzuschlafen, oder vermehrter Schlaf',
  'Müdigkeit oder Gefühl, keine Energie zu haben',
  'Verminderter Appetit oder übermäßiges Bedürfnis zu essen',
  'Schlechte Meinung von sich selbst; Gefühl, ein Versager zu sein oder die Familie enttäuscht zu haben',
  'Schwierigkeiten, sich auf etwas zu konzentrieren, z. B. beim Zeitunglesen oder Fernsehen',
  'Waren Ihre Bewegungen oder Ihre Sprache so verlangsamt, dass es auch anderen auffallen würde? Oder waren Sie im Gegenteil „zappelig“ oder ruhelos und hatten dadurch einen stärkeren Bewegungsdrang als sonst?',
  'Gedanken, dass Sie lieber tot wären oder sich Leid zufügen möchten'
].map((t, i) => ({ id: 'p' + (i + 1), text: t }));

const GAD7_ITEMS = [
  'Nervosität, Ängstlichkeit oder Anspannung',
  'Nicht in der Lage sein, Sorgen zu stoppen oder zu kontrollieren',
  'Übermäßige Sorgen bezüglich verschiedener Angelegenheiten',
  'Schwierigkeiten zu entspannen',
  'Rastlosigkeit, sodass Stillsitzen schwerfällt',
  'Schnelle Verärgerung oder Gereiztheit',
  'Gefühl der Angst, so als würde etwas Schlimmes passieren'
].map((t, i) => ({ id: 'g' + (i + 1), text: t }));

/* ---------- Module ---------- */
const MODULES = [
  { id: 'start', group: 'Überblick', title: 'Übersicht', type: 'dashboard' },
  { id: 'ablauf', group: 'Überblick', title: 'Diagnoseweg in Deutschland', type: 'ablauf' },

  { id: 'person', group: 'Angaben', title: 'Persönliche Angaben & Anliegen', type: 'form', required: true,
    intro: 'Diese Angaben bilden den Rahmen des Erstgesprächs. Je konkreter Sie Ihr Anliegen beschreiben, desto schneller kommt das Gespräch auf den Punkt. Name und Kontaktdaten sind freiwillig.',
    sections: [
      { title: 'Stammdaten', fields: [
        { id: 'name', label: 'Name (freiwillig)', type: 'text' },
        { id: 'geburt', label: 'Geburtsjahr', type: 'number', req: true, min: 1920, max: 2010 },
        { id: 'geschlecht', label: 'Geschlecht', type: 'select', req: true, options: ['weiblich', 'männlich', 'divers', 'keine Angabe'] },
        { id: 'versicherung', label: 'Versicherung', type: 'select', req: true, options: ['Gesetzlich (GKV)', 'Privat (PKV)', 'Beihilfe + PKV', 'Selbstzahler'] },
        { id: 'hausarzt', label: 'Hausarztpraxis', type: 'text' },
        { id: 'taetigkeit', label: 'Aktuelle Tätigkeit (Beruf, Ausbildung, Studium)', type: 'text', req: true }
      ]},
      { title: 'Anliegen', fields: [
        { id: 'anlass', label: 'Warum möchten Sie sich jetzt untersuchen lassen?', type: 'textarea', req: true, help: 'Z. B. Probleme im Job, Partner/in hat ADHS vermutet, eigenes Kind wurde diagnostiziert.' },
        { id: 'ausloeser', label: 'Was hat den Verdacht ausgelöst? (Mehrfachauswahl)', type: 'checks', options: ['Eigenes Kind oder Verwandte mit ADHS-Diagnose', 'Hinweis von Partner/in, Familie oder Freunden', 'Hinweis von Ärztin/Arzt oder Therapeut/in', 'Probleme in Beruf/Studium', 'Medien, Bücher, Social Media', 'Andere Behandlung hat nicht geholfen', 'Sonstiges'] },
        { id: 'beschwerden', label: 'Ihre drei wichtigsten Beschwerden im Alltag', type: 'textarea', req: true, help: 'Möglichst konkret: „Ich verpasse jede Woche Fristen, weil …“ statt „Ich bin unkonzentriert“.' },
        { id: 'seit', label: 'Seit wann bemerken Sie diese Schwierigkeiten?', type: 'select', req: true, options: ['Schon immer / seit der Kindheit', 'Seit der Jugend', 'Seit dem Erwachsenenalter', 'Erst seit kurzem (unter 1 Jahr)', 'Weiß nicht'] },
        { id: 'leidensdruck', label: 'Leidensdruck insgesamt', type: 'range', req: true, min: 0, max: 10, help: '0 = gar nicht belastet, 10 = extrem belastet' },
        { id: 'ziele', label: 'Was erhoffen Sie sich von der Diagnostik?', type: 'textarea', help: 'Z. B. Klarheit, Behandlung, Nachteilsausgleich, Verständnis im Umfeld.' }
      ]},
      { title: 'Fremdauskunft', fields: [
        { id: 'eltern', label: 'Können Eltern oder andere Bezugspersonen Auskunft über Ihre Kindheit geben?', type: 'select', req: true, options: ['Ja, beide Eltern', 'Ja, ein Elternteil', 'Ja, Geschwister/andere Verwandte', 'Nein, niemand verfügbar'] },
        { id: 'partner', label: 'Gibt es eine Person, die Sie aktuell gut kennt (Partner/in, Freund/in)?', type: 'select', req: true, options: ['Ja', 'Nein'] }
      ]}
    ]
  },

  { id: 'asrs', group: 'Selbstbeurteilung', title: 'Screening (ASRS-Typ)', type: 'scale', required: true, scale: 'freq5', items: ASRS_ITEMS,
    instrument: 'Angelehnt an die Adult ADHD Self-Report Scale ASRS v1.1 der WHO',
    intro: 'Kurzes Screening mit 18 Fragen. Beziehen Sie sich auf die letzten 6 Monate. Teil A (Fragen 1–6) gilt als der aussagekräftigste Screening-Teil. Das Original wird in vielen Praxen als erster Fragebogen eingesetzt.'
  },
  { id: 'dsm-aktuell', group: 'Selbstbeurteilung', title: 'Symptomcheckliste heute', type: 'dsm', which: 'adult', required: true, scale: 'sev4',
    instrument: 'Strukturiert nach den 18 Symptomkriterien von DSM-5 (Kriterium A) – wie ADHS-SB und DIVA-5',
    intro: 'Bewerten Sie, wie stark jedes Merkmal in den letzten 6 Monaten auf Sie zutraf. Notieren Sie, wenn möglich, ein konkretes Beispiel aus Ihrem Alltag. Genau diese Beispiele fragt die Fachärztin oder der Facharzt im strukturierten Interview (z. B. DIVA-5) ab – vorbereitet sparen sie viel Zeit.',
    extra: [
      { id: 'beginn', label: 'Wann sind mehrere dieser Merkmale zum ersten Mal aufgetreten? (Kriterium B)', type: 'select', req: true, options: ['Vor dem 12. Lebensjahr', 'Zwischen 12 und 17 Jahren', 'Erst im Erwachsenenalter', 'Weiß nicht'] },
      { id: 'dauer', label: 'Bestehen die Merkmale seit mindestens 6 Monaten durchgehend?', type: 'select', req: true, options: ['Ja', 'Nein', 'Unsicher'] },
      { id: 'bereiche', label: 'In welchen Lebensbereichen treten die Merkmale auf? (Kriterium C)', type: 'checks', req: true, options: ['Beruf / Ausbildung / Studium', 'Partnerschaft / Familie', 'Freundeskreis / soziale Kontakte', 'Freizeit / Hobbys', 'Haushalt / Alltagsorganisation', 'Straßenverkehr', 'Keinem Bereich'] },
      { id: 'beeintr', label: 'Wie stark beeinträchtigen Sie die Merkmale insgesamt? (Kriterium D)', type: 'select', req: true, options: ['Gar nicht', 'Leicht', 'Deutlich', 'Schwer'] },
      { id: 'phasen', label: 'Treten die Merkmale nur in bestimmten Phasen auf, z. B. nur während einer Depression, nach einem Trauma oder unter Substanzkonsum? (Kriterium E)', type: 'select', req: true, options: ['Nein, sie sind durchgehend da', 'Ja, nur in bestimmten Phasen', 'Unsicher'] }
    ]
  },
  { id: 'dsm-kindheit', group: 'Selbstbeurteilung', title: 'Symptomcheckliste Kindheit', type: 'dsm', which: 'child', required: true, scale: 'sev4',
    instrument: 'DSM-5-Kriterium A, retrospektiv für das Alter von 5–12 Jahren (wie im Kindheitsteil der DIVA-5)',
    intro: 'Wie waren Sie als Kind im Grundschulalter? Hilfreich sind Zeugnisse, Fotos, Erzählungen von Eltern oder Geschwistern. Wenn Sie unsicher sind, wählen Sie die Stufe, die am ehesten passt, und notieren Sie die Quelle Ihrer Erinnerung.'
  },
  { id: 'kindheit-skala', group: 'Selbstbeurteilung', title: 'Kindheitsskala (WURS-Typ)', type: 'scale', required: true, scale: 'wurs5', items: WURS_ITEMS,
    instrument: 'Eigene Items zu den Themen der Wender Utah Rating Scale – Kurzform (WURS-K)',
    intro: 'Zweiter, unabhängiger Blick auf die Kindheit. Die WURS-K erfasst neben Aufmerksamkeit und Unruhe auch Stimmung, Impulskontrolle, Sozialverhalten und Schule. In Deutschland ist die WURS-K Teil der Homburger ADHS-Skalen (HASE) und wird sehr häufig eingesetzt.'
  },
  { id: 'emotion', group: 'Selbstbeurteilung', title: 'Emotionen & Organisation', type: 'scale', required: true, scale: 'sev4', items: EMO_ITEMS, grouped: 'grp',
    instrument: 'Themen der Wender-Utah-Kriterien (Wender-Reimherr-Interview, WRI)',
    intro: 'Bei Erwachsenen stehen oft nicht Zappeln und Herumlaufen im Vordergrund, sondern Stimmungsschwankungen, Reizbarkeit, Stressintoleranz und Desorganisation. Das Wender-Reimherr-Interview erfasst genau diese Merkmale. Bezugszeitraum: die letzten 6 Monate.'
  },
  { id: 'alltag', group: 'Selbstbeurteilung', title: 'Beeinträchtigung im Alltag', type: 'scale', required: true, scale: 'func4', items: FUNC_ITEMS, grouped: 'dom',
    instrument: 'Bereiche angelehnt an die Weiss Functional Impairment Rating Scale (WFIRS-S)',
    intro: 'Eine Diagnose setzt voraus, dass die Merkmale das Leben spürbar beeinträchtigen (DSM-5-Kriterium D). Bewerten Sie die letzten 6 Monate. Wählen Sie „Betrifft mich nicht“, wenn der Bereich für Sie nicht relevant ist (z. B. kein Führerschein).'
  },

  { id: 'fremd-aktuell', group: 'Fremdbeurteilung', title: 'Fremdbeurteilung heute', type: 'fremd', which: 'adult', scale: 'sev4', recommended: true,
    instrument: 'DSM-5-Kriterium A aus Sicht einer nahestehenden Person (wie ADHS-FB / CAARS-Fremdbeurteilung)',
    intro: 'Bitten Sie Ihre Partnerin, Ihren Partner oder eine gute Freundin/einen guten Freund, diesen Bogen auszufüllen – am besten ohne Ihre eigenen Antworten zu kennen. Die Person kann direkt auf diesem Gerät antworten oder die Antworten eines Papierbogens werden hier übertragen.'
  },
  { id: 'fremd-kindheit', group: 'Fremdbeurteilung', title: 'Fremdbeurteilung Kindheit', type: 'fremd', which: 'child', scale: 'sev4', recommended: true,
    instrument: 'DSM-5-Kriterium A, Kindheit 5–12 Jahre, aus Sicht von Eltern/Geschwistern',
    intro: 'Die Fremdanamnese durch Eltern ist in Deutschland ein fester Bestandteil der Erwachsenendiagnostik. Sind die Eltern nicht verfügbar, können ältere Geschwister oder andere Verwandte antworten. Fehlt jede Fremdauskunft, ist eine Diagnose trotzdem möglich – Zeugnisse gewinnen dann an Gewicht.'
  },

  { id: 'phq9', group: 'Abgrenzung', title: 'Stimmung (PHQ-9)', type: 'scale', required: true, scale: 'phq4', items: PHQ9_ITEMS,
    instrument: 'Patient Health Questionnaire PHQ-9 (deutsche Fassung PHQ-D), frei verwendbar',
    intro: 'Wie oft fühlten Sie sich im Verlauf der letzten 2 Wochen durch die folgenden Beschwerden beeinträchtigt? Depressionen können Konzentrationsprobleme verursachen und treten häufig zusätzlich zu ADHS auf. Die Fachärztin oder der Facharzt muss beides voneinander abgrenzen.'
  },
  { id: 'gad7', group: 'Abgrenzung', title: 'Angst (GAD-7)', type: 'scale', required: true, scale: 'phq4', items: GAD7_ITEMS,
    instrument: 'Generalized Anxiety Disorder Scale GAD-7 (deutsche Fassung), frei verwendbar',
    intro: 'Wie oft fühlten Sie sich im Verlauf der letzten 2 Wochen durch die folgenden Beschwerden beeinträchtigt? Angststörungen können Unruhe und Konzentrationsprobleme verursachen.'
  },
  { id: 'differenzial', group: 'Abgrenzung', title: 'Weitere Abklärung', type: 'form', required: true,
    intro: 'Laut S3-Leitlinie muss geprüft werden, ob andere Ursachen die Beschwerden besser erklären oder zusätzlich vorliegen. Diese Fragen sind kein Test, sondern eine Checkliste für das Gespräch. Ein „Ja“ bedeutet nicht, dass eine weitere Erkrankung vorliegt.',
    sections: [
      { title: 'Stimmungsphasen (Abgrenzung bipolare Störung)', fields: [
        { id: 'bp1', label: 'Hatten Sie Phasen von mehreren Tagen mit ungewöhnlich gehobener oder gereizter Stimmung und deutlich mehr Energie als sonst?', type: 'yn', req: true },
        { id: 'bp2', label: 'Brauchten Sie in solchen Phasen viel weniger Schlaf, ohne müde zu sein?', type: 'yn', req: true },
        { id: 'bp3', label: 'Hatten Sie in solchen Phasen Rededrang, Gedankenrasen oder haben viel Geld ausgegeben?', type: 'yn', req: true },
        { id: 'bp4', label: 'Waren diese Phasen klar von Ihrem „normalen Ich“ abgegrenzt (Beginn und Ende erkennbar)?', type: 'yn', req: true, help: 'ADHS-Merkmale sind eher durchgehend vorhanden, bipolare Episoden haben Anfang und Ende.' }
      ]},
      { title: 'Autismus-Spektrum', fields: [
        { id: 'as1', label: 'Sind Smalltalk und ungeschriebene soziale Regeln für Sie anstrengend und nicht intuitiv?', type: 'yn', req: true },
        { id: 'as2', label: 'Brauchen Sie feste Routinen und reagieren stark, wenn diese durchbrochen werden?', type: 'yn', req: true },
        { id: 'as3', label: 'Haben Sie sehr intensive, eng umschriebene Spezialinteressen?', type: 'yn', req: true },
        { id: 'as4', label: 'Sind Sie überempfindlich gegenüber Geräuschen, Licht, Gerüchen oder Stoffen auf der Haut?', type: 'yn', req: true },
        { id: 'as5', label: 'Fällt es Ihnen schwer, Mimik, Ironie oder Andeutungen anderer zu deuten?', type: 'yn', req: true },
        { id: 'as6', label: 'Bestanden diese Besonderheiten schon in der Kindheit?', type: 'yn', req: true }
      ]},
      { title: 'Emotionale Instabilität', fields: [
        { id: 'bl1', label: 'Haben Sie starke Angst, verlassen zu werden, und tun viel, um das zu verhindern?', type: 'yn', req: true },
        { id: 'bl2', label: 'Haben Sie sich schon einmal absichtlich selbst verletzt?', type: 'yn', req: true },
        { id: 'bl3', label: 'Kennen Sie ein anhaltendes, quälendes Gefühl innerer Leere?', type: 'yn', req: true },
        { id: 'bl4', label: 'Schwankt Ihr Bild von sich selbst stark (wer Sie sind, was Sie wollen)?', type: 'yn', req: true },
        { id: 'bl5', label: 'Sind Ihre engen Beziehungen sehr intensiv und wechselhaft (Idealisierung und Abwertung)?', type: 'yn', req: true }
      ]},
      { title: 'Schlaf', fields: [
        { id: 'sl1', label: 'Schnarchen Sie laut, oder wurden Atemaussetzer im Schlaf beobachtet?', type: 'yn', req: true, help: 'Eine Schlafapnoe kann Konzentrationsprobleme verursachen.' },
        { id: 'sl2', label: 'Ist Ihr Schlaf trotz ausreichender Dauer nicht erholsam?', type: 'yn', req: true },
        { id: 'sl3', label: 'Schlafen Sie tagsüber ungewollt ein (z. B. beim Lesen, Fernsehen, Beifahren)?', type: 'yn', req: true },
        { id: 'sl4', label: 'Haben Sie abends unruhige, kribbelnde Beine mit Bewegungsdrang?', type: 'yn', req: true },
        { id: 'sl5', label: 'Arbeiten Sie im Schichtdienst oder ist Ihr Schlafrhythmus stark verschoben?', type: 'yn', req: true }
      ]},
      { title: 'Belastende Erlebnisse, Angst, Zwang', fields: [
        { id: 'tr1', label: 'Haben Sie sehr belastende Ereignisse erlebt, die Sie bis heute in Erinnerungen, Albträumen oder Flashbacks verfolgen?', type: 'yn', req: true },
        { id: 'tr2', label: 'Sind Sie dauerhaft angespannt, schreckhaft und „auf der Hut“?', type: 'yn', req: true },
        { id: 'zw1', label: 'Haben Sie Zwangsgedanken oder Zwangshandlungen (z. B. Kontrollieren, Waschen), die viel Zeit kosten?', type: 'yn', req: true }
      ]},
      { title: 'Entwicklung & Neurologie', fields: [
        { id: 'le1', label: 'Wurde bei Ihnen eine Lese-Rechtschreib- oder Rechenschwäche festgestellt oder vermutet?', type: 'yn', req: true },
        { id: 'ti1', label: 'Haben oder hatten Sie Tics (unwillkürliche Bewegungen oder Laute)?', type: 'yn', req: true },
        { id: 'ko1', label: 'Ist eine Schilddrüsenerkrankung bekannt?', type: 'yn', req: true },
        { id: 'ko2', label: 'Hatten Sie Krampfanfälle, Epilepsie oder Absencen?', type: 'yn', req: true },
        { id: 'ko3', label: 'Hatten Sie eine Gehirnerschütterung mit Bewusstlosigkeit oder ein Schädel-Hirn-Trauma?', type: 'yn', req: true },
        { id: 'ko4', label: 'Sind Eisenmangel, Blutarmut oder Vitamin-B12-Mangel bekannt?', type: 'yn', req: true },
        { id: 'ko5', label: 'Verstärken sich die Beschwerden deutlich mit dem Zyklus, in Schwangerschaft/Stillzeit oder in den Wechseljahren?', type: 'yn', req: true, help: 'Nur beantworten, falls zutreffend; sonst „Nein“.' }
      ]},
      { title: 'Alkohol (AUDIT-C, WHO) und andere Substanzen', fields: [
        { id: 'au1', label: 'Wie oft trinken Sie Alkohol?', type: 'select', req: true, options: ['Nie', 'Einmal im Monat oder seltener', '2- bis 4-mal im Monat', '2- bis 3-mal pro Woche', '4-mal pro Woche oder öfter'] },
        { id: 'au2', label: 'Wie viele alkoholische Getränke trinken Sie an einem typischen Tag, an dem Sie trinken?', type: 'select', req: true, options: ['1–2 (oder nie)', '3–4', '5–6', '7–9', '10 oder mehr'], help: '1 Getränk ≈ 0,33 l Bier, 0,125 l Wein oder 4 cl Spirituosen.' },
        { id: 'au3', label: 'Wie oft trinken Sie 6 oder mehr Getränke bei einer Gelegenheit?', type: 'select', req: true, options: ['Nie', 'Seltener als einmal im Monat', 'Jeden Monat', 'Jede Woche', 'Täglich oder fast täglich'] },
        { id: 'can', label: 'Wie oft konsumieren Sie Cannabis?', type: 'select', req: true, options: ['Nie', 'Früher, aktuell nicht', 'Seltener als monatlich', 'Monatlich', 'Wöchentlich', 'Täglich oder fast täglich'] },
        { id: 'drog', label: 'Andere Drogen (z. B. Amphetamine, Kokain, MDMA)?', type: 'select', req: true, options: ['Nie', 'Früher, aktuell nicht', 'Gelegentlich', 'Regelmäßig'] },
        { id: 'stim', label: 'Nehmen Sie verschreibungspflichtige Medikamente (z. B. Stimulanzien) ohne eigene Verordnung?', type: 'yn', req: true },
        { id: 'nik', label: 'Rauchen oder dampfen Sie?', type: 'select', req: true, options: ['Nein', 'Früher', 'Gelegentlich', 'Täglich'] },
        { id: 'koff', label: 'Tassen Kaffee / Energydrinks pro Tag', type: 'number', req: true, min: 0, max: 30 }
      ]}
    ]
  },

  { id: 'anamnese', group: 'Biografie', title: 'Lebensgeschichte & Gesundheit', type: 'form', required: true,
    intro: 'Die biografische Anamnese ist der zeitaufwendigste Teil der Diagnostik. Wer sie vorbereitet mitbringt, verkürzt das Gespräch erheblich. Fragen Sie für die frühe Kindheit Ihre Eltern.',
    sections: [
      { title: 'Schwangerschaft, Geburt, frühe Kindheit', fields: [
        { id: 'ss', label: 'Besonderheiten in Schwangerschaft oder Geburt', type: 'checks', options: ['Frühgeburt (vor der 37. Woche)', 'Geringes Geburtsgewicht', 'Komplikationen bei der Geburt', 'Rauchen in der Schwangerschaft', 'Alkohol in der Schwangerschaft', 'Keine bekannt', 'Unbekannt'] },
        { id: 'entw', label: 'Frühkindliche Entwicklung (Laufen, Sprechen, Sauberkeit, Schlaf)', type: 'textarea', help: 'Z. B. „sehr früh gelaufen, Schreikind, schlechter Schläfer“.' },
        { id: 'kita', label: 'Auffälligkeiten in Kita oder Kindergarten', type: 'textarea' },
        { id: 'quelle', label: 'Woher stammen diese Informationen?', type: 'select', req: true, options: ['Eigene Erinnerung', 'Eltern/Verwandte befragt', 'U-Heft/Unterlagen', 'Gemischt', 'Keine Informationen verfügbar'] }
      ]},
      { title: 'Schule', fields: [
        { id: 'schulform', label: 'Besuchte Schulformen und Abschluss', type: 'text', req: true },
        { id: 'wiederholt', label: 'Klassen wiederholt, Schulwechsel, Schulverweise?', type: 'textarea', req: true, help: 'Wenn nichts davon: „keine“.' },
        { id: 'zeugnis', label: 'Typische Bemerkungen in Zeugnissen (Arbeits- und Sozialverhalten)', type: 'textarea', help: 'Z. B. „träumt viel“, „stört den Unterricht“, „könnte mehr leisten“.' },
        { id: 'foerder', label: 'Nachhilfe, Förderunterricht, Ergo-/Logopädie, Schulpsychologie?', type: 'textarea' }
      ]},
      { title: 'Ausbildung, Studium, Beruf', fields: [
        { id: 'ausb', label: 'Ausbildungen/Studiengänge (auch abgebrochene)', type: 'textarea', req: true },
        { id: 'jobs', label: 'Anzahl Arbeitsstellen in den letzten 10 Jahren', type: 'number', min: 0, max: 99 },
        { id: 'kuend', label: 'Kündigungen, Abmahnungen, Probezeit nicht bestanden?', type: 'textarea' }
      ]},
      { title: 'Partnerschaft, Familie, Alltag', fields: [
        { id: 'stand', label: 'Familienstand', type: 'select', req: true, options: ['Ledig', 'In Partnerschaft', 'Verheiratet', 'Getrennt/geschieden', 'Verwitwet'] },
        { id: 'kinder', label: 'Eigene Kinder (Anzahl, Besonderheiten, ADHS-Diagnose?)', type: 'text' },
        { id: 'fuehrer', label: 'Führerschein, Unfälle, Punkte in Flensburg, Führerscheinentzug', type: 'textarea' },
        { id: 'recht', label: 'Rechtliche Probleme (Anzeigen, Verfahren)', type: 'text' },
        { id: 'finanz', label: 'Finanzielle Probleme (Schulden, Schufa-Einträge, Impulskäufe)', type: 'text' }
      ]},
      { title: 'Psychische Gesundheit', fields: [
        { id: 'diag', label: 'Bisherige psychiatrische/psychologische Diagnosen', type: 'textarea', req: true, help: 'Wenn keine: „keine“. Auch Verdachtsdiagnosen nennen.' },
        { id: 'behand', label: 'Bisherige Behandlungen (Psychotherapie, Klinik, Reha) mit Zeitraum und Wirkung', type: 'textarea' },
        { id: 'suizid', label: 'Gab es früher Suizidgedanken oder Suizidversuche?', type: 'select', req: true, options: ['Nein', 'Gedanken, keine Versuche', 'Ja, Versuch(e)', 'Möchte ich persönlich besprechen'] }
      ]},
      { title: 'Körperliche Gesundheit (wichtig für eine mögliche Medikation)', fields: [
        { id: 'vorerk', label: 'Körperliche Vorerkrankungen', type: 'textarea', req: true, help: 'Wenn keine: „keine“.' },
        { id: 'medis', label: 'Aktuelle Medikamente mit Dosis (auch Pille, Nahrungsergänzung)', type: 'textarea', req: true, help: 'Wenn keine: „keine“.' },
        { id: 'herz', label: 'Herz und Kreislauf', type: 'checks', req: true, options: ['Bluthochdruck', 'Herzrhythmusstörungen / Herzstolpern', 'Angeborener Herzfehler', 'Ohnmacht oder Brustschmerz bei Belastung', 'Plötzlicher Herztod in der Familie vor dem 50. Lebensjahr', 'Grüner Star (Glaukom)', 'Nichts davon'] },
        { id: 'groesse', label: 'Größe (cm)', type: 'number', min: 100, max: 230 },
        { id: 'gewicht', label: 'Gewicht (kg)', type: 'number', min: 30, max: 300 },
        { id: 'schwanger', label: 'Schwangerschaft, Stillzeit oder Kinderwunsch?', type: 'select', options: ['Nein', 'Ja', 'Nicht zutreffend'] }
      ]},
      { title: 'Familie', fields: [
        { id: 'fam_adhs', label: 'ADHS (diagnostiziert oder vermutet) bei Blutsverwandten', type: 'checks', req: true, options: ['Mutter', 'Vater', 'Geschwister', 'Eigene Kinder', 'Großeltern/Onkel/Tanten', 'Niemand bekannt'] },
        { id: 'fam_psych', label: 'Andere psychische Erkrankungen oder Sucht in der Familie', type: 'textarea' }
      ]},
      { title: 'Ressourcen', fields: [
        { id: 'staerken', label: 'Ihre Stärken (z. B. Kreativität, Hilfsbereitschaft, Energie in Krisen)', type: 'textarea' },
        { id: 'strategien', label: 'Was hilft Ihnen bisher? (Listen, Wecker, Sport, Kaffee …)', type: 'textarea' }
      ]}
    ]
  },

  { id: 'unterlagen', group: 'Vorbereitung', title: 'Unterlagen-Checkliste', type: 'checklist', recommended: true,
    intro: 'Diese Unterlagen werden in Deutschland typischerweise angefordert. Grundschulzeugnisse sind besonders wichtig, weil sie das Kriterium „Symptome vor dem 12. Lebensjahr“ belegen. Fehlende Unterlagen schließen eine Diagnose nicht aus.',
    groups: [
      { title: 'Für den ersten Termin', items: [
        { id: 'egk', text: 'Elektronische Gesundheitskarte bzw. Versicherungsnachweis' },
        { id: 'ueberw', text: 'Überweisung der Hausarztpraxis', help: 'Für Fachärzte nicht immer Pflicht, aber für Spezialambulanzen meist erforderlich. Für eine Vermittlung über die Terminservicestelle braucht es eine Überweisung mit Vermittlungscode.' },
        { id: 'medplan', text: 'Aktueller Medikationsplan' },
        { id: 'bericht', text: 'Bericht aus dieser App (ausgedruckt oder auf dem Handy)' }
      ]},
      { title: 'Belege aus der Kindheit', items: [
        { id: 'gszeug', text: 'Grundschulzeugnisse (Klasse 1–4) mit Bemerkungen zum Arbeits- und Sozialverhalten' },
        { id: 'wszeug', text: 'Zeugnisse der weiterführenden Schule' },
        { id: 'uheft', text: 'Kinder-Untersuchungsheft (gelbes Heft, U1–U9)' },
        { id: 'kindber', text: 'Berichte aus Kindheit/Jugend: Kinderarzt, Schulpsychologie, Ergotherapie, Logopädie' },
        { id: 'kindsonst', text: 'Sonstiges: Briefe von Lehrkräften, Hausaufgabenhefte, Tagebücher' }
      ]},
      { title: 'Fremdauskünfte', items: [
        { id: 'fb_eltern', text: 'Fremdbeurteilung Kindheit durch Eltern/Geschwister', help: 'In dieser App unter „Fremdbeurteilung Kindheit“.' },
        { id: 'fb_partner', text: 'Fremdbeurteilung heute durch Partner/in oder Freund/in', help: 'In dieser App unter „Fremdbeurteilung heute“.' },
        { id: 'begleit', text: 'Klären, ob eine Bezugsperson zu einem Termin mitkommen kann' }
      ]},
      { title: 'Medizinische Befunde', items: [
        { id: 'vorbef', text: 'Arztbriefe, Klinik- und Reha-Berichte, frühere Diagnosen' },
        { id: 'labor', text: 'Laborwerte von der Hausarztpraxis: Schilddrüse (TSH), Blutbild, Ferritin, Leber- und Nierenwerte, ggf. Vitamin B12 und D', help: 'Dient dem Ausschluss körperlicher Ursachen.' },
        { id: 'ekg', text: 'Blutdruck, Puls, ggf. EKG', help: 'Vor einer medikamentösen Behandlung mit Stimulanzien erforderlich.' },
        { id: 'tests', text: 'Frühere Testergebnisse (Intelligenztest, LRS-Diagnostik, neuropsychologische Tests)' }
      ]},
      { title: 'Beruf und Alltag', items: [
        { id: 'arbzeug', text: 'Arbeits- und Ausbildungszeugnisse, ggf. Abmahnungen' },
        { id: 'tagebuch', text: 'Symptom- und Schlaftagebuch über 1–2 Wochen', help: 'Kurze Notizen: Was hat heute nicht geklappt, wie habe ich geschlafen, Kaffee/Alkohol.' },
        { id: 'fragen', text: 'Liste Ihrer Fragen an die Ärztin/den Arzt (siehe „Fragen für den Termin“)' }
      ]}
    ]
  },
  { id: 'arztfragen', group: 'Vorbereitung', title: 'Fragen für den Termin', type: 'form', recommended: true,
    intro: 'In der Aufregung des Termins gehen Fragen leicht verloren. Markieren Sie, was Sie fragen möchten. Die Auswahl erscheint im Bericht.',
    sections: [
      { title: 'Zur Diagnostik', fields: [
        { id: 'q_diag', label: 'Fragen auswählen', type: 'checks', options: [
          'Welche Testverfahren und Interviews setzen Sie ein?',
          'Wie viele Termine sind geplant und wie lange dauert die Diagnostik insgesamt?',
          'Übernimmt meine Krankenkasse die Kosten vollständig?',
          'Brauchen Sie Auskünfte meiner Eltern – und was, wenn diese nicht verfügbar sind?',
          'Wie unterscheiden Sie ADHS von Depression, Angst, Trauma oder Autismus?',
          'Werden neuropsychologische Tests (z. B. Aufmerksamkeitstests am Computer) gemacht?',
          'Bekomme ich einen schriftlichen Befund bzw. Arztbrief?'
        ]}
      ]},
      { title: 'Zur Behandlung', fields: [
        { id: 'q_beh', label: 'Fragen auswählen', type: 'checks', options: [
          'Welche Behandlungsmöglichkeiten gibt es (Psychoedukation, Medikamente, Psychotherapie, Coaching)?',
          'Welche Medikamente kommen in Frage, welche Nebenwirkungen gibt es?',
          'Welche Untersuchungen sind vor einer Medikation nötig (Herz, Blutdruck)?',
          'Darf ich mit Medikation Auto fahren?',
          'Was muss ich bei Reisen mit Betäubungsmitteln beachten?',
          'Wer stellt Folgerezepte aus – Facharzt oder Hausarzt?',
          'Gibt es ADHS-spezifische Psychotherapie oder Gruppenprogramme in der Nähe?',
          'Gibt es Selbsthilfegruppen?'
        ]}
      ]},
      { title: 'Folgen einer Diagnose', fields: [
        { id: 'q_folge', label: 'Fragen auswählen', type: 'checks', options: [
          'Wie wirkt sich eine Diagnose auf spätere Versicherungsanträge aus (Berufsunfähigkeit, private Kranken- oder Lebensversicherung)?',
          'Was bedeutet eine Diagnose für eine Verbeamtung?',
          'Gibt es einen Nachteilsausgleich für Studium oder Prüfungen?',
          'Muss ich meinen Arbeitgeber informieren?'
        ], help: 'Das sind sachliche Punkte, die viele erst nach der Diagnose erfahren. Wägen Sie sie mit Ihrer Ärztin oder Ihrem Arzt ab.' },
        { id: 'q_eigen', label: 'Eigene Fragen', type: 'textarea' }
      ]}
    ]
  },

  { id: 'auswertung', group: 'Ergebnis', title: 'Auswertung & Bericht', type: 'report' }
];

/* Ablauf in Deutschland */
const ABLAUF = [
  { id: 'st1', title: 'Selbsteinschätzung und Unterlagen', who: 'Sie selbst', text: 'Fragebögen in dieser App ausfüllen, Zeugnisse und Befunde sammeln, Bezugspersonen um Fremdbeurteilung bitten.' },
  { id: 'st2', title: 'Hausarztpraxis', who: 'Hausärztin/Hausarzt', text: 'Beschwerden schildern, Überweisung zur Psychiatrie mitnehmen (für die Terminservicestelle mit Vermittlungscode). Körperliche Ursachen abklären: Blutbild, Schilddrüse (TSH), Ferritin, ggf. Blutdruck, Puls und EKG.' },
  { id: 'st3', title: 'Spezialistin oder Spezialisten finden', who: 'Sie selbst', text: 'Die Diagnose stellen Fachärzte für Psychiatrie und Psychotherapie, Nervenärzte, ADHS-Spezialambulanzen (oft an Universitätskliniken) sowie ärztliche und psychologische Psychotherapeuten. Medikamente verordnen dürfen nur Ärztinnen und Ärzte. Termine vermittelt die Terminservicestelle (116117). Lassen Sie sich parallel auf mehrere Wartelisten setzen; Wartezeiten von mehreren Monaten sind üblich.' },
  { id: 'st4', title: 'Erstgespräch', who: 'Fachärztin/Facharzt', text: 'Schilderung der Beschwerden, erste Screening-Fragebögen (häufig ASRS, WURS-K, ADHS-SB), psychischer Befund, Planung der weiteren Diagnostik.' },
  { id: 'st5', title: 'Ausführliche Diagnostik', who: 'Fachärztin/Facharzt', text: 'Strukturiertes Interview (z. B. DIVA-5, Wender-Reimherr-Interview, ADHS-Diagnose-Checkliste), Selbst- und Fremdbeurteilungsbögen (z. B. HASE, CAARS), Sichtung der Zeugnisse, Fremdanamnese, Abgrenzung anderer Erkrankungen. Optional neuropsychologische Tests (z. B. TAP, QbTest, d2-R). Diese Tests allein können ADHS weder beweisen noch ausschließen.' },
  { id: 'st6', title: 'Befundbesprechung', who: 'Fachärztin/Facharzt', text: 'Mitteilung des Ergebnisses und schriftlicher Befund. Kodiert wird in Deutschland nach ICD-10-GM (z. B. F90.0 einfache Aktivitäts- und Aufmerksamkeitsstörung, F98.8 Aufmerksamkeitsstörung ohne Hyperaktivität).' },
  { id: 'st7', title: 'Behandlung (multimodal)', who: 'Fachärztin/Facharzt, Psychotherapie', text: 'Psychoedukation, auf Wunsch Medikation (Stimulanzien wie Methylphenidat oder Lisdexamfetamin, Nicht-Stimulanzien wie Atomoxetin), ADHS-spezifische Psychotherapie, Coaching und Selbsthilfe. Stimulanzien werden auf Betäubungsmittelrezept verordnet; vorher werden Herz und Kreislauf geprüft.' }
];

const SOURCES = [
  { t: 'S3-Leitlinie ADHS bei Kindern, Jugendlichen und Erwachsenen (AWMF-Register-Nr. 028-045)', u: 'https://register.awmf.org/de/leitlinien/detail/028-045' },
  { t: 'ASRS v1.1 – Adult ADHD Self-Report Scale (WHO / Harvard Medical School)', u: 'https://www.hcp.med.harvard.edu/ncs/asrs.php' },
  { t: 'DIVA-5 – Diagnostisches Interview für ADHS bei Erwachsenen (DIVA Foundation)', u: 'https://www.divacenter.eu/' },
  { t: 'Terminservicestelle der Kassenärztlichen Vereinigungen', u: 'https://www.116117.de' },
  { t: 'ADHS Deutschland e. V. (Selbsthilfe)', u: 'https://www.adhs-deutschland.de' },
  { t: 'TelefonSeelsorge (Krisenhilfe, rund um die Uhr)', u: 'https://www.telefonseelsorge.de' }
];

/* Kurzformen der 18 Kriterien (3. Person) – für Fremdbeurteilung und Berichtstabelle */
const DSM_SHORT = {
  a1a: ['übersieht Details, macht Flüchtigkeitsfehler', 'machte Flüchtigkeitsfehler, übersah Details'],
  a1b: ['kann die Aufmerksamkeit nur schwer halten', 'konnte sich nur kurz konzentrieren'],
  a1c: ['scheint nicht zuzuhören, wenn man sie/ihn anspricht', 'wirkte abwesend, wenn man sie/ihn ansprach'],
  a1d: ['bringt Aufgaben und Pflichten nicht zu Ende', 'brachte Aufgaben und Hausaufgaben nicht zu Ende'],
  a1e: ['hat Mühe, Aufgaben und Zeit zu organisieren', 'hatte Mühe, Sachen und Aufgaben zu organisieren'],
  a1f: ['vermeidet oder verschiebt geistig anstrengende Aufgaben', 'vermied anstrengende Aufgaben wie Hausaufgaben'],
  a1g: ['verliert oder verlegt häufig Dinge', 'verlor oder vergaß häufig Sachen'],
  a1h: ['ist leicht ablenkbar', 'war leicht ablenkbar, träumte viel'],
  a1i: ['ist im Alltag vergesslich (Termine, Rechnungen)', 'war bei Alltäglichem vergesslich'],
  a2a: ['zappelt mit Händen oder Füßen, rutscht herum', 'zappelte, rutschte auf dem Stuhl herum'],
  a2b: ['steht auf, wo Sitzenbleiben erwartet wird', 'stand auf, wo Sitzenbleiben erwartet wurde'],
  a2c: ['wirkt innerlich unruhig und getrieben', 'rannte oder kletterte unpassend herum'],
  a2d: ['kann sich kaum ruhig beschäftigen oder entspannen', 'konnte kaum ruhig spielen'],
  a2e: ['ist ständig „auf Achse“, wie getrieben', 'war ständig in Bewegung, „wie aufgezogen“'],
  a2f: ['redet übermäßig viel', 'redete übermäßig viel'],
  a2g: ['platzt mit Antworten heraus, beendet Sätze anderer', 'platzte mit Antworten heraus'],
  a2h: ['kann schlecht warten, bis sie/er an der Reihe ist', 'konnte schlecht abwarten'],
  a2i: ['unterbricht andere, mischt sich ein', 'störte oder unterbrach andere']
};

const MODULE_MINUTES = { person: 5, asrs: 4, 'dsm-aktuell': 15, 'dsm-kindheit': 15, 'kindheit-skala': 6, emotion: 5, alltag: 6, 'fremd-aktuell': 10, 'fremd-kindheit': 10, phq9: 2, gad7: 2, differenzial: 8, anamnese: 20, unterlagen: 5, arztfragen: 3 };
