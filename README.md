# OpenFunnels

🚧 **Work in Progress** 🚧

An open-source funnel builder with drag-and-drop functionality and interactive layout management. Build high-converting funnels with ease using our modern, intuitive interface.

## 🌟 Features

- **Drag & Drop Builder**: Intuitive visual editor for creating funnels
- **Interactive Layout Management**: Real-time preview and editing
- **Responsive Design**: Funnels that look great on all devices
- **Multi-step Workflows**: Create complex funnel sequences
- **Analytics Integration**: Track performance and conversions
- **Template Library**: Pre-built funnel templates to get started quickly
- **Custom Components**: Extensible component system
- **Team Collaboration**: Share and collaborate on funnel projects

## 🚀 Tech Stack

### Backend
- **Laravel 11**: Modern PHP framework
- **Inertia.js**: SPA experience with server-side routing
- **SQLite**: Lightweight database for development
- **Pest**: Testing framework

### Frontend
- **React**: Component-based UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework

## 📋 Prerequisites

Before getting started, ensure you have the following installed:

- **PHP**: Version 8.2 or higher
- **Composer**: PHP dependency manager
- **Node.js**: Version 18 or higher
- **npm/pnpm**: Package manager (pnpm recommended)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aialvi/openfunnels.git
   cd openfunnels
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install JavaScript dependencies**
   ```bash
   pnpm install
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Database setup**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

6. **Build assets**
   ```bash
   pnpm run build
   ```

## 🏃‍♂️ Development

### Start the development servers

1. **Laravel development server**
   ```bash
   php artisan serve
   ```

2. **Vite development server** (in a separate terminal)
   ```bash
   pnpm run dev
   ```

3. **Access the application**
   - Open your browser to `http://localhost:8000`

### Running tests

```bash
# Run all tests
php artisan test

# Run with coverage
php artisan test --coverage

# Run specific test suite
php artisan test --testsuite=Feature
```

## 📁 Project Structure

```
app/
├── Http/Controllers/     # Application controllers
├── Models/              # Eloquent models
├── Policies/            # Authorization policies
└── Providers/           # Service providers

resources/
├── js/                  # React components and TypeScript
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   └── types/          # TypeScript definitions
└── css/                # Stylesheets

database/
├── migrations/         # Database migrations
└── seeders/           # Database seeders

tests/
├── Feature/           # Feature tests
└── Unit/             # Unit tests
```

## 🎯 Roadmap

### Phase 1 (Current)
- [x] Project setup and architecture
- [x] Basic Laravel + Inertia.js integration
- [ ] User authentication system
- [ ] Basic funnel CRUD operations

### Phase 2
- [ ] Drag and drop funnel builder
- [ ] Component library
- [ ] Template system
- [ ] Real-time preview

### Phase 3
- [ ] Analytics and tracking
- [ ] A/B testing capabilities
- [ ] Integration APIs
- [ ] Team collaboration features

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests to ensure everything works
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines
- Follow PSR-12 coding standards for PHP
- Use TypeScript for all JavaScript code
- Write tests for new features
- Update documentation as needed
- Follow conventional commit messages

### Code Style
```bash
# Format PHP code
./vendor/bin/pint

# Format JavaScript/TypeScript
pnpm run lint:fix
```

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/aialvi/openfunnels/issues)
- **Discussions**: [GitHub Discussions](https://github.com/aialvi/openfunnels/discussions)
- **Documentation**: Coming soon

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Laravel community for the excellent framework
- React team for the powerful UI library
- All contributors who help make this project better

---

**Status**: This project is currently under active development. Core features are being built and refined. Stay tuned for updates!
