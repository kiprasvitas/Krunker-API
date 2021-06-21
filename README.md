# Krunker User Stats API
This web application is based as an introduction to background worker processes in Heroku, which can be found at the [Heroku Devcenter](https://devcenter.heroku.com/articles/python-rq).

## How it works:
There used to be faster API's that would connect directly to Krunker's social websockets, including repositories like this: https://github.com/fasetto/krunker.io, however, Krunker soon found out about this and decided to not only add extreme cors policies to their websockets, but also armed their websockets and websites with hcaptchas. That is why, this API, though extremely slow, works differently then most. This API runs [Undetectable Chromedriver](https://github.com/ultrafunkamsterdam/undetected-chromedriver), which is the only Chromium based undetectable selenium chromedriver that is able to load Krunker's Hub page.

Here are the steps:

Web worker recieves URL parameter 'name' from client
Background worker runs function 'scrapeUser' with the parameter/argument
scrapeUser starts the chromedriver
loads the profile page in Krunker Hub
checks for captchas
if a captcha is found, it will navigate to hcaptcha.com and login and set the accessibility cookie (which allows it to bypass all hcaptchas automatically)
the driver navigates back to the krunker hub, solves the captcha
the driver scrapes all available user data (websockets can be scraped as well: view => https://github.com/ultrafunkamsterdam/undetected-chromedriver#the-version-2-expert-mode-including-devtoolwire-events)
the function quits the drivers and returns the user data back to the client

## How to Setup
The only way this API was possible was with the help of [Hcaptcha's Accessibility Cookie](https://www.hcaptcha.com/accessibility) which allows the driver to automatically bypass the hcaptcha for each API request.

If you want to host the API for yourself, you must signup for Hcaptcha's accessibility program with a valid password and username at: https://dashboard.hcaptcha.com/signup?type=accessibility

Once, you have a valid username and password, please go to the utils.py file and replace the username and password variables at the top of the scrapeUser function.

After that, you're all set up and you can launch the API to Heroku or any other platform of your choosing.

## Example Response:

```
{"LVL": "10", "CHALLENGE": "1", "KR": "170", "SCORE": "128,245", "SPK": "89.93", "KILLS": "1,426", "DEATHS": "990", "KDR": "1.4404", "KPG": "7.2386", "GAMES": "197", "W/L": "0.59", "WINS": "73", "LOSSES": "124", "ASSISTS": "0", "NUKES": "0", "KR-PACKAGES": "0", "MELEE": "0", "BEATDOWNS": "0", "BULLSEYES": "0", "HEADSHOTS": "0", "WALLBANGS": "0", "SPRAYS PLACED": "0", "ACCURACY": "0%", "TIME PLAYED": "9h 11m", "HACKER": "TRUE", "CLAN": "NONE", "FOLLOWERS": "8", "FOLLOWING": "0", "PARTNER": "FALSE", "PREMIUM": "FALSE", "VERIFIED": "FALSE"}
```

To test out the API: go here

Example: https://krunkerapi.herokuapp.com/?name=nameofuser

The API will return all of the specified user results.

I've also added app.json and this readme so you can:

## Deploy to Heroku
By clicking the button below.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
