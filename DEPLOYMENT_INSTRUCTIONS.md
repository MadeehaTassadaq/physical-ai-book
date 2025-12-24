# Deployment Instructions

This document provides instructions for deploying your Docusaurus site to GitHub Pages.

## Prerequisites

1. A GitHub account
2. Git installed on your local machine
3. The project files in this repository

## Step 1: Create a GitHub Repository

1. Go to GitHub and create a new repository named `physical-ai-book`
2. Do NOT initialize the repository with a README, .gitignore, or license

## Step 2: Configure Git Remote

In your local repository, run:

```bash
git remote add origin https://github.com/[Your-GitHub-Username]/physical-ai-book.git
```

Replace `[Your-GitHub-Username]` with your actual GitHub username.

## Step 3: Push to GitHub

```bash
git branch -M main
git push -u origin main
```

## Step 4: Configure GitHub Pages

1. In your GitHub repository, go to Settings > Pages
2. Under "Source", select "GitHub Actions"
3. The deploy.yml workflow file is already configured in `.github/workflows/deploy.yml`

## Step 5: Update Configuration

After creating your repository, update the following in `docusaurus.config.js`:

1. Replace `[Your-GitHub-Username]` with your actual GitHub username in:
   - `organizationName`
   - `url`
   - GitHub link in navbar

## Step 6: Trigger Deployment

After pushing changes to the `main` branch, GitHub Actions will automatically build and deploy your site to GitHub Pages.

Your site will be available at: `https://[Your-GitHub-Username].github.io/physical-ai-book/`

## Verification

You can verify the build works locally by running:

```bash
npm run build
```

The site will be built in the `build/` directory.