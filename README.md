# Nia AI Sales Assistant

A comprehensive voice-powered AI sales assistant with CRM integration, built using microservices architecture.

## 🏗️ Architecture

This application follows a microservices architecture with the following services:

### Core Services
- **API Gateway** (Port 3000) - Routes requests and handles authentication
- **Auth Service** (Port 3001) - User authentication and authorization
- **Voice Service** (Port 3002) - Speech processing and voice interactions
- **AI Service** (Port 3004) - Natural language processing and AI responses
- **CRM Service** (Port 3003) - CRM integrations (Salesforce, Creatio, SAP)
- **Notification Service** (Port 3005) - Push notifications and alerts

### Infrastructure
- **PostgreSQL** - Primary database (separate DBs per service)
- **Redis** - Caching and session storage
- **RabbitMQ** - Message queue for inter-service communication

### Frontend
- **React Application** (Port 3006) - Modern web interface with Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for development)
- Google Cloud credentials (for voice processing)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nia-ai-sales-assistant
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3006
   - API Gateway: http://localhost:3000
   - Database: localhost:5432

### Default Login
- Email: `admin@nia.ai`
- Password: `admin123`

## 📁 Project Structure

```
nia-ai-sales-assistant/
├── services/
│   ├── api-gateway/          # API Gateway service
│   ├── auth-service/         # Authentication service
│   ├── voice-service/        # Voice processing service
│   ├── ai-service/          # AI engine service
│   ├── crm-service/         # CRM integration service
│   └── notification-service/ # Notification service
├── frontend/                 # React frontend application
├── database/
│   ├── init/                # Database initialization scripts
│   └── migrations/          # Database migrations
├── docker-compose.yml       # Docker services configuration
└── README.md
```

## 🎯 Features

### Voice Assistant
- **Speech Recognition** - Google Speech-to-Text with Indian English support
- **Natural Language Processing** - Intent detection and entity extraction
- **Text-to-Speech** - Natural voice responses
- **Multi-language Support** - English, Hindi, and Hinglish

### CRM Integration
- **Multi-CRM Support** - Salesforce, Creatio, and SAP
- **Real-time Sync** - Automatic data synchronization
- **Lead Management** - Create, update, and track leads
- **Task Management** - Automated task creation and tracking
- **Meeting Scheduling** - Calendar integration

### Admin Dashboard
- **User Management** - Role-based access control
- **System Monitoring** - Health checks and performance metrics
- **Analytics** - Sales performance and AI interaction analytics
- **Configuration** - CRM setup and system settings

## 🔧 Development

### Running Individual Services

Each service can be run independently for development:

```bash
# Auth Service
cd services/auth-service
npm install
npm run dev

# Voice Service
cd services/voice-service
npm install
npm run dev

# Frontend
cd frontend
npm install
npm start
```

### Database Migrations

```bash
# Run migrations for a specific service
cd services/auth-service
npm run migrate
```

### Testing

```bash
# Run tests for all services
docker-compose -f docker-compose.test.yml up

# Run tests for a specific service
cd services/auth-service
npm test
```

## 🔐 Security

- JWT-based authentication
- Role-based access control
- API rate limiting
- Input validation and sanitization
- Secure password hashing (bcrypt)
- HTTPS enforcement in production

## 📊 Monitoring

- Winston logging across all services
- Health check endpoints
- Performance metrics
- Error tracking and alerting

## 🚀 Deployment

### Production Deployment

1. **Build production images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Deploy to production**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Environment Variables

Key environment variables to configure:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=your-secret-key

# Google Cloud (for voice processing)
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# CRM Integrations
SALESFORCE_CLIENT_ID=your-salesforce-client-id
SALESFORCE_CLIENT_SECRET=your-salesforce-client-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs`

## 🗺️ Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced AI features (sentiment analysis, predictive analytics)
- [ ] Additional CRM integrations
- [ ] Offline capabilities
- [ ] Advanced reporting and dashboards
- [ ] Multi-tenant support