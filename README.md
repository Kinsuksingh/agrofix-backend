# AgroFix Backend API

AgroFix is a bulk vegetable and fruit ordering platform. This is the backend API built with Express.js and PostgreSQL to support admin and user functionalities like product management, order placement, and order tracking.

## Base URLs

- **Local Development**: `http://localhost:5000/api`
- **Production**: `https://agrofix-backend-beta.vercel.app/`

---

## Table of Contents

- [Admin Routes](#admin-routes)
- [User Routes](#user-routes)
- [Product Routes](#product-routes)
- [Order Routes](#order-routes)
- [Database Status](#database-status)
- [Tech Stack](#tech-stack)
- [Run Locally](#run-locally)

---

## Admin Routes

### Signup
`POST /admin/signup`  
```json
{
  "name": "adminuser",
  "username": "admin1",
  "password": "securepass123"
}
```

### Login
`POST /admin/login`  
```json
{
  "username": "admin1",
  "password": "securepass123"
}
```

### Delete Admin (optional)
`DELETE /admin/delete`  
```json
{
  "username": "admin1",
  "password": "securepass123"
}
```

### Get All Orders  
`GET /admin/orders`  
Authentication: Username and Password in headers.

### Update Order Status  
`PUT /admin/orders/:id/status`  
```json
{
  "status": "confirmed"
}
```
Authentication: Username and Password in headers.

---

## User Routes

### Signup
`POST /user/signup`  
```json
{
  "username": "user",
  "phoneNumber": "0123456789"
}
```

### Login
`POST /user/login`  
```json
{
  "username": "user",
  "phoneNumber": "0123456789"
}
```

### Get User Orders
`GET /user/orders?phone=0123456789`

To filter delivered orders:  
`GET /user/orders?phone=0123456789&status=delivered`

---

## Product Routes

### Get All Products (Public)
`GET /products`

### Create Product (Admin Only)
`POST /products`  
Authentication: Username and Password in headers.  
```json
{
  "name": "Bottle Gourd",
  "description": "Tender bottle gourd, perfect for healthy Indian recipes",
  "image_url": "https://example.com/image.jpg",
  "price_details": "₹22 per kg",
  "price_per_kg": 22.0,
  "availability": true,
  "stock_kg": 75,
  "min_order_kg": 1,
  "bulk_discount": "10% off on 15kg+",
  "category": "Vegetable",
  "unit_type": "kg"
}
```

### Delete Product (Admin Only)
`DELETE /products/:id`  
Authentication: Username and Password in headers.

---

## Order Routes

### Place Order
`POST /orders`  
```json
{
  "buyer_name": "user",
  "buyer_contact": "0123456789",
  "delivery_address": "123 Maple Street, Greenfield Heights",
  "payment_method": "Cash on Delivery",
  "items": [
    {
      "name": "Golden Potatoes",
      "quantity": 5,
      "unit_type": "kg",
      "price_per_kg": 40
    },
    {
      "name": "Farm Tomatoes",
      "quantity": 2,
      "unit_type": "kg",
      "price_per_kg": 60
    }
  ]
}
```

---

## Database Status

### Check DB Connection
`GET /db-status`

---

## Tech Stack

- **Backend**: Express.js
- **Database**: PostgreSQL (Hosted on Neon)
- **Hosting**: Vercel
- **Auth**: Basic Auth for Admin

---

## Run Locally

```bash
git clone https://github.com/Kinsuksingh/agrofix-backend.git
cd agrofix-backend
npm install
npm start
```

Configure your `.env` with the necessary database URL and other secrets.

---

## License

This project is open-source and free to use.