# NourishLink

A full-stack community food distribution platform connecting local food donors (grocery stores, restaurants, farms), food banks, and recipient families.

Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Prisma, and PostgreSQL.

---

## Features

- **Role-Based Portals**: Distinct dashboards for Donors, Food Bank Admins, and Recipients.
- **Inventory & Surplus Triage**: Intelligent shelf-life scoring and distribution prioritization based on food categories and storage requirements.
- **Dietary & Needs Matching**: Automated matching engine correlating unreserved food donations to open recipient requests based on dietary requirements (Halal, Gluten-Free, Vegan, Diabetic-Friendly) and household sizes.
- **Accessibility Support**: Built-in High Contrast mode (`data-contrast="high"`) and font-size scaling for accessibility.
- **Secure Authentication**: JWT-based session cookies with bcrypt password hashing and Zod schema validation.

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Frontend**: React 19, Tailwind CSS, Lucide Icons
- **Backend**: Next.js Server Components & Route Handlers
- **Database**: PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Validation**: Zod
- **Testing**: Vitest & React Testing Library

---

## Project Structure

```
├── prisma/
│   ├── schema.prisma       # Database schema and relations
│   └── seed.ts             # Initial seed data for development
├── src/
│   ├── app/                # App Router pages and API route handlers
│   │   ├── admin/          # Pantry dispatch & match portal
│   │   ├── api/            # REST API endpoints (auth, donations, requests, etc.)
│   │   ├── donor/          # Food donor inventory management
│   │   ├── recipient/      # Family request submission portal
│   │   └── ...
│   ├── components/         # Reusable UI components & layout elements
│   ├── lib/                # Core utilities, auth, triage engine, schemas
│   └── types/              # Shared TypeScript definitions
└── tests/                  # Unit and integration test suites
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- PostgreSQL database (or Neon/Supabase instance)

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd nourishlink
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://<user>:<password>@<host>/<dbname>?sslmode=require"
   JWT_SECRET="your-secure-secret-key"
   NEXT_PUBLIC_APP_NAME="NourishLink"
   ```

4. Initialize the database schema:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. (Optional) Seed the database with sample data:
   ```bash
   npx tsx prisma/seed.ts
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Test & Build

```bash
# Run unit tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

---

## License

MIT
