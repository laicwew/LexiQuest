# HelloMee

[HelloMee](https://lexi-quest-five.vercel.app/) is an interactive language learning game where players help an alien character learn Earth languages through vocabulary acquisition and story interaction.

## Overview

HelloMee is designed as a vocabulary learning game. Players interact with an alien character who is learning human language and culture. Through feeding text to the alien, players help it understand vocabulary and grammar. The game features a progression system where the alien levels up as it learns more words, and players can review learned vocabulary to reinforce their knowledge. The game also includes a postcard system that captures memorable moments from AI-generated content, creating a personalized learning journal.

## Playthrough

The game follows a structured progression system:

1. **Setup Phase**
   - Select username, target level, and target country
   - Name your alien companion
<img width="2556" height="1185" alt="图片" src="https://github.com/user-attachments/assets/bc642f91-0f81-41aa-9e88-3628008c3a66" />
<img width="2553" height="1188" alt="图片" src="https://github.com/user-attachments/assets/35a6aa54-2d59-40f8-92bd-c511224020c3" />


2. **Learning Loop**
   - Feed alien with text content
   - Memorize new words to Dictionary
   - Review previously learned vocabulary
   - Continue memorizing more words
   - If not sure what to do, check "About"
     <img width="2559" height="1184" alt="图片" src="https://github.com/user-attachments/assets/2d6c2eb7-ceac-4dc3-8031-b0286fa7bed8" />
     <img width="2556" height="1176" alt="图片" src="https://github.com/user-attachments/assets/422d9bd6-870e-4499-8d7f-a3d6eba8e903" />
     <img width="2556" height="1178" alt="图片" src="https://github.com/user-attachments/assets/1ddb257d-504d-4c41-868d-dd28ef49d9bf" />
     <img width="2550" height="1176" alt="图片" src="https://github.com/user-attachments/assets/86493559-84ff-4081-8c40-0153948a3f8e" />
     <img width="2559" height="1197" alt="图片" src="https://github.com/user-attachments/assets/ede30d63-1d82-4b20-80ca-eccd1df1dfcd" />



3. **Progression**
   - Reach level 2 to unlock postcards feature
   - Check collected postcards from AI interactions
   - Continue learning until reaching level 4
     <img width="2556" height="1179" alt="图片" src="https://github.com/user-attachments/assets/3fc7febb-d075-43b8-9ac9-57ecc9fd48e2" />
     <img width="2553" height="1182" alt="图片" src="https://github.com/user-attachments/assets/b2933f5d-dff8-4c51-b955-ad37229cac49" />



4. **Completion**
   - Receive a personalized thank you letter
   - Click "See you again" to clear game history and return to start
     <img width="2553" height="1188" alt="图片" src="https://github.com/user-attachments/assets/beccb964-cedf-4644-9deb-45071924424a" />
     <img width="2556" height="1188" alt="图片" src="https://github.com/user-attachments/assets/e97a4206-5cb0-4a50-9b52-ac4c17bfdf24" />


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

## Potential for more target languages

Modify the `system-prompt-level-?.txt` file to specify the response language, and replace the example response with its Japanese translation. After that, you can receive replies like this in the game:

<img width="2292" height="1128" alt="图片" src="https://github.com/user-attachments/assets/11ef938b-ff2f-4af1-9030-85c3e7e09eef" />

