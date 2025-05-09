import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestRegressor, VotingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import xgboost as xgb
from sklearn.metrics import r2_score

class HousePricePredictor:
    def __init__(self):
        base_path = os.path.dirname(__file__)
        self.target = 'Price'
        self.dataset_path  = os.path.join(base_path, 'dataset.csv')
        self.model_file    = os.path.join(base_path, 'model.pkl')
        self.num_imp_file  = os.path.join(base_path, 'num_imputer.pkl')
        self.bin_imp_file  = os.path.join(base_path, 'bin_imputer.pkl')
        self.scaler_file   = os.path.join(base_path, 'scaler.pkl')
        self.pca_file      = os.path.join(base_path, 'pca.pkl')
        self.features_file = os.path.join(base_path, 'features.pkl')

        if self._check_saved_model():
            self.voting_reg      = joblib.load(self.model_file)
            self.num_imputer     = joblib.load(self.num_imp_file)
            self.bin_imputer     = joblib.load(self.bin_imp_file)
            self.scaler          = joblib.load(self.scaler_file)
            self.pca             = joblib.load(self.pca_file)
            self.all_features    = joblib.load(self.features_file)
            self.numerical_features = ['Area', 'No. of Bedrooms', 'Latitude', 'Longitude']
            self.binary_features    = [f for f in self.all_features if f not in self.numerical_features]
        else:
            self.num_imputer  = SimpleImputer(strategy='median')
            self.bin_imputer  = SimpleImputer(strategy='most_frequent')
            self.scaler       = StandardScaler()
            self.pca          = None
            self.rf           = RandomForestRegressor(random_state=42)
            self.xgb          = xgb.XGBRegressor(random_state=42)
            self.voting_reg   = None
            self.train_model()

    def _check_saved_model(self):
        return all(os.path.exists(p) for p in [
            self.model_file,
            self.num_imp_file,
            self.bin_imp_file,
            self.scaler_file,
            self.pca_file,
            self.features_file
        ])

    def _get_features(self, df):
        df = df.drop(columns=['Id', 'Location', 'City', self.target])
        self.numerical_features = ['Area', 'No. of Bedrooms', 'Latitude', 'Longitude']
        self.binary_features    = [c for c in df.columns if c not in self.numerical_features]
        self.all_features       = self.numerical_features + self.binary_features

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
            return self.pca.fit_transform(X_combined)
        else:
            return self.pca.transform(X_combined)

    def train_model(self, test_size=0.2, random_state=42):
        if not os.path.exists(self.dataset_path):
            raise FileNotFoundError(f"{self.dataset_path} not found")
        df = pd.read_csv(self.dataset_path)
        self._get_features(df)

        X = df[self.all_features]
        y = df[self.target]
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )

        X_train_p = self.preprocess_data(X_train, fit=True)
        X_test_p  = self.preprocess_data(X_test,  fit=False)

        rf_grid = GridSearchCV(self.rf, {'n_estimators':[100],'max_depth':[10]}, cv=3, scoring='r2', n_jobs=-1)
        rf_grid.fit(X_train_p, y_train)
        xgb_grid = GridSearchCV(self.xgb, {'n_estimators':[100],'max_depth':[5],'learning_rate':[0.1]}, cv=3, scoring='r2', n_jobs=-1)
        xgb_grid.fit(X_train_p, y_train)

        self.voting_reg = VotingRegressor([
            ('rf',  rf_grid.best_estimator_),
            ('xgb', xgb_grid.best_estimator_),
            ('lr',  LinearRegression())
        ])
        self.voting_reg.fit(X_train_p, y_train)

        joblib.dump(self.voting_reg,   self.model_file)
        joblib.dump(self.num_imputer,  self.num_imp_file)
        joblib.dump(self.bin_imputer,  self.bin_imp_file)
        joblib.dump(self.scaler,       self.scaler_file)
        joblib.dump(self.pca,          self.pca_file)
        joblib.dump(self.all_features, self.features_file)

        y_pred = self.voting_reg.predict(X_test_p)
        print("R2 Score:", r2_score(y_test, y_pred))

    def predict(self, input_data):
        for f in self.all_features:
            input_data.setdefault(f, 0)
        df_in = pd.DataFrame([input_data])
        X_p   = self.preprocess_data(df_in, fit=False)
        pred  = self.voting_reg.predict(X_p)[0]
        print(f"Predicted Price: ₹{pred:.2f} Lakhs")
        return pred
