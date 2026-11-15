# iKhono Mobile

A React Native mobile app for the iKhono platform — connecting clients with skilled professionals across South Africa.

Built with **Expo Go SDK 54, Supabase** and **TypeScript**.

---

## Prerequisites

Make sure you have the following installed before getting started:

- [Node.js](https://nodejs.org/) v20 or higher
- [Git](https://git-scm.com/)
- [Expo Go](https://expo.dev/client) app on your phone — **must support SDK 54.0.2**
  - Android: [Download on Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - iOS: [Download on App Store](https://apps.apple.com/app/expo-go/id982107779)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/iKhono-africa/iKhono-mobile.git
cd iKhono-mobile
```

### 2. Install dependencies

> Note: This project requires `--legacy-peer-deps` due to peer dependency conflicts with Expo SDK 54.

```bash
npm install --legacy-peer-deps
```

### 3. Set up environment variables

Create a `.env` file in the root of the project:

```bash
cp .env.example .env
```

Then open `.env` and fill in the required values:

```env
EXPO_PUBLIC_API_URL=https://ikhono.africa/api
```

### 4. Start the development server

```bash
npx expo start
```

Then scan the QR code with the **Expo Go** app on your phone.

---

## Project Structure

```
ikhono-mobile/
├── app/                  # Expo Router screens
│   ├── (auth)/           # Login, signup, password reset
│   ├── (client)/         # Client-facing screens
│   └── (professional)/   # Professional-facing screens
├── assets/               # Images and fonts
├── constants/            # App-wide constants
├── services/             # API service layer (axios)
├── store/                # Zustand state management
└── .env                  # Environment variables (not committed)
```

---

## Tech Stack

| Technology | Version |
|---|---|
| Expo SDK | 54.0.2 |
| React Native | 0.76.x |
| TypeScript | 5.x |
| Expo Router | File-based routing |
| Axios | API requests |
| Zustand | State management |
| Lucide React Native | Icons |

---

## Contributing

1. Make sure you're on the latest `main` branch: `git pull origin main`
2. Create a new branch for your feature: `git checkout -b feature/your-feature-name`
3. Make your changes and test on your device via Expo Go
4. Commit your changes: `git commit -m "describe what you did"`
5. Push your branch: `git push origin feature/your-feature-name`
6. Open a Pull Request on GitHub for review

---

## Notes

- The backend API is live at `https://ikhono.africa/api` — no local server setup needed
- Never commit your `.env` file
- If you encounter install issues, always use `npm install --legacy-peer-deps`
