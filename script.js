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

function getChordNotes(rootNote, chordType) {
  const rootIndex = noteMap.indexOf(rootNote);
  return chords[chordType].map(interval => noteMap[(rootIndex + interval) % 12]);
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
      dot.style.top = `${fret === 12 ? height / 2 - 30 : height / 2}px`;
      fretboard.appendChild(dot);

      if (fret === 12) {
        const dot2 = dot.cloneNode();
        dot2.style.top = `${height / 2 + 30}px`;
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

  // Add note labels if toggle is enabled
  if (showNotes) {
    for (let string = 0; string < 6; string++) {
      for (let fret = 0; fret <= 12; fret++) {
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

  if (mode === 'interval' || mode === 'chord') {
    stringSelect.style.display = 'none';
    noteTypeSelect.style.display = 'none';
  } else {
    stringSelect.style.display = 'flex';
    noteTypeSelect.style.display = 'flex';
  }
}

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

    const chordName = chordType === 'major' ? 'major' :
                     chordType === 'minor' ? 'minor' :
                     chordType === 'diminished' ? 'diminished' :
                     chordType === 'augmented' ? 'augmented' :
                     chordType === 'major7' ? 'major 7th' :
                     chordType === 'minor7' ? 'minor 7th' :
                     chordType === 'dominant7' ? 'dominant 7th' : 'diminished 7th';

    taskDisplay.textContent = `Find all the notes in ${rootNote} ${chordName} chord`;
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
    fret = Math.floor(Math.random() * 12) + 1;
    note = noteAt(string, fret);
  } while (!isNoteValid(note));

  target = { string, fret, note };
  const displayString = ordinal(string + 1);
  taskDisplay.textContent = `Click on the ${note} note on the ${displayString} string.`;
}

function handleClick(e) {
  const mode = modeSelect.value;
  const visualIndex = parseInt(e.currentTarget.dataset.string);
  const clickedString = visualIndex;
  const selected = stringSelect.value;

  const x = event.offsetX;
  const width = fretboard.clientWidth;
  const fret = Math.floor((x / (width / 12))) + 1;
  const note = noteAt(clickedString, fret);

  const edgeMargin = 0.05;
  const y = edgeMargin * fretboard.clientHeight + (clickedString / 5) * (fretboard.clientHeight * (1 - 2 * edgeMargin));
  const marker = document.createElement('div');
  marker.classList.add('marker');
  marker.style.left = `${x}px`;
  marker.style.top = `${y}px`;

  if (mode === 'interval') {
    const expectedNote = noteMap[(noteMap.indexOf(target.root) + target.semitones) % 12];
    if (note === expectedNote) {
      marker.classList.add('correct');
      showFeedback(`<div>✅ Good!</div><div style="font-size: 14px; color: #aaa;">You found ${note} correctly!</div>`, 'feedback-correct');
      createParticles(e.clientX, e.clientY, true);
      fretboard.appendChild(marker);
      setTimeout(() => {
        renderFretboard();
        newTask();
      }, 2000);
    } else {
      marker.classList.add('incorrect');
      showFeedback(`<div>❌ OOPS</div><div style="font-size: 14px; color: #aaa;">You clicked ${note}. Expected ${expectedNote}.</div>`, 'feedback-incorrect');
      createParticles(e.clientX, e.clientY, false);
      fretboard.appendChild(marker);
    }
    return;
  } else if (mode === 'chord') {
    if (target.chordNotes.includes(note)) {
      if (target.selectedNotes.includes(note)) {
        // Note already selected
        marker.classList.add('incorrect');
        showFeedback(`<div>❌ Already found!</div><div style="font-size: 14px; color: #aaa;">You already found ${note}. Find the remaining notes: ${target.chordNotes.filter(n => !target.selectedNotes.includes(n)).join(', ')}</div>`, 'feedback-incorrect');
        createParticles(e.clientX, e.clientY, false);
      } else {
        // Correct note, add to selected
        target.selectedNotes.push(note);
        // Track the specific position clicked
        clickedPositions.push({ string: clickedString, fret: fret });
        marker.classList.add('correct');

        if (target.selectedNotes.length === target.chordNotes.length) {
          // Chord complete!
          showFeedback(`<div>✅ Chord Complete!</div><div style="font-size: 14px; color: #aaa;">You found all notes in ${target.root} ${target.chordType} chord!</div>`, 'feedback-correct');
          createParticles(e.clientX, e.clientY, true);
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
          createParticles(e.clientX, e.clientY, true);
        }
      }
    } else {
      // Wrong note
      marker.classList.add('incorrect');
      showFeedback(`<div>❌ Not in chord!</div><div style="font-size: 14px; color: #aaa;">${note} is not in ${target.root} ${target.chordType} chord. Need: ${target.chordNotes.filter(n => !target.selectedNotes.includes(n)).join(', ')}</div>`, 'feedback-incorrect');
      createParticles(e.clientX, e.clientY, false);
      // Track the specific incorrect position clicked
      incorrectPositions.push({ string: clickedString, fret: fret });
    }

    fretboard.appendChild(marker);

    // Only redraw and clear feedback when the chord is completed (handled above)
    return;
  }

  marker.classList.add('marker');
  marker.style.left = `${x}px`;
  marker.style.top = `${y}px`;

  if (note === target.note && clickedString === target.string) {
    marker.classList.add('correct');
    showFeedback(`<div>✅ Good!</div><div style="font-size: 14px; color: #aaa;">You found ${note} on the ${ordinal(clickedString + 1)} string!</div>`, 'feedback-correct');
    createParticles(e.clientX, e.clientY, true);
    fretboard.appendChild(marker);
    setTimeout(() => {
      renderFretboard();
      newTask();
    }, 2000);
  } else {
    const expectedString = target.string;
    const expectedFret = target.fret;
    const expectedNote = target.note;
    const expectedStringLabel = ordinal(expectedString + 1);
    const actualStringLabel = ordinal(clickedString + 1);
    marker.classList.add('incorrect');
    showFeedback(`<div>❌ OOPS</div><div style="font-size: 14px; color: #aaa;">You clicked ${note} on the ${actualStringLabel} string. Expected ${expectedNote} on the ${expectedStringLabel} string.</div>`, 'feedback-incorrect');
    createParticles(e.clientX, e.clientY, false);
    fretboard.appendChild(marker);
  }
}

document.getElementById('new-task').addEventListener('click', () => {
  // Clear chord training state when manually refreshing
  if (modeSelect.value === 'chord') {
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
  if (mode === 'interval') {
    const intervalContent = `
      <h3>Interval Reference Guide</h3>
      <div class="interval-row">
        <span class="interval-name">Minor 2nd</span>
        <span class="interval-semitone">1 semitone</span>
        <span class="interval-description">Half step up (e.g., C to C#)</span>
      </div>
      <div class="interval-row">
        <span class="interval-name">Major 2nd</span>
        <span class="interval-semitone">2 semitones</span>
        <span class="interval-description">Whole step up (e.g., C to D)</span>
      </div>
      <div class="interval-row">
        <span class="interval-name">Minor 3rd</span>
        <span class="interval-semitone">3 semitones</span>
        <span class="interval-description">Three half steps up (e.g., C to D#)</span>
      </div>
      <div class="interval-row">
        <span class="interval-name">Major 3rd</span>
        <span class="interval-semitone">4 semitones</span>
        <span class="interval-description">Four half steps up (e.g., C to E)</span>
      </div>
      <div class="interval-row">
        <span class="interval-name">Perfect 4th</span>
        <span class="interval-semitone">5 semitones</span>
        <span class="interval-description">Five half steps up (e.g., C to F)</span>
      </div>
      <div class="interval-row">
        <span class="interval-name">Tritone</span>
        <span class="interval-semitone">6 semitones</span>
        <span class="interval-description">Six half steps up (e.g., C to F#)</span>
      </div>
      <div class="interval-row">
        <span class="interval-name">Perfect 5th</span>
        <span class="interval-semitone">7 semitones</span>
        <span class="interval-description">Seven half steps up (e.g., C to G)</span>
      </div>
      <div class="interval-row">
        <span class="interval-name">Minor 6th</span>
        <span class="interval-semitone">8 semitones</span>
        <span class="interval-description">Eight half steps up (e.g., C to G#)</span>
      </div>
      <div class="interval-row">
        <span class="interval-name">Major 6th</span>
        <span class="interval-semitone">9 semitones</span>
        <span class="interval-description">Nine half steps up (e.g., C to A)</span>
      </div>
      <div class="interval-row">
        <span class="interval-name">Minor 7th</span>
        <span class="interval-semitone">10 semitones</span>
        <span class="interval-description">Ten half steps up (e.g., C to A#)</span>
      </div>
      <div class="interval-row">
        <span class="interval-name">Major 7th</span>
        <span class="interval-semitone">11 semitones</span>
        <span class="interval-description">Eleven half steps up (e.g., C to B)</span>
      </div>
      <div class="interval-row">
        <span class="interval-name">Octave</span>
        <span class="interval-semitone">12 semitones</span>
        <span class="interval-description">Twelve half steps up (e.g., C to C)</span>
      </div>
    `;
    showModal(intervalContent);
  } else if (mode === 'chord') {
    const chordContent = `
      <h3>Chord Training Guide</h3>
      <div style="text-align: left; padding-left: 20px">
        <p style="margin-bottom: 20px; line-height: 1.6;">Chord training helps you understand the building blocks of harmony. Each chord type has a specific formula:</p>
      </div>

      <div class="interval-row">
        <span class="interval-name">Major</span>
        <span class="interval-semitone">Root + M3 + P5</span>
        <span class="interval-description">Root + Major 3rd + Perfect 5th (e.g., C major = C, E, G)</span>
      </div>
      <div class="interval-row">
        <span class="interval-name">Minor</span>
        <span class="interval-semitone">Root + m3 + P5</span>
        <span class="interval-description">Root + Minor 3rd + Perfect 5th (e.g., C minor = C, D#, G)</span>
      </div>
      <div class="interval-row">
        <span class="interval-name">Diminished</span>
        <span class="interval-semitone">Root + m3 + d5</span>
        <span class="interval-description">Root + Minor 3rd + Diminished 5th (e.g., C diminished = C, D#, F#)</span>
      </div>
      <div class="interval-row">
        <span class="interval-name">Augmented</span>
        <span class="interval-semitone">Root + M3 + A5</span>
        <span class="interval-description">Root + Major 3rd + Augmented 5th (e.g., C augmented = C, E, G#)</span>
      </div>
      <div class="interval-row">
        <span class="interval-name">Major 7th</span>
        <span class="interval-semitone">Root + M3 + P5 + M7</span>
        <span class="interval-description">Root + Major 3rd + Perfect 5th + Major 7th (e.g., C major 7 = C, E, G, B)</span>
      </div>
      <div class="interval-row">
        <span class="interval-name">Minor 7th</span>
        <span class="interval-semitone">Root + m3 + P5 + m7</span>
        <span class="interval-description">Root + Minor 3rd + Perfect 5th + Minor 7th (e.g., C minor 7 = C, D#, G, A#)</span>
      </div>
      <div class="interval-row">
        <span class="interval-name">Dominant 7th</span>
        <span class="interval-semitone">Root + M3 + P5 + m7</span>
        <span class="interval-description">Root + Major 3rd + Perfect 5th + Minor 7th (e.g., C dominant 7 = C, E, G, A#)</span>
      </div>
      <div class="interval-row">
        <span class="interval-name">Diminished 7th</span>
        <span class="interval-semitone">Root + m3 + d5 + d7</span>
        <span class="interval-description">Root + Minor 3rd + Diminished 5th + Diminished 7th (e.g., C diminished 7 = C, D#, F#, A)</span>
      </div>

      <div style="text-align: left; padding-left: 20px; margin-top: 20px;">
        <p style="line-height: 1.6;"><strong>Tip:</strong> Use the "Show Notes" toggle to help visualize the fretboard while learning!</p>
      </div>
    `;
    showModal(chordContent);
  } else {
    const noteContent = `
      <h3>Note Training Tips</h3>
      <p style="margin-bottom: 20px; line-height: 1.6;">Hint - limit the questions to a single string to focus your learning on one string at a time if you find learning the whole fretboard at the same time overwhelming.</p>
    `;
    showModal(noteContent);
  }
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
  const pageY = y;

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
  } else {
    instructionsTitle.textContent = 'Note Training';
    instructionsText.textContent = 'Knowing the notes of the guitar neck from memory is one of the most powerful things you can do as a guitarist. It unlocks fluency, creativity, and precision in virtually every area of your playing. Test your knowledge by  guessing the note on the fretboard.';
  }
}

function showModal(content) {
  const modalOverlay = document.getElementById('modal-overlay');
  const modalContent = document.getElementById('modal-content-inner');
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
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

// Add scroll event listener
window.addEventListener('scroll', handleScroll);

function showFeedback(html, className) {
  feedback.textContent = '';
  feedback.classList.remove('feedback-correct', 'feedback-incorrect');
  void feedback.offsetWidth; // force reflow for animation
  feedback.innerHTML = html;
  feedback.classList.add(className);
}
