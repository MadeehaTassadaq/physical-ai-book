# Physical AI Robotics Book

This repository contains the source code and documentation for the Physical AI Robotics Book project.

## About

This is a Docusaurus-based documentation site for physical AI robotics concepts, featuring:

- Interactive RAG chatbot with selection support
- Azure Static Web Apps deployment configuration
- GitHub Pages deployment workflow

## Installation

```bash
yarn
```

## Local Development

```bash
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Using SSH:

```bash
USE_SSH=true yarn deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.

## Features

- Docusaurus documentation site
- Floating RAG chatbot for interactive Q&A
- Responsive design
- GitHub integration
