import undetected_chromedriver.v2 as uc
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
import base64
import time
import os
import asyncio
import requests
import json
import sys

def scrapeUser(name):
    user_name = name
    email = os.environ.get("EMAIL")
    password = os.environ.get("PASS")

    options = uc.ChromeOptions()
    options.binary_location = os.environ.get("GOOGLE_CHROME_BIN")

    options.add_argument("--headless")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--no-sandbox")

    #executable_path=os.environ.get("CHROMEDRIVER_PATH"), 
    driver = uc.Chrome(executable_path=os.environ.get("CHROMEDRIVER_PATH"), patcher_force_close=True, options=options)

    def solveCaptcha():
        driver.get("https://dashboard.hcaptcha.com/login")
        time.sleep(1.1)
        driver.find_element_by_xpath("/html/body/div[1]/div/div[1]/div/div[2]/div[3]/div[3]/div[1]/input").send_keys(email)
        driver.find_element_by_xpath("/html/body/div[1]/div/div[1]/div/div[2]/div[3]/div[3]/div[2]/input").send_keys(password)
        driver.find_element_by_xpath("/html/body/div[1]/div/div[1]/div/div[2]/div[4]/button").click()
        time.sleep(2.2)
        WebDriverWait(driver, 16).until(EC.element_to_be_clickable((By.XPATH, "/html/body/div[1]/div/div[3]/div/div[3]/button"))).click()
        WebDriverWait(driver, 16).until(EC.visibility_of_element_located((By.XPATH, "/html/body/div[1]/div/div[3]/div/div[3]/span")))
        time.sleep(2)


    driver.get('https://krunker.io/social.html?p=profile&q={}'.format(user_name))
    print("website loaded")
    time.sleep(2)

    def iscaptcha():
        try:
            iframes = driver.find_elements_by_tag_name('iframe')
            for frame in iframes:
                if frame.get_attribute("src").startswith("https://newassets.hcaptcha.com/captcha/v1/"):
                    return True
        except Exception as e:
            print(e)
            return False

    captcha = iscaptcha()

    if captcha == True:
        print("found captcha")
        solveCaptcha()
        driver.get('https://krunker.io/social.html?p=profile&q={}'.format(user_name))
        time.sleep(2)
        WebDriverWait(driver, 10).until(EC.frame_to_be_available_and_switch_to_it(
                    (By.CSS_SELECTOR, "iframe[src^='https://newassets.hcaptcha.com/captcha/v1/']")))
        driver.execute_script("document.getElementById('checkbox').click()")
        print("solved captcha")
    else:
        print("no captcha found")

    time.sleep(1)

    try:
        WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, '//button[normalize-space()="I Accept"]'))).click()
        WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "statHolder")))
        res = driver.find_element_by_id('statHolder')
        res_html = res.get_attribute('innerText')

        is_hacker = driver.find_element_by_id('hackText')
        if (is_hacker.get_attribute('style') == "display: none;"):
            hacker = "false"
        else:
            hacker = "true"

        followers = driver.find_elements_by_class_name('follL')[0].get_attribute('innerText')[0:-9]
        following = driver.find_elements_by_class_name('follL')[1].get_attribute('innerText')[0:-9]

        def checkClan():
            try:
                links = driver.find_elements_by_tag_name('a')
                for link in links:
                    if link.get_attribute("href").startswith("https://krunker.io/social.html?p=clan&q="):
                        href = link.get_attribute("href")
                        playerclan = href[href.find("q")+2:]
                        return playerclan
            except Exception as e:
                print(e)
                exc_type, exc_obj, exc_tb = sys.exc_info()
                fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
                print(exc_type, fname, exc_tb.tb_lineno)
                return False

        def check_badge(name):
            badges = []
            for icon in driver.find_element_by_id("rightProfile").find_element_by_class_name('leftTopHolder').find_elements_by_class_name('material-icons'):
                if (icon.get_attribute("innerText") == name):
                    badges.append("true")
                else:
                    badges.append("false")
            if any("true" in s for s in badges):
                return "true"
            else:
                return "false"

        isclan = checkClan()

        if isclan != False:
            clan = isclan
        else:
            clan = "none"

        verified = check_badge("check_circle")
        partner = check_badge("verified")
        premium = check_badge("beenhere")

        driver.quit()
        words_list = res_html.split('\n')
        def Convert(lst):
            res_dct = {lst[i]: lst[i + 1] for i in range(0, len(lst), 2)}
            return res_dct
        sentence_dict = Convert(words_list)
        sentence_dict['hacker'] = hacker
        sentence_dict['clan'] = clan
        sentence_dict['followers'] = followers
        sentence_dict['following'] = following
        sentence_dict['partner'] = partner
        sentence_dict['premium'] = premium
        sentence_dict['verified'] = verified
        sentence_dict = json.dumps(sentence_dict)
        return sentence_dict.lower()
    except Exception as e:
        exc_type, exc_obj, exc_tb = sys.exc_info()
        fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
        print(exc_type, fname, exc_tb.tb_lineno)
        driver.quit()
        return "No user found with this name."