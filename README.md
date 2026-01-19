# Refresh

A multi-role Express and MongoDB application for managing a student database. This project features image uploads, data validation, and authentication, built with modern Node.js libraries.

## Features

### Core Features
- **Student Management:** Full **CRUD** (Create, Read, Update, Delete) capabilities for student records.
- **Image Handling:** Integrated with **Cloudinary** and **Multer** for uploading and storing student profile images.
- **Data Validation:** Robust input validation using **Joi** to ensure data integrity.
- **Authentication:** Secure password handling with **Bcrypt** and authentication via **JSON Web Tokens (JWT)**.
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

Dependencies from package.json:

- bcrypt ^6.0.0 / bcryptjs ^3.0.3
- cloudinary ^1.41.3
- cookie-parser ^1.4.7
- dotenv ^17.2.3
- ejs ^3.1.10
- express ^5.2.1
- joi ^18.0.2
- jsonwebtoken ^9.0.3
- luxon ^3.7.2
- method-override ^3.0.0
- mongodb ^7.0.0
- mongoose ^9.0.2
- multer ^2.0.2
- multer-storage-cloudinary ^4.0.0
- nodemailer ^7.0.12

## Project structure (important files)

- `index.js` - Main server file: starts the server and connects to the database.
- `models/student.js` - Mongoose schema for Student records, containing personal info, marks, and image data.
- `models/owner.js` - Mongoose schema for the Owner (referenced by Student).
- `package.json` - Project metadata and dependencies.
- `.env` - Environment variables configuration (excluded from git).

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

2.  **Owner**: Referenced model for ownership/admin association.

## Routes

*(Inferred structure based on REST conventions and dependencies)*

- `GET /` — Dashboard / Home.
- `GET /students` — List all students.
- `GET /students/new` — Form to add a new student.
- `POST /students` — Create a new student (handles image upload).
- `GET /students/:id` — View student details.
- `GET /students/:id/edit` — Form to edit a student.
- `PUT /students/:id` — Update student details.
- `DELETE /students/:id` — Delete a student record.

> Note: Forms that perform PUT and DELETE use `method-override` with a query parameter of `_method`.

## Setup & run (Windows PowerShell)

1. Install dependencies:

```powershell
npm install
```

2. Configure Environment Variables:
   Create a `.env` file in the root directory. You will likely need the following keys based on the dependencies:
   ```env
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_KEY=...
   CLOUDINARY_SECRET=...
   MONGO_URL=mongodb://127.0.0.1:27017/refresh
   JWT_SECRET=...
   ```

3. Ensure MongoDB is running locally.

4. Start the app:

```powershell
node index.js
```

5. Open your browser at: `http://localhost:3000/` (Check console for actual port).

## Notes & troubleshooting

- **Cloudinary Error:** If image uploads fail, ensure your `.env` file has the correct Cloudinary credentials.
- **Database Connection:** Ensure the MongoDB service is running. If using a cloud database (Atlas), ensure your IP is whitelisted.
- **EJS Errors:** If views fail to render, check that the `views` directory exists and contains the necessary `.ejs` files.

## Potential improvements

- Add unit tests (currently `npm test` is not configured).
- Implement a frontend framework or improve UI with Bootstrap (if not already present).
- Add pagination for the student list if the database grows large.

## License

This project uses the ISC license as indicated in `package.json`.