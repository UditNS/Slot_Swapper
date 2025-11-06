# SlotSwapper 🔄

A peer-to-peer time slot scheduling and swapping application built with the MERN stack. SlotSwapper allows users to manage their calendar events and exchange time slots with other users seamlessly.

## 🌟 Features

- **User Authentication**: Secure signup and login with JWT tokens
- **Event Management**: Create, edit, delete, and view your calendar events
- **Swappable Slots**: Mark events as swappable to allow other users to request swaps
- **Marketplace**: Browse available time slots from other users
- **Swap Requests**: Send and receive swap requests with real-time status tracking
- **Dashboard Analytics**: View statistics about your events and swap history
- **Responsive Design**: Beautiful UI built with Tailwind CSS

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js**: Server and API
- **MongoDB** & **Mongoose**: Database and ODM
- **JWT**: Authentication
- **bcrypt**: Password hashing
- **CORS**: Cross-origin resource sharing

### Frontend
- **React 19**: UI library
- **Redux Toolkit**: State management
- **React Router**: Navigation
- **Axios**: HTTP client
- **Tailwind CSS**: Styling
- **Lucide React**: Icons
- **Vite**: Build tool

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or Atlas account)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd slotswapper
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend` directory:

```env
PORT=4000
DATABASE_URL=mongodb://localhost:27017/slotswapper
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
```

**For MongoDB Atlas:**
```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/slotswapper?retryWrites=true&w=majority
```

### 3. Frontend Setup

```bash
cd ../Frontend
npm install
```

The `.env` file is already configured in `Frontend/.env`:

```env
VITE_API_URL=http://localhost:4000/api
```

### 4. Run the Application

**Terminal 1 - Start Backend:**
```bash
cd Backend
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
cd Frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000

## 📁 Project Structure

```
slotswapper/
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # MongoDB connection
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT authentication middleware
│   │   ├── models/
│   │   │   ├── user.js              # User schema
│   │   │   ├── events.js            # Event schema
│   │   │   └── swapRequest.js       # Swap request schema
│   │   ├── routes/
│   │   │   ├── auth.js              # Authentication routes
│   │   │   ├── events.js            # Event management routes
│   │   │   └── swap.js              # Swap functionality routes
│   │   └── app.js                   # Express app configuration
│   ├── package.json
│   └── .env
│
└── Frontend/
    ├── src/
    │   ├── components/
    │   │   ├── CalanderView.jsx     # Calendar event list
    │   │   ├── MarketplaceView.jsx  # Available slots marketplace
    │   │   ├── RequestsView.jsx     # Swap requests management
    │   │   ├── CreateEventModal.jsx # Create event modal
    │   │   └── EditEventModal.jsx   # Edit event modal
    │   ├── pages/
    │   │   ├── Login.jsx            # Login page
    │   │   ├── Signup.jsx           # Signup page
    │   │   └── Dashboard.jsx        # Main dashboard
    │   ├── store/
    │   │   ├── index.js             # Redux store configuration
    │   │   └── slices/
    │   │       ├── authSlice.js     # Authentication state
    │   │       ├── eventSlice.js    # Events state
    │   │       └── swapSlice.js     # Swaps state
    │   ├── services/
    │   │   └── api.js               # API service layer
    │   ├── App.jsx                  # Main app component
    │   ├── main.jsx                 # App entry point
    │   └── index.css                # Global styles
    ├── package.json
    └── .env
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Events
- `GET /api/events` - Get all user events (protected)
- `GET /api/events/:id` - Get single event (protected)
- `POST /api/events` - Create event (protected)
- `PUT /api/events/:id` - Update event (protected)
- `DELETE /api/events/:id` - Delete event (protected)
- `PATCH /api/events/:id/toggle-swappable` - Toggle swappable status (protected)
- `GET /api/events/stats/upcoming` - Get event statistics (protected)

### Swaps
- `GET /api/swaps/swappable-slots` - Get all swappable slots (protected)
- `POST /api/swaps/swap-request` - Create swap request (protected)
- `POST /api/swaps/swap-response/:requestId` - Accept/reject swap (protected)
- `GET /api/swaps/my-requests` - Get user's swap requests (protected)
- `GET /api/swaps/request/:requestId` - Get specific swap request (protected)
- `DELETE /api/swaps/cancel/:requestId` - Cancel swap request (protected)
- `GET /api/swaps/stats` - Get swap statistics (protected)

## 🎯 Usage Guide

### 1. Register/Login
- Create a new account or login with existing credentials
- JWT token is stored in localStorage for authentication

### 2. Create Events
- Navigate to "My Calendar"
- Click "Create Event" button
- Fill in event details (title, start time, end time)
- Event is created with "BUSY" status by default

### 3. Make Events Swappable
- In "My Calendar", click "Make Swappable" on any event
- Event status changes to "SWAPPABLE" and becomes visible in the marketplace

### 4. Browse Marketplace
- Navigate to "Marketplace" tab
- View all swappable slots from other users
- Click "Request Swap" to initiate a swap

### 5. Manage Swap Requests
- Navigate to "Requests" tab
- **Incoming**: Accept or reject swaps from other users
- **Outgoing**: View status of your swap requests or cancel them

### 6. Accept a Swap
- When you accept a swap, the ownership of both events is exchanged
- Both events are marked as "BUSY" after successful swap

## 🔒 Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token authentication
- Protected API routes with middleware
- Token expiration (7 days)
- CORS configuration for secure cross-origin requests

## 🎨 Event Status Types

- **BUSY**: Regular event, not available for swapping
- **SWAPPABLE**: Available for other users to request swap
- **SWAP_PENDING**: Event has an active swap request (cannot be modified)

## 📊 Dashboard Statistics

- Total events count
- Busy events count
- Swappable events count
- Pending swaps count
- Total swap requests (accepted/rejected/pending)

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod` or check Atlas connection
- Verify DATABASE_URL in `.env` is correct
- Check firewall settings for Atlas IP whitelist

### Port Already in Use
- Backend default port: 4000 (change in `.env` with PORT variable)
- Frontend default port: 5173 (managed by Vite)

### CORS Errors
- Ensure frontend URL matches CORS origin in `Backend/src/app.js`
- Default is set to `http://localhost:5173`

### Authentication Issues
- Clear localStorage and try logging in again
- Check if JWT_SECRET is set in backend `.env`
- Verify token is being sent in Authorization header

## 🚧 Future Enhancements

- [ ] Real-time notifications with Socket.io
- [ ] Email notifications for swap requests
- [ ] Calendar view (week/month)
- [ ] Event categories and tags
- [ ] User profiles and ratings
- [ ] Advanced filtering and search
- [ ] Mobile app with React Native
- [ ] Event reminders
- [ ] Recurring events
- [ ] Group swaps (multiple participants)


## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For issues and questions, please open an issue in the repository.
