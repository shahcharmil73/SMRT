const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Data storage
let customerData = [];
let inventoryData = [];
let detailData = [];
let pricelistData = [];
let mergedData = [];

// Load CSV data
async function loadCSVData() {
    try {
        console.log('Loading CSV data...');
        
        // Load Customer data
        customerData = await loadCSV('Customer.csv');
        console.log(`Loaded ${customerData.length} customers`);
        
        // Load Inventory data
        inventoryData = await loadCSV('Inventory.csv');
        console.log(`Loaded ${inventoryData.length} inventory records`);
        
        // Load Detail data
        detailData = await loadCSV('Detail.csv');
        console.log(`Loaded ${detailData.length} detail records`);
        
        // Load Pricelist data
        pricelistData = await loadCSV('Pricelist.csv');
        console.log(`Loaded ${pricelistData.length} pricelist records`);
        
        // Merge data
        mergedData = mergeAllData();
        console.log('Data loaded and merged successfully');
        
    } catch (error) {
        console.error('Error loading CSV data:', error);
    }
}

function loadCSV(filename) {
    return new Promise((resolve, reject) => {
        const results = [];
        const filePath = path.join(__dirname, '..', 'data', filename);
        
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

function mergeAllData() {
    const merged = [];
    
    detailData.forEach(detail => {
        const inventory = inventoryData.find(inv => inv.IID == detail.IID);
        const customer = customerData.find(cust => cust.CID == inventory?.CID);
        const pricelist = pricelistData.find(price => price.item_id == detail.price_table_item_id);
        
        if (inventory && customer && pricelist) {
            merged.push({
                ...detail,
                ...inventory,
                ...customer,
                ...pricelist,
                Total_Price: parseFloat(detail.item_baseprice) || 0,
                Customer_Name: customer.Customer_Name || `${customer.FNAME1 || ''} ${customer.LNAME || ''}`.trim(),
                Product_Name: detail.item_name || pricelist.name,
                Category: inventory.CATEGORY || 'Dry Clean',
                Unit_Price: parseFloat(pricelist.baseprice) || 0,
                Order_Date: inventory.INDATE,
                Status: inventory.OUTDATE ? 'Completed' : 'Processing'
            });
        }
    });
    
    return merged;
}

function validateQueryResult(result) {
    if (typeof result === 'object' && result !== null) {
        for (const [key, value] of Object.entries(result)) {
            if (typeof value === 'number') {
                if (value < 0 || value > 1000000) {
                    return false;
                }
            }
        }
    }
    return true;
}

function processDataQuery(query, mergedData) {
    const queryLower = query.toLowerCase();
    
    // Customer queries
    if (queryLower.includes('customer')) {
        if (queryLower.includes('list') || queryLower.includes('show')) {
            const formattedCustomers = customerData.map(c => ({
                CID: c.CID,
                Customer_Name: `${c.FNAME1} ${c.LNAME}`,
                Email: c.EMAIL,
                Phone: c.HPHONE,
                City: c.CITY,
                State: c.STATE,
                Customer_Type: c.PRICETBL,
                First_Date: c.FIRSTDATE
            }));
            return { customers: formattedCustomers };
        } else if (queryLower.includes('total') || queryLower.includes('count')) {
            return { total_customers: customerData.length };
        } else if (queryLower.includes('standard')) {
            const standardCustomers = customerData.filter(c => c.PRICETBL === 'STANDARD');
            return { standard_customers: standardCustomers.length };
        }
    }
    
    // Order queries
    else if (queryLower.includes('order') || queryLower.includes('ticket')) {
        if (queryLower.includes('total') || queryLower.includes('count')) {
            const uniqueOrders = [...new Set(inventoryData.map(order => order.IID))];
            return { total_orders: uniqueOrders.length };
        } else if (queryLower.includes('revenue') || queryLower.includes('sales')) {
            const totalRevenue = mergedData.reduce((sum, item) => sum + item.Total_Price, 0);
            return { total_revenue: Math.round(totalRevenue * 100) / 100 };
        } else if (queryLower.includes('average')) {
            const orderTotals = {};
            mergedData.forEach(item => {
                if (!orderTotals[item.IID]) orderTotals[item.IID] = 0;
                orderTotals[item.IID] += item.Total_Price;
            });
            const avgOrderValue = Object.values(orderTotals).reduce((sum, val) => sum + val, 0) / Object.keys(orderTotals).length;
            return { average_order_value: Math.round(avgOrderValue * 100) / 100 };
        } else if (queryLower.includes('status')) {
            const statusCount = { 'Completed': 0, 'Processing': 0 };
            inventoryData.forEach(order => {
                const status = order.OUTDATE ? 'Completed' : 'Processing';
                statusCount[status] = (statusCount[status] || 0) + 1;
            });
            return { order_status_distribution: statusCount };
        }
    }
    
    // Product queries
    else if (queryLower.includes('product') || queryLower.includes('item')) {
        if (queryLower.includes('list') || queryLower.includes('show')) {
            const formattedProducts = pricelistData.map(p => ({
                item_id: p.item_id,
                Product_Name: p.name,
                Unit_Price: p.baseprice,
                Category: 'Dry Clean'
            }));
            return { products: formattedProducts };
        } else if (queryLower.includes('top') || queryLower.includes('best') || queryLower.includes('popular')) {
            const productCount = {};
            mergedData.forEach(item => {
                productCount[item.Product_Name] = (productCount[item.Product_Name] || 0) + 1;
            });
            const topProducts = Object.entries(productCount)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
            return { top_products: topProducts };
        } else if (queryLower.includes('category')) {
            const categorySales = {};
            mergedData.forEach(item => {
                categorySales[item.Category] = (categorySales[item.Category] || 0) + item.Total_Price;
            });
            return { category_sales: categorySales };
        }
    }
    
    // Financial queries
    else if (queryLower.includes('revenue') || queryLower.includes('sales')) {
        if (queryLower.includes('total')) {
            const totalRevenue = mergedData.reduce((sum, item) => sum + item.Total_Price, 0);
            return { total_revenue: Math.round(totalRevenue * 100) / 100 };
        } else if (queryLower.includes('by customer')) {
            const customerRevenue = {};
            mergedData.forEach(item => {
                customerRevenue[item.Customer_Name] = (customerRevenue[item.Customer_Name] || 0) + item.Total_Price;
            });
            return { customer_revenue: customerRevenue };
        }
    }
    
    // Summary queries
    else if (queryLower.includes('summary') || queryLower.includes('overview') || queryLower.includes('dashboard')) {
        const orderTotals = {};
        mergedData.forEach(item => {
            if (!orderTotals[item.IID]) orderTotals[item.IID] = 0;
            orderTotals[item.IID] += item.Total_Price;
        });
        const avgOrderValue = Object.values(orderTotals).reduce((sum, val) => sum + val, 0) / Object.keys(orderTotals).length;
        
        const productCount = {};
        mergedData.forEach(item => {
            productCount[item.Product_Name] = (productCount[item.Product_Name] || 0) + 1;
        });
        const topProduct = Object.entries(productCount).sort(([,a], [,b]) => b - a)[0];
        
        return {
            total_customers: customerData.length,
            total_orders: inventoryData.length,
            total_order_items: detailData.length,
            total_products: pricelistData.length,
            total_revenue: Math.round(mergedData.reduce((sum, item) => sum + item.Total_Price, 0) * 100) / 100,
            avg_order_value: Math.round(avgOrderValue * 100) / 100,
            top_customer_by_orders: customerData.length > 0 ? { [customerData[0].Customer_Name]: 1 } : {},
            top_product_by_sales: topProduct ? { [topProduct[0]]: topProduct[1] } : {}
        };
    }
    
    // Default response
    return {
        message: 'I can help you with questions about customers, orders, products, and sales data.',
        available_queries: [
            'Show all customers',
            'How many orders are there?',
            'What is the total revenue?',
            'Show top products',
            'Customer summary',
            'Order status distribution'
        ]
    };
}

// Routes
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        data_loaded: mergedData.length > 0
    });
});

app.post('/api/query', (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'No query provided' });
        }
        
        const result = processDataQuery(query, mergedData);
        const isValid = validateQueryResult(result);
        
        if (!isValid) {
            result.validation_warning = 'Some values may be unrealistic';
        }
        
        res.json({
            query: query,
            result: result,
            timestamp: new Date().toISOString(),
            data_grounded: true
        });
        
    } catch (error) {
        console.error('Query processing error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/data/summary', (req, res) => {
    try {
        const uniqueOrders = [...new Set(inventoryData.map(order => order.IID))];
        const orderTotals = {};
        mergedData.forEach(item => {
            if (!orderTotals[item.IID]) orderTotals[item.IID] = 0;
            orderTotals[item.IID] += item.Total_Price;
        });
        const avgOrderValue = Object.values(orderTotals).reduce((sum, val) => sum + val, 0) / Object.keys(orderTotals).length;
        
        const productCount = {};
        mergedData.forEach(item => {
            productCount[item.Product_Name] = (productCount[item.Product_Name] || 0) + 1;
        });
        const topProduct = Object.entries(productCount).sort(([,a], [,b]) => b - a)[0];
        
        res.json({
            total_customers: customerData.length,
            total_orders: uniqueOrders.length,
            total_order_items: detailData.length,
            total_products: pricelistData.length,
            total_revenue: Math.round(mergedData.reduce((sum, item) => sum + item.Total_Price, 0) * 100) / 100,
            avg_order_value: Math.round(avgOrderValue * 100) / 100,
            top_customer_by_orders: customerData.length > 0 ? { [`${customerData[0].FNAME1} ${customerData[0].LNAME}`]: 1 } : {},
            top_product_by_sales: topProduct ? { [topProduct[0]]: topProduct[1] } : {}
        });
        
    } catch (error) {
        console.error('Summary generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/reports/text', (req, res) => {
    try {
        const { type } = req.body;
        
        if (type === 'summary') {
            const summary = {
                total_customers: customerData.length,
                total_orders: inventoryData.length,
                total_revenue: Math.round(mergedData.reduce((sum, item) => sum + item.Total_Price, 0) * 100) / 100,
                avg_order_value: 0
            };
            
            const orderTotals = {};
            mergedData.forEach(item => {
                if (!orderTotals[item.IID]) orderTotals[item.IID] = 0;
                orderTotals[item.IID] += item.Total_Price;
            });
            summary.avg_order_value = Math.round(Object.values(orderTotals).reduce((sum, val) => sum + val, 0) / Object.keys(orderTotals).length * 100) / 100;
            
            const report = `# Business Summary Report
Generated on: ${new Date().toLocaleString()}

## Key Metrics
- Total Customers: ${summary.total_customers}
- Total Orders: ${summary.total_orders}
- Total Revenue: $${summary.total_revenue.toLocaleString()}
- Average Order Value: $${summary.avg_order_value.toLocaleString()}

## Customer Analysis
Premium Customers: ${customerData.filter(c => c.Customer_Type === 'Premium').length}
Standard Customers: ${customerData.filter(c => c.Customer_Type === 'Standard').length}

## Order Status Distribution
${Object.entries(inventoryData.reduce((acc, order) => {
    acc[order.Status] = (acc[order.Status] || 0) + 1;
    return acc;
}, {})).map(([status, count]) => `${status}: ${count}`).join('\n')}`;
            
            res.json({ report: report, type: type });
        }
        
    } catch (error) {
        console.error('Report generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
async function startServer() {
    await loadCSVData();
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Backend server running on http://localhost:${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
        console.log(`📈 Data loaded: ${mergedData.length} merged records`);
    });
}

startServer().catch(console.error);
