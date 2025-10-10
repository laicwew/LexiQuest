# LexiQuest Vue.js 版本

这是将原有的LexiQuest项目从React.js迁移到Vue.js的版本。

## 项目结构

```
src/
├── assets/                 # 静态资源文件
├── components/             # Vue组件
│   └── game/              # 游戏相关组件
│       ├── ActionButtons.vue
│       ├── AchievementNotification.vue
│       ├── CharacterStats.vue
│       ├── DictionaryModal.vue
│       ├── ProgressPanel.vue
│       └── StoryDisplay.vue
├── router/                 # 路由配置
├── stores/                 # Pinia状态管理
├── views/                  # 页面视图
│   ├── StartView.vue      # 启动页面
│   ├── GameView.vue       # 游戏主页面
│   └── AboutView.vue      # 关于页面
├── App.vue                # 根组件
└── main.ts                # 应用入口文件
```

## 功能特性

1. **角色创建系统** - 创建和自定义你的角色
2. **词汇学习系统** - 通过交互式故事学习词汇
3. **RPG元素** - 角色升级、经验值和成就系统
4. **词典功能** - 查看已学习的词汇
5. **进度跟踪** - 监控学习进度

## 技术栈

- Vue 3 + TypeScript
- Vite 构建工具
- Vue Router 路由管理
- Pinia 状态管理
- Tailwind CSS 样式框架

## 安装和运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 组件说明

### 主要视图组件

1. **StartView.vue** - 启动页面，用户可以设置用户名、语言偏好和难度
2. **GameView.vue** - 游戏主界面，包含所有游戏功能

### 游戏组件

1. **CharacterStats.vue** - 显示角色状态（生命值、能量、经验值等）
2. **StoryDisplay.vue** - 显示游戏故事内容和交互式词汇
3. **ActionButtons.vue** - 显示操作按钮（吃掉、攻击、对话、模仿）
4. **ProgressPanel.vue** - 显示进度信息（当前模块、成就、今日统计）
5. **DictionaryModal.vue** - 词典模态框，查看已学习的词汇
6. **AchievementNotification.vue** - 成就通知组件

## 状态管理

使用Pinia进行状态管理，在`stores/gameStore.ts`中定义了游戏状态：

- 角色属性
- 当前模块信息
- 故事内容
- 词汇数据
- 进度信息

## 路由配置

在`router/index.ts`中配置了以下路由：

- `/` - 启动页面
- `/game` - 游戏主页面
- `/about` - 关于页面

## 开发说明

1. 所有游戏组件位于`src/components/game/`目录下
2. 视图组件位于`src/views/`目录下
3. 状态管理使用Pinia，在`src/stores/`目录下
4. 路由配置在`src/router/`目录下

## 注意事项

1. 项目使用Tailwind CSS进行样式设计
2. 字体使用Google Fonts加载
3. 数据持久化使用localStorage
4. 响应式设计适配不同屏幕尺寸
