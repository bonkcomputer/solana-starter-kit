# Contributing to Solana Starter Kit

First off, thank you for considering contributing to the Solana Starter Kit! This project is developed by Bonk Computer with powerful enhancements from Tapestry. It's people like you that make this a great tool for the Solana developer community.

## Code of Conduct

By participating in this project, you are expected to uphold our values of being respectful and inclusive to all contributors.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps to reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed and what behavior you expected
* Include screenshots if relevant
* Note your environment (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

* Use a clear and descriptive title
* Provide a detailed description of the proposed enhancement
* Explain why this enhancement would be useful to most users
* List any alternative solutions you've considered

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes
4. Make sure your code follows the existing style (use the provided ESLint and Prettier configs)
5. For swap/trading features, ensure both external wallets and Privy embedded wallets are supported
6. Test with both BCT and SSE tokens when modifying trading functionality
7. Issue that pull request!

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `pnpm install`
3. Create a branch for your feature: `git checkout -b feature/amazing-feature`
4. Make your changes
5. Run linting: `pnpm run lint`
6. Commit your changes using clear commit messages
7. Push to your fork and submit a pull request

## Style Guidelines

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

### JavaScript/TypeScript Style Guide

* Follow the existing code style
* Use TypeScript for new code
* Ensure all TypeScript has proper types (avoid `any` when possible)
* Use meaningful variable and function names
* Comment complex logic

### Documentation Style Guide

* Use Markdown for documentation
* Keep language clear and simple
* Include code examples where helpful
* Update the README.md if you change functionality

## License

By contributing to Solana Starter Kit, you agree that your contributions will be licensed under the MIT License. 