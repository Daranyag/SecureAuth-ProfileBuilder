
A full-stack, secure, and modern User Authentication System featuring robust JWT validation, bcrypt password encryption, role-based access control (RBAC), user profile customization (including avatar uploads), and an administrative control panel. The user interface features a premium glassmorphic visual language, complete with smooth animations and a responsive dark/light mode toggle.

---

## 🛠️ Technology Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (via Mongoose ODM)
- **Frontend**: React.js (built with Vite), Vanilla CSS (custom design system)
- **Security & Libs**:
  - `jsonwebtoken` (JWT creation and verification)
  - `bcryptjs` (secure one-way password hashing)
  - `multer` (multipart/form-data for file uploads)
  - `cors` (Cross-Origin Resource Sharing)
  - `lucide-react` (modern UI icons)
  - `axios` (HTTP network client)
  - `react-router-dom` (client-side routing)

---

## 📂 Project Structure

```
internlogin/
├── config/             # Database connection configurations
│   └── db.js
├── controllers/        # Request-response logic for endpoints
│   ├── authController.js
│   └── userController.js
├── middleware/         # Security, JWT, upload filters
│   ├── authMiddleware.js
│   └── uploadMiddleware.js
├── models/             # Mongoose schemas & hooks
│   └── userModel.js
├── routes/             # Express routing mapping
│   ├── authRoutes.js
│   └── userRoutes.js
├── uploads/            # Server uploads folder for avatars (auto-generated)
├── .env                # Server configuration (credentials, port, keys)
├── package.json        # Backend NPM package manifest
├── server.js           # Server bootstrap configuration
└── frontend/           # React client application (Vite template)
    ├── package.json    # Frontend NPM package manifest
    ├── index.html      # HTML skeleton
    └── src/
        ├── App.jsx     # Main Routing coordinator & Navbar layout
        ├── index.css   # Vanilla CSS Variables, Transitions & Theme styles
        ├── main.jsx    # React bootstrapping entrypoint
        ├── context/    # AuthContext state provider
        │   └── AuthContext.jsx
        ├── pages/      # Route view templates
        │   ├── Dashboard.jsx
        │   ├── Login.jsx
        │   ├── Profile.jsx
        │   ├── Register.jsx
        │   └── Settings.jsx
        ├── protected-routes/ # Authorization checks
        │   └── ProtectedRoute.jsx
        └── services/   # Client request layers
            └── api.js
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v16.x or higher recommended)
- **NPM** (packaged with Node.js)
- **MongoDB Database URI** (Atlas cluster or a local instance URI)

### 2. Backend Setup
1. Open a terminal in the root project folder:
   ```bash
   # Make sure dependencies are installed
   npm install
   ```
2. Create or verify the `.env` file in the root directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/database_name?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_signature_secret_key_here
   ```
3. Start the Express development server:
   ```bash
   npm start
   # or run via node directly
   node server.js
   ```
   The backend API will run on `http://localhost:5000`.

### 3. Frontend Setup
1. Open a second terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   The application will boot and display a local server address (usually `http://localhost:5173`).

---

## 🔒 Security Features
1. **Password Hashing**: Passwords are encrypted utilizing `bcryptjs` with a work factor of 10 inside the Mongoose user schema pre-save hook. Plaintext passwords are never saved.
2. **JWT Security**: Client requests authenticate using `Bearer` JSON Web Tokens passed in request authorization headers.
3. **Session Interceptor**: The Axios interceptor checks responses; if the server reports `401 Unauthorized` or `403 Forbidden` (e.g. user blocked or token expired), it immediately removes the tokens from `localStorage` and logs the user out.
4. **Data Validation**: Form fields (email formats, password rules, matching confirmation, profile size limits) are validated on both the client (for user feedback) and server (for database security).
5. **Secure Mongoose Projection**: The User Schema excludes the password hash field by default (`select: false`) to prevent accidental leaks in profile queries.

---

## 🛡️ Role-Based Access Control (RBAC)
- **Normal Users**:
  - Access to individual Dashboard metrics.
  - Can view and modify their own Profile info (Full Name, Email, Upload Avatar).
  - Can modify their account password under Settings.
  - Cannot access the Administrative Control console.
- **Admin Users**:
  - Complete access to personal Dashboard and Profile settings.
  - Grants access to the **Admin Control Panel** inside the Dashboard.
  - View all user accounts (displaying name, email, role, last login, active status).
  - Search/filter accounts by name or email.
  - **Block/Unblock Users**: Blocks users immediately. Blocked users lose endpoint privileges and are booted from their sessions on their next request.
  - **Delete Users**: Permanently erases user records and removes user profile images from server storage.

---

## 🌐 API Endpoint Directory

### Authentication Endpoint (`/api/auth`)
- `POST /api/auth/register` - Create new account (public).
- `POST /api/auth/login` - Verify credentials and receive JWT (public).

### User Endpoints (`/api/users`)
- `GET /api/users/me` - Fetch profile information for logged-in user (protected).
- `PUT /api/users/profile` - Update name, email, and profile avatar (protected, multipart/form-data).
- `PUT /api/users/change-password` - Update account password (protected).
- `GET /api/users` - Fetch full user directory (admin only).
- `PUT /api/users/:id/block` - Toggle blocked status of a user (admin only).
- `DELETE /api/users/:id` - Delete user account and corresponding storage files (admin only).
