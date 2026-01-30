
# Tag Royale: Multiplayer Tag Game

Messing around with sockets and Socket.io library

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [npm](https://www.npmjs.com/)

### Install Dependencies

Run the following command in the project root:

```bash
npm install
```

### Start the Server

To start the server in production mode:

```bash
npm start
```

To start the server in development mode (with auto-reload):

```bash
npm run dev
```


The server will serve the client from the `public/` directory. By default, it runs on [http://localhost:3000](http://localhost:3000) (or the port specified in your config).

---


## Play with Friends Over the Internet

To let friends join your game from anywhere, you need to make your server accessible over the internet. There are several ways to do this:

- **Port forwarding:** Configure your router to forward the game server port (default: 3000) to your computer. This requires access to your router settings and may expose your device to the public internet.
- **Cloud hosting:** Deploy your server to a cloud provider (e.g., AWS, DigitalOcean, Heroku, etc.) for a more permanent and scalable solution.
- **Tunneling services (easy for quick play/testing):** Use a tunneling service like [ngrok](https://ngrok.com/) to temporarily expose your local server to the internet without changing router settings.

### Example: Hosting with ngrok (Tunneling)

1. **Start your server locally:**
	```bash
	npm start
	```

2. **Install ngrok as a dev dependency (or globally):**
	```bash
	npm install --save-dev ngrok
	```
	Or install globally if you prefer.

3. **(OPTIONAL) Sign up for a free ngrok account:**
	- Visit [ngrok.com](https://ngrok.com/) and create an account to get your auth token (required for stable tunnels).

4. **Expose your local server:**
	```bash
	npx ngrok http 3000
	```
	(Replace `3000` with your server port if different.)

5. **Share the public URL:**
	- ngrok will display a `https://` URL (e.g., `https://abcd1234.ngrok.io`).
	- Share this link with your friends—they can join your game from anywhere!

**Note:**
- Your computer must stay online and the server/ngrok must remain running for others to connect.
- Free ngrok accounts may change the public URL each time you run it.
- For best results, ensure your firewall allows incoming connections on the server port.
- Other tunneling tools (like localtunnel, Cloudflare Tunnel, etc.) can also be used if you prefer.

---
