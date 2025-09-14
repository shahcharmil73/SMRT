# Technical Documentation: AI-Driven Mobile App with CSV Integration

## Architecture Overview

This application follows a client-server architecture with a React Native mobile frontend and a Python Flask backend. The system is designed to provide AI-powered data analysis capabilities while maintaining data integrity and preventing hallucinations.

### System Architecture

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐    CSV Files    ┌─────────────────┐
│                 │                │                 │                │                 │
│  React Native   │◄──────────────►│  Python Flask   │◄──────────────►│  CSV Data       │
│  Mobile App     │                │  Backend API    │                │  (4 files)      │
│                 │                │                 │                │                 │
└─────────────────┘                └─────────────────┘                └─────────────────┘
```

## Data Flow

### 1. Data Loading and Processing
- CSV files are loaded into Pandas DataFrames at startup
- Data is merged using foreign key relationships
- Cached in memory for fast query processing

### 2. Query Processing Pipeline
```
User Query → Natural Language Processing → Data Query → Validation → Response
```

#### CSVDataManager Class
```python
class CSVDataManager:
    def __init__(self, data_dir='../data'):
        self.customer_df = None
        self.inventory_df = None
        self.detail_df = None
        self.pricelist_df = None
        self.load_all_data()
    
    def get_merged_data(self):
        # Merges all CSV tables using foreign keys
        # Returns comprehensive dataset for analysis
```

#### Query Processing Engine
```python
def process_data_query(query, merged_data, data_manager):
    # Processes natural language queries
    # Returns structured data responses
    # Implements data validation
```

#### Core Endpoints
- `GET /api/health` - System health check
- `POST /api/query` - Process natural language queries
- `GET /api/data/summary` - Get dataset summary statistics

#### Report Generation
- `POST /api/reports/text` - Generate textual reports
- `POST /api/reports/visual` - Generate visual reports with Plotly

### Data Validation Framework

#### Validation Methods
1. **Range Validation**: Numeric values checked against reasonable bounds
2. **Cross-Reference Validation**: Results verified against source data
3. **Structure Validation**: Response format validation
4. **Completeness Validation**: Ensures all required data is present

#### Example Validation
```python
def validate_query_result(result, query_context):
    if isinstance(result, dict):
        for key, value in result.items():
            if isinstance(value, (int, float)):
                if value < 0 or value > 1000000:  # Sanity check
                    return False, f"Value {value} for {key} seems unrealistic"
    return True, "Validated"
```

#### Component Structure
```
App.js (Main Component)
├── Header Component
├── Data Summary Dashboard
├── Quick Actions Panel
├── Chat Interface
│   ├── Message List
│   ├── Input Component
│   └── Loading Indicator
└── Reports Modal
```

#### State Management
```javascript
const [messages, setMessages] = useState([]);
const [inputText, setInputText] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [dataSummary, setDataSummary] = useState(null);
const [showReports, setShowReports] = useState(false);
```

### API Integration

#### HTTP Client Configuration
```javascript
const API_BASE_URL = 'http://10.0.2.2:5000/api'; // Android emulator
```

#### Error Handling
```javascript
try {
    const response = await axios.post(`${API_BASE_URL}/query`, {
        query: inputText
    });
    // Process successful response
} catch (error) {
    // Handle errors gracefully
    setMessages(prev => [...prev, errorMessage]);
}
```

### Data Merging Strategy
```python
merged = detail_df.merge(
    inventory_df, on='IID'
).merge(
    customer_df, on='CID'
).merge(
    pricelist_df, left_on='price_table_item_id', right_on='price_table_item_id'
)
```

#### Query Categories
1. **Customer Queries**: "Show customers", "Premium customers", "Customer count"
2. **Order Queries**: "Total orders", "Revenue", "Order status"
3. **Product Queries**: "Product list", "Top products", "Category sales"
4. **Financial Queries**: "Revenue by customer", "Monthly sales"
5. **Summary Queries**: "Business overview", "Dashboard data"

#### Query Processing Flow
```python
def process_data_query(query, merged_data, data_manager):
    query_lower = query.lower()
    
    # Customer queries
    if 'customer' in query_lower:
        return process_customer_query(query_lower, data_manager)
    
    # Order queries
    elif 'order' in query_lower:
        return process_order_query(query_lower, merged_data)
    
    # Product queries
    elif 'product' in query_lower:
        return process_product_query(query_lower, merged_data)
    
    # Default response
    else:
        return get_help_response()
```

### Visual Reports

#### Chart Types
1. **Bar Charts**: Revenue by customer, product sales
2. **Pie Charts**: Order status, category distribution
3. **Horizontal Bar Charts**: Top products by sales

#### Plotly Integration
```python
import plotly.graph_objects as go
import plotly.express as px

# Generate chart
fig = go.Figure(data=[
    go.Bar(x=customer_revenue.index, y=customer_revenue.values)
])

# Convert to JSON for frontend
chart_json = json.dumps(fig, cls=PlotlyJSONEncoder)
```

## Scalability Considerations

### Performance Optimizations

#### Backend Optimizations
- **Data Caching**: CSV data loaded once and cached in memory
- **Efficient Queries**: Pandas operations for fast data processing
- **Connection Pooling**: Reuse HTTP connections
- **Response Compression**: Compress large responses

#### Frontend Optimizations
- **Lazy Loading**: Load data only when needed
- **Memoization**: Cache expensive computations
- **Virtual Lists**: Efficient rendering of large lists
- **Image Optimization**: Optimize chart rendering

### Database Migration Path

#### Current State: CSV Files
- Simple file-based storage
- Fast for small to medium datasets
- Limited concurrent access

#### Future State: Database
- PostgreSQL/MySQL for production
- ACID compliance
- Concurrent access support
- Advanced querying capabilities

#### Migration Strategy
```python
# Database abstraction layer
class DataManager:
    def __init__(self, data_source='csv'):
        if data_source == 'csv':
            self.loader = CSVLoader()
        elif data_source == 'database':
            self.loader = DatabaseLoader()
    
    def get_data(self):
        return self.loader.load()
```

## Security Considerations

### Data Protection
- **Input Validation**: Sanitize all user inputs
- **SQL Injection Prevention**: Use parameterized queries
- **XSS Protection**: Escape user-generated content
- **CORS Configuration**: Restrict cross-origin requests

### API Security
```python
from flask_cors import CORS

# Configure CORS
CORS(app, origins=['http://localhost:8081', 'http://10.0.2.2:8081'])

# Input validation
def validate_query_input(query_data):
    query = query_data.get('query', '').strip()
    if len(query) > 500:  # Prevent oversized queries
        raise ValueError("Query too long")
    return query
```

## Testing Strategy

### Backend Testing
```python
import pytest
from app import app, CSVDataManager

def test_health_endpoint():
    with app.test_client() as client:
        response = client.get('/api/health')
        assert response.status_code == 200
        assert response.json['status'] == 'healthy'

def test_query_processing():
    data_manager = CSVDataManager()
    result = process_data_query("total revenue", data_manager.get_merged_data(), data_manager)
    assert 'total_revenue' in result
```

### Frontend Testing
```javascript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../App';

test('renders welcome message', () => {
    const { getByText } = render(<App />);
    expect(getByText(/Hello! I'm your AI assistant/)).toBeTruthy();
});

test('processes user input', async () => {
    const { getByPlaceholderText, getByText } = render(<App />);
    const input = getByPlaceholderText('Ask me about your business data...');
    
    fireEvent.changeText(input, 'What is the total revenue?');
    fireEvent.press(getByText('Send'));
    
    await waitFor(() => {
        expect(getByText(/Total revenue/)).toBeTruthy();
    });
});
```
This technical documentation provides a comprehensive overview of the system architecture, implementation details, and future roadmap for the AI-driven mobile application.
