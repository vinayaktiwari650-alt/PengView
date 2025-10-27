# PengVision 🐧

An AI-powered toolkit for architects to visualize, analyze, and present building designs. Simply upload a photo of a building, and PengVision will generate a complete suite of architectural assets, with the ability to save your work and continue later.

![PengVision Screenshot](https://storage.googleapis.com/aistudio-project-assets/L2Fpc3R1ZGlvL2dlbS1wcm9qZWN0cy9wLzU1OTM5NTU5NjM5MA/persistent/11802909_1721243142491.png) <!-- Replace with a screenshot of your app -->

---

## ✨ Features

-   **User Login**: A simple, username-based login system to provide a personal workspace. All projects are saved per-user in the browser's local storage.
-   **Image Upload**: Start by uploading a JPG, PNG, or WEBP photo of a building.
-   **Project Management**:
    -   **Save Project**: Save your uploaded image and all generated assets under a project name.
    -   **My Projects**: View, load, and delete your saved projects from a convenient modal.
    -   **New Project**: Easily clear the workspace to start fresh.
-   **Architectural Portfolio Generator**: Automatically creates a professional portfolio with multiple views:
    -   3D Block Model
    -   Photorealistic Night Render
    -   Conceptual Floor Plans
    -   Artistic Design Sketches
    -   Technical Elevation Drawings
    -   Detailed Close-up Sketches
-   **Site Context Renderer**: Place your building design onto a real-world site by uploading a map screenshot.
-   **Downloadable Assets**: All generated images and text analyses can be downloaded individually or as a `.zip` archive.

## 🛠️ Tech Stack

This project is built with a modern, no-build-step frontend stack.

-   **Framework**: [React 18](https://reactjs.org/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **AI**: [Google Gemini API](https://ai.google.dev/docs/gemini_api_overview)
    -   `gemini-2.5-flash-image` for all image generation tasks.
    -   `gemini-2.5-pro` for textual analysis and script generation.
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (via CDN)
-   **Packaging**: [JSZip](https://stuk.github.io/jszip/) for creating downloadable `.zip` archives.
-   **Environment**: Runs directly in the browser using ES Modules and an `importmap` in `index.html`. No `npm`, `yarn`, or build tools like Vite/Webpack are required.

---

## 🚀 Getting Started

To run this project, you need a valid Google Gemini API key and a simple local web server.

### 1. API Key Setup

The application requires a Google Gemini API key to function.

1.  **Get an API Key**: Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to create your API key.
2.  **Enable APIs**: Ensure the project associated with your API key has the **Generative AI API** (also sometimes listed as the Vertex AI API) enabled in the Google Cloud Console. This is necessary for all the generative features to work.
3.  **Set Environment Variable**: The application is designed to read the API key from an environment variable named `API_KEY`.
    -   If you are running this in a cloud development environment like Google AI Studio's Web IDE, find the "Secrets" or "Environment Variables" panel and create a new secret named `API_KEY` with your key as the value.
    -   If running locally, you will need a way to serve the files while making this variable available to the browser context. The easiest way is often to run it in an environment that handles this for you.

### 2. Running the Project

Since this project does not have a build step, you can run it using any simple local web server.

1.  **Enter a Username**: On first launch, you'll be prompted to enter a username. This creates your local workspace.
2.  **Clone or Download the Repository**: Get all the project files onto your local machine.
3.  **Navigate to the Project Directory**: Open your terminal or command prompt and `cd` into the project folder.
4.  **Start a Local Server**: Run one of the following commands:

    **Using Python:**
    ```bash
    python -m http.server
    ```

    **Using Node.js (with `serve` package):**
    ```bash
    # Install serve globally if you don't have it
    npm install -g serve
    # Run the server
    serve .
    ```

    **Using VS Code:**
    -   Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension.
    -   Right-click on `index.html` and select "Open with Live Server".

5.  **Open in Browser**: Open your web browser and navigate to the local server address provided (e.g., `http://localhost:8000` or `http://127.0.0.1:5500`).

---

## 📂 File Structure

The project has a simple and organized file structure.

```
.
├── index.html          # Main HTML entry point, includes the importmap for dependencies.
├── index.tsx           # Mounts the React application to the DOM.
├── App.tsx             # The root React component, manages layout and core state.
├── metadata.json       # Project metadata.
├── README.md           # This file.
├── types.ts            # Contains all TypeScript type definitions for the project.
├── components/         # Contains all reusable React components.
│   ├── Login.tsx
│   ├── ProjectsModal.tsx
│   ├── ...and more
├── services/           # Handles external API calls.
│   └── geminiService.ts  # All interactions with the Google Gemini API.
└── utils/              # Helper functions.
    ├── storage.ts
    └── ...and more
```

## 🤝 How to Contribute

Contributions are welcome! If you have ideas for new features or improvements, please follow these steps:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature (`git checkout -b feature/your-feature-name`).
3.  **Make your changes** and commit them (`git commit -m 'Add some amazing feature'`).
4.  **Push to the branch** (`git push origin feature/your-feature-name`).
5.  **Open a Pull Request.**

---

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.