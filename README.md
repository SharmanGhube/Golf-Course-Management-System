# Golf Course Management System

A comprehensive golf course management web application built with Next.js, Go, and MySQL. This system provides a complete solution for managing golf course operations including tee time bookings, equipment rentals, driving range sessions, and member management.

## 🎯 Features

### Core Functionality
- 🏌️ **Tee Time Booking & Scheduling** - Real-time availability with instant confirmation
- 🏟️ **Course Information Management** - Detailed course and hole information
- 🎯 **Golf Range Booking** - Ball bucket management with different sizes
- 💳 **Payment Processing** - Secure payment handling (Stripe integration ready)
- 🛠️ **Equipment Rental** - Comprehensive equipment management system
- 👥 **Membership Management** - Multiple membership tiers and benefits
- 🌤️ **Weather Integration** - Real-time weather conditions using OpenWeatherMap API
- 🔐 **User Authentication & Authorization** - JWT-based secure authentication

### User Experience
- 📱 **Responsive Design** - Dark theme optimized for all devices
- ⚡ **Real-time Updates** - Live availability and booking confirmations
- 🎨 **Modern UI** - Built with Tailwind CSS and Framer Motion animations
- 🔍 **Advanced Search** - Filter by date, time, equipment type, etc.

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Query** - Data fetching and caching
- **React Hook Form** - Form validation and handling
- **Zustand** - State management
- **Axios** - HTTP client

### Backend
- **Go 1.21+** - High-performance backend
- **Gin** - Web framework
- **GORM** - ORM for database operations
- **JWT** - Authentication tokens
- **MySQL 8.0** - Relational database
- **Docker** - Containerization

### External Services
- **OpenWeatherMap API** - Weather data
- **Stripe** - Payment processing (ready for integration)

## 🏗️ Project Structure

```
golf-course-management/
├── backend/                 # Go backend application
│   ├── internal/
│   │   ├── auth/           # Authentication logic
│   │   ├── config/         # Configuration management
│   │   ├── database/       # Database connection
│   │   ├── handlers/       # HTTP handlers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Data models
│   │   └── routes/         # Route definitions
│   ├── main.go            # Application entry point
│   ├── go.mod             # Go dependencies
│   └── Dockerfile         # Backend container
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable components
│   │   └── lib/           # Utilities and API
│   ├── package.json       # Node dependencies
│   └── Dockerfile         # Frontend container
├── database/
│   └── init.sql           # Database schema and seed data
├── docker-compose.yml     # Multi-container setup
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (for frontend development)
- **Go 1.21+** (for backend development)
- **Docker & Docker Compose** (for database and containerization)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd golf-course-management
   ```

2. **Set up environment variables**
   ```bash
   # Backend environment
   cp backend/.env.example backend/.env
   
   # Frontend environment
   cp frontend/.env.example frontend/.env.local
   ```

3. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend && go mod tidy
   
   # Frontend dependencies
   cd ../frontend && npm install
   ```

4. **Start the database**
   ```bash
   docker-compose up -d mysql
   ```

5. **Wait for database initialization (about 30 seconds)**

6. **Start the backend server**
   ```bash
   cd backend
   go run main.go
   ```

7. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

### 🔗 Access Points
- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8080/api/v1
- **Health Check**: http://localhost:8080/health
- **Database**: localhost:3306

## 📊 Database Schema

The system uses a comprehensive MySQL schema with the following main entities:

- **Users** - Customer and staff accounts with role-based access
- **Courses** - Golf course information with hole details
- **Tee Times** - Booking system with availability management
- **Range Sessions** - Driving range bookings with ball bucket sizes
- **Equipment** - Rental inventory management
- **Payments** - Transaction tracking and payment processing
- **Weather Logs** - Historical weather data storage

## 🔐 Authentication & Authorization

### User Roles
- **Admin** - Full system access, course management, user oversight
- **Staff** - Day-to-day operations, booking management, equipment tracking
- **Member** - Premium features, priority booking, discounted rates
- **Customer** - Basic booking and rental capabilities

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API endpoints
- Secure session management

## 🌟 Key Features Breakdown

### Tee Time Management
- Real-time availability checking
- Advanced booking system (up to 30 days ahead)
- Group booking support (1-4 players)
- Cart rental integration
- Special requests handling
- Automatic pricing calculation

### Equipment Rental System
- Categorized equipment inventory
- Availability tracking
- Damage and maintenance status
- Deposit management
- Flexible rental periods
- Return processing

### Driving Range
- Multiple ball bucket sizes (Small, Medium, Large, Jumbo)
- Bay assignment system
- Session duration management
- Dynamic pricing
- Real-time availability

### Weather Integration
- Current conditions display
- Historical weather data
- Course-specific weather information
- Automatic data refresh
- Weather-based recommendations

## 🔧 Development

### Backend Development
```bash
cd backend
go run main.go  # Start development server
go test ./...   # Run tests
```

### Frontend Development
```bash
cd frontend
npm run dev     # Start development server
npm run build   # Build for production
npm run lint    # Run linting
```

### Database Management
```bash
docker-compose up -d mysql    # Start database
docker-compose down           # Stop all services
docker-compose logs mysql     # View database logs
```

## 🚀 Production Deployment

### Using Docker Compose
```bash
docker-compose up -d          # Start all services
docker-compose down           # Stop all services
docker-compose logs -f        # View logs
```

### Manual Deployment
1. Build the backend: `go build -o main .`
2. Build the frontend: `npm run build`
3. Set up production database
4. Configure environment variables
5. Deploy using your preferred method

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile

### Courses
- `GET /api/v1/courses` - List all courses
- `GET /api/v1/courses/{id}` - Get course details

### Tee Times
- `GET /api/v1/tee-times/available` - Check availability
- `POST /api/v1/tee-times` - Book tee time
- `GET /api/v1/tee-times` - User's bookings

### Equipment
- `GET /api/v1/equipment` - List equipment
- `POST /api/v1/equipment/rentals` - Rent equipment
- `GET /api/v1/equipment/rentals` - User's rentals

### Range
- `POST /api/v1/range/sessions` - Book range session
- `GET /api/v1/range/bucket-prices` - Get pricing

### Weather
- `GET /api/v1/weather/course/{id}` - Current weather
- `GET /api/v1/weather/course/{id}/history` - Weather history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Open an issue in the repository
- Check the documentation
- Review the API endpoints
- Ensure all environment variables are set correctly

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by real golf course management needs
- Designed for scalability and performance
- Community-driven development approach
