🎓 Campus Queue Management System

A real-time, role-based campus queue management system built to streamline department queues for students, staff, admins, and guests using modern web technologies.

This system replaces manual queuing with a live, synchronized digital queue, reducing congestion, confusion, and waiting inefficiencies.

📌 Problem Statement

In many campuses:

Students crowd department offices

Queue status is unclear

Staff manually manage turn order

Guests have no structured access

This project solves the problem by providing:

Live queue visibility

Controlled access

Role-based actions

Real-time updates without refresh

🎯 Key Objectives

Digitize campus queues

Provide real-time updates using WebSockets

Ensure role-based access control

Support guest access without authentication

Maintain system consistency across refreshes and devices

👥 User Roles & Capabilities
👨‍🎓 Student

View departments

Join a department queue

See Now Serving ticket

Get notified when it’s their turn

View ticket number, position & wait time

Leave queue anytime

Auto-restore ticket after refresh

👩‍💼 Staff

Assigned to one department only

Call next ticket

Complete current ticket

Open / close queue

Increase queue limit

Generate QR code for guest access

View live queue statistics:

Total tickets

Served tickets

Remaining tickets

All actions update users in real time

🛠️ Admin

Create departments

Assign staff to departments

View all departments

Search departments easily

Enforced rule:

One staff → One department

🧍 Guest (QR-based)

Join queue using QR code

No login required

Anonymous token-based access

Live updates using sockets

Cancel ticket anytime

Session-safe & isolated from staff login

⚡ Real-Time Functionality

Implemented using Socket.IO with department-based rooms.

Events Used:

ticket_called

ticket_completed

queue_status_changed

queue_limit_updated

All connected users (students & guests) receive updates instantly.

🧠 System Architecture
Client (React)
   │
   ├── REST API (Axios)
   │
   └── WebSockets (Socket.IO)
            │
        Express Server
            │
        MongoDB (Mongoose)

🛠️ Tech Stack
Frontend

React.js

Tailwind CSS

React Router

Axios

Socket.IO Client

Backend

Node.js

Express.js

MongoDB

Mongoose

JWT Authentication

Socket.IO

QR Code Generator

🔐 Authentication & Security

JWT-based authentication for:

Admin

Staff

Student

Token-based anonymous access for guests

Role validation on every protected API

Frontend & backend route protection

Socket rooms scoped per department

📁 Project Structure
campus-queue-management-system/
│
├── frontend/
│   ├── pages/
│   │   ├── student/
│   │   ├── staff/
│   │   ├── admin/
│   │   └── guest/
│   ├── services/
│   ├── components/
│   └── App.jsx
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── server.js
│
└── README.md

⚙️ Installation & Setup
1️⃣ Clone Repository
git clone https://github.com/your-username/campus-queue-management-system.git
cd campus-queue-management-system

2️⃣ Backend Setup
cd backend
npm install


Create .env file:

PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173


Run backend:

npm run dev

3️⃣ Frontend Setup
cd frontend
npm install
npm run dev


Application runs at:

http://localhost:5173

🔗 Application Routes
Route	Description
/	Home
/about	About
/login	Login
/signup	Signup
/student	Student Dashboard
/staff	Staff Dashboard
/admin	Admin Dashboard
/guest/join	Guest Join
/guest/ticket	Guest Ticket
🧪 Tested Scenarios

Multiple students joining simultaneously

Guest & student receiving live updates

Ticket restore after page refresh

Queue open/close handling

Role separation (guest ≠ staff ≠ admin)

Socket reconnection stability

Unauthorized access prevention

📈 Scope for Future Enhancement

SMS / Email notifications

Multi-counter support

Analytics dashboard

Department schedules

Dark mode

Admin activity logs

🏁 Conclusion

This project demonstrates:

Full-stack MERN development

Real-time application design

Clean UI/UX with Tailwind

Proper state & socket synchronization

Scalable, role-based architecture

It is suitable for academic evaluation, hackathons, and portfolio presentation.

👨‍💻 Author

Naveen Chandra Devrari
B.Tech (CSE)
Full-Stack Development Project