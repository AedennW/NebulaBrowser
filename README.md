# NebulaBrowser

A responsive, space-themed web launchpad with a searchable game library.

## Features

- Responsive layout for desktop, tablet, and mobile
- Quick links to useful websites
- Searchable game collection with title and genre filtering
- Game player that embeds individual game HTML files from the public `gn-math/html` GitHub repository
- Cover art loaded from the public `gn-math/covers` GitHub repository
- Optional open-in-new-tab control for each game
- Space-inspired styling and glow theme toggle
- No build tools or dependencies required

## Run locally

Open `index.html` in a browser, or use a local development server such as VS Code Live Server.

## Deploy with GitHub Pages

1. Open the repository's **Settings**.
2. Select **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and `/ (root)`, then save.

## Game sources

The game list is based on game entries in the public GN-Math assets repository. Individual game pages and cover images are requested directly from the corresponding GN-Math GitHub repositories through jsDelivr. NebulaBrowser does not copy the GN-Math website or recreate its main site.

Game titles, game content, and artwork belong to their respective creators. Availability and embedding behavior can vary by game and by browser.
