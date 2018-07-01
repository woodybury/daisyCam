import cv2
import glob
import os

imgs = glob.glob('daisy_photos/*.jpg')

print (imgs)

width = 500

folder = 'daisy_photos/resized'
if not os.path.exists(folder):
    os.makedirs(folder)

for img in imgs:
    pic = cv2.imread(img, cv2.IMREAD_UNCHANGED)
    height = int(width * pic.shape[0] / pic.shape[1])
    pic = cv2.resize(pic, (width, height))
    print (img)
    cv2.imwrite(folder + '/' + img.replace('daisy_photos/',''), pic)
