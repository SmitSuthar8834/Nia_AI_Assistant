# 🤖 Nia AI Sales Assistant

An intelligent voice-based sales assistant that understands natural English (with Indian accent support), integrates with CRMs like Creatio, SAP, and Salesforce, and performs sales tasks like creating leads, scheduling meetings, and reading emails.

## 🌟 Key Features

- **Natural Voice Interaction** - Conversational AI with Indian English accent support
- **Multi-CRM Integration** - Works with Creatio, Salesforce, and SAP
- **Smart Lead Management** - Voice-powered lead creation and tracking
- **Meeting Scheduling** - Automated calendar management with Google Meet integration
- **Email Intelligence** - Reads and summarizes emails with action items
- **Task Automation** - Voice-controlled task creation and follow-up reminders
- **Admin Dashboard** - Comprehensive user and system management
- **Mobile Support** - Responsive web and native mobile apps
- **Multi-language** - Supports English, Hindi, and Hinglish
- **Analytics & Reporting** - Sales performance tracking and insights

## 🏗️ Architecture

```
+------------------+
| Web / Mobile App |
+--------+---------+
         |
+-----------v-----------+
|  Voice Handler (STT)  |
+-----------+-----------+
         |
+-----------v-----------+
|     AI Engine (LLM)   |
|  (Gemini / GPT etc.)  |
+-----------+-----------+
         |
+-----------v-----------+
| Integration Middleware|
+-----------+-----------+
         |
+--------+--------+--------+--------+
|        |        |        |        |
+---v---+ +---v---+ +---v---+ +---v---+
|Creatio| |Salesf.| | SAP   | |Google |
| API   | | API   | |OData  | | APIs  |
+-------+ +-------+ +-------+ +-------+
```

## 💻 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, Tailwind CSS |
| Mobile | Flutter / React Native |
| Voice | Google STT (en-IN), Whisper |
| AI Core | Gemini API / OpenAI GPT-4 |
| Backend | Node.js (Express) / Python (FastAPI) |
| Database | MongoDB / PostgreSQL |
| Auth | Firebase Auth / OAuth 2.0 |
| Hosting | Vercel, Firebase, Cloud Run |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- PostgreSQL 15+
- Redis 7+

### Development Setup

1. **Clone and Install Dependencies**
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install
```

2. **Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Update database and Redis connection details in .env
```

3. **Start with Docker (Recommended)**
```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f
```

4. **Or Start Manually**
```bash
# Start PostgreSQL and Redis locally
# Then run:
npm run dev
```

5. **Run Tests**
```bash
# Backend tests
npm test

# Frontend tests
cd frontend && npm test

# Test coverage
npm run test:coverage
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both backend and frontend in development |
| `npm run dev:backend` | Start only backend server |
| `npm run dev:frontend` | Start only frontend application |
| `npm run build` | Build both backend and frontend for production |
| `npm test` | Run backend test suite |
| `npm run lint` | Run ESLint on backend code |
| `npm run format` | Format code with Prettier |

### Development Phases

#### ✅ Phase 1: Foundation (COMPLETED)
- ✅ Project setup with TypeScript, Express, React
- ✅ PostgreSQL and Redis configuration
- ✅ Docker development environment
- ✅ Testing framework setup
- ✅ ESLint and Prettier configuration

#### 🔄 Phase 2: Core Services
- Authentication and authorization system
- User management API and interface
- Database models and migrations
- Basic admin dashboard

#### 📋 Phase 3: AI & Voice Integration
- Voice processing service setup
- AI engine integration
- Natural language processing
- Conversation context management

#### 🔗 Phase 4: CRM Integration
- Multi-CRM API abstraction layer
- Salesforce, Creatio, and SAP connectors
- Lead and task management
- Data synchronization

## 📋 Current Status

✅ **Requirements Complete** - 25 comprehensive requirements covering all features  
✅ **Design Complete** - Full system architecture and technical design  
✅ **Implementation Plan Ready** - 19 major tasks with 42 detailed sub-tasks  
🚀 **Ready for Development** - Spec-driven development can begin  

## 📁 Project Structure

```
.kiro/specs/nia-admin-system/
├── requirements.md    # 25 comprehensive requirements with EARS format
├── design.md         # Complete system architecture and technical design
└── tasks.md          # 19 major tasks with 42 detailed implementation steps
```

## 🔐 Security & Compliance

- OAuth 2.0 authentication with refresh tokens
- JWT-based access control
- Role-based permissions
- Comprehensive audit logging
- Data encryption at rest and in transit

## 🤝 Contributing

This project follows a spec-driven development approach. Please review the requirements and design documents before contributing.

## 📄 License

[License information to be added]

---

**Built with ❤️ for sales professionals who want to work smarter, not harder.**
## 🎯 
Next Steps

The spec is complete and ready for implementation! To start development:

1. **Review the Spec Documents:**
   - Read through `requirements.md` for feature understanding
   - Study `design.md` for technical architecture
   - Examine `tasks.md` for implementation roadmap

2. **Begin Implementation:**
   - Start with Task 1: Project foundation and development environment
   - Follow the incremental approach outlined in the tasks
   - Each task builds upon the previous ones

3. **Development Approach:**
   - Use test-driven development for all components
   - Implement features incrementally with regular testing
   - Focus on one task at a time for quality delivery

**Ready to build the future of AI-powered sales assistance!** 🚀