# GIAP - Javascript SDK

- [Description](#description)
- [Usage](#usage)
- [Installation for Development](#installation-for-development)

## Description

**Javscript SDK** for your app to communicate with **Got It Analytics Platform**

## Usage

    npm install @gotitinc/giap

### Import the package
  ```javascript
  import giap from "gotitinc/giap"
  ```
### Initialize the library
Use this method to initialize and setup the SDK. All other SDK methods ***must be*** called after this one
  ```javascript
  giap.initialize('YOUR_PROJECT_TOKEN', 'THE_GIAP_SERVER_URL')
  ```
Parameters

-   `projectToken`: **[String]()** - **required** - your project token
-   `serverUrl`: **[String]()** - **required** - GIAP server url
-   `enableLog`: **[Boolean]()** - **optional** - set to `true` to enable console log

### Create alias
Use this method right after user has just signed up

```javascript
giap.alias("INSERT THE USER ID");
```

### Identify
Use this method right after user has just logged in

```javascript
giap.identify("INSERT THE USER ID");
```

### Track

Use a string to represent the event name (**required**) and a object (**optional**) to represent the event properties.

```javascript
giap.track("Visit", { economyGroup });
```

### Set properties for current profile
At any moment after initializing the lib, you can set custom properties for current tracking profile

```javascript
giap.setProfileProperties({ fullName: name });
```

### Reset
Use this method right after user has just logged out

```javascript
giap.reset();
```



## Installation for Development
### Prerequisites

- Install [Node.js](https://nodejs.org/en/) on your machine

### Installing

1. Clone this repository

   ```bash
   git clone https://github.com/tutoruniverse/giap_javascript.git
   ```

2. Install dependencies

   ```bash
   cd giap_javascript
   npm install
   ```

### Available Script

#### Testing
    npm test
#### Run Demo App
1. Edit config in `demo/src/constants/app.js` if needed
2. Run <br/>
  ```bash
  npm start-demo
  ```
#### Production
    npm run build
