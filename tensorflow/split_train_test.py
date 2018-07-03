# see Dat Tran's raccoon detector: https://github.com/datitran/raccoon_dataset
import numpy as np
import pandas as pd
np.random.seed(1)

full_labels = pd.read_csv('data/daisy_labels.csv')

gb = full_labels.groupby('filename')
grouped_list = [gb.get_group(x) for x in gb.groups]

print (len(grouped_list))

train_index = np.random.choice(len(grouped_list), size=180, replace=False)
test_index = np.setdiff1d(list(range(230)), train_index)

train = pd.concat([grouped_list[i] for i in train_index])
test = pd.concat([grouped_list[i] for i in test_index])

train.to_csv('data/train_labels.csv', index=None)
test.to_csv('data/test_labels.csv', index=None)