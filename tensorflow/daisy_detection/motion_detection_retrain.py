import cv2
import daisy_detection_retrain
from datetime import datetime

static_back = None
video = cv2.VideoCapture(0)

while True:
    # Reading frame(image) from video
    check, frame = video.read()

    # Initializing motion = 0(no motion)
    motion = 0

    # Converting color image to gray_scale image
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Converting gray scale image to GaussianBlur 
    # so that change can be find easily
    gray = cv2.GaussianBlur(gray, (21, 21), 0)

    # In first iteration we assign the value 
    # of static_back to our first frame
    if static_back is None:
        static_back = gray
        continue

    # Difference between static background 
    # and current frame(which is GaussianBlur)
    diff_frame = cv2.absdiff(static_back, gray)

    # If change in between static background and
    # current frame is greater than 30 it will show white color(255)
    thresh_frame = cv2.threshold(diff_frame, 100, 255, cv2.THRESH_BINARY)[1]
    thresh_frame = cv2.dilate(thresh_frame, None, iterations = 2)

    # Finding contour of moving object
    (_, cnts, _) = cv2.findContours(thresh_frame.copy(),
                                    cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    for contour in cnts:
        if cv2.contourArea(contour) < 10000:
            continue
        print ('movement!')
        cv2.imwrite("capture/movement.jpg", frame)

        score = daisy_detection_retrain.detection("capture/movement.jpg")
        if score > 0.7:
            print ('daisy found, score: ', score)
            filename = "capture/daisy" + datetime.now().strftime("%Y%m%d-%H%M%S") + ".jpg"
            print (filename)
            cv2.imwrite(filename, frame)


        # (x, y, w, h) = cv2.boundingRect(contour)
        # # making green rectangle arround the moving object
        # cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 3)

    # Displaying the black and white image in which if
    # cv2.imshow("Threshold Frame", thresh_frame)

    key = cv2.waitKey(1)
    # if q entered whole process will stop
    if key == ord('q'):
        # if something is movingthen it append the end time of movement
        if motion == 1:
            time.append(datetime.now())
        break

video.release()

# Destroying all the windows
cv2.destroyAllWindows()