# pptbutlikeweb

Minimalist PowerPoint-like web presentation made with Bun, React, and
TailwindCSS for fast, offline-capable slideshows (i.e. TVs on walls and
whatnot). Basically as simple as possible while still being useful.

Made for the [AEDIROUM](https://aediroum.ca) to make it easier for them to
update the slides on their TVs without needing to go connect the TVs to an
operating system or to have to manually update files on a USB key.

## How to use

- Put slides in the `slides` folder
  - Right now, only images are supported (png, jpg, gif, svg)
- Build the project with `bun run build`
- Serve the `dist` folder with any static file server (e.g. `python -m http.server`)
- Open the served site in a web browser

## How it works

Any time you rebuild, a new `build-date` file is created in the `dist` folder
with a base36-encoded timestamp of when the build was made. The client
occasionally checks this file to see if it is out of date, and if so,
automatically reloads the page to get the latest version.

## Development

- Run `bun install` to install dependencies
- Run `bun run dev` to start the development server
- Open `http://localhost:3000` in your web browser

## License

[MIT](LICENSE)
