import json

import pandas as pd
from flask import Flask, request, send_from_directory
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.manifold import MDS

app = Flask(__name__, static_url_path='', static_folder='my-d3-app/build')

raw_data_df = None
data_columns = None
raw_numerical_data_df = pd.DataFrame({'A' : []})
numerical_data_columns = None
scaled_data = None
pca_loadings_df = None
eigen_vectors = None

pcs = ['PC1', 'PC2', 'PC3', 'PC4', 'PC5', 'PC6',
       'PC7', 'PC8', 'PC9', 'PC10', 'PC11', 'PC12']

dataset_path = "data/dataset.csv"


def load_data(csv_path):
    global raw_numerical_data_df, raw_data_df, scaled_data, numerical_data_columns, data_columns

    raw_data_df = pd.read_csv(csv_path)
    del raw_data_df["ID"]
    del raw_data_df["Name"]
    data_columns = raw_data_df.columns

    numerical_data_columns = data_columns[4:]

    raw_numerical_data_df = pd.DataFrame(
        raw_data_df[numerical_data_columns], columns=numerical_data_columns)


def kmeans(raw_numerical_data_df):
    kmeans = KMeans(n_clusters=5, random_state=0)
    clusters = kmeans.fit_predict(raw_numerical_data_df)

    return clusters


def pca():
    global raw_numerical_data_df, numerical_data_columns, pca_loadings_df, pcs

    sc = StandardScaler()
    scaled_data = sc.fit_transform(raw_numerical_data_df)

    pca = PCA()

    eigen_vectors = pca.fit_transform(scaled_data)

    pca_loadings_df = pd.DataFrame(
        pca.components_.T, columns=pcs, index=numerical_data_columns)
    pca_loadings_df['feature'] = numerical_data_columns

    return eigen_vectors, pca_loadings_df, pca.explained_variance_ratio_


def biplot(pca_loadings_df, eigen_vectors):
    ms = MinMaxScaler((-1, 1))
    dataPoints = ms.fit_transform(eigen_vectors[:, 0:2])
    dataPoints = [{'x': d[0], 'y': d[1]} for d in dataPoints]

    dimensionAxes = [{'x': x, 'y': y} for x, y in zip(
        pca_loadings_df['PC1'], pca_loadings_df['PC2'])]

    return {
        'dataPoints': dataPoints,
        'dimensionAxes': dimensionAxes
    }


def getTop4SignificantFeatures(pca_loadings_df, intrinsicDimensionalityIndex):
    global pcs

    df = pd.DataFrame(pca_loadings_df[pcs[0:intrinsicDimensionalityIndex]])
    df['SSL'] = df.pow(2).sum(axis=1)
    df['feature'] = df.index
    return df.sort_values(ascending=False, by='SSL')[0:4]


def dataMDS(raw_numerical_data_df):
    mds = MDS(n_components=2, metric=True,
              dissimilarity='euclidean', random_state=1)
    transformed = mds.fit_transform(raw_numerical_data_df)

    return [{'x': d[0], 'y': d[1]} for d in transformed]


def variableMDS(raw_numerical_data_df):
    correlation_df = raw_numerical_data_df.corr()
    dissimilarity_matrix = correlation_df.abs().rsub(1)  # 1 - |correlation|

    mds = MDS(n_components=2, metric=True,
              dissimilarity='precomputed', random_state=1)
    transformed = mds.fit_transform(dissimilarity_matrix)

    return [{'x': d[0], 'y': d[1]} for d in transformed]


@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/data_info')
def data_info():
    global dataset_path, data_columns, raw_data_df, numerical_data_columns, raw_numerical_data_df

    load_data(dataset_path)

    clusters = kmeans(raw_numerical_data_df)

    return {
        'features': data_columns.tolist(),
        'rawData': raw_data_df.to_dict(orient='records'),
        'numericalFeatures': numerical_data_columns.tolist(),
        'rawNumericalData': raw_numerical_data_df.to_dict(orient='records'),
        'kmeansClusters': clusters.tolist(),
    }


@app.route('/pca_info')
def pca_info():
    global dataset_path
    if raw_numerical_data_df.empty:
        load_data(dataset_path)

    eigen_vectors, pca_loadings_df_, pcaVarRatio = pca()

    biplotData = biplot(pca_loadings_df_, eigen_vectors)

    return {
        'varianceRatio': pcaVarRatio.tolist(),
        'biplotData': biplotData,
    }


@app.route('/top_significant_features')
def top_significant_features():
    global pca_loadings_df

    idi = int(request.args.get('idi'))
    topSignificantFeatures = getTop4SignificantFeatures(pca_loadings_df, idi)

    return {
        'topSignificantFeatures': topSignificantFeatures.to_dict(orient='records'),
    }


@app.route('/mds_info')
def mds_info():
    global dataset_path, raw_numerical_data_df

    if raw_numerical_data_df.empty:
        load_data(dataset_path)

    data_mds = dataMDS(raw_numerical_data_df)

    variable_mds = variableMDS(raw_numerical_data_df)

    return {
        'dataMds': data_mds,
        'variableMds': variable_mds,
    }


if __name__ == '__main__':
    app.run()
