# ADHS-Diagnosemappe

Eine Web-App, mit der Erwachsene in Deutschland die fachärztliche ADHS-Diagnostik vorbereiten. Sie braucht keine Installation und keinen Server. Alle Angaben bleiben im Browser (`localStorage`).

## Starten
`index.html` im Browser öffnen. Ein Build-Schritt ist nicht nötig. Alternativ den Ordner über einen beliebigen statischen Webserver ausliefern, z. B. `python3 -m http.server`.

## Inhalt
| Bereich | Module |
|---|---|
| Überblick | Diagnoseweg in Deutschland (7 Schritte, DSM-5-Kriterien A–E, erwartete Instrumente), Tracker für die Facharztsuche |
| Angaben | Persönliche Angaben, Anliegen, Leidensdruck, verfügbare Fremdauskünfte |
| Selbstbeurteilung | Screening (ASRS-Typ, 18 Items, Teil A), Symptomcheckliste heute und Kindheit (18 DSM-5-Kriterien mit Beispielfeldern wie in DIVA-5), Kindheitsskala (WURS-Typ, 25 Items), Emotionen & Organisation (Wender-Utah-Themen), Beeinträchtigung im Alltag (WFIRS-Bereiche) |
| Fremdbeurteilung | Bogen für Partner/in bzw. Freund/in (heute) und für Eltern/Geschwister (Kindheit) |
| Abgrenzung | PHQ-9, GAD-7, AUDIT-C, Checkliste zu bipolarer Störung, Autismus, emotionaler Instabilität, Schlaf, Trauma, Zwang, Lernstörungen, Tics, körperlichen Ursachen und Substanzen |
| Biografie | Schwangerschaft/Geburt, Entwicklung, Schule, Beruf, Beziehungen, Verkehr, Finanzen, Diagnosen, Medikamente, Herz-Kreislauf, Familienanamnese, Ressourcen |
| Vorbereitung | Unterlagen-Checkliste mit Status, Fragen für den Termin |
| Ergebnis | Unverbindliche Einschätzung (erst wenn alle Pflichtmodule fertig sind), Bericht für die Praxis, Kopieren/Drucken/Sichern/Laden |

## Bedienung für Menschen mit ADHS
Die Oberfläche folgt Empfehlungen für kognitive Barrierefreiheit (W3C, „Making Content Usable for People with Cognitive and Learning Disabilities“):

- **Eine Frage pro Bildschirm** (Standard): große Antwortflächen, nach der Antwort automatisch zur nächsten Frage. Bei Fragen mit Beispielfeld wird nicht automatisch weitergeschaltet. Die Listenansicht „Alle auf einmal“ ist jederzeit umschaltbar.
- **Tastatur:** `1`–`5` antworten, `←`/`→` zurück/weiter, `Esc` schließt Menüs.
- **Ein nächster Schritt** statt einer Wand aus Modulen: Die Übersicht zeigt nur die nächste Etappe mit Restzeit. Alle Etappen lassen sich aufklappen.
- **Weitermachen, wo man aufgehört hat:** Die Position in jedem Fragebogen wird gespeichert.
- **Kurze Texte:** Nur der erste Satz jeder Einleitung ist sichtbar, der Rest steht unter „Mehr dazu“.
- **Restzeit** je Etappe und gesamt („noch ca. 6 Min.“), Fortschrittspunkte pro Frage.
- **Pausen:** Hinweis „Gute Stelle für eine Pause“ nach je 9 Fragen und eine abschaltbare Erinnerung nach 20 Minuten aktiver Bearbeitung.
- **Erfolgsmeldung** nach jeder abgeschlossenen Etappe mit direktem Link zur nächsten.
- **Einstellungsmenü oben rechts** mit zwei Reitern:
  - **Speichern:** erklärt gleich oben, dass alle Angaben nur lokal in diesem Browser gespeichert werden, zeigt den Zeitpunkt der letzten Speicherung und nennt, wann Daten verloren gehen können. Dort liegen auch Sicherung (Datei/Code), Laden und Löschen.
  - **Ansicht:** Textgröße (3 Stufen), automatisch weiter, ruhige Ansicht (ohne Seitenleiste, gedämpfte Farben, ohne Animationen), Pausen-Erinnerung, Vorlesen (Sprachausgabe des Browsers).
- Leicht lesbare Schrift (Atkinson Hyperlegible), große Klickflächen, hell/dunkel, `prefers-reduced-motion` wird beachtet.

## Auswertungslogik (transparent im Bericht dargestellt)
- **Kriterium A:** Ein Symptom zählt ab der Stufe „deutlich“. Erfüllt bei mindestens 5 von 9 in einem Bereich, grenzwertig bei 4.
- **Screening:** Teil A positiv bei mindestens 4 von 6 auffälligen Antworten (Schwellen wie beim ASRS v1.1).
- **Kindheit:** „deutlich“ bei mindestens 6 Symptomen in einem Bereich, oder bei mindestens 3 Symptomen plus Kindheitsskala ≥ 36/100. „teilweise“, wenn eines dieser Zeichen vorliegt oder ein Beginn vor dem 12. Lebensjahr angegeben ist.
- **Kriterium C:** mindestens 2 Lebensbereiche. **Kriterium D:** mindestens 2 Alltagsbereiche mit „oft“ oder häufiger, oder Gesamtbeeinträchtigung „deutlich“/„schwer“.
- **Stufen:** *deutlich* (A + Kindheit + C + D erfüllt, nicht nur phasenweise), *teilweise* (A erfüllt/grenzwertig oder Screening positiv), sonst *gering*.
- Hinweise zur Abgrenzung (PHQ-9 ≥ 10, GAD-7 ≥ 10, AUDIT-C, Hypomanie, Autismus usw.) werden gesondert ausgewiesen.

## Wichtige Hinweise
- Die App stellt **keine Diagnose** und ist **nicht validiert**.
- Geschützte Instrumente (ASRS, WURS-K, ADHS-SB/HASE, DIVA-5, CAARS, WRI, WFIRS) sind **nicht im Original** enthalten. Die App bildet ihre Inhalte mit eigenen Formulierungen ab. Wörtlich übernommen sind nur die frei verwendbaren Bögen PHQ-9, GAD-7 und AUDIT-C.
- Der Orientierungswert der Kindheitsskala (36/100) ist aus dem WURS-K-Grenzwert (30 von 84) umgerechnet und nicht validiert.
