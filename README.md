 
# ClassicStudio Backend

The backend API for **ClassicStudio**, a full-stack studio marketplace and booking platform. It allows users to create and manage studio listings, explore available creative spaces, and make studio reservations.

Built with Node.js, Express.js, and MongoDB, this backend handles API requests, image uploads, authentication, and booking management.

## 🚀 Technologies Used

- **Node.js** – JavaScript runtime
- **Express.js** – Backend framework
- **MongoDB** – Database
- **Multer** – Handling multipart form data and image uploads
- **ImgBB** – Studio image hosting
- **Better Auth** – Authentication and session management
- **Jose** – JWT verification
- **CORS** – Cross-origin resource sharing
- **dotenv** – Environment variable management

## ✨ Features

- Create new studio listings with multiple image uploads.
- Upload studio images to ImgBB.
- Automatically generate a random rating for newly added studios.
- Retrieve all studios and individual studio details.
- Update studio information and images.
- Delete studio listings.
- Display the six latest studios in the Featured Studios section.
- Create studio bookings with an initial `Pending` status.
- Retrieve bookings associated with a user's email.
- Cancel pending bookings by updating their status to `Cancelled`.
- Check for overlapping time slots against existing `Confirmed` bookings.
- Protect selected API endpoints using JWT verification.

## 📁 Project Structure

```text
classicstudio-backend/
├── middleware/
│   └── upload.js
├── utils/
│   └── uploadImage.js
├── index.js
├── package.json
├── package-lock.json
├── .env
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/suhitajahan-Easha/Classicstudio-server.git
```

### 2. Navigate to the project directory

```bash
cd classicstudio-backend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
CLIENT_URI=your_frontend_url
```

- `MONGODB_URI` – MongoDB connection string.
- `CLIENT_URI` – Frontend origin used to retrieve the Better Auth JWKS endpoint.

Keep your `.env` file private. Never commit database credentials or secrets to GitHub.

### 5. Run the server

```bash
npm start
```

If your `package.json` has a development script, you can also run:

```bash
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

## 🔌 API Endpoints

### Studio APIs

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/add-studio` | Create a studio listing with image uploads | Required |
| GET | `/studio` | Retrieve all studios | Not required |
| GET | `/studio/:id` | Retrieve a studio by ID | Not required |
| PATCH | `/studio/:id` | Update studio details and images | Required |
| DELETE | `/studio/:id` | Delete a studio listing | Required |
| GET | `/add-studio/:email` | Retrieve studios belonging to a user | Required |
| GET | `/featured-Studio` | Retrieve the six latest studios | Not required |

### Booking APIs

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| POST | `/booking` | Create a studio booking | Required |
| GET | `/booking/:email` | Retrieve bookings by user email | Required |
| PATCH | `/booking/:id` | Cancel a pending booking | Required |

## 🏢 Studio Management

The studio management APIs support:

- Creating studio listings with details such as title, category, hourly rate, security deposit, maximum capacity, location, amenities, and overview.
- Uploading up to five studio images using Multer and ImgBB.
- Automatically generating a random rating between 3.5 and 5.0 for new studios.
- Updating studio information while retaining existing images when no new images are uploaded.
- Retrieving the six latest studios using MongoDB sorting and limiting.

## 📅 Booking Management

The booking system supports:

- Creating reservations with booking date, start time, and end time.
- Assigning `Pending` as the initial booking status.
- Retrieving a user's bookings using their email address.
- Cancelling pending reservations by changing their status to `Cancelled`.
- Checking time overlap against existing `Confirmed` bookings for the same studio and date.

### Booking Statuses

- `Pending` – Newly created reservation.
- `Confirmed` – Confirmed reservation.
- `Completed` – Finished reservation.
- `Cancelled` – Cancelled reservation.

The cancellation API updates the booking status instead of permanently deleting the booking record.

## 🔐 Authentication and Security

ClassicStudio uses Better Auth for user authentication and session management.

The backend uses the `jose` library to verify JWT tokens through the Better Auth JWKS endpoint:

```text
${CLIENT_URI}/api/auth/jwks
```

Selected API endpoints require a valid Bearer token in the request authorization header.

## 🗄️ Database

The application uses MongoDB.



**Collections:**

- `Studio` – Stores studio listings, images, amenities, pricing, ratings, and owner information.
- `bookings` – Stores booking details, user information, studio references, time slots, and booking statuses.

## 🌐 Frontend Integration

The backend communicates with the Next.js frontend through REST API requests.

For local development, configure the frontend API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

For production, replace the local URL with your deployed backend URL.

## 🚢 Deployment

Before deploying the backend:

1. Configure the required environment variables.
2. Ensure MongoDB is accessible from the hosting server.
3. Configure CORS for your frontend domain.
4. Verify the authentication and JWKS configuration.
5. Deploy the backend to your preferred hosting platform.
6. Update the frontend API URL to the deployed backend.

---

## 👩‍💻 Project

**ClassicStudio** – A studio marketplace and booking platform.

**Backend:** Node.js · Express.js · MongoDB · Better Auth
