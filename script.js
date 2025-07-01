// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

// Guitar string notes (from high E to low E)
const NOTES = ['E', 'B', 'G', 'D', 'A', 'E'];

// Chromatic scale for note calculations
const NOTE_MAP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// String offsets for note calculation (how many semitones each open string is from C)
// High E (string 1) = 4 semitones above C, B (string 2) = 11 semitones above C, etc.
const STRING_OFFSETS = [4, 11, 7, 2, 9, 4];

// Fretboard layout constants
const FRET_COUNT = 13; // 0-12 frets (including open strings)
const DOT_FRETS = [3, 5, 7, 9, 12]; // Standard fretboard dot positions
const EDGE_MARGIN = 0.05; // 5% margin from top/bottom edges for string positioning
const OPEN_STRING_HITBOX_WIDTH = 20; // Width of clickable area for open strings
const OPEN_STRING_HITBOX_HEIGHT = 12; // Height of clickable area for open strings
const OPEN_STRING_LEFT_OFFSET = -14; // X position for open string labels and hitboxes
const FRET_LABEL_OFFSET = 0.5; // Position fret labels between frets (0.5 = halfway)
const DOT_OFFSET_FROM_CENTER = 45; // Distance of 12th fret dots from center (in pixels)

// Particle animation constants
const PARTICLE_COUNT = 1;
const PARTICLE_SIZE = 18; // Size of particle in pixels
const PARTICLE_SPREAD_X = 60; // Maximum horizontal spread for particles
const PARTICLE_SPREAD_Y = 60; // Maximum vertical spread for particles
const PARTICLE_ANIMATION_DURATION = 1000; // Animation duration in milliseconds

// UI feedback timing
const FEEDBACK_DISPLAY_DURATION = 2000; // How long to show success feedback before next task

// ============================================================================
// CHORD AND SCALE DEFINITIONS
// ============================================================================

// Chord definitions (intervals from root note)
const CHORDS = {
  'major': [0, 4, 7], // root, major 3rd, perfect 5th
  'minor': [0, 3, 7], // root, minor 3rd, perfect 5th
  'diminished': [0, 3, 6], // root, minor 3rd, diminished 5th
  'augmented': [0, 4, 8], // root, major 3rd, augmented 5th
  'major7': [0, 4, 7, 11], // root, major 3rd, perfect 5th, major 7th
  'minor7': [0, 3, 7, 10], // root, minor 3rd, perfect 5th, minor 7th
  'dominant7': [0, 4, 7, 10], // root, major 3rd, perfect 5th, minor 7th
  'diminished7': [0, 3, 6, 9], // root, minor 3rd, diminished 5th, diminished 7th
};

// Scale definitions (intervals from root note)
const SCALES = {
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

// Interval definitions for interval training
const INTERVALS = [
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

// Display name mappings
const CHORD_NAME_MAP = {
  'major': 'major',
  'minor': 'minor',
  'diminished': 'diminished',
  'augmented': 'augmented',
  'major7': 'major 7th',
  'minor7': 'minor 7th',
  'dominant7': 'dominant 7th',
  'diminished7': 'diminished 7th'
};

const SCALE_NAME_MAP = {
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

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const fretboard = document.getElementById('fretboard');
const taskDisplay = document.getElementById('task-text');
const feedback = document.getElementById('feedback');
const stringSelect = document.getElementById('string-select');
const noteTypeSelect = document.getElementById('note-type-select');
const modeSelect = document.getElementById('mode-select');
const showNotesToggle = document.getElementById('show-notes-toggle');
const intervalCheatsheet = document.getElementById('interval-cheatsheet');

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let target = {}; // Current training target
let clickedPositions = []; // Track clicked positions for chord/scale training
let incorrectPositions = []; // Track incorrect positions for chord/scale training

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get the note at a specific string and fret position
 * @param {number} stringIndex - String index (0-5, where 0 is high E)
 * @param {number} fret - Fret number (0-12, where 0 is open string)
 * @returns {string} The note name (e.g., 'C', 'F#')
 */
function getNoteAt(stringIndex, fret) {
  const baseNoteIndex = STRING_OFFSETS[stringIndex];
  return NOTE_MAP[(baseNoteIndex + fret) % 12];
}

/**
 * Check if a note is valid based on current note type filter
 * @param {string} note - Note to validate
 * @returns {boolean} Whether the note is valid
 */
function isNoteValid(note) {
  const type = noteTypeSelect.value;
  const isNatural = !note.includes('#');

  if (type === 'all') return true;
  if (type === 'natural') return isNatural;
  if (type === 'accidental') return !isNatural;
  return true;
}

/**
 * Format a number as an ordinal (1st, 2nd, 3rd, etc.)
 * @param {number} n - Number to format
 * @returns {string} Ordinal string
 */
function formatOrdinal(n) {
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  return `${n}th`;
}

/**
 * Format fret description for display
 * @param {number} fret - Fret number
 * @returns {string} Formatted fret description
 */
function formatFretDescription(fret) {
  if (fret === 0) return 'open';
  return `${fret}${fret === 1 ? 'st' : fret === 2 ? 'nd' : fret === 3 ? 'rd' : 'th'} fret`;
}

/**
 * Get chord notes for a given root note and chord type
 * @param {string} rootNote - Root note of the chord
 * @param {string} chordType - Type of chord
 * @returns {string[]} Array of note names in the chord
 */
function getChordNotes(rootNote, chordType) {
  const rootIndex = NOTE_MAP.indexOf(rootNote);
  return CHORDS[chordType].map(interval => NOTE_MAP[(rootIndex + interval) % 12]);
}

/**
 * Get scale notes for a given root note and scale type
 * @param {string} rootNote - Root note of the scale
 * @param {string} scaleType - Type of scale
 * @returns {string[]} Array of note names in the scale
 */
function getScaleNotes(rootNote, scaleType) {
  const rootIndex = NOTE_MAP.indexOf(rootNote);
  return SCALES[scaleType].map(interval => NOTE_MAP[(rootIndex + interval) % 12]);
}

/**
 * Calculate Y position for a string on the fretboard
 * @param {number} stringIndex - String index (0-5)
 * @param {number} height - Fretboard height
 * @returns {number} Y position in pixels
 */
function calculateStringYPosition(stringIndex, height) {
  return EDGE_MARGIN * height + (stringIndex / 5) * (height * (1 - 2 * EDGE_MARGIN));
}

/**
 * Calculate X position for a fret on the fretboard
 * @param {number} fret - Fret number
 * @param {number} width - Fretboard width
 * @returns {number} X position in pixels
 */
function calculateFretXPosition(fret, width) {
  return (fret / (FRET_COUNT - 1)) * width;
}

// ============================================================================
// FRETBOARD RENDERING
// ============================================================================

/**
 * Create a string element with hitbox for clicking
 * @param {number} stringIndex - String index (0-5)
 * @param {number} height - Fretboard height
 * @param {string} selectedString - Currently selected string filter
 * @param {string} mode - Current training mode
 * @returns {HTMLElement} String element
 */
function createStringElement(stringIndex, height, selectedString, mode) {
  const y = calculateStringYPosition(stringIndex, height);
  const div = document.createElement('div');
  div.classList.add('string-hitbox');
  div.style.top = `${y}px`;
  div.dataset.string = stringIndex;

  // Add glow effect for selected string in note training mode
  if (selectedString !== 'all' && stringIndex === parseInt(selectedString) - 1 && mode !== 'interval') {
    div.classList.add('glow');
  }

  div.addEventListener('click', handleClick);

  const line = document.createElement('div');
  line.classList.add('string-line');
  div.appendChild(line);

  return div;
}

/**
 * Create fret lines and labels
 * @param {number} width - Fretboard width
 * @param {number} height - Fretboard height
 */
function createFretElements(width, height) {
  for (let fret = 0; fret < FRET_COUNT; fret++) {
    const x = calculateFretXPosition(fret, width);

    // Create fret line
    const line = document.createElement('div');
    line.classList.add('fret-line');
    line.style.left = `${x}px`;
    fretboard.appendChild(line);

    // Add fret labels between frets, starting from 1
    if (fret > 0) {
      const label = document.createElement('div');
      label.classList.add('fret-label');
      // Position label between the previous fret and current fret
      const labelX = ((fret - FRET_LABEL_OFFSET) / (FRET_COUNT - 1)) * width;
      label.style.left = `${labelX}px`;
      label.textContent = fret;
      fretboard.appendChild(label);
    }

    // Add dot markers at standard positions
    if (DOT_FRETS.includes(fret)) {
      const dot = document.createElement('div');
      dot.classList.add('dot-marker');
      dot.style.left = `${x - (width / (FRET_COUNT - 1)) / 2}px`;
      dot.style.top = `${fret === 12 ? height / 2 - DOT_OFFSET_FROM_CENTER : height / 2}px`;
      fretboard.appendChild(dot);

      // 12th fret has two dots
      if (fret === 12) {
        const dot2 = dot.cloneNode();
        dot2.style.top = `${height / 2 + DOT_OFFSET_FROM_CENTER}px`;
        fretboard.appendChild(dot2);
      }
    }
  }
}

/**
 * Create open string elements with labels and hitboxes
 * @param {number} height - Fretboard height
 */
function createOpenStringElements(height) {
  for (let string = 0; string < 6; string++) {
    const note = getNoteAt(string, 0);
    const y = calculateStringYPosition(string, height);

    // Create clickable area for open string
    const openStringHitbox = document.createElement('div');
    openStringHitbox.classList.add('open-string-hitbox');
    openStringHitbox.style.position = 'absolute';
    openStringHitbox.style.left = `${OPEN_STRING_LEFT_OFFSET}px`;
    openStringHitbox.style.top = `${y - 6}px`; // 6px offset to center the hitbox
    openStringHitbox.style.width = `${OPEN_STRING_HITBOX_WIDTH}px`;
    openStringHitbox.style.height = `${OPEN_STRING_HITBOX_HEIGHT}px`;
    openStringHitbox.style.cursor = 'pointer';
    openStringHitbox.dataset.string = string;
    openStringHitbox.dataset.fret = '0';
    openStringHitbox.addEventListener('click', handleClick);
    fretboard.appendChild(openStringHitbox);

    // Create note label
    const noteLabel = document.createElement('div');
    noteLabel.classList.add('note-label');
    noteLabel.classList.add(note.includes('#') ? 'accidental' : 'natural');
    noteLabel.style.left = `${OPEN_STRING_LEFT_OFFSET}px`;
    noteLabel.style.top = `${y}px`;
    noteLabel.textContent = note;
    fretboard.appendChild(noteLabel);
  }
}

/**
 * Create note labels for all fretted positions
 * @param {number} width - Fretboard width
 * @param {number} height - Fretboard height
 */
function createFrettedNoteLabels(width, height) {
  for (let string = 0; string < 6; string++) {
    for (let fret = 1; fret <= 12; fret++) { // Start from fret 1 since fret 0 is handled above
      const note = getNoteAt(string, fret);
      const x = calculateFretXPosition(fret, width);
      const y = calculateStringYPosition(string, height);

      const noteLabel = document.createElement('div');
      noteLabel.classList.add('note-label');
      noteLabel.classList.add(note.includes('#') ? 'accidental' : 'natural');
      // Position notes in the gap before the fret (between previous fret and current fret)
      noteLabel.style.left = `${x - (width / (FRET_COUNT - 1)) / 2}px`;
      noteLabel.style.top = `${y}px`;
      noteLabel.textContent = note;
      fretboard.appendChild(noteLabel);
    }
  }
}

/**
 * Create markers for previously clicked positions
 * @param {Array} positions - Array of position objects
 * @param {string} markerClass - CSS class for the marker ('correct' or 'incorrect')
 * @param {number} width - Fretboard width
 * @param {number} height - Fretboard height
 */
function createPositionMarkers(positions, markerClass, width, height) {
  positions.forEach(pos => {
    const x = pos.fret === 0 ? OPEN_STRING_LEFT_OFFSET : (pos.fret - 1 + 0.5) * (width / 12);
    const y = calculateStringYPosition(pos.string, height);
    const marker = document.createElement('div');
    marker.classList.add('marker', markerClass);
    marker.style.left = `${x}px`;
    marker.style.top = `${y}px`;
    fretboard.appendChild(marker);
  });
}

/**
 * Render the complete fretboard with all elements
 */
function renderFretboard() {
  fretboard.innerHTML = '';
  feedback.textContent = '';
  feedback.classList.remove('feedback-correct', 'feedback-incorrect');

  const width = fretboard.clientWidth;
  const height = fretboard.clientHeight;
  const selectedString = stringSelect.value;
  const mode = modeSelect.value;
  const showNotes = showNotesToggle.checked;

  // Create string elements
  for (let string = 0; string < 6; string++) {
    const stringElement = createStringElement(string, height, selectedString, mode);
    fretboard.appendChild(stringElement);
  }

  // Create fret elements
  createFretElements(width, height);

  // Show previously selected positions for chord/scale training
  if (mode === 'chord' || mode === 'scale') {
    if (clickedPositions.length > 0) {
      createPositionMarkers(clickedPositions, 'correct', width, height);
    }
    if (incorrectPositions.length > 0) {
      createPositionMarkers(incorrectPositions, 'incorrect', width, height);
    }
  }

  // Create open string elements
  createOpenStringElements(height);

  // Add note labels for all frets if toggle is enabled
  if (showNotes) {
    createFrettedNoteLabels(width, height);
  }
}

// ============================================================================
// TASK GENERATION
// ============================================================================

/**
 * Generate a new interval training task
 */
function generateIntervalTask() {
  const rootNote = NOTE_MAP[Math.floor(Math.random() * 12)];
  const interval = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];

  target = {
    mode: 'interval',
    root: rootNote,
    semitones: interval.semitones,
    intervalName: interval.name
  };

  taskDisplay.textContent = `Find the ${interval.name} from ${rootNote}`;
}

/**
 * Generate a new chord training task
 */
function generateChordTask() {
  const chordTypes = Object.keys(CHORDS);
  const chordType = chordTypes[Math.floor(Math.random() * chordTypes.length)];
  const rootNote = NOTE_MAP[Math.floor(Math.random() * 12)];
  const chordNotes = getChordNotes(rootNote, chordType);

  // Clear previous state
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

  const chordName = CHORD_NAME_MAP[chordType];
  taskDisplay.textContent = `Find all the notes in ${rootNote} ${chordName} chord`;
}

/**
 * Generate a new scale training task
 */
function generateScaleTask() {
  const scaleTypes = Object.keys(SCALES);
  const scaleType = scaleTypes[Math.floor(Math.random() * scaleTypes.length)];
  const rootNote = NOTE_MAP[Math.floor(Math.random() * 12)];
  const scaleNotes = getScaleNotes(rootNote, scaleType);

  // Clear previous state
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

  const scaleName = SCALE_NAME_MAP[scaleType];
  taskDisplay.textContent = `Find all the notes in ${rootNote} ${scaleName} scale`;
}

/**
 * Generate a new note training task
 */
function generateNoteTask() {
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
    note = getNoteAt(string, fret);
  } while (!isNoteValid(note));

  target = { string, fret, note };
  const displayString = formatOrdinal(string + 1);
  taskDisplay.textContent = `Click on the ${note} note on the ${displayString}.`;
}

/**
 * Generate a new training task based on current mode
 */
function newTask() {
  const mode = modeSelect.value;

  switch (mode) {
    case 'interval':
      generateIntervalTask();
      break;
    case 'chord':
      generateChordTask();
      break;
    case 'scale':
      generateScaleTask();
      break;
    default:
      generateNoteTask();
      break;
  }
}

// ============================================================================
// CLICK HANDLING
// ============================================================================

/**
 * Calculate fret number from click position
 * @param {number} offsetX - X offset of click
 * @param {number} width - Fretboard width
 * @returns {number} Fret number (1-12)
 */
function calculateFretFromClick(offsetX, width) {
  return Math.floor((offsetX / (width / 12))) + 1;
}

/**
 * Create a marker element at the clicked position
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {HTMLElement} Marker element
 */
function createClickMarker(x, y) {
  const marker = document.createElement('div');
  marker.classList.add('marker');
  marker.style.left = `${x}px`;
  marker.style.top = `${y}px`;
  return marker;
}

/**
 * Handle interval training click
 * @param {string} note - Clicked note
 * @param {number} x - Fretboard-relative X coordinate
 * @param {number} y - Y position for marker
 * @param {number} clientX - Page X coordinate for particles
 * @param {number} clientY - Page Y coordinate for particles
 */
function handleIntervalClick(note, x, y, clientX, clientY) {
  const expectedNote = NOTE_MAP[(NOTE_MAP.indexOf(target.root) + target.semitones) % 12];
  const marker = createClickMarker(x, y);

  if (note === expectedNote) {
    marker.classList.add('correct');
    showFeedback(`<div>✅ Good!</div><div style="font-size: 14px; color: #aaa;">You found ${note} correctly!</div>`, 'feedback-correct');
    createParticles(clientX, clientY, true);
    fretboard.appendChild(marker);
    setTimeout(() => {
      renderFretboard();
      newTask();
    }, FEEDBACK_DISPLAY_DURATION);
  } else {
    marker.classList.add('incorrect');
    showFeedback(`<div>❌ OOPS</div><div style="font-size: 14px; color: #aaa;">You clicked ${note}. Expected ${expectedNote}.</div>`, 'feedback-incorrect');
    createParticles(clientX, clientY, false);
    fretboard.appendChild(marker);
  }
}

/**
 * Handle chord training click
 * @param {string} note - Clicked note
 * @param {number} clickedString - String index
 * @param {number} fret - Fret number
 * @param {number} x - Fretboard-relative X coordinate
 * @param {number} y - Y position for marker
 * @param {number} clientX - Page X coordinate for particles
 * @param {number} clientY - Page Y coordinate for particles
 */
function handleChordClick(note, clickedString, fret, x, y, clientX, clientY) {
  const marker = createClickMarker(x, y);

  // Check if this string already has a note selected
  const stringAlreadyUsed = clickedPositions.some(pos => pos.string === clickedString);

      if (stringAlreadyUsed) {
      marker.classList.add('incorrect');
      showFeedback(`<div>❌ String already used!</div><div style="font-size: 14px; color: #aaa;">You already selected a note on the ${formatOrdinal(clickedString + 1)} string. Choose a different string.</div>`, 'feedback-incorrect');
      createParticles(clientX, clientY, false);
      fretboard.appendChild(marker);
      return;
    }

  if (target.chordNotes.includes(note)) {
    // Correct note, add to selected
    target.selectedNotes.push(note);
    clickedPositions.push({ string: clickedString, fret: fret });
    marker.classList.add('correct');

    // Count unique notes for completion check
    const uniqueSelectedNotes = [...new Set(target.selectedNotes)];

          if (uniqueSelectedNotes.length === target.chordNotes.length) {
        // Chord complete!
        showFeedback(`<div>✅ Chord Complete!</div><div style="font-size: 14px; color: #aaa;">You found all notes in ${target.root} ${target.chordType} chord!</div>`, 'feedback-correct');
        createParticles(clientX, clientY, true);
        target.completed = true;
        setTimeout(() => {
          // Clear selected notes and clicked positions for next task
          target.selectedNotes = [];
          clickedPositions = [];
          incorrectPositions = [];
          renderFretboard();
          newTask();
        }, FEEDBACK_DISPLAY_DURATION);
      } else {
        // Still more notes to find
        showFeedback(`<div>✅ Good!</div><div style="font-size: 14px; color: #aaa;">Found ${note}.</div>`, 'feedback-correct');
        createParticles(clientX, clientY, true);
      }
    } else {
      // Wrong note
      marker.classList.add('incorrect');
      showFeedback(`<div>❌ Not in chord!</div><div style="font-size: 14px; color: #aaa;">${note} is not in ${target.root} ${target.chordType} chord. Need: ${target.chordNotes.filter(n => !target.selectedNotes.includes(n)).join(', ')}</div>`, 'feedback-incorrect');
      createParticles(clientX, clientY, false);
      incorrectPositions.push({ string: clickedString, fret: fret });
    }

  fretboard.appendChild(marker);
}

/**
 * Handle scale training click
 * @param {string} note - Clicked note
 * @param {number} clickedString - String index
 * @param {number} fret - Fret number
 * @param {number} x - Fretboard-relative X coordinate
 * @param {number} y - Y position for marker
 * @param {number} clientX - Page X coordinate for particles
 * @param {number} clientY - Page Y coordinate for particles
 */
function handleScaleClick(note, clickedString, fret, x, y, clientX, clientY) {
  const marker = createClickMarker(x, y);

  if (target.scaleNotes.includes(note)) {
          if (target.selectedNotes.includes(note)) {
        // Note already selected
        marker.classList.add('incorrect');
        showFeedback(`<div>❌ Already found!</div><div style="font-size: 14px; color: #aaa;">You already found ${note}. Find the remaining notes: ${target.scaleNotes.filter(n => !target.selectedNotes.includes(n)).join(', ')}</div>`, 'feedback-incorrect');
        createParticles(clientX, clientY, false);
      } else {
        // Correct note, add to selected
        target.selectedNotes.push(note);
        clickedPositions.push({ string: clickedString, fret: fret });
        marker.classList.add('correct');

        if (target.selectedNotes.length === target.scaleNotes.length) {
          // Scale complete!
          const scaleName = SCALE_NAME_MAP[target.scaleType];
          showFeedback(`<div>✅ Scale Complete!</div><div style="font-size: 14px; color: #aaa;">You found all notes in ${target.root} ${scaleName} scale!</div>`, 'feedback-correct');
          createParticles(clientX, clientY, true);
          target.completed = true;
          setTimeout(() => {
            // Clear selected notes and clicked positions for next task
            target.selectedNotes = [];
            clickedPositions = [];
            incorrectPositions = [];
            renderFretboard();
            newTask();
          }, FEEDBACK_DISPLAY_DURATION);
        } else {
          // Still more notes to find
          showFeedback(`<div>✅ Good!</div><div style="font-size: 14px; color: #aaa;">Found ${note}.</div>`, 'feedback-correct');
          createParticles(clientX, clientY, true);
        }
      }
    } else {
      // Wrong note
      marker.classList.add('incorrect');
      showFeedback(`<div>❌ Not in scale!</div><div style="font-size: 14px; color: #aaa;">${note} is not in ${target.root} ${target.scaleType} scale. Need: ${target.scaleNotes.filter(n => !target.selectedNotes.includes(n)).join(', ')}</div>`, 'feedback-incorrect');
      createParticles(clientX, clientY, false);
      incorrectPositions.push({ string: clickedString, fret: fret });
    }

  fretboard.appendChild(marker);
}

/**
 * Handle note training click
 * @param {string} note - Clicked note
 * @param {number} clickedString - String index
 * @param {number} fret - Fret number
 * @param {number} x - Fretboard-relative X coordinate
 * @param {number} y - Y position for marker
 * @param {number} clientX - Page X coordinate for particles
 * @param {number} clientY - Page Y coordinate for particles
 */
function handleNoteClick(note, clickedString, fret, x, y, clientX, clientY) {
  const marker = createClickMarker(x, y);

  if (note === target.note && clickedString === target.string) {
    marker.classList.add('correct');
    const fretDescription = formatFretDescription(target.fret);
    showFeedback(`<div>✅ Good!</div><div style="font-size: 14px; color: #aaa;">You found ${note} on the ${formatOrdinal(clickedString + 1)} string (${fretDescription})!</div>`, 'feedback-correct');
    createParticles(clientX, clientY, true);
    fretboard.appendChild(marker);
    setTimeout(() => {
      renderFretboard();
      newTask();
    }, FEEDBACK_DISPLAY_DURATION);
  } else {
    const expectedString = target.string;
    const expectedNote = target.note;
    const expectedStringLabel = formatOrdinal(expectedString + 1);
    const actualStringLabel = formatOrdinal(clickedString + 1);
    const expectedFretDescription = formatFretDescription(target.fret);
    marker.classList.add('incorrect');
    showFeedback(`<div>❌ OOPS</div><div style="font-size: 14px; color: #aaa;">You clicked ${note} on the ${actualStringLabel} string. Expected ${note} on the ${expectedStringLabel} string (${expectedFretDescription}).</div>`, 'feedback-incorrect');
    createParticles(clientX, clientY, false);
    fretboard.appendChild(marker);
  }
}

/**
 * Main click handler for all training modes
 * @param {Event} e - Click event
 */
function handleClick(e) {
  const mode = modeSelect.value;
  const visualIndex = parseInt(e.currentTarget.dataset.string);
  const clickedString = visualIndex;

  // Check if this is an open string click
  const isOpenString = e.currentTarget.classList.contains('open-string-hitbox');
  let fret, note, x, y;

  const height = fretboard.clientHeight;

  if (isOpenString) {
    fret = 0;
    note = getNoteAt(clickedString, 0);
    x = OPEN_STRING_LEFT_OFFSET;
    y = calculateStringYPosition(clickedString, height);
  } else {
    x = e.offsetX;
    const width = fretboard.clientWidth;
    fret = calculateFretFromClick(x, width);
    note = getNoteAt(clickedString, fret);
    y = calculateStringYPosition(clickedString, height);
  }

  // Route to appropriate handler based on mode
  switch (mode) {
    case 'interval':
      handleIntervalClick(note, x, y, e.clientX, e.clientY);
      break;
    case 'chord':
      handleChordClick(note, clickedString, fret, x, y, e.clientX, e.clientY);
      break;
    case 'scale':
      handleScaleClick(note, clickedString, fret, x, y, e.clientX, e.clientY);
      break;
    default:
      handleNoteClick(note, clickedString, fret, x, y, e.clientX, e.clientY);
      break;
  }
}

// ============================================================================
// PARTICLE ANIMATION
// ============================================================================

/**
 * Create particle animation at click position
 * @param {number} x - Page X coordinate
 * @param {number} y - Page Y coordinate
 * @param {boolean} isCorrect - Whether the click was correct
 */
function createParticles(x, y, isCorrect) {
  const colors = isCorrect ? ['#4CAF50'] : ['#f44336'];

  // Use page coordinates directly
  const pageX = x;
  const pageY = y;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    particle.style.width = PARTICLE_SIZE + 'px';
    particle.style.height = PARTICLE_SIZE + 'px';

    // Center the particle on the click point
    particle.style.left = (pageX - PARTICLE_SIZE/2) + 'px';
    particle.style.top = (pageY - PARTICLE_SIZE/2) + 'px';

    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

    // More varied movement patterns
    const spreadX = Math.random() * PARTICLE_SPREAD_X - PARTICLE_SPREAD_X/2;
    const spreadY = Math.random() * PARTICLE_SPREAD_Y - PARTICLE_SPREAD_Y/2;
    particle.style.transform = `translate(${spreadX}px, ${spreadY}px)`;

    document.body.appendChild(particle);

    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, PARTICLE_ANIMATION_DURATION);
  }
}

// ============================================================================
// UI MANAGEMENT
// ============================================================================

/**
 * Update visibility of note controls based on current mode
 */
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

/**
 * Update instructions based on current mode
 */
function updateInstructions() {
  const mode = modeSelect.value;
  const instructionsTitle = document.getElementById('instructions-title');
  const instructionsText = document.getElementById('instructions-text');

  const instructions = {
    'interval': {
      title: 'Interval Training',
      text: 'In guitar theory (and music theory in general), intervals are the building blocks of melody and harmony. An interval is the distance between two notes, measured in steps or semitones.'
    },
    'chord': {
      title: 'Chord Training',
      text: 'Learn to identify the notes that make up different chord types. Click on all the notes that belong to the given chord. You can select notes in any order, and the exercise is complete when you\'ve found all the required notes.'
    },
    'scale': {
      title: 'Scale Training',
      text: 'Master scale construction by identifying all the notes in different scale types. Click on each note that belongs to the given scale. This training helps you understand scale patterns and improves your ability to play scales across the fretboard.'
    },
    'default': {
      title: 'Note Training',
      text: 'Knowing the notes of the guitar neck from memory is one of the most powerful things you can do as a guitarist. It unlocks fluency, creativity, and precision in virtually every area of your playing. Test your knowledge by guessing the note on the fretboard.'
    }
  };

  const currentInstructions = instructions[mode] || instructions.default;
  instructionsTitle.textContent = currentInstructions.title;
  instructionsText.textContent = currentInstructions.text;
}

/**
 * Show feedback message
 * @param {string} html - HTML content to display
 * @param {string} className - CSS class for styling
 */
function showFeedback(html, className) {
  feedback.textContent = '';
  feedback.classList.remove('feedback-correct', 'feedback-incorrect');
  requestAnimationFrame(() => {
    feedback.innerHTML = html;
    feedback.classList.add(className);
  });
}

/**
 * Show modal with specified content
 * @param {string} contentId - ID of content element to display
 */
function showModal(contentId) {
  const modalOverlay = document.getElementById('modal-overlay');
  const modalContent = document.getElementById('modal-content-inner');
  const content = document.getElementById(contentId).innerHTML;
  modalContent.innerHTML = content;
  modalOverlay.style.display = 'flex';
}

/**
 * Hide modal
 */
function hideModal() {
  const modalOverlay = document.getElementById('modal-overlay');
  modalOverlay.style.display = 'none';
}

/**
 * Handle scroll events for sticky header
 */
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

// ============================================================================
// EVENT LISTENERS
// ============================================================================

// New task button
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

// Mode selection
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

// String selection
stringSelect.addEventListener('change', () => {
  renderFretboard();
  newTask();
});

// Note type selection
noteTypeSelect.addEventListener('change', () => {
  renderFretboard();
  newTask();
});

// Show notes toggle
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

// Scroll event listener
window.addEventListener('scroll', handleScroll);

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize the application
renderFretboard();
newTask();
updateInstructions();
updateNoteControlsVisibility();
handleScroll(); // Set initial scroll state
