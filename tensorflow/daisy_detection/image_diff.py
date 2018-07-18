import cv2

threshold = 150

def gray_blur(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray_blur = cv2.GaussianBlur(gray, (21, 21), 0)
    return gray_blur

def diff(prev_image, current_frame):
    prev_image = cv2.imread(prev_image)

    prev_image = gray_blur(prev_image)
    current_frame = gray_blur(current_frame)

    diff_frame = cv2.absdiff(prev_image, current_frame)

    thresh_frame = cv2.threshold(diff_frame, threshold, 255, cv2.THRESH_BINARY)[1]
    thresh_frame = cv2.dilate(thresh_frame, None, iterations = 2)

    (_, cnts, _) = cv2.findContours(thresh_frame.copy(),
                                    cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    for contour in cnts:
        if cv2.contourArea(contour) < 10000:
            return True
        else:
            return False