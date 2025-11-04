# LexiQuest


[LexiQuest](https://lexi-quest-five.vercel.app/) is an interactive language learning game where players help an alien character learn Earth languages through vocabulary acquisition and story interaction.

## Overview

LexiQuest is designed as a vocabulary learning game. Players interact with an alien character who is learning human language and culture. Through feeding text to the alien, players help it understand vocabulary and grammar. The game features a progression system where the alien levels up as it learns more words, and players can review learned vocabulary to reinforce their knowledge. The game also includes a postcard system that captures memorable moments from AI-generated content, creating a personalized learning journal.

## Playthrough

The game follows a structured progression system:

1. **Setup Phase**
   - Select username, target level, and target country
   - Name your alien companion
<img width="2550" height="1179" alt="图片" src="https://github.com/user-attachments/assets/8e5342ff-65bf-4188-bd7a-eba818e6731c" />
<img width="2553" height="1179" alt="图片" src="https://github.com/user-attachments/assets/a4ab476b-9d38-4f50-9969-4b1e0eff89c6" />


2. **Learning Loop**
   - Feed alien with text content
   - Memorize new words to Dictionary
   - Review previously learned vocabulary
   - Continue memorizing more words
   - If not sure what to do, check "About"
<img width="2559" height="1176" alt="图片" src="https://github.com/user-attachments/assets/fd530ad2-22b6-48c0-879b-c2ae3f45602a" />
<img width="2559" height="1176" alt="图片" src="https://github.com/user-attachments/assets/690dee03-0407-4941-9d8b-2c373dc12382" />
<img width="2559" height="1191" alt="图片" src="https://github.com/user-attachments/assets/15a26f32-3efc-4716-9d9a-0d7b85217547" />
<img width="2559" height="1187" alt="图片" src="https://github.com/user-attachments/assets/13317e39-8800-490c-9d2c-0de25c7a7ec0" />
<img width="2559" height="1185" alt="图片" src="https://github.com/user-attachments/assets/29d639df-b466-49bc-8675-52c8108b188b" />


3. **Progression**
   - Reach level 2 to unlock postcards feature
   - Check collected postcards from AI interactions
   - Continue learning until reaching level 4
<img width="2559" height="1185" alt="图片" src="https://github.com/user-attachments/assets/7d07840e-de47-4a64-b832-29104cbc6c27" />

4. **Completion**
   - Receive a personalized thank you letter
   - Click "See you again" to clear game history and return to start
<img width="2559" height="1194" alt="图片" src="https://github.com/user-attachments/assets/feb55ac5-9a63-4a25-8662-c7c55ca4dab5" />
<img width="2559" height="1188" alt="图片" src="https://github.com/user-attachments/assets/53f87ae7-9c65-4f84-9ca1-d739b03613ed" />
<img width="2553" height="1182" alt="图片" src="https://github.com/user-attachments/assets/d1da3001-579a-424e-883e-ff783ea51448" />

## Project Structure

```
src/
├── assets/                 # Static assets and text files
├── components/             # Vue components
│   └── game/              # Game-related components
│       ├── CharacterStats.vue
│       ├── DictionaryModal.vue
│       ├── ProgressPanel.vue
│       ├── StoryDisplay.vue
│       └── PostcardModal.vue
├── router/                 # Router configuration
├── stores/                 # Pinia state management
├── views/                  # Page views
│   ├── StartView.vue      # Start page
│   ├── GameView.vue       # Main game page
│   └── AboutView.vue      # About page
├── App.vue                # Root component
└── main.ts                # Application entry point
```

## Features

1. **Character Creation System** - Create and customize your alien character
2. **Vocabulary Learning System** - Learn vocabulary through interactive stories
3. **RPG Elements** - Character leveling and progression system
4. **Dictionary Function** - View learned vocabulary
5. **Progress Tracking** - Monitor learning progress
6. **AI-Powered Content** - Dynamic story generation with DeepSeek API
7. **Postcard System** - Collect memorable moments from AI interactions
8. **Review System** - Reinforce learned vocabulary through spaced repetition

## Tech Stack

- Vue 3 + TypeScript
- Vite Build Tool
- Vue Router for Navigation
- Pinia for State Management
- Tailwind CSS for Styling

## Installation and Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables Configuration

The project uses environment variables to store sensitive information such as API keys. To configure:

1. Copy the `.env.example` file and rename it to `.env`
2. Fill in your DeepSeek API Key in the `.env` file

```bash
cp .env.example .env
```

Note: The `.env` file has been added to `.gitignore` and will not be committed to the version control system.

## Component Descriptions

### Main View Components

1. **StartView.vue** - Start page where users can set their username, language preferences, and difficulty
2. **GameView.vue** - Main game interface containing all game functionality

### Game Components

1. **CharacterStats.vue** - Displays character status (health, level, etc.)
2. **StoryDisplay.vue** - Displays game story content and interactive vocabulary
3. **ProgressPanel.vue** - Displays progress information (current level, achievements, daily stats)
4. **DictionaryModal.vue** - Dictionary modal to view learned vocabulary
5. **PostcardModal.vue** - Postcard modal to view collected moments

## State Management

Pinia is used for state management. Game state is defined in `stores/gameStore.ts`:

- Character attributes
- Story content
- Vocabulary data
- Progress information
- Postcard collection

## Router Configuration

Routes are configured in `router/index.ts`:

- `/` - Start page
- `/game` - Main game page
- `/about` - About page

## Development Notes

1. All game components are located in the `src/components/game/` directory
2. View components are located in the `src/views/` directory
3. State management uses Pinia in the `src/stores/` directory
4. Router configuration is in the `src/router/` directory

## Important Notes

1. The project uses Tailwind CSS for styling
2. Fonts are loaded via Google Fonts
3. Data persistence uses localStorage
4. Responsive design adapts to different screen sizes
5. AI content generation powered by DeepSeek API
