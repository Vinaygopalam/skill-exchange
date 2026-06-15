# Skill Exchange Platform

A full-stack web application that enables users to share, learn, and exchange skills with others. Users can create skill listings, send exchange requests, communicate through real-time chat, receive notifications, review other users, and track their progress through leaderboards and analytics.

## Features

### User Authentication

* User Registration and Login
* JWT-based Authentication
* Secure Protected Routes

### Skill Management

* Post New Skills
* Edit Existing Skills
* Delete Skills
* Browse Available Skills

### Skill Exchange Requests

* Send Skill Exchange Requests
* Accept or Reject Requests
* Track Request Status

### Real-Time Communication

* Real-Time Chat using Socket.io
* Instant Messaging Between Users

### User Profile System

* View and Update Profiles
* Display Skills and Activity

### Notifications

* Real-Time Notifications
* Request Updates and Alerts

### Reviews and Ratings

* Leave Reviews for Other Users
* User Rating System

### Advanced Features

* Advanced Skill Search
* Personalized Recommendations
* Leaderboard System
* Statistics Dashboard

## Tech Stack

### Frontend

* React.js
* React Router
* CSS

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### Real-Time Communication

* Socket.io

### Authentication

* JWT (JSON Web Token)

## Project Structure

skill-exchange/

├── backend/

├── frontend/

├── README.md

## Installation

### Clone the Repository

```bash
git clone https://github.com/Vinaygopalam/skill-exchange.git
cd skill-exchange
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file and add:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

Start the backend server:

```bash
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Future Enhancements

* Video Calling
* Skill Verification Badges
* AI-Based Skill Recommendations
* Mobile Application
* Email Notifications

## Author

Vinay Gopalam

GitHub: https://github.com/Vinaygopalam

## Live Demo

https://skill-exchange-iota.vercel.app/login
