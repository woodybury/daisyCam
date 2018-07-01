import os

path =  os.getcwd() + '/daisy_photos/'
filenames = os.listdir(path)

for x, filename in enumerate(filenames, 0):
    print (filename)
    if filename.startswith('daisy_'):
        os.rename(path + filename, path + 'daisy_' + str(200 + x) + '.jpg')
