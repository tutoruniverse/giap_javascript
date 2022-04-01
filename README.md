# GIAP - Javascript SDK

- [Description](#description)
- [Usage](#usage)
- [Installation for Development](#installation-for-development)

## Description

**Javscript SDK** for your app to communicate with **Got It Analytics Platform**

## Usage

    npm install @gotitinc/giap_javascript

### Import the package

```javascript
import giap from '@gotitinc/giap_javascript';
```

### Initialize the library

Use this method to initialize and setup the SDK. All other SDK methods **_must be_** called after this one

```javascript
giap.initialize('YOUR_PROJECT_TOKEN', 'THE_GIAP_SERVER_URL');
```

Parameters

- `projectToken`: **[String]()** - **required** - your project token
- `serverUrl`: **[String]()** - **required** - GIAP server url
- `enableLog`: **[Boolean]()** - **optional** - set to `true` to enable development log

### Create alias

Use this method with a string representing user id (**required**) right after user has just signed up

```javascript
giap.alias('INSERT THE USER ID');
```

### Identify

Use this method with a string representing user id (**required**) right after user has just logged in

```javascript
giap.identify('INSERT THE USER ID');
```

### Track

Use a string to represent the event name (**required**) and a object (**optional**) to represent the event properties.

```javascript
giap.track('Visit', { economyGroup });
```

### Set properties for current profile

At any moment after initializing the lib, you can set custom properties for current tracking profile

```javascript
giap.setProfileProperties({ fullName: 'YOUR FULL NAME' });
```

### Modify properties for current profile

#### Increase: Increment/decrement a numeric property

```javascript
giap.increase('propertyName', 100);
```

#### Append: Add element(s) to a list property

```javascript
giap.append('propertyName', ['one', 'two']);
```

#### Remove: Remove element(s) from a list property

```javascript
giap.remove('propertyName', ['two']);
```

### Reset

Use this method right after user has just logged out

```javascript
giap.reset();
```

### Notification

GIAP Javascript SDK handles everything asynchronously. Your app can be notified about important tasks done by the SDK.

Implement the following methods for your library:

```javascript
giap.notification.didResetWithDistinctId = (distinctId) => {
  console.log(`GIAP didResetWithDistinctId: ${distinctId}`);
};

giap.notification.didEmitEvents = (events, responseData) => {
  console.log('GIAP didEmitEvent: ', events);
  console.log('   Response: ', responseData);
};

giap.notification.didUpdateProfile = ({ id, props }, responseData) => {
  console.log(`GIAP didUpdateProfile: ${id} with withProperties: `, props);
  console.log('   Response: ', responseData);
};

giap.notification.didCreateAliasForUserId = (
  { userId, distinctId },
  responseData,
) => {
  console.log(
    `GIAP didCreateAliasForUserId: ${userId} withDistinctId ${distinctId}`,
  );
  console.log('   Response: ', responseData);
};

giap.notification.didIdentifyUserId = (
  { userId, distinctId },
  responseData,
) => {
  console.log(
    `GIAP didIdentifyUserId: ${userId} withCurrentDistinctId ${distinctId}`,
  );
  console.log('   Response: ', responseData);
};
```

## Installation for Development

### Prerequisites

- Install [Node.js](https://nodejs.org/en/) at least version **14** on your machine

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
npm run start-demo
```

#### Production

    npm run build
