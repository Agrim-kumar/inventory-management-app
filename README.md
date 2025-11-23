# Product Inventory Management System

A full-stack inventory management application with search, filtering, inline editing, and CSV import/export.

## Tech Stack
- Frontend: React
- Backend: Node.js + Express
- Database: SQLite

##Features
Product search by name with filtering by category
Inline editing of product details with optimistic UI updates
CSV import/export for products
Inventory change history with detailed logs
Responsive design for mobile and desktop
Fully deployed backend and frontend with live URLs

##Repository Structure
```
inventory-management-system/
│
├── backend/          # Node.js + Express + SQLite backend
│   ├── config/       # Database config
│   ├── controllers/  # Request handlers
│   ├── middleware/   # Middlewares (upload, error handler)
│   ├── routes/       # API routes
│   ├── uploads/      # Temp file uploads (CSV)
│   ├── .env          # Environment variables
│   ├── server.js     # Main server file
│   └── package.json
│
└── frontend/         # React frontend
    ├── src/
    │   ├── components/  # UI components (ProductTable, InventoryHistory, etc.)
    │   ├── pages/       # Pages (ProductsPage)
    │   ├── services/    # API calls wrapper (axios)
    │   ├── utils/
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    ├── .env           # Local env variables
    └── package.json
```
##Setup Instructions
  Prerequisites
    Node.js (v16+)
    npm (v8+)
    Git
    GitHub account
    Optional: VS Code editor

##Backend Setup
1.Open terminal and navigate to the backend folder:
  cd backend
2.Install dependencies:
  npm install
3.Create a .env file with content:
  PORT=5000
  NODE_ENV=development
  DATABASE_PATH=./inventory.db
4.Start the backend server in development mode:
  npm run dev
5.Backend server runs on http://localhost:5000

##Frontend Setup
1.Open a new terminal and navigate to the frontend folder:
  cd frontend
2.Install dependencies:
  npm install
3.Create .env file in frontend root with content:
4.REACT_APP_API_URL=http://localhost:5000/api
5.Start React development server:
   npm start
6.Access your app at http://localhost:3000

##Deployment Instructions
Backend Deployment on Render
1.Push your backend code to GitHub:
  git add .
  git commit -m "Backend initial commit"
  git push origin main
2.Go to Render and create a new Web Service.

3.Connect your GitHub repo, select the backend folder as root directory.

4.Set the build and start commands:
  Build: npm install
  Start: npm start
5.Set environment variables in Render dashboard:
  PORT=5000
  NODE_ENV=production
  DATABASE_PATH=./inventory.db
6.Confirm Auto-Deploy is enabled.

7.Deploy and wait for the service to come online.
8.Test the live backend URL (https://your-backend.onrender.com/api/products).

Frontend Deployment on Netlify
1.Push frontend code to GitHub (if not already done):
  git add .
  git commit -m "Frontend initial commit"
  git push origin main
2.Go to Netlify, create new site from Git repository.
3.Configure build settings:
  Base directory: frontend
  Build command: npm run build
  Publish directory: frontend/build
4.Set environment variable on Netlify:
  REACT_APP_API_URL=https://your-backend.onrender.com/api
5.Deploy site and note the frontend URL (like https://your-app.netlify.app).
6.After deployment, the frontend will communicate with the live backend.

##Notes and Tips
 - Make sure CORS is enabled on the backend with appropriate origins.
 - Backend SQLite database file must be accessible and persistent on Render.
 - Always redeploy frontend on Netlify after changing environment variables.
 - For local development, run both frontend (npm start) and backend (npm run dev) concurrently.
 - Console logs and network tab in the browser are helpful for debugging failed API calls.

## Live URLs
- Frontend: https://inventorry-management.netlify.app/
- Backend: https://inventory-backend-9m7o.onrender.com/
