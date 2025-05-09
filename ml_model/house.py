import pandas as pd
import numpy as np
import os
import joblib
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
        base_path = os.path.dirname(__file__)
        self.model_file = os.path.join(base_path, 'model.pkl')
        self.num_imp_file = os.path.join(base_path, 'num_imputer.pkl')
        self.bin_imp_file = os.path.join(base_path, 'bin_imputer.pkl')
        self.scaler_file = os.path.join(base_path, 'scaler.pkl')
        self.pca_file = os.path.join(base_path, 'pca.pkl')
        self.features_file = os.path.join(base_path, 'features.pkl')
        self.target = 'Price'  # Assuming 'Price' is the target column
        print(base_path,"\n",self.model_file)
        # Load if trained model exists
        if self._check_saved_model():
            self.voting_reg = joblib.load(self.model_file)
            self.num_imputer = joblib.load(self.num_imp_file)
            self.bin_imputer = joblib.load(self.bin_imp_file)
            self.scaler = joblib.load(self.scaler_file)
            self.pca = joblib.load(self.pca_file)
            self.all_features = joblib.load(self.features_file)
            self.numerical_features = ['Area', 'No. of Bedrooms', 'Latitude', 'Longitude']
            self.binary_features = [f for f in self.all_features if f not in self.numerical_features]
        else:
            self.numerical_features = None
            self.binary_features = None
            self.all_features = None
            self.num_imputer = SimpleImputer(strategy='median')
            self.bin_imputer = SimpleImputer(strategy='most_frequent')
            self.scaler = StandardScaler()
            self.pca = None
            self.rf = RandomForestRegressor(random_state=42)
            self.xgb = xgb.XGBRegressor(random_state=42)
            self.voting_reg = None
            self.train_model()

    def _check_saved_model(self):
        return all([os.path.exists(self.model_file),
                    os.path.exists(self.num_imp_file),
                    os.path.exists(self.bin_imp_file),
                    os.path.exists(self.scaler_file),
                    os.path.exists(self.pca_file),
                    os.path.exists(self.features_file)])

    def _get_features(self, df):
        df = df.drop(columns=['Id', 'Location', 'City', self.target])  # Make sure to drop the 'Id', 'Location', 'City', and target
        self.numerical_features = ['Area', 'No. of Bedrooms', 'Latitude', 'Longitude']
        self.binary_features = [col for col in df.columns if col not in self.numerical_features]
        self.all_features = self.numerical_features + self.binary_features

    def preprocess_data(self, X, fit=False):
        X_num = X[self.numerical_features]
        X_bin = X[self.binary_features]
        
        if fit:
            X_num = self.num_imputer.fit_transform(X_num)
            X_bin = self.bin_imputer.fit_transform(X_bin)
            X_num = self.scaler.fit_transform(X_num)
        else:
            X_num = self.num_imputer.transform(X_num)
            X_bin = self.bin_imputer.transform(X_bin)
            X_num = self.scaler.transform(X_num)
            
        X_combined = np.hstack((X_num, X_bin))
        
        if fit:
            self.pca = PCA(n_components=0.95, random_state=42)
            X_transformed = self.pca.fit_transform(X_combined)
        else:
            if self.pca is None:
                raise ValueError("PCA not fitted.")
            X_transformed = self.pca.transform(X_combined)
        return X_transformed

    def train_model(self, test_size=0.2, random_state=42):
        # Use os.path.join to make the file path more reliable
        base_path = os.path.dirname(__file__)
        dataset_path = os.path.join(base_path, 'dataset.csv')
        
        # Load the dataset
        df = pd.read_csv(dataset_path)  # Make sure the file path is correct
        self._get_features(df)

        # Define the feature set and target
        X = df[self.all_features]
        y = df[self.target]
        
        # Split the data into training and test sets
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=random_state)

        # Preprocess the data
        X_train_preprocessed = self.preprocess_data(X_train, fit=True)
        X_test_preprocessed = self.preprocess_data(X_test, fit=False)

        # Set hyperparameters for RandomForest and XGBoost
        rf_params = {'n_estimators': [100], 'max_depth': [10]}
        xgb_params = {'n_estimators': [100], 'max_depth': [5], 'learning_rate': [0.1]}
        
        # Perform GridSearchCV for both models
        rf_grid = GridSearchCV(self.rf, rf_params, cv=3, scoring='r2', n_jobs=-1)
        rf_grid.fit(X_train_preprocessed, y_train)
        best_rf = rf_grid.best_estimator_

        xgb_grid = GridSearchCV(self.xgb, xgb_params, cv=3, scoring='r2', n_jobs=-1)
        xgb_grid.fit(X_train_preprocessed, y_train)
        best_xgb = xgb_grid.best_estimator_

        # Create a Voting Regressor combining all models
        self.voting_reg = VotingRegressor([
            ('rf', best_rf),
            ('xgb', best_xgb),
            ('lr', LinearRegression())
        ])
        self.voting_reg.fit(X_train_preprocessed, y_train)

        # Save the trained models and preprocessing pipeline
        joblib.dump(self.voting_reg, self.model_file)
        joblib.dump(self.num_imputer, self.num_imp_file)
        joblib.dump(self.bin_imputer, self.bin_imp_file)
        joblib.dump(self.scaler, self.scaler_file)
        joblib.dump(self.pca, self.pca_file)
        joblib.dump(self.all_features, self.features_file)

        # Evaluate model performance on the test set
        y_pred = self.voting_reg.predict(X_test_preprocessed)
        print("R2 Score:", r2_score(y_test, y_pred))

    def predict(self, input_data):
        # Ensure all features are present in the input_data, adding missing ones with default values
        for f in self.all_features:
            if f not in input_data:
                input_data[f] = 0
        input_df = pd.DataFrame([input_data])
        
        # Preprocess the input data
        preprocessed = self.preprocess_data(input_df)
        
        # Make prediction
        prediction = self.voting_reg.predict(preprocessed)[0]
        print(f"\nPredicted Price: ₹{prediction:.2f} Lakhs")
        return prediction

