# 🌱 GreenPacman ♻️

**GreenPacman** is an eco-themed, grid-based arcade game inspired by the classic Pac-Man. Your mission is to **clean up the grid** by collecting eco-dots and power-ups, while avoiding environmental polluters like **smog, oil spills, plastic waste, and stumps**.

---

## 🎮 Gameplay

- **Collect dots** to earn points.
- **Grab power-ups** to make polluters vulnerable.
- **Avoid polluters** unless they’re vulnerable — then you can clean them up for bonus points!
- **Clear the grid** to win the game.

---

## 🧠 Features

- Responsive 20x20 grid layout.
- Classic-style movement and enemy AI.
- Touch, keyboard, and on-screen button controls.
- Power-ups that temporarily weaken polluters.
- Local storage high score tracking.
- Color-coded maze with eco-themed assets.
- Game-over and victory overlay screens.

---

## 🕹️ Controls

### Keyboard:
- `Arrow Keys` – Move up, down, left, or right.

### Touch:
- **Swipe** in the direction you want to move.

### On-screen Buttons:
- Tap directional arrows on mobile devices.

---

## 📦 Setup & Installation

1. Clone or download the repository:

    ```bash
    git clone https://github.com/yourusername/greenpacman.git
    cd greenpacman
    ```

2. Open `index.html` in your browser.

> ✅ No additional dependencies or server setup required — it’s a **pure JavaScript/HTML/CSS** project.

---

## 🖼️ Assets

Game uses eco-friendly icons:
- `player.png` – Your green hero.
- `dot.png` – Eco-dots to collect.
- `power.png` – Power-up item.
- `smog.png`, `oil.png`, `plastic.png`, `stump.png` – Environmental polluters.

> 📁 Place all assets in a folder called `assets/` within your project directory.

---

## 🧪 Customization Tips

- **Add more polluters**: Use the `Polluter` class.
- **Design new levels**: Edit the `maze` array layout in JavaScript.
- **Change themes**: Modify wall color using the CSS `--wall-color` variable.

---

## 🏁 Win & Lose Conditions

- **Win**: Collect all eco-dots.
- **Lose**: Collide with a polluter while not powered-up.

---

## 📱 Responsive Design

The canvas scales dynamically based on screen size and maintains aspect ratio, ensuring gameplay is smooth on both desktop and mobile devices.

---

## 💾 High Score

The game automatically saves your high score using `localStorage`. It persists even after you close the tab or refresh the browser.

---

## 📃 License

MIT License. Free to use, modify, and share.

---

## 👨‍💻 Author

Created by Aashish Niranjan B.  
Feel free to contribute, fork, or provide feedback!



Created by Aashish Niranjan B.
Feel free to contribute or fork the project!
