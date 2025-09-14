# AI-Driven Mobile App with CSV Integration

A comprehensive mobile application built with React Native that provides an AI-powered interface for querying and analyzing business data stored in CSV files. The app features a chat-based interface where users can ask questions about their financial/order information, with AI responses grounded in actual data to prevent hallucinations.

## Features

### Core Functionality
- **Chat-based Interface**: Natural language queries about business data
- **Data Grounding**: AI responses are validated against actual CSV data to prevent hallucinations
- **CSV Integration**: Direct querying of Customer, Inventory, Detail, and Pricelist CSV files
- **Scalable Architecture**: Designed to handle larger datasets efficiently

### Advanced Features
- **Report Generation**: Both textual and visual reports
- **Real-time Analytics**: Interactive charts and graphs
- **Data Validation**: Built-in validation to ensure response accuracy
- **Modern UI/UX**: Clean interface using React Native with Material Design principles

## Project Structure

```
├── backend/                 # Python Flask API server
│   ├── app.py              # Main Flask application
│   └── requirements.txt    # Python dependencies
├── data/                   # CSV datasets
│   ├── Customer.csv        # Customer profile information
│   ├── Inventory.csv       # Order-level information
│   ├── Detail.csv          # Order details
│   └── Pricelist.csv       # Pricing information
├── App.js                  # Main React Native application
├── package.json           # Node.js dependencies
├── Dockerfile             # Multi-stage Docker configuration
├── docker-compose.yml     # Docker Compose setup
└── README.md              # This file
```

## Technology Stack

### Frontend
- **React Native**: Cross-platform mobile development
- **React Native Chart Kit**: Data visualization
- **Axios**: HTTP client for API calls
- **Material Icons**: Icon library

### Backend
- **Python Flask**: RESTful API server
- **Pandas**: Data manipulation and analysis
- **Plotly**: Advanced data visualization
- **NumPy**: Numerical computing

### Deployment
- **Docker**: Containerization
- **Docker Compose**: Multi-service orchestration

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- Python 3.9+
- Docker and Docker Compose
- React Native development environment
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-mobile-app-csv
   ```

2. **Start the backend server**
   ```bash
   docker-compose up backend
   ```
   The backend will be available at `http://localhost:5000`

3. **Run the mobile app**
   ```bash
   # For Android
   npx react-native run-android
   
   # For iOS (macOS only)
   npx react-native run-ios
   ```

### Option 2: Manual Setup

1. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```

2. **Frontend Setup**
   ```bash
   npm install
   npx react-native start
   ```

3. **Run the mobile app**
   ```bash
   # In a new terminal
   npx react-native run-android  # or run-ios
   ```

### Option 3: Full Docker Development Environment

```bash
docker-compose up development
```

This will start the backend server and provide instructions for running the mobile app.

## Usage

### Chat Interface
- Ask questions about customers: "Show me all customers", "How many premium customers do we have?"
- Query order information: "What's our total revenue?", "Show order status distribution"
- Analyze products: "What are the top-selling products?", "Show revenue by category"

### Report Generation
- **Text Reports**: Business summaries, customer analysis
- **Visual Reports**: Charts for revenue, product sales, order status

### Example Queries
- "What is the total revenue?"
- "Show me all premium customers"
- "What are the top 5 products by sales?"
- "Generate a business summary report"
- "Show order status distribution"

## Data Validation & Anti-Hallucination Measures

### Built-in Safeguards
1. **Data Grounding**: All AI responses are generated from actual CSV data
2. **Validation Checks**: Numeric values are validated for reasonableness
3. **Query Processing**: Structured query processing prevents fabricated responses
4. **Error Handling**: Graceful error handling for invalid queries

### Validation Techniques
- Range checks for numeric values
- Cross-reference validation with source data
- Structured response formatting
- Data integrity verification

## Scalability Considerations

### Performance Optimizations
- **Data Caching**: CSV data is loaded once and cached in memory
- **Efficient Queries**: Pandas operations for fast data processing
- **Lazy Loading**: Data is processed only when needed
- **Connection Pooling**: Efficient API request handling

### Scaling for Larger Datasets
- Database migration path (PostgreSQL, MySQL)
- Data pagination for large result sets
- Background processing for complex queries
- Caching strategies for frequently accessed data

## API Endpoints

### Core Endpoints
- `GET /api/health` - Health check
- `POST /api/query` - Process natural language queries
- `GET /api/data/summary` - Get data summary statistics

### Report Endpoints
- `POST /api/reports/text` - Generate textual reports
- `POST /api/reports/visual` - Generate visual reports

## Development

### Adding New Query Types
1. Extend the `process_data_query` function in `backend/app.py`
2. Add new query patterns and response handlers
3. Update the mobile app's query processing if needed

### Adding New Report Types
1. Create new report generation functions
2. Add corresponding API endpoints
3. Update the mobile app's report interface

### Data Schema Changes
1. Update CSV files with new columns
2. Modify data loading and merging logic
3. Update validation functions
4. Test with existing queries

## Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing
```bash
npm test
```

### Integration Testing
```bash
# Test API endpoints
curl -X POST http://localhost:5000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the total revenue?"}'
```

## Deployment

### Production Deployment
1. Update API URLs in the mobile app
2. Set up production database (optional)
3. Configure environment variables
4. Deploy backend to cloud service (AWS, GCP, Azure)
5. Build and distribute mobile app

### Docker Production Build
```bash
docker build -t ai-mobile-app --target production .
docker run -p 5000:5000 ai-mobile-app
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the example queries and responses

## Future Enhancements

- [ ] Real-time data synchronization
- [ ] Advanced AI model integration (GPT-4, Claude)
- [ ] Multi-language support
- [ ] Advanced analytics and forecasting
- [ ] Export functionality for reports
- [ ] User authentication and authorization
- [ ] Data visualization improvements
- [ ] Performance monitoring and analytics
