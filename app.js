import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import cors from 'cors';

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(express.json());
app.use(cors());

// Simple auth middleware for admin routes
// In a production app, you'd use JWT or another token-based auth system
const adminAuthMiddleware = async (req, res, next) => {
  try {
    // For demonstration - in real app, get this from JWT token or session
    // This is a placeholder - replace with actual auth logic
    const { username, password } = req.headers;
    
    if (!username || !password) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const admin = await prisma.admin.findUnique({
      where: { username }
    });
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Add admin info to request
    req.admin = {
      id: admin.id,
      username: admin.username,
      name: admin.name
    };
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

// DB Status Route
app.get('/api/db-status', async (req, res) => {
  try {
    const tableNames = Object.keys(prisma).filter(key => 
      !key.startsWith('_') && 
      typeof prisma[key] === 'object' && 
      prisma[key] !== null
    );
    
    const modelNames = tableNames.filter(name => 
      !['$connect', '$disconnect', '$on', '$transaction', '$extends'].includes(name)
    );
    
    return res.status(200).json({
      success: true,
      message: 'Database connection successful',
      tables: modelNames
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to connect to database',
      error: error.message
    });
  }
});

// Admin Routes
app.post('/api/admin/signup', async (req, res) => {
  try {
    const { name, username, password } = req.body;
    
    if (!name || !username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    const existingAdmin = await prisma.admin.findUnique({
      where: { username }
    });
    
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }
    
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const newAdmin = await prisma.admin.create({
      data: {
        name,
        username,
        password_hash
      },
      select: {
        id: true,
        name: true,
        username: true
      }
    });
    
    return res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: newAdmin
    });
  } catch (error) {
    console.error('Admin signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create admin',
      error: error.message
    });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }
    
    const admin = await prisma.admin.findUnique({
      where: { username }
    });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Wrong password'
      });
    }
    
    const { password_hash, ...adminData } = admin;
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: adminData
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Admin deletion route
app.delete('/api/admin/delete', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }
    
    const admin = await prisma.admin.findUnique({
      where: { username }
    });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Wrong password'
      });
    }
    
    // Delete the admin
    await prisma.admin.delete({
      where: { id: admin.id }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    console.error('Admin deletion error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete admin',
      error: error.message
    });
  }
});


// POST /api/user/signup
app.post('/api/user/signup', async (req, res) => {
  const { username, phoneNumber } = req.body;

  if (!username || !phoneNumber) {
    return res.status(400).json({ success: false, message: 'Username and phone number are required' });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { phoneNumber }]
      }
    });

    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        phoneNumber
      }
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// POST /api/user/login
app.post('/api/user/login', async (req, res) => {
  const { username, phoneNumber } = req.body;

  if (!username || !phoneNumber) {
    return res.status(400).json({ success: false, message: 'Username and phone number are required' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        username,
        phoneNumber
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or phone number'
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});





// --- ROUTES ---

// 🟢 GET all available products (Public)
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { availability: true }
    });
    res.json({ success: true, message: 'Products fetched', data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching products', error: error.message });
  }
});

// 🟢 (Optional) GET a specific product by ID
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await prisma.product.findUnique({ where: { id: Number(id) } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching product', error: error.message });
  }
});

// 🔐 POST create a product (Admin only)
app.post('/api/products', adminAuthMiddleware, async (req, res) => {
  try {
    const product = await prisma.product.create({ data: req.body });
    res.status(201).json({ success: true, message: 'Product created', data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error creating product', error: error.message });
  }
});

// 🔐 DELETE product (Admin only)
app.delete('/api/products/:id', adminAuthMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({ where: { id: Number(id) } });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error deleting product', error: error.message });
  }
});

// 👉 Place Order API
app.post('/api/orders', async (req, res) => {
  try {
    const {
      buyer_name,
      buyer_contact,
      delivery_address,
      payment_method,
      items
    } = req.body;

    const total_amount = items.reduce((acc, item) => {
      return acc + (item.price_per_kg * item.quantity);
    }, 0);

    const order = await prisma.order.create({
      data: {
        buyer_name,
        buyer_contact,
        delivery_address,
        payment_method,
        total_amount,
        cart_summary: {
          create: items.map(item => ({
            product_name: item.name,
            quantity: item.quantity,
            unit_type: item.unit_type,
            price_per_kg: item.price_per_kg,
            total_price: item.quantity * item.price_per_kg
          }))
        }
      },
      include: {
        cart_summary: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({
      success: false,
      message: 'Error placing order',
      error: error.message
    });
  }
});


// 👉 Get orders by phone number with optional status
app.get('/api/user/orders', async (req, res) => {
  try {
    const { phone, status } = req.query;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required in query'
      });
    }

    const whereClause = {
      buyer_contact: phone
    };

    if (status) {
      whereClause.status = status;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        cart_summary: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});


// 🔐 Get all orders (admin only)
app.get('/api/admin/orders', adminAuthMiddleware, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { cart_summary: true },
      orderBy: { created_at: 'desc' }
    });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
  }
});


// 🔐 Update order status (admin only)
app.put('/api/admin/orders/:id/status', adminAuthMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
      data: { status }
    });

    res.json({ success: true, message: 'Order status updated', order: updatedOrder });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating status', error: error.message });
  }
});



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Disconnected from database');
  process.exit(0);
});


