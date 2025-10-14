# LexiQuest - Interaction Design

## Core Game Flow

### 1. Start Screen & User Setup
- **Username Input**: Simple input field for unique user identification
- **Language Selection**: Dropdown menus for native language (Chinese) and target language (English)
- **New/Continue Options**: Check for existing saves, offer to continue or start fresh

### 2. Character Creation Interface
- **Character Name Input**: Text field for player character name
- **Difficulty Selection**: Radio buttons for Easy/Normal/Hard modes
- **Character Stats Preview**: Visual display of starting HP, Energy, and other attributes
- **Confirm Button**: Creates character and proceeds to module selection

### 3. Module Selection Hub
- **Module Cards**: Grid layout showing available story modules (Supermarket, Forest, etc.)
- **Module Preview**: Each card shows title, description, difficulty level, and preview image
- **Progress Indicators**: Show completion status and vocabulary learned for each module
- **Select Button**: Choose module and begin story

### 4. Main Story Interface
- **Story Display Area**: Central text area showing current scene narrative
- **Interactive Vocabulary**: Target language words highlighted and clickable
- **Character Stats Bar**: Top display showing HP, Energy, and current level
- **Action Buttons Panel**: Four interaction buttons (Eat, Attack, Talk, Imitate)
- **Dictionary Toggle**: Button to open vocabulary dictionary
- **Save Game Button**: Manual save functionality

### 5. Interactive Vocabulary System
- **Word Selection**: Click on highlighted target words to select them
- **Contextual Actions**: Available actions change based on selected word type (noun, verb, adjective)
- **Immediate Feedback**: Action results displayed as story text updates
- **Vocabulary Acquisition**: "Imitate" action adds words to personal dictionary

### 6. Action Prompt System
- **Dynamic Suggestions**: AI-generated action prompts based on current context
- **Three-Choice Interface**: "Yes"/"Try Another"/"No" options for each prompt
- **Story Branching**: Choices lead to different narrative paths and vocabulary encounters

### 7. Dictionary & Progress Tracking
- **Personal Dictionary**: Modal showing learned vocabulary with definitions and usage
- **Progress Visualization**: Charts showing vocabulary growth and module completion
- **Achievement System**: Unlock badges for vocabulary milestones and story progress

### 8. Save & Load System
- **Auto-Save**: Automatic saving at key story points
- **Manual Save**: Player-initiated save with custom save names
- **Load Game**: Resume from any previous save point
- **Cross-Session Persistence**: Progress maintained across browser sessions

## Multi-Turn Interaction Loops

### Story Progression Loop
1. Read current scene narrative
2. Identify and click on target vocabulary words
3. Choose appropriate action (Eat, Attack, Talk, Imitate)
4. Read action outcome and updated story text
5. Receive new action prompts for story continuation
6. Make choice to advance narrative
7. Repeat with new vocabulary and story context

### Vocabulary Learning Loop
1. Encounter new target word in story context
2. Click word to select and highlight
3. Choose "Imitate" action to learn word
4. Word added to personal dictionary with context
5. Word becomes available for future story interactions
6. Track learning progress and review opportunities

### Character Development Loop
1. Complete story actions to gain experience points
2. Level up character to unlock new abilities
3. Improve vocabulary mastery to access advanced modules
4. Customize character stats based on learning preferences
5. Unlock new story paths and vocabulary themes

## Interactive Components

### 1. Word Token System
- **Visual State Management**: Words change appearance when selected (highlighting, borders)
- **Tooltip Information**: Hover effects show word definitions and pronunciation
- **Click Behavior**: Single click selects, double-click shows detailed information
- **Animation Effects**: Smooth transitions for word selection and deselection

### 2. Action Response System
- **Contextual Actions**: Available actions change based on selected word and story context
- **Immediate Feedback**: Action results appear as new story text within 1-2 seconds
- **Consequence Tracking**: Actions affect character stats and future story options
- **Visual Feedback**: Character portrait and stats update based on actions

### 3. Story Branching Engine
- **Choice Consequences**: Player decisions affect future story paths and vocabulary encounters
- **Multiple Endings**: Different story conclusions based on vocabulary mastery and choices
- **Replay Value**: New playthroughs reveal different vocabulary and story elements
- **Progressive Difficulty**: Story complexity increases with player vocabulary knowledge

### 4. Social Learning Features
- **Progress Sharing**: Share vocabulary achievements and story progress
- **Leaderboards**: Compare vocabulary mastery with other players
- **Study Groups**: Collaborative vocabulary challenges and story completion
- **Community Content**: User-generated story modules and vocabulary sets

## User Experience Flow

### First-Time Player Journey
1. **Welcome & Setup**: Create username and select language preferences
2. **Character Creation**: Personalize avatar and choose learning difficulty
3. **Tutorial Module**: Guided introduction to game mechanics and vocabulary system
4. **First Story**: Begin main adventure with supportive scaffolding
5. **Progress Celebration**: Achievement notifications and progress visualization

### Returning Player Experience
1. **Quick Resume**: One-click continuation from last save point
2. **Progress Overview**: Dashboard showing recent achievements and vocabulary growth
3. **New Content Alerts**: Notifications about available modules and story updates
4. **Skill Assessment**: Optional vocabulary review before continuing story

### Advanced Player Features
1. **Module Creation Tools**: Build custom story modules with personal vocabulary lists
2. **Advanced Analytics**: Detailed learning progress and vocabulary mastery statistics
3. **Speed Run Mode**: Complete modules with time and accuracy challenges
4. **Expert Challenges**: High-difficulty modules with complex vocabulary and grammar