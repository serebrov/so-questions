# See http://stackoverflow.com/questions/35382258/google-chrome-with-selenium/35420019
# Download the chromedriver:
# $ wget wget http://chromedriver.storage.googleapis.com/2.21/chromedriver_linux64.zip
# $ unzip chromedriver_linux64.zip
#
# Run the script as
# $ Xvfb :99 -ac -screen 0 1280x1024x16
# $ PATH=$PATH:. python selenimum_scrape.py

import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

os.environ['DISPLAY'] = ':99'

def init_driver():
    driver = webdriver.Chrome()
    driver.wait = WebDriverWait(driver, 5)
    return driver

def lookup(driver, query):
    print 'Get google.com'
    driver.get("http://www.google.com")
    try:
        box = driver.wait.until(EC.presence_of_element_located(
            (By.NAME, "q")))
        # once we type the query, this button disappears
        # button = driver.wait.until(EC.element_to_be_clickable(
        #     (By.NAME, "btnK")))
        box.send_keys(query)
        button = driver.wait.until(EC.element_to_be_clickable(
            (By.NAME, "btnG")))
        button.click()
        print 'Done'
    except TimeoutException:
        print("Box or Button not found in google.com")

if __name__ == "__main__":
    driver = init_driver()
    lookup(driver, "Selenium")
    time.sleep(5)
    driver.quit()
