<p align="center">
  <a href="https://builderbot.vercel.app/">
    <picture>
      <img src="https://builderbot.vercel.app/assets/thumbnail-vector.png" height="80">
    </picture>
    <h2 align="center">Chatbot Personal (Dinabot)</h2>
  </a>
</p>

<p align="center">
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@builderbot/bot">
    <img alt="" src="https://img.shields.io/npm/v/@builderbot/bot?color=%2300c200&label=%40bot-whatsapp">
  </a>
  <a aria-label="Join the community on GitHub" href="https://link.codigoencasa.com/DISCORD">
    <img alt="" src="https://img.shields.io/discord/915193197645402142?logo=discord">
  </a>
</p>

# Dinabot

DinaBot is a chatbot framework designed to handle conversational flows for personal finance management and diary entries. It leverages AI to classify user intents, process financial transactions, and manage diary entries with ease.

This project uses BuilderBot, a free and open-source framework that facilitates the creation of chatbots and intelligent applications connected to different communication channels such as WhatsApp.

## Features

- **Intent Classification**: Automatically classifies user messages into categories like finances, diary, or general queries.
- **Financial Management**:
  - Register expenses and incomes.
  - Query financial summaries (daily, weekly, monthly).
  - Analyze spending by category.
- **Diary Management**:
  - Record personal diary entries with mood and tags.
  - Query diary summaries and filter by tags or time periods.
- **AI Integration**: Uses AI to extract structured data from user messages and provide intelligent responses.
- **Customizable Flows**: Modular design allows for easy addition of new conversational flows.

## Project Structure

- **`src/flows`**: Contains all conversational flows, including finances, diary, and welcome flows.
- **`src/services`**: Handles business logic for finances, diary, and AI interactions.
- **`src/utils`**: Utility functions for managing history and prompts.
- **`src/layers`**: Middleware layers for handling user interactions.
- **`src/config`**: Configuration for environment variables and API keys.

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm
- A `.env` file with the following variables:
  ```
  PORT=3008
  JWT_TOKEN=
  NUMBER_ID=
  VERIFY_TOKEN=
  API_KEY=
  URL=
  USER_NUMBER_DIARY=
  ```

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd builder-bot-aipath
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Build the project:

   ```bash
   pnpm build
   ```

4. Start the server:
   ```bash
   pnpm start
   ```

### Development

To run the project in development mode with live reloading:

```bash
pnpm dev
```

## Usage

### Financial Management

- **Register an Expense**:

  - Example: "Gasté $150 en comida rápida."
  - The bot will extract the amount, category, and description to register the expense.

- **Query Financial Summary**:
  - Example: "¿Cuánto gasté este mes?"
  - The bot will provide a summary of your expenses and incomes for the specified period.

### Diary Management

- **Add a Diary Entry**:

  - Example: "Hoy me sentí feliz porque terminé un proyecto importante."
  - The bot will save the entry with mood and tags.

- **Query Diary**:
  - Example: "¿Qué escribí la semana pasada?"
  - The bot will retrieve diary entries based on the specified time period or tags.

## API Integration

The project integrates with external AI services for intent classification and data extraction. Ensure the `API_KEY` and `URL` are correctly set in the `.env` file.

## Project Commands

- `pnpm start`: Start the production server.
- `pnpm dev`: Run the project in development mode.
- `pnpm build`: Build the project for production.
- `pnpm lint`: Run ESLint to check for code quality issues.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push the branch.
4. Submit a pull request.

## License

This project is licensed under the ISC License.

## Contact

- [Linkedin](https://www.linkedin.com/in/davidhilera/)
- [X](https://x.com/_deiviiss)
