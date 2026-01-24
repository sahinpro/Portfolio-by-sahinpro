# Portfolio Website

A modern, professional portfolio website showcasing projects, services, and professional experience. Built with React, TypeScript, Tailwind CSS, and Framer Motion.

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design with smooth animations
- **TypeScript**: Full type safety and better developer experience
- **Performance Optimized**: Fast loading times and optimized assets
- **SEO Friendly**: Proper meta tags and semantic HTML
- **Accessible**: ARIA labels and keyboard navigation support
- **Mobile First**: Fully responsive design for all devices

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **Lucide React** - Icon library

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🏗️ Build

To build for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📁 Project Structure

```
Portfolio/
├── public/              # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── Header/     # Header component and sub-components
│   │   └── ui/         # Base UI components (shadcn/ui)
│   ├── constants/      # Constants and configuration
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── pages/          # Page components
│   └── screens/        # Screen-specific components
├── index.html          # HTML entry point
├── tailwind.css        # Global styles
├── vite.config.ts      # Vite configuration
└── tsconfig.json       # TypeScript configuration
```

## 🎨 Code Style

- **Components**: Functional components with TypeScript
- **Hooks**: Custom hooks for reusable logic
- **Constants**: Centralized configuration and constants
- **Path Aliases**: Use `@/` prefix for imports from `src/`
- **Naming**: PascalCase for components, camelCase for functions/variables

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking

## 🔧 Configuration

### Path Aliases

The project uses path aliases for cleaner imports:

- `@/` → `src/`
- `@/components` → `src/components`
- `@/pages` → `src/pages`
- `@/hooks` → `src/hooks`
- `@/lib` → `src/lib`
- `@/constants` → `src/constants`

### Environment Variables

Create a `.env` file in the root directory for environment-specific variables.

## 📄 License

MIT License - feel free to use this project for your own portfolio.

## 👤 Author

**Sahin Alam**
- Portfolio: [Your Portfolio URL]
- Email: sahinhub@gmail.com
- GitHub: [@sahincoderbd](https://github.com/sahincoderbd)
