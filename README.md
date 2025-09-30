# Advanced Chess Game

A modern, feature-rich chess game built with HTML5, CSS3, and JavaScript. This game includes a beautiful UI, move validation, game timer, move history, and many advanced features.

## Features

### 🎮 Game Features
- **Complete Chess Rules**: All standard chess piece movements and rules
- **Move Validation**: Prevents illegal moves and enforces turn-based play
- **Pawn Promotion**: Automatic queen promotion when pawns reach the end
- **Visual Feedback**: Highlighted possible moves and capture indicators
- **Turn Timer**: Configurable game timer for each player
- **Move History**: Complete record of all moves made during the game
- **Captured Pieces**: Visual display of captured pieces for both sides

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Beautiful Animations**: Smooth hover effects and transitions
- **Modern Styling**: Clean, professional appearance with gradient backgrounds
- **Interactive Elements**: Intuitive click-to-move interface
- **Visual Indicators**: Clear highlighting for selected pieces and possible moves

### ⚙️ Advanced Features
- **Game Settings**: Customizable timer, sound effects, and display options
- **Undo Function**: Take back moves when needed
- **New Game**: Start fresh games at any time
- **Game Status**: Real-time notifications and game state updates
- **Coordinates Display**: Optional board coordinates for reference

## File Structure

```
Chess/
├── chess.html          # Main game interface
├── chess.css           # Modern styling and responsive design
├── chess.js            # Complete game logic and functionality
├── assets/
│   └── images/         # Chess piece images
│       ├── Bbishop.png
│       ├── Bking.png
│       ├── Bknight.png
│       ├── Bpawn.png
│       ├── Bqueen.png
│       ├── Brook.png
│       ├── Wbishop.png
│       ├── Wking.png
│       ├── Wknight.png
│       ├── Wpawn.png
│       ├── Wqueen.png
│       └── Wrook.png
└── README.md           # This file
```

## How to Play

### Starting the Game
1. Open `chess.html` in any modern web browser
2. The game starts automatically with White to move
3. Click on a piece to select it and see possible moves
4. Click on a highlighted square to move the piece

### Game Controls
- **New Game**: Start a fresh game
- **Undo**: Take back the last move
- **Settings**: Configure game options
- **Hint**: Get suggestions for moves (future feature)

### Game Rules
- Standard chess rules apply
- White moves first
- Click a piece to see its possible moves (highlighted in green)
- Capture moves are highlighted in red
- Pawns automatically promote to queens when reaching the opposite end
- Game ends when one king is captured or time runs out

### Timer
- Each player has a configurable time limit (default: 5 minutes)
- Timer counts down during each player's turn
- Game ends if a player runs out of time

## Technical Details

### Technologies Used
- **HTML5**: Semantic markup and modern web standards
- **CSS3**: Advanced styling with flexbox, grid, and animations
- **JavaScript ES6+**: Object-oriented programming with classes
- **Font Awesome**: Icons for enhanced UI
- **Google Fonts**: Inter font family for modern typography

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Performance Features
- Efficient DOM manipulation
- Optimized event handling
- Responsive image loading
- Smooth animations with CSS transitions

## Installation & Setup

### Local Development
1. Clone or download the project files
2. Ensure all files are in the same directory structure
3. Open `chess.html` in a web browser
4. No additional setup or dependencies required

### Web Deployment
1. Upload all files to your web server
2. Maintain the directory structure
3. Ensure the `assets/images/` folder contains all piece images
4. Access via your domain URL

## Customization

### Styling
- Modify `chess.css` to change colors, fonts, or layout
- CSS custom properties (variables) make theming easy
- Responsive breakpoints can be adjusted for different screen sizes

### Game Logic
- Extend the `ChessGame` class in `chess.js` for additional features
- Add new piece types or game variants
- Implement AI opponents or online multiplayer

### Settings
- Timer durations can be configured in the settings modal
- Sound effects and visual preferences are customizable
- Board coordinates and move highlighting can be toggled

## Troubleshooting

### Images Not Loading
- Ensure all PNG files are in the `assets/images/` directory
- Check file names match exactly (case-sensitive)
- Verify image files are not corrupted

### Game Not Starting
- Check browser console for JavaScript errors
- Ensure all files are properly linked in HTML
- Verify browser supports modern JavaScript features

### Performance Issues
- Close other browser tabs to free up memory
- Disable browser extensions that might interfere
- Use a modern browser for best performance

## Future Enhancements

### Planned Features
- **AI Opponent**: Computer player with difficulty levels
- **Online Multiplayer**: Play against friends remotely
- **Game Analysis**: Move suggestions and position evaluation
- **Tournament Mode**: Multiple games and scoring
- **Custom Themes**: Additional visual themes and piece sets
- **Sound Effects**: Audio feedback for moves and captures
- **Game Export**: Save and load games in standard notation

### Contributing
This is an open-source project. Feel free to:
- Report bugs or issues
- Suggest new features
- Submit improvements
- Create custom themes or piece sets

## License

This project is open source and available under the MIT License.

## Credits

- Chess piece images: Custom designed PNG assets
- Icons: Font Awesome
- Fonts: Google Fonts (Inter)
- Design: Modern web design principles

---

**Enjoy playing chess!** 🏆

For support or questions, please refer to the troubleshooting section or check the browser console for error messages.
