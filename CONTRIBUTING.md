# Contributing to Dolibarr MCP Server

Thank you for your interest in contributing to the Dolibarr MCP Server! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Git
- A Dolibarr instance for testing (optional)

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/ivanmartin33/dolibarr-mcp-server.git
   cd dolibarr-mcp-server
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   pnpm run dev
   ```

5. **Test your changes**
   ```bash
   # Test MCP endpoints
   curl -X POST http://localhost:3000/mcp \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc": "2.0", "method": "tools/list", "params": {}, "id": 1}'
   ```

## 🌟 How to Contribute

### Reporting Issues

Before creating an issue, please:

1. **Search existing issues** to avoid duplicates
2. **Use the issue template** if available
3. **Provide detailed information**:
   - Operating system and version
   - Node.js version
   - Dolibarr version
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages and logs

### Suggesting Features

1. **Check existing feature requests** first
2. **Open a discussion** before implementing large features
3. **Provide clear use cases** and benefits
4. **Consider backwards compatibility**

### Pull Requests

#### Before You Start

1. **Create an issue** to discuss your changes
2. **Check the development branch** (`dev`) for latest changes
3. **Ensure your idea aligns** with project goals

#### PR Process

1. **Create a feature branch** from `dev`:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Follow the coding standards
   - Add tests if applicable
   - Update documentation

3. **Test your changes**:
   ```bash
   pnpm run build
   pnpm run typecheck
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create pull request** targeting the `dev` branch

#### PR Guidelines

- **Clear title and description**
- **Reference related issues** (#123)
- **Include testing instructions**
- **Keep changes focused** (one feature per PR)
- **Update documentation** as needed

## 📋 Coding Standards

### TypeScript

- Use **strict TypeScript** settings
- **Document public APIs** with JSDoc
- Follow **existing code style**
- Use **meaningful variable names**

### Code Organization

- **One feature per file** when possible
- **Group related functionality**
- **Use descriptive file names**
- **Keep functions small** and focused

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

feat(api): add new dolibarr endpoint support
fix(mcp): resolve JSON-RPC error handling
docs(readme): update installation instructions
chore(deps): update dependencies
```

Types:
- **feat**: New features
- **fix**: Bug fixes
- **docs**: Documentation changes
- **style**: Code style changes
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

## 🧪 Testing

### Manual Testing

1. **Start the server**:
   ```bash
   pnpm run dev
   ```

2. **Test MCP methods**:
   ```bash
   # Initialize
   curl -X POST http://localhost:3000/mcp \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc": "2.0", "method": "initialize", "params": {}, "id": 1}'
   
   # List tools
   curl -X POST http://localhost:3000/mcp \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc": "2.0", "method": "tools/list", "params": {}, "id": 2}'
   ```

3. **Test with n8n** (if available)

### CI/CD

All PRs must pass:
- **Build tests** on Node.js 18, 20, 22
- **TypeScript compilation**
- **Integration tests**
- **n8n nodes build**

## 📁 Project Structure

```
├── .github/
│   └── workflows/        # CI/CD workflows
├── server/
│   └── routes/          # Nitro route handlers
│       └── mcp/         # MCP-specific routes
├── n8n-nodes/          # n8n community nodes
├── package.json        # Main project dependencies
├── nitro.config.ts     # Nitro configuration
├── tsconfig.json       # TypeScript configuration
└── README.md          # Project documentation
```

## 🎯 Development Focus Areas

We welcome contributions in these areas:

### High Priority
- **Bug fixes** and stability improvements
- **Performance optimizations**
- **Documentation improvements**
- **Test coverage** expansion

### Medium Priority
- **New Dolibarr endpoint support**
- **Additional MCP features**
- **Developer experience** improvements
- **Error handling** enhancements

### Low Priority
- **Code style** improvements
- **Dependency updates**
- **Build process** optimizations

## 🔍 Code Review Process

1. **Automated checks** must pass
2. **Manual review** by maintainers
3. **Testing** in multiple environments
4. **Documentation** review
5. **Merge** to `dev` branch

### Review Criteria

- **Functionality**: Does it work as intended?
- **Code quality**: Is it well-written and maintainable?
- **Performance**: Does it impact server performance?
- **Security**: Are there any security concerns?
- **Compatibility**: Does it break existing functionality?

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Documentation**: Check README.md and CLAUDE.md

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors are recognized in:
- **GitHub contributors** list
- **Release notes** for significant contributions
- **README acknowledgments** for major features

---

Thank you for contributing to the Dolibarr MCP Server! 🎉