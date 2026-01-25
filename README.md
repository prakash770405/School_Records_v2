# Refresh

A multi-role Express and MongoDB application for managing a student database. This project features image uploads, data validation, and authentication, built with modern Node.js libraries.

## Features

### Core Features
- **Student Management:** Full **CRUD** (Create, Read, Update, Delete) capabilities for student records.
- **Image Handling:** Integrated with **Cloudinary** and **Multer** for uploading and storing student profile images.
- **Data Validation:** Robust input validation using **Joi** to ensure data integrity.
- **Authentication:** Secure password handling with **Bcrypt** and authentication via **JSON Web Tokens (JWT)**. Includes **OTP-based Email Verification** for Admin accounts.
- **Student Authentication:** Students can create their own passwords and log in to a dedicated dashboard.
- **Email Integration:** Uses **Nodemailer** for email communication capabilities.
- **Date Management:** Precise date handling using **Luxon**.

### Technical Features
- **Server-Side Rendering:** Dynamically renders HTML with data from the database using EJS templates.
- **Method Override:** Supports `PUT` and `DELETE` HTTP methods in forms using `method-override`.
- **Environment Configuration:** Securely manages API keys and database URIs using `dotenv`.

## Tech stack / Libraries / Frameworks

- Node.js (runtime)
- Express (web framework) — v5.x
- EJS (templating engine)
- Mongoose (MongoDB object modeling) — v9.x
- Cloudinary & Multer (Media storage)
- Joi (Validation)
- JSON Web Token (Authentication)
- Nodemailer (Emailing)

### Dependencies

| Package                  | Version  | Description                                |
| ------------------------ | -------- | ------------------------------------------ |
| `bcrypt`                 | `^6.0.0` | Library for hashing passwords.             |
| `bcryptjs`               | `^3.0.3` | An alternative to `bcrypt`.                |
| `cloudinary`             | `^1.41.3`| Cloud-based image and video management.    |
| `connect-flash`          | `^0.1.1` | Middleware for flashing messages.          |
| `cookie-parser`          | `^1.4.7` | Parse Cookie header and populate `req.cookies`. |
| `dotenv`                 | `^17.2.3`| Loads environment variables from a `.env` file. |
| `ejs`                    | `^3.1.10`| Embedded JavaScript templating.            |
| `express`                | `^5.2.1` | Fast, unopinionated, minimalist web framework. |
| `express-session`        | `^1.18.2`| Simple session middleware for Express.     |
| `joi`                    | `^18.0.2`| Object schema description language and validator. |
| `jsonwebtoken`           | `^9.0.3` | JSON Web Token implementation.             |
| `luxon`                  | `^3.7.2` | Library for working with dates and times.  |
| `method-override`        | `^3.0.0` | Lets you use HTTP verbs like PUT or DELETE. |
| `mongodb`                | `^7.0.0` | The official MongoDB driver for Node.js.   |
| `mongoose`               | `^9.0.2` | MongoDB object modeling tool.              |
| `multer`                 | `^2.0.2` | Middleware for handling `multipart/form-data`. |
| `multer-storage-cloudinary`| `^4.0.0` | Cloudinary storage engine for Multer.      |
| `nodemailer`             | `^7.0.12`| Send e-mails from Node.js.                 |


## Project structure (important files)

- `app.js` - Main server file: starts the server and connects to the database.
- `models/student.js` - Mongoose schema for Student records.
- `models/owner.js` - Mongoose schema for the Owner (Admin).
- `models/studentAuth.js` - Mongoose schema for Student authentication.
- `package.json` - Project metadata and dependencies.
- `.env` - Environment variables configuration (excluded from git).
- `routes/` - Contains all the route definitions for the application.
- `views/` - Contains all the EJS templates.
- `public/` - Contains static assets like CSS and images.
- `middlewares/` - Contains custom middleware for authentication, validation, etc.
- `config/` - Contains configuration for Cloudinary, Multer, and Nodemailer.

## Data model

The application uses Mongoose models to structure the database:

1.  **Student (`models/student.js`)**:
    - `name` (String, default: 'hahaha')
    - `img` (Object: url, filename, photosize, phototype)
    - `subjects` (Array: name, marks [0-100])
    - `age` (Number, 4-100)
    - `roll_no` (Number)
    - `phone_no` (Number)
    - `email` (String)
    - `Class` (Number)
    - `owner` (ObjectId ref to 'Owner')
    - `date` (Date, default: Date.now)

2.  **Owner (`models/owner.js`)**:
    - `name` (String)
    - `email` (String)
    - `phone_no` (Number)
    - `password` (String)
    - `otp` (String)
    - `otpExpires` (Date)
    - `isVerified` (Boolean)

3.  **StudentAuth (`models/studentAuth.js`)**:
    - `student` (ObjectId ref to 'Student')
    - `email` (String)
    - `password` (String)
    - `lastLogin` (Date)
    - `isActive` (Boolean)

## Routes

**General**
- `GET /` — Dashboard / List all students (supports filtering by Class).

**Students (`/students`)**
- `GET /newdata` — Form to add a new student.
- `POST /form/data` — Create a new student (handles optional image upload).
- `GET /view/:id` — View student details.
- `GET /form/edit/:id` — Form to edit a student.
- `PUT /form/:id/edit` — Update student details (handles image replacement and class change).
- `DELETE /form/:id/delete` — Delete a student record.

**Subjects (`/subjects`)**
- `GET /new` — Form to add subjects to a specific class.
- `POST /add` — Add subjects to all students in a class.
- `POST /update/:studentId/:subjectId` — Update marks for a specific subject.

**Admin (`/admin`)**
- `GET /signup` — Admin signup form.
- `POST /signup` — Initiate admin signup (sends OTP).
- `GET /verify` — Page to verify email with OTP.
- `POST /verify-otp` — Verify email and create session.
- `POST /resend-otp` — Resend OTP to the admin's email.
- `GET /login` — Admin login form.
- `POST /login` — Authenticate admin.
- `GET /logout` — Logout admin.
- `DELETE /:adminId/delete` — Delete an admin account.

**Student Authentication (`/student`)**
- `GET /login` — Student login page.
- `POST /login` — Authenticate student.
- `GET /create-password` — Page for students to create a password.
- `POST /create-password` — Create a password for a student.
- `GET /dashboard` — Student dashboard.
- `GET /logout` — Logout student.


> Note: Forms that perform PUT and DELETE use `method-override` with a query parameter of `_method`.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally or a cloud instance)

## Setup & run (Windows PowerShell)

1. Install dependencies:

```powershell
npm install
```

2. Configure Environment Variables:
   Create a `.env` file in the root directory. You will need the following keys based on the dependencies:
   ```env
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_KEY=...
   CLOUDINARY_SECRET=...
   MONGO_URL=mongodb://127.0.0.1:27017/refresh
   JWT_SECRET=...
   EMAIL_USER=...
   EMAIL_PASS=...
   ```

3. Ensure MongoDB is running.

4. Start the app:

```powershell
node app.js
```

5. Open your browser at: `http://localhost:3000/` (Check console for actual port).

## Notes & troubleshooting

- **Cloudinary Error:** If image uploads fail, ensure your `.env` file has the correct Cloudinary credentials.
- **Database Connection:** Ensure the MongoDB service is running. If using a cloud database (Atlas), ensure your IP is whitelisted.
- **EJS Errors:** If views fail to render, check that the `views` directory exists and contains the necessary `.ejs` files.

## Potential improvements

- **Testing:** Add unit and integration tests using a framework like [Jest](https://jestjs.io/) or [Mocha](https://mochajs.org/).
- **UI/UX:** Enhance the user interface with a frontend framework like [Bootstrap](https://getbootstrap.com/) or [Tailwind CSS](https://tailwindcss.com/).
- **Pagination:** Implement pagination for the student list to handle large datasets efficiently.
- **Password Reset:** Add a "forgot password" feature for both admins and students.
- **Role-Based Access Control (RBAC):** Implement more granular permissions for different user roles.
- **Deployment:** Containerize the application using [Docker](https://www.docker.com/) for easier deployment.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any bugs or feature requests.

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature-name`).
6. Open a pull request.

## License

This project uses the ISC license as indicated in `package.json`.

```
Refresh
├─ app.js
├─ config
│  ├─ cloudinary.js
│  ├─ email.js
│  └─ multer.js
├─ middlewares
│  ├─ auth.js
│  ├─ checkLogin.js
│  ├─ detectStudent.js
│  ├─ noCache.js
│  ├─ studentAuth.js
│  └─ validatestudent.js
├─ models
│  ├─ owner.js
│  ├─ student.js
│  └─ studentAuth.js
├─ package-lock.json
├─ package.json
├─ public
│  └─ css
│     └─ index.css
├─ README.md
├─ routes
│  ├─ admin.routes.js
│  ├─ index.routes.js
│  ├─ student.routes.js
│  ├─ studentAuth.routes.js
│  └─ subject.routes.js
├─ schema.js
└─ views
   ├─ addsubject.ejs
   ├─ editform.ejs
   ├─ error.ejs
   ├─ form.ejs
   ├─ Includes
   │  ├─ flash.ejs
   │  ├─ footer.ejs
   │  ├─ header.ejs
   │  └─ navbar.ejs
   ├─ index.ejs
   ├─ Loginform.ejs
   ├─ signupform.ejs
   ├─ student
   │  ├─ createPassword.ejs
   │  ├─ dashboard.ejs
   │  └─ login.ejs
   ├─ verify.ejs
   └─ viewdetail.ejs

```