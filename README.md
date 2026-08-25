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

### 1. Backend Server Setup
```bash
cd server
npm install
npm run dev
```
The server will run at `http://localhost:5000`.

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
