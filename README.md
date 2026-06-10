## Team Information

This project was developed by OCC 1 Team 08 for WIF2003 Web Programming.

Group members:

* Chong Chee Yan
* Ho Kang Zheng
* Chua Xin Yi
* Lee Zi Xuan
* Yeong Hui Ni
* Lee Qian Yi



# InsightHUB KPI Management System

InsightHUB is a web-based KPI Management System developed for the WIF2003 Web Programming project. The system helps managers and staff manage KPI-related activities in a more organized way, including KPI creation, KPI assignment, progress tracking, evidence submission, evidence verification, and dashboard monitoring.

The system is built using the MERN stack, with React.js for the frontend, Node.js and Express.js for the backend, and MongoDB Atlas as the database.



## Project Features

The main features of the system include:

* User registration and login
* JWT-based authentication
* Role-based access for Manager and Staff
* KPI creation, listing, update, and deletion
* KPI assignment to staff
* Staff KPI progress update
* Evidence submission by staff
* Evidence verification by manager
* Dashboard and KPI progress overview
* System notifications for managers and staff
* Profile and avatar management
* Progress history tracking
* Manager staff management (edit and delete staff records)
* MongoDB database integration



## Technology Stack

### Frontend

* React.js
* React Router
* Bootstrap
* Bootstrap Icons
* Axios
* Chart.js
* react-chartjs-2

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JSON Web Token (JWT)
* bcryptjs
* Multer
* dotenv
* cors
* nodemon



## Project Structure

```bash
InsightHUB_WEB/
│
├── backend/
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   ├── __tests__/
│   ├── jest.config.cjs
│   ├── babel.config.cjs
│   ├── server.js
│   └── package.json
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   ├── constants/
│   ├── utils/
│   ├── apiConfig.js
│   ├── apiClient.js
│   ├── App.js
│   └── index.js
│
├── package.json
└── README.md
```

---

## Prerequisites

Before running the project, make sure the following are installed:

* Node.js
* npm
* MongoDB Atlas account
* Visual Studio Code or any code editor



## Setup Instructions

### 1. Clone or download the project

Clone the repository and open the project folder in Visual Studio Code.

```bash
git clone https://github.com/Ivy729/InsightHUB_WEB.git
cd InsightHUB_WEB
```



### 2. Install frontend dependencies

From the project root folder, run:

```bash
npm install
```



### 3. Install backend dependencies

Go into the backend folder and install the backend packages:

```bash
cd backend
npm install
```

**Important:** After installing backend dependencies, return to the project root folder before running the full application:

```bash
cd ..
```

Many users accidentally remain inside the `backend` folder and then cannot run the root-level scripts correctly.



### 4. Create the backend environment file

Inside the `backend` folder, create a `.env` file.

Add the following environment variables:

```env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
PORT=5000
```

Replace `your-mongodb-connection-string` with your MongoDB Atlas connection string.

Do not upload or share the `.env` file publicly because it contains private database and security information.



## Running the Project

### Run the full application

From the project root folder, run:

```bash
npm run dev
```

This will start both the frontend and backend.

By default:

* Frontend runs on: `http://localhost:3000`
* Backend runs on: `http://localhost:5000`

**Note:** The application uses `HashRouter`, so routes appear with `#/` in the URL, for example:

* `http://localhost:3000/#/login`
* `http://localhost:3000/#/dashboard-manager`



## Running Backend Only

To run only the backend server:

```bash
cd backend
npm run dev
```

or:

```bash
cd backend
npm start
```



## Running Tests

The project includes unit testing and functional testing using Jest and Supertest.

Go to the backend folder:

```bash
cd backend
```

Run all backend tests (unit + functional):

```bash
npm test
```

Run unit tests only:

```bash
npm test -- unit.test.js
```

Run functional tests only:

```bash
npm test -- functional.test.js
```



## Notes for Testing

For authenticated functional tests, make sure valid manager and staff test accounts exist in MongoDB.

The following optional variables can be added into `backend/.env`:

```env
TEST_MANAGER_EMAIL=manager@gmail.com
TEST_MANAGER_PASSWORD=your-manager-password
TEST_STAFF_EMAIL=staff@gmail.com
TEST_STAFF_PASSWORD=your-staff-password
```

These accounts are used only for testing protected routes and role-based access.



## Basic Usage Flow

1. Register a new staff or manager account.
2. Login using the correct role.
3. Manager creates and assigns KPI to staff.
4. Staff views assigned KPI and updates progress.
5. Staff submits evidence for the KPI.
6. Manager verifies the submitted evidence.
7. Manager can view KPI progress through the dashboard.
8. Manager can update or delete KPI records when needed.

---

## Important Reminder

Before running the project, make sure:

* Dependencies are installed in both frontend and backend.
* Returned to the project root folder (`cd ..`) before running `npm run dev`.
* The `.env` file is created inside the `backend` folder.
* MongoDB Atlas connection string is correct.
* Backend server and frontend are running properly.
* Port `3000` and port `5000` are not being used by other applications.
