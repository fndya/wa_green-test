# WhatsApp Messenger

A simple WhatsApp-style messenger built with React and Vite. The application provides a chat interface and integrates with the GREEN-API service for WhatsApp messaging.

## Features

- **Chat interface** — a messenger-style layout with a chat list and message history.
- **Create chats** — start a conversation by entering a phone number.
- **Send messages** — send text messages through GREEN-API.
- **Connection check** — verify the GREEN-API instance connection.
- **Responsive layout** — interface adapts to different screen sizes.

## Tech Stack

- React
- Vite
- JavaScript
- Tailwind CSS
- shadcn/ui
- Lucide React
- GREEN-API

## Getting Started

### Requirements

Make sure you have installed:

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm

### Installation

Clone the repository:

```bash
git clone <repository-url>
cd <project-directory>
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal (usually `http://localhost:5173`).

## GREEN-API Configuration

The application uses GREEN-API to connect to WhatsApp.

1. Create and configure an instance in your [GREEN-API account](https://green-api.com/).
2. Make sure the instance is authorized in WhatsApp.
3. Run the application.
4. Enter your **ID Instance** and **API Token Instance** in the connection form.
5. Check the connection status.

Do not commit your API token or share it publicly. The token is entered in the application at runtime.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Notes

- The application is a test project and is not intended for production use.
- GREEN-API requests are made from the client, so browser CORS restrictions may affect API functionality.
- Incoming message retrieval is not fully implemented.
- You need an authorized GREEN-API instance to test WhatsApp messaging.

## License

This project was created as a technical test task.