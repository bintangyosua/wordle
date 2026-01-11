# Wordle - A Daily Word Game

A web-based implementation of the popular word-guessing game where players have six attempts to guess a five-letter word, with feedback provided after each guess.

## 🎮 About

Wordle is an engaging word puzzle game that challenges players to deduce a hidden five-letter word within six tries. After each guess, the game provides color-coded feedback:

- **🟩 Green**: Letter is correct and in the right position
- **🟨 Yellow**: Letter is in the word but in the wrong position
- **⬜ Gray**: Letter is not in the word

## ✨ Features

- **Daily Puzzle**: New word challenge available each day
- **Color-Coded Feedback**: Intuitive visual hints for each guess
- **Dark Mode**: Eye-friendly dark theme option
- **Colorblind Mode**: Accessible color scheme for colorblind users
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Share Results**: Share your score without spoilers
- **Statistics Tracking**: Monitor your winning streaks and guess distribution

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No additional dependencies required

### Installation

1. Clone or download this repository:

   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```bash
   cd wordle
   ```

3. Open `index.html` in your web browser:

   - Double-click the file, or
   - Use a local server (recommended):

     ```bash
     # Using Python 3
     python -m http.server 8000

     # Using Node.js (http-server)
     npx http-server
     ```

4. Visit `http://localhost:8000` in your browser

## 🎯 How to Play

1. **Start Guessing**: Type a five-letter word and press Enter
2. **Review Feedback**: Check the color-coded tiles after each guess
3. **Adjust Strategy**: Use the feedback to narrow down possible words
4. **Win or Try Again**: You have 6 attempts to find the correct word
5. **Share Results**: Copy your results to share with friends (spoiler-free!)

## 🛠️ Technology Stack

- **HTML5**: Structure and semantic markup
- **CSS3**: Styling, animations, and responsive design
- **JavaScript**: Game logic and interactivity
- **Local Storage**: Save game state and statistics

## 📁 Project Structure

```
wordle/
├── index.html              # Main HTML file
├── js/                     # JavaScript directory
├── main.e65ce0a5.js       # Compiled JavaScript bundle
└── README.md              # Project documentation
```

## 🎨 Customization

The game includes several customizable themes and modes:

- Toggle between **Light Mode** and **Dark Mode** for different viewing preferences
- Enable **Colorblind Mode** for improved accessibility
- Settings are automatically saved to your browser's local storage

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📝 License

This project is created for educational and entertainment purposes. Original Wordle concept by Josh Wardle.

## 🙏 Acknowledgments

- Original game concept by [Josh Wardle](https://www.powerlanguage.co.uk/)
- Inspired by the daily word puzzle phenomenon
- Community feedback and suggestions

## 📧 Contact

For questions, suggestions, or feedback, please open an issue in the repository.

---

**Enjoy playing Wordle! 🎉**

_A new puzzle is available each day. Come back tomorrow for a new challenge!_
