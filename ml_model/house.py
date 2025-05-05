import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestRegressor, VotingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, explained_variance_score, max_error
from sklearn.decomposition import PCA
import xgboost as xgb

class HousePricePredictor:
    def __init__(self):
        self.csv_path = "dataset.csv"
        self.target = 'Price'
        
        # Initialize after reading data
        self.numerical_features = None
        self.binary_features = None
        self.all_features = None
        
        # Preprocessing tools
        self.num_imputer = SimpleImputer(strategy='median')
        self.bin_imputer = SimpleImputer(strategy='most_frequent')
        self.scaler = StandardScaler()
        self.pca = None  # PCA will be initialized during training
        
        # Models
        self.rf = RandomForestRegressor(random_state=42)
        self.xgb = xgb.XGBRegressor(random_state=42)
        self.voting_reg = None

    def _get_features(self, df):
        """Identify feature columns from dataframe and print them"""
        df = df.drop(columns=['Id', 'Location', 'City', self.target])
        self.numerical_features = ['Area', 'No. of Bedrooms', 'Latitude', 'Longitude']
        self.binary_features = [col for col in df.columns if col not in self.numerical_features]
        self.all_features = self.numerical_features + self.binary_features
        
        # Print selected features
        print("\n=== Selected Features ===")
        print("Numerical Features:", self.numerical_features)
        print("Binary Features:", self.binary_features)
        print("Total Features:", len(self.all_features))
        print("All Features:", self.all_features)

    def preprocess_data(self, X, fit=False):
        """Preprocess numerical and binary features, apply PCA if fit"""
        X_num = X[self.numerical_features]
        X_bin = X[self.binary_features]
        
        # Imputation
        if fit:
            X_num = self.num_imputer.fit_transform(X_num)
            X_bin = self.bin_imputer.fit_transform(X_bin)
            X_num = self.scaler.fit_transform(X_num)
        else:
            X_num = self.num_imputer.transform(X_num)
            X_bin = self.bin_imputer.transform(X_bin)
            X_num = self.scaler.transform(X_num)
            
        # Combine numerical and binary features
        X_combined = np.hstack((X_num, X_bin))
        
        # Apply PCA
        if fit:
            # Initialize PCA to retain 95% variance
            self.pca = PCA(n_components=0.95, random_state=42)
            X_transformed = self.pca.fit_transform(X_combined)
            print(f"PCA: Selected {self.pca.n_components_} components, explaining {self.pca.explained_variance_ratio_.sum():.4f} variance")
        else:
            if self.pca is None:
                raise ValueError("PCA not fitted. Train the model first.")
            X_transformed = self.pca.transform(X_combined)
            
        return X_transformed

    def train_model(self, test_size=0.2, random_state=42):
        """Train model with hyperparameter tuning and PCA"""
        df = pd.read_csv(self.csv_path)
        self._get_features(df)
        
        X = df[self.all_features]
        y = df[self.target]
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )
        
        # Preprocess data with PCA
        X_train_preprocessed = self.preprocess_data(X_train, fit=True)
        X_test_preprocessed = self.preprocess_data(X_test, fit=False)

        # Hyperparameter tuning
        rf_params = {'n_estimators': [100, 200], 'max_depth': [10, 20]}
        xgb_params = {'n_estimators': [100, 200], 'max_depth': [5, 7], 'learning_rate': [0.1, 0.05]}
        
        rf_grid = GridSearchCV(self.rf, rf_params, cv=5, scoring='r2', n_jobs=-1)
        rf_grid.fit(X_train_preprocessed, y_train)
        best_rf = rf_grid.best_estimator_
        
        xgb_grid = GridSearchCV(self.xgb, xgb_params, cv=5, scoring='r2', n_jobs=-1)
        xgb_grid.fit(X_train_preprocessed, y_train)
        best_xgb = xgb_grid.best_estimator_

        # Create voting regressor
        self.voting_reg = VotingRegressor(
            estimators=[
                ('rf', best_rf),
                ('xgb', best_xgb),
                ('lr', LinearRegression())
            ]
        )
        self.voting_reg.fit(X_train_preprocessed, y_train)

        # Evaluate
        y_pred = self.voting_reg.predict(X_test_preprocessed)
        metrics = {
            'RMSE': np.sqrt(mean_squared_error(y_test, y_pred)),
            'MAE': mean_absolute_error(y_test, y_pred),
            'R2': r2_score(y_test, y_pred),
            'Explained Variance': explained_variance_score(y_test, y_pred),
            'Max Error': max_error(y_test, y_pred)
        }
        
        # Print specified fields
        print("\n=== Model Training Results ===")
        print("Best RandomForest Parameters:", rf_grid.best_params_)
        print("Best XGBoost Parameters:", xgb_grid.best_params_)
        print(f"PCA Components: {self.pca.n_components_}")
        print(f"PCA Explained Variance Ratio: {self.pca.explained_variance_ratio_.sum():.4f}")
        print("\nTest Metrics:")
        print(f"  RMSE: {metrics['RMSE']:.2f}")
        print(f"  MAE: {metrics['MAE']:.2f}")
        print(f"  R² Score: {metrics['R2']:.4f}")
        print(f"  Explained Variance: {metrics['Explained Variance']:.4f}")
        print(f"  Max Error: {metrics['Max Error']:.2f}")
        
        return metrics

    def predict(self, input_data):
        if self.voting_reg is None or self.pca is None:
            self.train_model()
        """Make prediction for new input"""
        
        # Check features
        for f in self.all_features:
            if f not in input_data:
                input_data[f] = 0

        input_df = pd.DataFrame([input_data])
        preprocessed = self.preprocess_data(input_df)
        prediction = self.voting_reg.predict(preprocessed)[0]
        
        # Print prediction
        print(f"\nPredicted Price: ₹{prediction:.2f} Lakhs")
        return prediction

# Example usage
if __name__ == "__main__":
    predictor = HousePricePredictor()
    metrics = predictor.train_model()
    
    # Create sample input (using values from first row of dataset)
    sample_input = {
        'Area': 3340,
        'No. of Bedrooms': 4.0,
        'Latitude': 12.2655944,
        'Longitude': 76.6465404,
        'Resale': 0,
        'MaintenanceStaff': 1.0,
        'Gymnasium': 1.0,
        'SwimmingPool': 1.0,
        'LandscapedGardens': 1.0,
        'JoggingTrack': 1.0,
        'RainWaterHarvesting': 1.0,
        'IndoorGames': 1.0,
        'ShoppingMall': 0.0,
        'Intercom': 1.0,
        'SportsFacility': 1.0,
        'ATM': 0.0,
        'ClubHouse': 1.0,
        'School': 0.0,
        '24X7Security': 1.0,
        'PowerBackup': 1.0,
        'CarParking': 0.0,
        'StaffQuarter': 0.0,
        'Cafeteria': 0.0,
        'MultipurposeRoom': 0.0,
        'Hospital': 0.0,
        'WashingMachine': 0.0,
        'Gasconnection': 0.0,
        'AC': 0.0,
        'Wifi': 0.0,
        'Children\'splayarea': 1.0,
        'LiftAvailable': 1.0,
        'BED': 0.0,
        'VaastuCompliant': 0.0,
        'Microwave': 0.0,
        'GolfCourse': 0.0,
        'TV': 0.0,
        'DiningTable': 0.0,
        'Sofa': 0.0,
        'Wardrobe': 0.0,
        'Refrigerator': 0.0
    }
    
    try:
        prediction = predictor.predict(sample_input)
    except ValueError as e:
        print(f"Input Error: {e}") 