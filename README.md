# Peervo — Student Portfolio & Real-Time Collaboration Platform (v2)

**Peervo** is a student portfolio and real-time collaboration platform where student profiles display actual project showcases, study materials, and real-time chat. Instead of juggling GitHub for projects, LinkedIn for networking, and WhatsApp for team chat, Peervo brings the essentials of all three into one focused student tool — complete with a course notes hub.

---

## Key Features

- 👤 **Student Authentication & Profiles**: JWT-authenticated student accounts with editable bio, skills, education, and avatar picture.
- 🚀 **Project Showcase**: Post, edit, and star projects with tech stack tags, live demo links, and GitHub repository links.
- 📚 **Course Notes Hub (NEW)**: Upload study notes (PDF, DOC, images) tagged by course name (e.g. DBMS, DSA). Search, filter by course, and download notes.
- 💬 **Real-Time 1-on-1 & Team Group Chat**: Instant messaging powered by Socket.IO with typing indicators and persisted message history.
- 🟢 **Online Status & Read Receipts**: Live online status indicators on student profiles and double-tick message read receipts.
- 🔖 **Bookmarks / Saved Items (NEW)**: Save projects and course notes to a personal saved list.
- 🔔 **In-App Real-Time Notifications (NEW)**: Live notifications for new messages, stars on projects/notes, and comments delivered via Socket.IO and REST API.

---

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript, React 18, Vite, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express.js
- **Real-Time**: Socket.IO
- **Database**: MongoDB & Mongoose
- **Authentication**: JWT & bcryptjs
- **File Storage**: Multer / Cloudinary integration (profile pics, project screenshots, PDF/DOC note uploads)

---

## Application Flow

```
User → Register/Login → Build Profile → Add Projects → Upload/Browse Course Notes 
→ Explore Other Students → View Profile → Start Chat → Real-Time Messaging 
→ Star / Bookmark Projects & Notes → Live Notifications
```

---

## Getting Started Locally

### Configure the Backend
Create `server/.env` before starting the backend. At minimum, set:

```env
MONGO_URI=mongodb://127.0.0.1:27017/peervo
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters-long
CLIENT_URL=http://localhost:5173
```

Set `EMAIL_USER` and `EMAIL_PASS` to enable registration verification emails. In local development only, if email is not configured, the OTP is shown by the development app. Production never returns or logs OTP codes and requires email delivery to succeed.

For production, set `CLIENT_URL` to the exact frontend origin (or comma-separated exact origins), and configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` for persistent uploads. A JWT secret is required; use a random value at least 32 characters long. Without Cloudinary credentials, the API remains available but uploads return a configuration error. Grant admin access only by explicitly setting a user's `role` to `admin` in the database; email addresses never grant privileges.

### 1. Backend Server Setup
```bash
cd server
npm install
npm run dev
```
The server will run at `http://localhost:5000`.

Authentication uses an HttpOnly session cookie. For production, serve the frontend and API over HTTPS and set `CLIENT_URL` to the exact frontend origin so the browser can send the cookie.

After upgrading from the old localStorage-token login, users must sign in again. If the frontend and API are hosted on different sites, the session cookie uses `SameSite=None; Secure`; browsers that block third-party cookies may require hosting both on the same site or proxying `/api` and Socket.IO through the frontend domain.

### 2. Frontend Client Setup
```bash
cd client
npm install
npm run dev
```
The client will run at `http://localhost:5173`.

---

## Viva Talking Points

- **Why MongoDB over SQL for this schema?**: Flexible JSON-like document structure perfect for array fields like skills, tags, likedBy lists, and dynamic item references.
- **How does Socket.IO handle real-time delivery?**: Uses WebSockets with HTTP long-polling fallback, room subscriptions for 1-on-1 and group chats, and event emitters for instant notifications.
- **How do read receipts work?**: Messages maintain status (`sent` -> `delivered` -> `read`). When a user opens a chat, `mark_message_read` updates status and emits socket events to update ticks in real time.
- **File Upload Security & Validation**: Validates MIME types and file extensions (PDF, DOC, images) with size limits prior to storage.
