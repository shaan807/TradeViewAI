## TradeVisionAI

Welcome to TradeVisionAI, a web application designed for analyzing and understanding stock market data with the help of AI.

### Project Details

TradeVisionAI provides users with tools to visualize historical stock data and leverage artificial intelligence for insights and predictions. The application focuses on the analysis of TSLA stock data provided in a CSV format.

The core functionalities are presented through a user-friendly tabbed interface:

*   **Data Source and Processing:** The application loads historical TSLA stock data from the `src/data/TLSA-data.csv` file. This data is processed to include relevant metrics and structures required for visualization and AI analysis.

*   **Price/Volume Visualizer:** This tab displays an interactive chart utilizing the `recharts` library. It shows the historical price movements and trading volume of TSLA stock, allowing users to visualize trends and patterns over time. A brush feature is included to enable zooming and focusing on specific date ranges.

*   **AI Analyst Chat:** This feature provides a conversational interface where users can ask specific questions about the loaded TSLA stock data in natural language. The chatbot interacts with an AI model to analyze the data and provide relevant answers, making it easy to get quick insights without needing to manually sift through the data.

*   **Trend Forecaster:** This tab empowers users with AI-powered predictions about potential future stock trends based on the historical data. The application uses an AI model to generate a trend prediction and provides a confidence level for that prediction.

## How to Run the Project

To run this project locally, follow these steps:

1.  **Prerequisites:**
    Make sure you have Node.js and npm (or yarn) installed on your system.

git clone <repository_url>

npm install

npm run dev


.  **Open the application:**
    After the development server starts, open your web browser and go to the address provided in the terminal output (usually http://localhost:3000).

These are the standard steps for running a Next.js application. If there are any specific instructions or scripts defined in the package.json file, you might need to follow those as well.
