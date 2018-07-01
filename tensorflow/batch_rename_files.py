import os

path =  os.getcwd() + '/daisy_photos/'
filenames = os.listdir(path)

for x, filename in enumerate(filenames, 1):
    print (filename)
    if filename.startswith('IMG'):
        os.rename(path + filename, path + 'daisy_0.' + str(x) + '.jpg')
