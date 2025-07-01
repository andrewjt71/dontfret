const notes = ['E', 'B', 'G', 'D', 'A', 'E'];
const noteMap = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const stringOffsets = [4, 11, 7, 2, 9, 4]; // 1=high E, 2=B, 3=G, 4=D, 5=A, 6=low E
const fretboard = document.getElementById('fretboard');
const taskDisplay = document.getElementById('task-text');
const feedback = document.getElementById('feedback');
const stringSelect = document.getElementById('string-select');
const noteTypeSelect = document.getElementById('note-type-select');
let target = {};
const modeSelect = document.getElementById('mode-select');
const showNotesToggle = document.getElementById('show-notes-toggle');
const intervalCheatsheet = document.getElementById('interval-cheatsheet');

// Chord definitions
const chords = {
  'major': [0, 4, 7], // root, major 3rd, perfect 5th
  'minor': [0, 3, 7], // root, minor 3rd, perfect 5th
  'diminished': [0, 3, 6], // root, minor 3rd, diminished 5th
  'augmented': [0, 4, 8], // root, major 3rd, augmented 5th
  'major7': [0, 4, 7, 11], // root, major 3rd, perfect 5th, major 7th
  'minor7': [0, 3, 7, 10], // root, minor 3rd, perfect 5th, minor 7th
  'dominant7': [0, 4, 7, 10], // root, major 3rd, perfect 5th, minor 7th
  'diminished7': [0, 3, 6, 9], // root, minor 3rd, diminished 5th, diminished 7th
};

// Scale definitions (intervals from root)
const scales = {
  'major': [0, 2, 4, 5, 7, 9, 11], // W-W-H-W-W-W-H
  'natural_minor': [0, 2, 3, 5, 7, 8, 10], // W-H-W-W-H-W-W
  'harmonic_minor': [0, 2, 3, 5, 7, 8, 11], // W-H-W-W-H-WH-H
  'melodic_minor': [0, 2, 3, 5, 7, 9, 11], // W-H-W-W-W-W-H
  'pentatonic_major': [0, 2, 4, 7, 9], // 5-note scale
  'pentatonic_minor': [0, 3, 5, 7, 10], // 5-note scale
  'blues': [0, 3, 5, 6, 7, 10], // 6-note scale with blue note
  'dorian': [0, 2, 3, 5, 7, 9, 10], // W-H-W-W-W-H-W
  'mixolydian': [0, 2, 4, 5, 7, 9, 10], // W-W-H-W-W-H-W
  'lydian': [0, 2, 4, 6, 7, 9, 11], // W-W-W-H-W-W-H
  'phrygian': [0, 1, 3, 5, 7, 8, 10], // H-W-W-W-H-W-W
  'locrian': [0, 1, 3, 5, 6, 8, 10], // H-W-W-H-W-W-W
};

function getChordNotes(rootNote, chordType) {
  const rootIndex = noteMap.indexOf(rootNote);
  return chords[chordType].map(interval => noteMap[(rootIndex + interval) % 12]);
}

function getScaleNotes(rootNote, scaleType) {
  const rootIndex = noteMap.indexOf(rootNote);
  return scales[scaleType].map(interval => noteMap[(rootIndex + interval) % 12]);
}

function noteAt(stringIndex, fret) {
  const base = stringOffsets[stringIndex];
  return noteMap[(base + fret) % 12];
}

function isNoteValid(note) {
  const type = noteTypeSelect.value;
  const isNatural = !note.includes('#');
  if (type === 'all') return true;
  if (type === 'natural') return isNatural;
  if (type === 'accidental') return !isNatural;
  return true;
}

// Track clicked positions for chord training
let clickedPositions = [];
// Track incorrect positions for chord training
let incorrectPositions = [];

function renderFretboard() {
  fretboard.innerHTML = '';
  feedback.textContent = '';
  feedback.classList.remove('feedback-correct', 'feedback-incorrect');
  const width = fretboard.clientWidth;
  const height = fretboard.clientHeight;
  const fretCount = 13;
  const selectedString = stringSelect.value;
  const mode = modeSelect.value;
  const showNotes = showNotesToggle.checked;

  for (let string = 0; string < 6; string++) {
    // Position strings closer to edges, with edge strings very close to the fretboard edges
    const edgeMargin = 0.05; // 5% margin from edges
    const y = edgeMargin * height + (string / 5) * (height * (1 - 2 * edgeMargin));
    const div = document.createElement('div');
    div.classList.add('string-hitbox');
    div.style.top = `${y}px`;
    div.dataset.string = string;
    if (selectedString !== 'all' && string === parseInt(selectedString) - 1 && modeSelect.value !== 'interval') {
      div.classList.add('glow');
    }
    div.addEventListener('click', handleClick);

    const line = document.createElement('div');
    line.classList.add('string-line');
    div.appendChild(line);

    fretboard.appendChild(div);
  }

  const dotFrets = [3, 5, 7, 9, 12];
  for (let fret = 0; fret < fretCount; fret++) {
    const x = (fret / (fretCount - 1)) * width;

    const line = document.createElement('div');
    line.classList.add('fret-line');
    line.style.left = `${x}px`;
    fretboard.appendChild(line);

    // Add fret labels between frets, starting from 1
    if (fret > 0) {
      const label = document.createElement('div');
      label.classList.add('fret-label');
      // Position label between the previous fret and current fret
      const labelX = ((fret - 0.5) / (fretCount - 1)) * width;
      label.style.left = `${labelX}px`;
      label.textContent = fret;
      fretboard.appendChild(label);
    }

    if (dotFrets.includes(fret)) {
      const dot = document.createElement('div');
      dot.classList.add('dot-marker');
      dot.style.left = `${x - (width / (fretCount - 1)) / 2}px`;
      dot.style.top = `${fret === 12 ? height / 2 - 45 : height / 2}px`;
      fretboard.appendChild(dot);

      if (fret === 12) {
        const dot2 = dot.cloneNode();
        dot2.style.top = `${height / 2 + 45}px`;
        fretboard.appendChild(dot2);
      }
    }
  }

  // Show previously selected correct notes in chord training mode
  if (mode === 'chord' && clickedPositions.length > 0) {
    clickedPositions.forEach(pos => {
      const x = (pos.fret - 1 + 0.5) * (width / 12);
      const edgeMargin = 0.05;
      const y = edgeMargin * height + (pos.string / 5) * (height * (1 - 2 * edgeMargin));
      const marker = document.createElement('div');
      marker.classList.add('marker', 'correct');
      marker.style.left = `${x}px`;
      marker.style.top = `${y}px`;
      fretboard.appendChild(marker);
    });
  }
  // Show previously selected correct notes in scale training mode
  if (mode === 'scale' && clickedPositions.length > 0) {
    clickedPositions.forEach(pos => {
      const x = (pos.fret - 1 + 0.5) * (width / 12);
      const edgeMargin = 0.05;
      const y = edgeMargin * height + (pos.string / 5) * (height * (1 - 2 * edgeMargin));
      const marker = document.createElement('div');
      marker.classList.add('marker', 'correct');
      marker.style.left = `${x}px`;
      marker.style.top = `${y}px`;
      fretboard.appendChild(marker);
    });
  }
  // Show previously selected incorrect notes in chord training mode
  if (mode === 'chord' && incorrectPositions.length > 0) {
    incorrectPositions.forEach(pos => {
      const x = (pos.fret - 1 + 0.5) * (width / 12);
      const edgeMargin = 0.05;
      const y = edgeMargin * height + (pos.string / 5) * (height * (1 - 2 * edgeMargin));
      const marker = document.createElement('div');
      marker.classList.add('marker', 'incorrect');
      marker.style.left = `${x}px`;
      marker.style.top = `${y}px`;
      fretboard.appendChild(marker);
    });
  }
  // Show previously selected incorrect notes in scale training mode
  if (mode === 'scale' && incorrectPositions.length > 0) {
    incorrectPositions.forEach(pos => {
      const x = (pos.fret - 1 + 0.5) * (width / 12);
      const edgeMargin = 0.05;
      const y = edgeMargin * height + (pos.string / 5) * (height * (1 - 2 * edgeMargin));
      const marker = document.createElement('div');
      marker.classList.add('marker', 'incorrect');
      marker.style.left = `${x}px`;
      marker.style.top = `${y}px`;
      fretboard.appendChild(marker);
    });
  }

  // Always show open string notes (fret 0) with clickable areas
  for (let string = 0; string < 6; string++) {
    const note = noteAt(string, 0);
    const edgeMargin = 0.05;
    const y = edgeMargin * height + (string / 5) * (height * (1 - 2 * edgeMargin));

    // Create clickable area for open string
    const openStringHitbox = document.createElement('div');
    openStringHitbox.classList.add('open-string-hitbox');
    openStringHitbox.style.position = 'absolute';
    openStringHitbox.style.left = '-14px';
    openStringHitbox.style.top = `${y - 6}px`;
    openStringHitbox.style.width = '20px';
    openStringHitbox.style.height = '12px';
    openStringHitbox.style.cursor = 'pointer';
    openStringHitbox.dataset.string = string;
    openStringHitbox.dataset.fret = '0';
    openStringHitbox.addEventListener('click', handleClick);
    fretboard.appendChild(openStringHitbox);

    const noteLabel = document.createElement('div');
    noteLabel.classList.add('note-label');
    noteLabel.classList.add(note.includes('#') ? 'accidental' : 'natural');
    noteLabel.style.left = `-14px`;
    noteLabel.style.top = `${y}px`;
    noteLabel.textContent = note;
    fretboard.appendChild(noteLabel);
  }

  // Add note labels for all frets if toggle is enabled
  if (showNotes) {
    for (let string = 0; string < 6; string++) {
      for (let fret = 1; fret <= 12; fret++) { // Start from fret 1 since fret 0 is handled above
        const note = noteAt(string, fret);
        const x = (fret / (fretCount - 1)) * width;
        const edgeMargin = 0.05;
        const y = edgeMargin * height + (string / 5) * (height * (1 - 2 * edgeMargin));

        const noteLabel = document.createElement('div');
        noteLabel.classList.add('note-label');
        noteLabel.classList.add(note.includes('#') ? 'accidental' : 'natural');
        // Position notes in the gap before the fret (between previous fret and current fret)
        noteLabel.style.left = `${x - (width / (fretCount - 1)) / 2}px`;
        noteLabel.style.top = `${y}px`;
        noteLabel.textContent = note;
        fretboard.appendChild(noteLabel);
      }
    }
  }
}

function updateNoteControlsVisibility() {
  const mode = modeSelect.value;
  const stringSelect = document.getElementById('string-select').parentElement.parentElement;
  const noteTypeSelect = document.getElementById('note-type-select').parentElement.parentElement;

  if (mode === 'interval' || mode === 'chord' || mode === 'scale') {
    stringSelect.style.display = 'none';
    noteTypeSelect.style.display = 'none';
  } else {
    stringSelect.style.display = 'flex';
    noteTypeSelect.style.display = 'flex';
  }
}

// Helper function to format numbers as ordinals where ordinals are 1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th, 10th,
// 11th, 12th
function ordinal(n) {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}

function newTask() {
  const mode = modeSelect.value;
  if (mode === 'interval') {
    const intervals = [
      { name: 'minor 2nd', semitones: 1 },
      { name: 'major 2nd', semitones: 2 },
      { name: 'minor 3rd', semitones: 3 },
      { name: 'major 3rd', semitones: 4 },
      { name: 'perfect 4th', semitones: 5 },
      { name: 'tritone', semitones: 6 },
      { name: 'perfect 5th', semitones: 7 },
      { name: 'minor 6th', semitones: 8 },
      { name: 'major 6th', semitones: 9 },
      { name: 'minor 7th', semitones: 10 },
      { name: 'major 7th', semitones: 11 },
      { name: 'octave', semitones: 12 }
    ];
    const rootNote = noteMap[Math.floor(Math.random() * 12)];
    const interval = intervals[Math.floor(Math.random() * intervals.length)];
    target = {
      mode: 'interval',
      root: rootNote,
      semitones: interval.semitones,
      intervalName: interval.name
    };
    taskDisplay.textContent = `Find the ${interval.name} from ${rootNote}`;
    return;
  } else if (mode === 'chord') {
    const chordTypes = Object.keys(chords);
    const chordType = chordTypes[Math.floor(Math.random() * chordTypes.length)];
    const rootNote = noteMap[Math.floor(Math.random() * 12)];
    const chordNotes = getChordNotes(rootNote, chordType);

    // Clear clicked positions for new task
    clickedPositions = [];
    incorrectPositions = [];

    target = {
      mode: 'chord',
      root: rootNote,
      chordType: chordType,
      chordNotes: chordNotes,
      selectedNotes: [],
      completed: false
    };

    const chordNameMap = {
      'major': 'major',
      'minor': 'minor',
      'diminished': 'diminished',
      'augmented': 'augmented',
      'major7': 'major 7th',
      'minor7': 'minor 7th',
      'dominant7': 'dominant 7th',
      'diminished7': 'diminished 7th'
    };
    const chordName = chordNameMap[chordType];

    taskDisplay.textContent = `Find all the notes in ${rootNote} ${chordName} chord`;
    return;
  } else if (mode === 'scale') {
    const scaleTypes = Object.keys(scales);
    const scaleType = scaleTypes[Math.floor(Math.random() * scaleTypes.length)];
    const rootNote = noteMap[Math.floor(Math.random() * 12)];
    const scaleNotes = getScaleNotes(rootNote, scaleType);

    // Clear clicked positions for new task
    clickedPositions = [];
    incorrectPositions = [];

    target = {
      mode: 'scale',
      root: rootNote,
      scaleType: scaleType,
      scaleNotes: scaleNotes,
      selectedNotes: [],
      completed: false
    };

    const scaleNameMap = {
      'major': 'major',
      'natural_minor': 'natural minor',
      'harmonic_minor': 'harmonic minor',
      'melodic_minor': 'melodic minor',
      'pentatonic_major': 'major pentatonic',
      'pentatonic_minor': 'minor pentatonic',
      'blues': 'blues',
      'dorian': 'dorian',
      'mixolydian': 'mixolydian',
      'lydian': 'lydian',
      'phrygian': 'phrygian',
      'locrian': 'locrian'
    };
    const scaleName = scaleNameMap[scaleType];

    taskDisplay.textContent = `Find all the notes in ${rootNote} ${scaleName} scale`;
    return;
  }

  let string;
  const selected = stringSelect.value;
  if (selected === 'all') {
    string = Math.floor(Math.random() * 6);
  } else {
    string = parseInt(selected) - 1;
  }

  let note, fret;
  do {
    // Allow open strings (fret 0) or fretted notes (fret 1-12)
    fret = Math.floor(Math.random() * 13); // 0-12
    note = noteAt(string, fret);
  } while (!isNoteValid(note));

  target = { string, fret, note };
  const displayString = ordinal(string + 1);
  const fretDescription = fret === 0 ? 'open' : `${fret}${fret === 1 ? 'st' : fret === 2 ? 'nd' : fret === 3 ? 'rd' : 'th'} fret`;
  taskDisplay.textContent = `Click on the ${note} note on the ${displayString} string (${fretDescription}).`;
}

function handleClick(e) {
  const mode = modeSelect.value;
  const visualIndex = parseInt(e.currentTarget.dataset.string);
  const clickedString = visualIndex;

  // Check if this is an open string click
  const isOpenString = e.currentTarget.classList.contains('open-string-hitbox');
  let fret, note, x, y;

  const edgeMargin = 0.05;
  const height = fretboard.clientHeight;

  if (isOpenString) {
    fret = 0;
    note = noteAt(clickedString, 0);
    x = -14;
    y = edgeMargin * height + (clickedString / 5) * (height * (1 - 2 * edgeMargin));
  } else {
    x = e.offsetX;
    const width = fretboard.clientWidth;
    fret = Math.floor((x / (width / 12))) + 1;
    note = noteAt(clickedString, fret);
    y = edgeMargin * height + (clickedString / 5) * (height * (1 - 2 * edgeMargin));
  }

  const marker = document.createElement('div');
  marker.classList.add('marker');
  marker.style.left = `${x}px`;
  marker.style.top = `${y}px`;

  if (mode === 'interval') {
    const expectedNote = noteMap[(noteMap.indexOf(target.root) + target.semitones) % 12];
    if (note === expectedNote) {
      marker.classList.add('correct');
      showFeedback(`<div>✅ Good!</div><div style="font-size: 14px; color: #aaa;">You found ${note} correctly!</div>`, 'feedback-correct');
      createParticles(e.clientX, y, true);
      fretboard.appendChild(marker);
      setTimeout(() => {
        renderFretboard();
        newTask();
      }, 2000);
    } else {
      marker.classList.add('incorrect');
      showFeedback(`<div>❌ OOPS</div><div style="font-size: 14px; color: #aaa;">You clicked ${note}. Expected ${expectedNote}.</div>`, 'feedback-incorrect');
      createParticles(e.clientX, y, false);
      fretboard.appendChild(marker);
    }
    return;
  } else if (mode === 'chord') {
    // Check if this string already has a note selected
    const stringAlreadyUsed = clickedPositions.some(pos => pos.string === clickedString);

    if (stringAlreadyUsed) {
      // String already has a note selected
      marker.classList.add('incorrect');
      showFeedback(`<div>❌ String already used!</div><div style="font-size: 14px; color: #aaa;">You already selected a note on the ${ordinal(clickedString + 1)} string. Choose a different string.</div>`, 'feedback-incorrect');
      createParticles(e.clientX, y, false);
      fretboard.appendChild(marker);
      return;
    }

    if (target.chordNotes.includes(note)) {
      // Correct note, add to selected
      target.selectedNotes.push(note);
      // Track the specific position clicked
      clickedPositions.push({ string: clickedString, fret: fret });
      marker.classList.add('correct');

      // Count unique notes for completion check
      const uniqueSelectedNotes = [...new Set(target.selectedNotes)];

      if (uniqueSelectedNotes.length === target.chordNotes.length) {
        // Chord complete!
        showFeedback(`<div>✅ Chord Complete!</div><div style="font-size: 14px; color: #aaa;">You found all notes in ${target.root} ${target.chordType} chord!</div>`, 'feedback-correct');
        createParticles(e.clientX, y, true);
        target.completed = true;
        setTimeout(() => {
          // Clear selected notes and clicked positions for next task
          target.selectedNotes = [];
          clickedPositions = [];
          incorrectPositions = [];
          renderFretboard();
          newTask();
        }, 2000);
      } else {
        // Still more notes to find - don't show remaining notes
        showFeedback(`<div>✅ Good!</div><div style="font-size: 14px; color: #aaa;">Found ${note}.</div>`, 'feedback-correct');
        createParticles(e.clientX, y, true);
      }
    } else {
      // Wrong note
      marker.classList.add('incorrect');
      showFeedback(`<div>❌ Not in chord!</div><div style="font-size: 14px; color: #aaa;">${note} is not in ${target.root} ${target.chordType} chord. Need: ${target.chordNotes.filter(n => !target.selectedNotes.includes(n)).join(', ')}</div>`, 'feedback-incorrect');
      createParticles(e.clientX, y, false);
      // Track the specific incorrect position clicked
      incorrectPositions.push({ string: clickedString, fret: fret });
    }

    fretboard.appendChild(marker);

    // Only redraw and clear feedback when the chord is completed (handled above)
    return;
  } else if (mode === 'scale') {
    if (target.scaleNotes.includes(note)) {
      if (target.selectedNotes.includes(note)) {
        // Note already selected
        marker.classList.add('incorrect');
        showFeedback(`<div>❌ Already found!</div><div style="font-size: 14px; color: #aaa;">You already found ${note}. Find the remaining notes: ${target.scaleNotes.filter(n => !target.selectedNotes.includes(n)).join(', ')}</div>`, 'feedback-incorrect');
        createParticles(e.clientX, y, false);
      } else {
        // Correct note, add to selected
        target.selectedNotes.push(note);
        // Track the specific position clicked
        clickedPositions.push({ string: clickedString, fret: fret });
        marker.classList.add('correct');

        if (target.selectedNotes.length === target.scaleNotes.length) {
          // Scale complete!
          const scaleNameMap = {
            'major': 'major',
            'natural_minor': 'natural minor',
            'harmonic_minor': 'harmonic minor',
            'melodic_minor': 'melodic minor',
            'pentatonic_major': 'major pentatonic',
            'pentatonic_minor': 'minor pentatonic',
            'blues': 'blues',
            'dorian': 'dorian',
            'mixolydian': 'mixolydian',
            'lydian': 'lydian',
            'phrygian': 'phrygian',
            'locrian': 'locrian'
          };
          const scaleName = scaleNameMap[target.scaleType];
          showFeedback(`<div>✅ Scale Complete!</div><div style="font-size: 14px; color: #aaa;">You found all notes in ${target.root} ${scaleName} scale!</div>`, 'feedback-correct');
          createParticles(e.clientX, y, true);
          target.completed = true;
          setTimeout(() => {
            // Clear selected notes and clicked positions for next task
            target.selectedNotes = [];
            clickedPositions = [];
            incorrectPositions = [];
            renderFretboard();
            newTask();
          }, 2000);
        } else {
          // Still more notes to find
          showFeedback(`<div>✅ Good!</div><div style="font-size: 14px; color: #aaa;">Found ${note}.</div>`, 'feedback-correct');
          createParticles(e.clientX, y, true);
        }
      }
    } else {
      // Wrong note
      marker.classList.add('incorrect');
      showFeedback(`<div>❌ Not in scale!</div><div style="font-size: 14px; color: #aaa;">${note} is not in ${target.root} ${target.scaleType} scale. Need: ${target.scaleNotes.filter(n => !target.selectedNotes.includes(n)).join(', ')}</div>`, 'feedback-incorrect');
      createParticles(e.clientX, y, false);
      // Track the specific incorrect position clicked
      incorrectPositions.push({ string: clickedString, fret: fret });
    }

    fretboard.appendChild(marker);

    // Only redraw and clear feedback when the scale is completed (handled above)
    return;
  }

  marker.classList.add('marker');
  marker.style.left = `${x}px`;
  marker.style.top = `${y}px`;

  if (note === target.note && clickedString === target.string) {
    marker.classList.add('correct');
    const fretDescription = target.fret === 0 ? 'open' : `${target.fret}${target.fret === 1 ? 'st' : target.fret === 2 ? 'nd' : target.fret === 3 ? 'rd' : 'th'} fret`;
    showFeedback(`<div>✅ Good!</div><div style="font-size: 14px; color: #aaa;">You found ${note} on the ${ordinal(clickedString + 1)} string (${fretDescription})!</div>`, 'feedback-correct');
    createParticles(e.clientX, y, true);
    fretboard.appendChild(marker);
    setTimeout(() => {
      renderFretboard();
      newTask();
    }, 2000);
  } else {
    const expectedString = target.string;
    const expectedNote = target.note;
    const expectedStringLabel = ordinal(expectedString + 1);
    const actualStringLabel = ordinal(clickedString + 1);
    const expectedFretDescription = target.fret === 0 ? 'open' : `${target.fret}${target.fret === 1 ? 'st' : target.fret === 2 ? 'nd' : target.fret === 3 ? 'rd' : 'th'} fret`;
    marker.classList.add('incorrect');
    showFeedback(`<div>❌ OOPS</div><div style="font-size: 14px; color: #aaa;">You clicked ${note} on the ${actualStringLabel} string. Expected ${expectedNote} on the ${expectedStringLabel} string (${expectedFretDescription}).</div>`, 'feedback-incorrect');
    createParticles(e.clientX, y, false);
    fretboard.appendChild(marker);
  }
}

document.getElementById('new-task').addEventListener('click', () => {
  // Clear chord/scale training state when manually refreshing
  if (modeSelect.value === 'chord' || modeSelect.value === 'scale') {
    clickedPositions = [];
    incorrectPositions = [];
    if (target && target.selectedNotes) {
      target.selectedNotes = [];
    }
  }
  // Clear feedback and redraw fretboard
  feedback.textContent = '';
  feedback.classList.remove('feedback-correct', 'feedback-incorrect');
  renderFretboard();
  newTask();
});

modeSelect.addEventListener('change', () => {
  if (modeSelect.value === 'interval') {
    stringSelect.value = 'all';
  }

  // Clear chord/scale training state when changing modes
  clickedPositions = [];
  incorrectPositions = [];
  if (target && target.selectedNotes) {
    target.selectedNotes = [];
  }

  // Clear feedback
  feedback.textContent = '';
  feedback.classList.remove('feedback-correct', 'feedback-incorrect');

  renderFretboard();
  newTask();
  updateInstructions();
  updateNoteControlsVisibility();
});

stringSelect.addEventListener('change', () => {
  renderFretboard();
  newTask();
});

noteTypeSelect.addEventListener('change', () => {
  renderFretboard();
  newTask();
});

showNotesToggle.addEventListener('change', () => {
  renderFretboard();
});

// Modal event listeners
document.getElementById('info-icon').addEventListener('click', () => {
  const mode = modeSelect.value;
  let contentId;

  if (mode === 'interval') {
    contentId = 'interval-modal-content';
  } else if (mode === 'chord') {
    contentId = 'chord-modal-content';
  } else if (mode === 'scale') {
    contentId = 'scale-modal-content';
  } else {
    contentId = 'note-modal-content';
  }

  showModal(contentId);
});

document.getElementById('modal-close').addEventListener('click', hideModal);
document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target.id === 'modal-overlay') {
    hideModal();
  }
});

renderFretboard();
newTask();
updateInstructions();
updateNoteControlsVisibility();

function createParticles(x, y, isCorrect) {
  const particleCount = 1;

  const colors = isCorrect ?
    ['#4CAF50'] :
    ['#f44336'];

  // Use the actual click coordinates from the event
  const pageX = x;
  const fretboardRect = fretboard.getBoundingClientRect();
  const pageY = fretboardRect.top + y;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    // More varied sizes
    const size = 18;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';

    // Center the particle on the click point
    particle.style.left = (pageX - size/2) + 'px';
    particle.style.top = (pageY - size/2) + 'px';

    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

    // More varied movement patterns
    const spreadX = Math.random() * 60 - 30;
    const spreadY = Math.random() * 60 - 30;
    particle.style.transform = `translate(${spreadX}px, ${spreadY}px)`;

    document.body.appendChild(particle);

    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 1000);
  }
}

function updateInstructions() {
  const mode = modeSelect.value;
  const instructionsTitle = document.getElementById('instructions-title');
  const instructionsText = document.getElementById('instructions-text');

  if (mode === 'interval') {
    instructionsTitle.textContent = 'Interval Training';
    instructionsText.textContent = 'In guitar theory (and music theory in general), intervals are the building blocks of melody and harmony. An interval is the distance between two notes, measured in steps or semitones.';
  } else if (mode === 'chord') {
    instructionsTitle.textContent = 'Chord Training';
    instructionsText.textContent = 'Learn to identify the notes that make up different chord types. Click on all the notes that belong to the given chord. You can select notes in any order, and the exercise is complete when you\'ve found all the required notes.';
  } else if (mode === 'scale') {
    instructionsTitle.textContent = 'Scale Training';
    instructionsText.textContent = 'Master scale construction by identifying all the notes in different scale types. Click on each note that belongs to the given scale. This training helps you understand scale patterns and improves your ability to play scales across the fretboard.';
  } else {
    instructionsTitle.textContent = 'Note Training';
    instructionsText.textContent = 'Knowing the notes of the guitar neck from memory is one of the most powerful things you can do as a guitarist. It unlocks fluency, creativity, and precision in virtually every area of your playing. Test your knowledge by  guessing the note on the fretboard.';
  }
}

function showModal(contentId) {
  const modalOverlay = document.getElementById('modal-overlay');
  const modalContent = document.getElementById('modal-content-inner');
  const content = document.getElementById(contentId).innerHTML;
  modalContent.innerHTML = content;
  modalOverlay.style.display = 'flex';
}

function hideModal() {
  const modalOverlay = document.getElementById('modal-overlay');
  modalOverlay.style.display = 'none';
}

// Sticky header scroll detection
function handleScroll() {
  const header = document.querySelector('.main-header');
  const isMobile = window.innerWidth <= 600;

  if (isMobile) {
    header.classList.add('scrolled');
  } else if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

// Add scroll event listener
window.addEventListener('scroll', handleScroll);

// Call handleScroll on page load to set initial state
handleScroll();

function showFeedback(html, className) {
  feedback.textContent = '';
  feedback.classList.remove('feedback-correct', 'feedback-incorrect');
  requestAnimationFrame(() => {
    feedback.innerHTML = html;
    feedback.classList.add(className);
  });
}
