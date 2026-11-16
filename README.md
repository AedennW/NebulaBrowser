# NebulaBrowser

A responsive, space-themed web launchpad with a searchable game library.

## Features

- Responsive layout for desktop, tablet, and mobile
- Quick links to useful websites
- Searchable game collection with title and genre filtering
- Loads the current game catalog from the public GN-Math assets repository
- Individual game pages and cover art load from the public GN-Math GitHub repositories through jsDelivr
- Embedded game player with an optional open-in-new-tab control
- Space-inspired styling and glow theme toggle
- No build tools or dependencies required

## Run locally

Open `index.html` in a browser, or use a local development server such as VS Code Live Server. The game catalog is loaded at runtime, so the page needs an internet connection.

## Deploy with GitHub Pages

1. Open the repository's **Settings**.
2. Select **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and `/ (root)`, then save.

## Game sources

NebulaBrowser reads the game catalog from `gn-math/assets/zones.json`. It uses each entry's individual HTML filename and game ID to load that game's page and cover image from the public `gn-math/html` and `gn-math/covers` repositories. It does not embed or link to the GN-Math website.

The default library excludes non-game entries and titles clearly associated with horror, graphic violence, weapons, or gambling. Some catalog entries may also be unavailable or incompatible with the browser. Game titles and artwork remain the property of their respective creators.
