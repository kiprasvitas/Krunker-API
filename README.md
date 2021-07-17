# Krunker User Stats API
This web application is based as an introduction to background worker processes in Heroku, which can be found at the [Heroku Devcenter](https://devcenter.heroku.com/articles/python-rq).

## Examples:
Python:
```python
import requests
import json

name = "FrostyWolfTTV"

def getUserData(name):

	# Create request to the API
	r = requests.get("https://krunkerapi.herokuapp.com/?name={}".format(name))

	# Check if the response has the value LVL in it
	if "LVL" not in r.text:
		# If you get a gateway timeout, please wait around a minute before trying again
		print("Gateway Timeout...")
		print(r.text)
	else:
		print(r.text)

	data = json.loads(r.text)

	# Example of getting specific data from json
	print(data['lvl'])

getUserData(name)
```
**If you don't want to get gateway timeout errors, I would suggest cloning the project and importing the utils.py file scrapeUser function into your python file so it can executed locally**

## How it works:
There used to be faster API's that would connect directly to Krunker's social websockets, including repositories like this: https://github.com/fasetto/krunker.io, however, Krunker soon found out about this and decided to not only add extreme cors policies to their websockets, but also armed their websockets and websites with hcaptchas. That is why, this API, though extremely slow, works differently then most. This API runs [Undetectable Chromedriver](https://github.com/ultrafunkamsterdam/undetected-chromedriver), which is the only Chromium based undetectable selenium chromedriver that is able to load Krunker's Hub page.

Here are the steps:

1. Web worker recieves URL parameter 'name' from client
2. Background worker runs function 'scrapeUser' with the parameter/argument
3. scrapeUser starts the chromedriver
4. loads the profile page in Krunker Hub
5. checks for captchas
6. if a captcha is found, it will navigate to hcaptcha.com and login and set the accessibility cookie (which allows it to bypass all hcaptchas automatically)
7. the driver navigates back to the krunker hub, solves the captcha
8. the driver scrapes all available user data (websockets can be scraped as well: view => https://github.com/ultrafunkamsterdam/undetected-chromedriver#the-version-2-expert-mode-including-devtoolwire-events)
9. the function quits the drivers and returns the user data back to the client

## How to Setup
The only way this API was possible was with the help of [Hcaptcha's Accessibility Cookie](https://www.hcaptcha.com/accessibility) which allows the driver to automatically bypass the hcaptcha for each API request.

If you want to host the API for yourself, you must signup for Hcaptcha's accessibility program with a valid password and username at: https://dashboard.hcaptcha.com/signup?type=accessibility

Once, you have a valid username and password, please go to your Heroku dashboard and configure two new config variables named 'EMAIL' and 'PASS'. Their values should be your email and password for Hcaptcha accessibility.

After that, you're all set up and you can launch the API to Heroku or any other platform of your choosing.

## Example Response:

```
{"LVL": "10", "CHALLENGE": "1", "KR": "170", "SCORE": "128,245", "SPK": "89.93", "KILLS": "1,426", "DEATHS": "990", "KDR": "1.4404", "KPG": "7.2386", "GAMES": "197", "W/L": "0.59", "WINS": "73", "LOSSES": "124", "ASSISTS": "0", "NUKES": "0", "KR-PACKAGES": "0", "MELEE": "0", "BEATDOWNS": "0", "BULLSEYES": "0", "HEADSHOTS": "0", "WALLBANGS": "0", "SPRAYS PLACED": "0", "ACCURACY": "0%", "TIME PLAYED": "9h 11m", "HACKER": "TRUE", "CLAN": "NONE", "FOLLOWERS": "8", "FOLLOWING": "0", "PARTNER": "FALSE", "PREMIUM": "FALSE", "VERIFIED": "FALSE"}
```

To test out the API: go here

Example: https://krunkerapi.herokuapp.com/?name=nameofuser

The API will return all of the specified user results.

**One thing to keep in mind is that the first request might return an H12 error. This is not because the process failed, but because it took too long to solve the hcaptcha the first time. After the first request, it should return the results without an error.**

I've also added app.json and this readme so you can:

## Deploy to Heroku
By clicking the button below.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
