from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

def get_data_from_mongodb(uri = 'mongodb://localhost:27017', db_name = 'iot_project', collection = 'measurements'):
    df = pd.DataFrame()
    try:
        client = MongoClient(uri, serverSelectionTimeoutMS=1000)
        client.admin.command("ping")
        print("Connection successful")

        db = client[db_name]
        collection = db[collection]

        cursor = collection.find({})
        df = pd.DataFrame(list(cursor))
        print(list(df.columns))
        return df
    except ConnectionFailure:
        print("Connection failed")

def clean_data(df, add_moving_avg_cols = True):
    raw_data = df.copy()
    #delete rows with more than 90% missing data
    df = df.dropna(thresh=int(0.9 * len(df.columns)), axis=0)

    #delete duplicate rows
    df = df.drop_duplicates()

    #delete statistic outliers
    for column in df.select_dtypes(include=['float64', 'int64']).columns:
        q1 = df[column].quantile(0.25)
        q3 = df[column].quantile(0.75)
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        df = df[(df[column] >= lower_bound) & (df[column] <= upper_bound)]

    #delete realistic outliners
    df.loc[
        (clean_df["temperature"] < -20) |
        (clean_df["temperature"] > 60),
        "temperature"
    ] = np.nan

    #fill in blanks
    df = df.interpolate()

    #add moving avg columns to the df
    if add_moving_avg_cols:
        pass
        # TODO fill this in

    return df

get_data_from_mongodb()