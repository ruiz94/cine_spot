# 🎬 CineSpot

A modern application to manage Cinema tickets sales.

## 📋 Description

CineSpot is a comprehensive cinema ticket managing platform that allows users to:
- Browse current movies and showtimes
- Select seats 
- Purchase tickets online (future: secure payment processing)
- Manage ticket sells and view ticket purchasing history
- Receive digital tickets via email or mobile app (future feature)
- Get notifications about upcoming releases and special events (future feature)

## ✨ Features

- �️ **Online Ticket Sales**: Easy and fast ticket purchasing system
- 🎭 **Movie Catalog**: Browse current and upcoming movies with trailers
- � **Loyalty Program**: Reward points and special discounts for frequent customers
- 📊 **Admin Dashboard**: Comprehensive management tools for cinema operators

## 🚀 Installation

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn
- Git
- Prisma

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/cine_spot.git
   cd cine_spot
   ```

2. **Install dependencies for both frontend and backend**
   ```bash
   # Install root dependencies (monorepo tools)
   npm install
   
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   cd ..
   ```

3. **Configure environment variables**
   ```bash
   # Frontend environment variables
   cp frontend/.env.example frontend/.env
   
   # Backend environment variables
   cp backend/.env.example backend/.env
   ```
   
   Edit the backend `.env` file with your configuration:
   ```env
   DATABASE_URL=your_database_connection_string
   PORT=5000
   JWT_SECRET=tu_clave_super_secreta_de_al_menos_32_caracteres
   JWT_EXPIRES_IN=24h
   ```

4. **Set up the database**
   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   cd ..
   ```

5. **Start the applications** (need to implement)
   ```bash
   # Start both frontend and backend concurrently
   npm run dev
   
   # Or start them individually:
   # Backend (from root)
   npm run dev:backend
   
   # Frontend (from root)
   npm run dev:frontend
   ```

6. **Open in browser**
   ```
   Frontend: http://localhost:5173
   Backend API: http://localhost:5000
   ```

## 💻 Usage

### Main functionalities

```bash
# Get movie showtimes
GET /api/movies/showtimes?date=2025-07-19

# Book tickets
POST /api/bookings
{
  "showtimeId": "123",
  "seats": ["A1", "A2"],
  "customerInfo": {...}
}

# Get booking details
GET /api/bookings/:bookingId

```

### Usage examples

```javascript
// Get available showtimes
const showtimes = await fetch('/api/movies/showtimes?movieId=123');

// Create a booking
const booking = await fetch('/api/bookings', {
  method: 'POST',
  body: JSON.stringify({
    showtimeId: '456',
    seats: ['B5', 'B6'],
    customerEmail: 'user@example.com'
  })
});
```

## 🛠️ Technologies Used

### Frontend
- **React.js** - User interface library
- **Vite** - Build tool and development server
- **TypeScript** - Typed superset of JavaScript
- **Zustand** - Lightweight state management library
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web framework for Node.js
- **Prisma** - Modern database toolkit
- **Json Web Token** - 
- **bcrypt** - 

### Services
- **Vercel** - Deployment and hosting

### Development Tools
- **ESLint** - Code linter
- **Prettier** - Code formatter
- **Jest** - Testing framework
- **Husky** - Git hooks
- **Typescript** - 

## 📁 Project Structure

```
cine_spot/                 # Monorepo root
├── frontend/              # Frontend application (Vite + React)
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   │   ├── common/    # Common UI components
│   │   │   ├── booking/   # Booking-related components
│   │   │   └── admin/     # Admin dashboard components
│   │   ├── pages/         # Application pages
│   │   │   ├── movies/    # Movie listing and details
│   │   │   ├── booking/   # Booking flow pages
│   │   │   └── admin/     # Admin panel pages
│   │   ├── hooks/         # Custom hooks
│   │   ├── store/         # Zustand store configuration
│   │   ├── utils/         # Utility functions
│   │   ├── types/         # TypeScript definitions
│   │   ├── lib/           # External library configurations
│   │   └── styles/        # Global styles
│   ├── public/            # Static files
│   ├── tests/             # Frontend tests
│   ├── .env.example       # Frontend environment variables
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.ts     # Vite configuration
│   └── tsconfig.json      # TypeScript configuration
├── backend/               # Backend application (Node.js + Express)
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middlewares/   # Express middlewares
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utility functions
│   │   ├── types/         # TypeScript definitions
│   │   └── config/        # Configuration files
│   ├── prisma/            # Database schema and migrations
│   ├── tests/             # Backend tests
│   ├── .env.example       # Backend environment variables
│   ├── package.json       # Backend dependencies
│   └── tsconfig.json      # TypeScript configuration
├── docs/                  # Shared documentation
├── package.json           # Root package.json for monorepo scripts
└── README.md             # This file
```

## 🧪 Testing

```bash
# Run all tests
npm run test
npm run test:backend
npm run test:watch:backend
npm run test:coverage:backend
```

## 🚀 Deployment

## 📝 Roadmap

- [x] **v1.0** - Core Features
  - [] Movie catalog
  - [] Seat selection
  - [ ] Payment processing
  - [ ] User authentication

- [ ] **v1.1** - Enhanced Features
  - [ ] Loyalty program
  - [ ] Group bookings

- [ ] **v2.0** - Advanced Features
  - [ ] Multi-language support

## 🐛 Bug Reports

If you find any bugs, please:

1. Check that it hasn't been reported before
2. Create a detailed issue with:
   - Problem description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

## 📄 License

This project is under the MIT License. See the [LICENSE](LICENSE) file for more details.

## 👨‍💻 Author

**Armando Ruiz**
- GitHub: [@armandoruiz](https://github.com/armandoruiz)
- LinkedIn: [Armando Ruiz](https://linkedin.com/in/armandoruiz)
- Email: armando@example.com

## 🙏 Acknowledgments

- [Vercel](https://vercel.com/) for hosting and deployment
- The open source community for the libraries used in this project

---

⭐ **Like the project? Give it a star on GitHub!**