# NeuroGuard - Stroke Risk Assessment Web

**NeuroGuard Web** is a modern, responsive frontend application built with **React** and **TypeScript**, designed to interact with the Stroke Risk Prediction API. It serves as a Decision Support System (SPK), providing a user-friendly interface for doctors and patients to assess stroke probability using advanced machine learning models.

This application features a sleek UI powered by **Tailwind CSS**, real-time data visualization, and secure authentication flows.

## Key Features

- **Interactive Dashboard**: Visualizes patient risk trends over time using interactive area charts (via `Recharts`) and provides quick statistics on recent assessments.
- **Comprehensive Risk Assessment**: A guided form interface that allows users to input clinical vitals (e.g., age, glucose levels) and symptoms to generate instant risk predictions.
- **Model Selection**: Users can dynamically choose between different backend models (**Logistic Regression**, **Random Forest**, **SVM**) directly from the UI to compare results.
- **Detailed History**: A complete log of past predictions, allowing users to review detailed input parameters and probability scores for historical assessments.
- **Profile & Personalization**: Users can set "Personal Defaults" (Age, Hypertension history) to streamline future assessments.
- **Responsive Design**: Fully responsive layout optimized for both desktop clinical settings and mobile usage, featuring a custom sidebar and mobile navigation.

## Technology Stack

- **Core**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **Charts/Visualization**: [Recharts](https://recharts.org/)
- **HTTP Client**: Native Fetch API with custom service wrapper

## Quick Setup

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** or **yarn**
* A running instance of the **Stroke Risk Prediction API** (Backend).

### Installation & Running

1. **Clone the repository**
   ```bash
   git clone https://github.com/reishandy/web-spk-stroke.git
   cd web-spk-stroke
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory to point to your backend API.
   *Note: If not provided, it defaults to the production URL set in `services/api.ts`.*

   ```env
   VITE_API_URL=http://localhost:30023
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   The app will typically run on `http://localhost:5173` (check your terminal for the exact port).

5. **Build for Production**
   ```bash
   npm run build
   npm run preview
   ```

## Project Details and Architecture

### User Flow

1. **Authentication**: Users log in or register. Tokens are stored securely in `localStorage`.
2. **Onboarding**: New users are prompted to set **Personal Defaults** (Age, Hypertension) in the Profile section.
3. **Assessment**:
    - User navigates to "New Assessment".
    - Selects a Machine Learning model (e.g., Random Forest).
    - Confirms defaults and checks current symptoms.
    - Submits data to receive a "Risk" or "Safe" prediction with probability percentages.
4. **Review**: Results are saved to the history log and visualized on the Dashboard.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | The base URL of the Stroke Risk Prediction API. | `https://stroke-backend.reishandy.id` |

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## Author

Created by: **Reishandy**
- GitHub: [https://github.com/Reishandy](https://github.com/Reishandy)