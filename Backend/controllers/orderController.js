const { Order, User, Product, ProductVariation } = require("../models");
const { Op } = require("sequelize");

// Generate unique order number
const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
};

// Get all orders (admin)
exports.getOrders = async (req, res) => {
    try {
        const { status, userId, storeName, productName } = req.query;
        const whereClause = {};
        
        if (status) whereClause.status = status;
        if (userId) whereClause.userId = userId;

        const orders = await Order.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'storeOwner',
                    attributes: ['id', 'fullName', 'email', 'phoneNumber'],
                    where: storeName ? {
                        fullName: {
                            [Op.like]: `%${storeName}%`
                        }
                    } : undefined
                },
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'description'],
                    where: productName ? {
                        name: {
                            [Op.like]: `%${productName}%`
                        }
                    } : undefined
                },
                {
                    model: User,
                    as: 'approver',
                    attributes: ['id', 'fullName'],
                    required: false
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // Format the response
        const formattedOrders = orders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            storeOwnerName: order.storeOwner?.fullName || 'Unknown',
            storeOwnerEmail: order.storeOwner?.email,
            productName: order.product?.name || 'Unknown Product',
            quantity: order.quantity,
            totalAmount: order.totalAmount,
            status: order.status,
            notes: order.notes,
            adminNotes: order.adminNotes,
            createdAt: order.created_at,
            approvedAt: order.approved_at,
            approverName: order.approver?.fullName
        }));

        res.json({
            success: true,
            data: formattedOrders
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders"
        });
    }
};

// Get orders for a specific store owner
exports.getStoreOwnerOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const orders = await Order.findAll({
            where: { userId },
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'description']
                },
                {
                    model: User,
                    as: 'approver',
                    attributes: ['id', 'fullName'],
                    required: false
                }
            ],
            order: [['created_at', 'DESC']]
        });

        // Format the response
        const formattedOrders = orders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            productName: order.product?.name || 'Unknown Product',
            quantity: order.quantity,
            totalAmount: order.totalAmount,
            status: order.status,
            notes: order.notes,
            adminNotes: order.adminNotes,
            createdAt: order.created_at,
            approvedAt: order.approved_at,
            approverName: order.approver?.fullName
        }));

        res.json({
            success: true,
            data: formattedOrders
        });
    } catch (error) {
        console.error("Error fetching store owner orders:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders"
        });
    }
};

// Get single order
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const order = await Order.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'storeOwner',
                    attributes: ['id', 'fullName', 'email', 'phoneNumber']
                },
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'description']
                },
                {
                    model: User,
                    as: 'approver',
                    attributes: ['id', 'fullName'],
                    required: false
                }
            ]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch order"
        });
    }
};

// Create new order (store owner)
exports.createOrder = async (req, res) => {
    try {
        const { productId, quantity, notes, userId } = req.body;

        // Validate required fields
        if (!productId || !quantity || !userId) {
            return res.status(400).json({
                success: false,
                message: "Product ID, quantity, and user ID are required"
            });
        }

        // Check if product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check if user exists and is a store owner
        const user = await User.findByPk(userId);
        if (!user || user.userType !== 'storeowner') {
            return res.status(400).json({
                success: false,
                message: "Invalid user or user is not a store owner"
            });
        }

        // Calculate total amount (using first variation price as default)
        let totalAmount = 0;
        const variations = await ProductVariation.findAll({
            where: { product_id: productId }
        });
        
        if (variations.length > 0) {
            totalAmount = parseFloat(variations[0].price || 0) * quantity;
        }

        // Generate unique order number
        const orderNumber = generateOrderNumber();

        // Create order
        const order = await Order.create({
            orderNumber,
            userId,
            productId,
            quantity,
            totalAmount,
            notes: notes || null,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: order
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create order"
        });
    }
};

// Approve order (admin)
exports.approveOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;

        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: "Order is not in pending status"
            });
        }

        await order.update({
            status: 'approved',
            approvedBy: adminId,
            approvedAt: new Date()
        });

        res.json({
            success: true,
            message: "Order approved successfully",
            data: order
        });
    } catch (error) {
        console.error("Error approving order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to approve order"
        });
    }
};

// Reject order (admin)
exports.rejectOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body;
        const adminId = req.user.id;

        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: "Order is not in pending status"
            });
        }

        await order.update({
            status: 'rejected',
            adminNotes: notes,
            approvedBy: adminId,
            approvedAt: new Date()
        });

        res.json({
            success: true,
            message: "Order rejected successfully",
            data: order
        });
    } catch (error) {
        console.error("Error rejecting order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reject order"
        });
    }
};

// Update order
exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, notes } = req.body;

        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Only allow updates if order is pending
        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: "Cannot update order that is not in pending status"
            });
        }

        // Recalculate total amount if quantity changes
        let totalAmount = order.totalAmount;
        if (quantity && quantity !== order.quantity) {
            const product = await Product.findByPk(order.productId);
            const variations = await ProductVariation.findAll({
                where: { product_id: order.productId }
            });
            
            if (variations.length > 0) {
                totalAmount = parseFloat(variations[0].price || 0) * quantity;
            }
        }

        await order.update({
            quantity: quantity || order.quantity,
            totalAmount,
            notes: notes || order.notes
        });

        res.json({
            success: true,
            message: "Order updated successfully",
            data: order
        });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update order"
        });
    }
};

// Delete order
exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByPk(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        // Only allow deletion if order is pending
        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: "Cannot delete order that is not in pending status"
            });
        }

        await order.destroy();

        res.json({
            success: true,
            message: "Order deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete order"
        });
    }
};

// Get filter options for orders
exports.getOrderFilterOptions = async (req, res) => {
    try {
        // Get all store owners (users with userType = 'storeowner')
        const storeOwners = await User.findAll({
            where: { userType: 'storeowner' },
            attributes: ['id', 'fullName'],
            order: [['fullName', 'ASC']]
        });

        // Get all products
        const products = await Product.findAll({
            attributes: ['id', 'name'],
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            data: {
                storeOwners: storeOwners.map(owner => ({
                    value: owner.fullName,
                    label: owner.fullName
                })),
                products: products.map(product => ({
                    value: product.name,
                    label: product.name
                }))
            }
        });
    } catch (error) {
        console.error("Error fetching filter options:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch filter options"
        });
    }
}; 