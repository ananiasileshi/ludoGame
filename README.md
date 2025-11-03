# 🎲 LudoVerse

A modern, fully-featured Ludo board game built with vanilla JavaScript, HTML5 Canvas, and CSS3. Play locally with 2-4 players or challenge the CPU in single-player mode!

## ✨ Features

### Core Gameplay
- **Classic Ludo Rules**: Authentic implementation of traditional Ludo gameplay
- **2-4 Players**: Flexible player count (Red, Blue, Green, Yellow)
- **Local Multiplayer**: Same-device multiplayer for human players
- **CPU Opponents**: Play against AI with intelligent move prioritization
- **Three Difficulty Levels**: Easy, Medium, and Hard CPU opponents

### Game Mechanics
- ✅ Roll a 6 to move tokens out of base
- ✅ Extra turn on rolling a 6
- ✅ Capture opponent tokens on non-safe squares
- ✅ Safe squares (starting positions and home lanes)
- ✅ Exact roll required to finish
- ✅ Automatic turn progression
- ✅ Win detection when all 4 tokens reach home

### UI/UX Features
- 🎨 **Modern Design**: Clean, flat aesthetic with gradient accents
- 🌓 **Dark Mode**: Toggle between light and dark themes
- 📱 **Responsive Layout**: Works on desktop, tablet, and mobile (360px+)
- ✨ **Smooth Animations**: Token movement, dice rolling, and transitions
- 🎵 **Sound Effects**: Toggleable audio feedback for actions
- ⚡ **Animation Speed Control**: Adjust game speed to your preference
- ⌨️ **Keyboard Support**: Space/Enter to roll dice, Tab navigation
- 📊 **Game Log**: Real-time activity feed of all moves
- 🏆 **Victory Screen**: Celebratory confetti animation on win

### Persistence & History
- 💾 **Save/Load Game**: Resume games anytime with localStorage
- 📜 **Match History**: Track last 10 completed games
- ⚙️ **Settings Persistence**: Saves theme, sound, and animation preferences

## 🚀 How to Run

### Quick Start
1. Download or clone this repository
2. Open `index.html` in any modern web browser
3. Start playing!

**No build process, no server, no dependencies required!**

### Supported Browsers
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## 🎮 How to Play

### Game Setup
1. Click **"New Game"** from the main menu
2. Select number of players (2, 3, or 4)
3. Configure each player:
   - Enter player name
   - Choose Human or CPU
4. Select CPU difficulty if using AI opponents
5. Click **"Start Game"**

### Controls

#### Mouse/Touch
- **Click/Tap Dice**: Roll the dice
- **Click/Tap Token**: Move a selectable token

#### Keyboard
- **Space** or **Enter**: Roll dice
- **Tab**: Navigate UI elements
- **Enter**: Activate buttons

### Game Rules

#### Starting
- Roll a **6** to move a token from base to the starting square
- Rolling a 6 grants an extra turn

#### Movement
- Roll the dice and move one of your tokens by the number shown
- Tokens move clockwise around the board
- You can only move tokens that have legal moves

#### Capturing
- Landing on an opponent's token (on non-safe squares) sends it back to their base
- Safe squares: Starting positions and colored home lanes

#### Winning
- Move all 4 tokens into your home finish area
- Must roll exact number to land on finish square
- First player to finish all tokens wins!

## 📁 Project Structure

```
LudoVerse/
│
├── index.html          # Main HTML structure
├── styles.css          # Complete styling with themes and animations
├── app.js              # Game logic, rendering, AI, and state management
├── assets/             # Placeholder for custom icons/sounds (optional)
└── README.md           # This file
```

## 🎯 Features Breakdown

### Implemented Features

#### Game Logic
- ✅ Full Ludo rule implementation
- ✅ Token movement with path calculation
- ✅ Capture mechanics on non-safe squares
- ✅ Home lane entry and finish logic
- ✅ Extra turn on rolling 6
- ✅ Turn order management
- ✅ Win condition detection

#### Board & Rendering
- ✅ Canvas-based board (15x15 grid)
- ✅ Color-coded player bases
- ✅ Main path with 52 squares
- ✅ Home lanes for each color
- ✅ Safe square indicators
- ✅ Token rendering with numbers
- ✅ Visual selection highlights
- ✅ Responsive scaling

#### AI (CPU Players)
- ✅ Legal move validation
- ✅ Move prioritization heuristic:
  1. Finish tokens (highest priority)
  2. Capture opponent tokens
  3. Advance tokens closest to finish
  4. Move tokens out of base
- ✅ Randomized thinking delay (600-1400ms)

#### UI/UX
- ✅ Main menu with navigation
- ✅ Game setup screen
- ✅ Live game board with sidebar
- ✅ Player status cards
- ✅ Dice animation
- ✅ Game log with recent moves
- ✅ Victory screen with confetti
- ✅ Rules screen
- ✅ Settings panel
- ✅ Match history viewer

#### Persistence
- ✅ Save/Load game state
- ✅ Match history (last 10 games)
- ✅ Settings persistence
- ✅ LocalStorage integration

#### Accessibility
- ✅ Keyboard controls
- ✅ Clear visual feedback
- ✅ Responsive design
- ✅ Color-blind friendly indicators (numbers on tokens)

### Known Limitations

1. **Single Device Only**: No online multiplayer or network play
2. **Basic Sound**: Uses Web Audio API oscillators (no custom sound files)
3. **AI Difficulty**: CPU uses heuristic-based logic, not advanced AI
4. **No Undo**: Cannot undo moves after completion
5. **Browser Storage**: Save games limited to localStorage (cleared if cache is cleared)

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Semantic structure
- **CSS3**: Modern styling with CSS variables, flexbox, grid, animations
- **JavaScript ES6+**: Classes, arrow functions, async operations
- **Canvas API**: Board and token rendering
- **Web Audio API**: Sound effect generation
- **LocalStorage API**: Data persistence

### Code Architecture
- **GameState Class**: Manages game state and turn logic
- **Player Class**: Represents players and their tokens
- **Game Object**: Main controller with all game methods
- **Event-Driven**: Responsive to user interactions
- **Modular Functions**: Separated concerns (rendering, logic, UI, persistence)

### Performance
- Efficient canvas rendering
- RequestAnimationFrame for smooth animations
- Minimal DOM manipulation
- Optimized event listeners

## 🎨 Customization

### Changing Colors
Edit the `COLOR_MAP` in `app.js`:
```javascript
const COLOR_MAP = {
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#10b981',
    yellow: '#f59e0b'
};
```

### Adjusting Board Size
Modify `boardSize` in the game object (default: 15):
```javascript
boardSize: 15
```

### Custom Sounds
Replace the `playSound()` method in `app.js` with custom audio files in the `assets/` folder.

## 🐛 Troubleshooting

### Game Won't Load
- Ensure JavaScript is enabled in your browser
- Check browser console for errors (F12)
- Try a different browser

### Save/Load Not Working
- Check if browser allows localStorage
- Ensure you're not in private/incognito mode
- Clear browser cache and try again

### Canvas Not Displaying
- Update to a modern browser version
- Check if hardware acceleration is enabled
- Try resizing the browser window

## 📝 Future Enhancements (Not Implemented)

- Online multiplayer with WebRTC or WebSockets
- Custom board themes and skins
- Tournament mode with brackets
- Replay system for saved games
- Advanced AI with machine learning
- Achievements and statistics tracking
- Custom rule variations
- Drag-and-drop token movement
- Animated tutorial overlay

## 📄 License

This project is open source and available for educational and personal use.

## 🙏 Credits

Created as a demonstration of vanilla JavaScript game development.

---

**Enjoy playing LudoVerse! 🎲🎉**

For issues or suggestions, feel free to modify the code to suit your needs.
