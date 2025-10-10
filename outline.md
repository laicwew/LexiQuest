# LexiQuest - Project Outline

## File Structure

```
/mnt/okcomputer/output/
├── index.html                 # Main game interface (Story Scene)
├── start.html                 # Start screen and user setup
├── character.html             # Character creation interface
├── modules.html               # Module selection hub
├── main.js                    # Core game logic and state management
├── resources/                 # Assets and media files
│   ├── logo.png              # Game logo with magical design
│   ├── character-bg.png      # Character creation background
│   ├── market-module.png     # Supermarket module background
│   ├── forest-module.png     # Forest adventure module background
│   ├── library-interior.jpg  # Ancient library scene
│   ├── fantasy-landscape.jpg # RPG game background
│   ├── ui-elements.jpg       # Game interface components
│   └── spell-effects.jpg     # Magical particle effects
├── interaction.md            # Interaction design documentation
├── design.md                 # Visual design style guide
└── outline.md               # This project outline file
```

## Page Functionality Overview

### 1. index.html - Main Game Interface
**Purpose**: Core story gameplay with interactive vocabulary learning
**Key Features**:
- Story text display with typewriter animation
- Interactive vocabulary words (clickable, highlighted)
- Character stats display (HP, Energy, Level)
- Action buttons (Eat, Attack, Talk, Imitate)
- Dictionary toggle and vocabulary management
- Save/load game functionality
- Progress tracking and analytics

**Components**:
- Navigation bar with game logo and user info
- Character stats panel with animated progress bars
- Main story display area with parchment styling
- Interactive word tokens with hover effects
- Action button grid with fantasy styling
- Dictionary modal with search and filter
- Achievement notifications system

### 2. start.html - Start Screen & Setup
**Purpose**: Initial user setup and game initialization
**Key Features**:
- Username input with validation
- Language selection (Chinese/English)
- Save game detection and loading options
- Game introduction and tutorial access
- Settings and preferences configuration

**Components**:
- Animated game logo with magical effects
- Username input form with real-time validation
- Language selection dropdowns
- Save game list with preview information
- Tutorial and help system access
- Settings panel with accessibility options

### 3. character.html - Character Creation
**Purpose**: Player character customization and initial setup
**Key Features**:
- Character name input and validation
- Difficulty level selection (Easy/Normal/Hard)
- Character stats preview and customization
- Avatar selection and personalization
- Starting vocabulary and skill selection

**Components**:
- Character creation form with step-by-step wizard
- Real-time character preview with stats
- Difficulty level selector with descriptions
- Starting skill and vocabulary selection
- Character background story generator
- Confirmation and save functionality

### 4. modules.html - Module Selection Hub
**Purpose**: Story module selection and progress management
**Key Features**:
- Available module grid display
- Module preview with descriptions and difficulty
- Progress tracking for each module
- Filter and search functionality
- Module recommendation system

**Components**:
- Module card grid with preview images
- Filter controls (difficulty, theme, completion status)
- Search functionality with instant results
- Progress visualization for each module
- Achievement and unlock system display
- Module preview modal with detailed information

## Core JavaScript Functionality (main.js)

### Game State Management
- **GameState**: Central state management for all game data
- **Character**: Player character data and methods
- **Story**: Story progression and narrative management
- **Vocabulary**: Word learning and dictionary functionality
- **Progress**: Achievement tracking and analytics
- **SaveSystem**: Local storage and data persistence

### Interactive Systems
- **WordTokenizer**: Parse story text and create interactive vocabulary
- **ActionHandler**: Process player actions and game responses
- **StoryEngine**: Generate narrative content and branching paths
- **VocabularyLearner**: Manage word acquisition and review scheduling
- **ProgressTracker**: Monitor learning progress and generate analytics

### UI Controllers
- **StoryDisplay**: Manage story text rendering and animations
- **CharacterPanel**: Update and animate character stats
- **DictionaryModal**: Handle vocabulary lookup and management
- **NotificationSystem**: Display achievements and game messages
- **SaveLoadUI**: Manage game saving and loading interfaces

### Data Management
- **ModuleLoader**: Load and parse story module files
- **VocabularyDatabase**: Manage word definitions and examples
- **AnalyticsEngine**: Track learning behavior and generate insights
- **SettingsManager**: Handle user preferences and configurations

## Module System Architecture

### Module Structure (JSON Format)
```json
{
  "module_id": "supermarket_v1",
  "title": "Supermarket Adventure",
  "description": "Learn shopping vocabulary in a magical market",
  "difficulty": "beginner",
  "target_words": ["apple", "bread", "milk", "cheese"],
  "scenes": [
    {
      "id": "entrance",
      "text": "You enter the magical supermarket...",
      "interactions": ["talk_to_clerk", "examine_shelves"],
      "vocabulary": ["entrance", "magical", "supermarket"]
    }
  ],
  "npcs": [
    {
      "id": "clerk",
      "name": "Shopkeeper",
      "dialogue": ["Welcome to our market!", "What can I help you find?"]
    }
  ]
}
```

### Vocabulary Learning System
- **Word Acquisition**: Context-based vocabulary introduction
- **Spaced Repetition**: Intelligent review scheduling based on performance
- **Contextual Learning**: Words learned through story interactions
- **Mastery Levels**: Progressive vocabulary skill development
- **Personal Dictionary**: Customizable word collection and organization

### Progress Tracking
- **Story Completion**: Module and scene completion tracking
- **Vocabulary Mastery**: Word learning progress and retention rates
- **Character Development**: Level progression and skill unlocks
- **Achievement System**: Milestone rewards and learning goals
- **Analytics Dashboard**: Detailed learning insights and recommendations

## Technical Implementation Details

### Animation Libraries Integration
- **Anime.js**: Button interactions, character stat animations, scene transitions
- **p5.js**: Background particle effects, magical aura visualizations
- **Typed.js**: Story text typewriter effects, narrative reveals
- **ECharts.js**: Progress charts, vocabulary mastery visualizations
- **Pixi.js**: Advanced magical effects and interactive visualizations

### Responsive Design Strategy
- **Mobile First**: Touch-optimized interactions and layouts
- **Progressive Enhancement**: Advanced features for larger screens
- **Adaptive UI**: Context-aware interface adjustments
- **Performance Optimization**: Efficient rendering and asset loading

### Accessibility Features
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Comprehensive ARIA labels and descriptions
- **High Contrast Mode**: Alternative color schemes for visibility
- **Font Scaling**: User-adjustable text sizing for comfort
- **Reduced Motion**: Option to disable animations for sensitive users

### Data Persistence
- **Local Storage**: Game state, character progress, and settings
- **Session Management**: Temporary data and current game state
- **Export/Import**: Save game backup and transfer functionality
- **Cross-Device Sync**: Optional cloud synchronization for progress

This comprehensive outline ensures a fully-featured, engaging language learning RPG that combines effective educational methodology with immersive gaming experiences. Each component is designed to work seamlessly together while maintaining modularity for future expansion and customization.