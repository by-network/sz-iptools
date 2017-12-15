# Sz-IPtools

Sz-IPtools is a set of tools to validate, calculate and manage IP address configuration of a Linux server. It is write to use as a Node.js module. The tools are separate by modules, that can be invoked separately. The modules are:

 * <b>IPCalculator</b>: Some methods to help with IP address validation, get address details and calculate with subnet mask.

 * <b>IFaceConfigurator</b>: (NOT implemented yet)

 * <b>IPRouter</b>: (NOT implemented yet)

## Support

 * Node.js
 
## Installation

```sh
> npm install sz-tools --save
```

## Node.js

 ### Loading IPCalculator module
```javascript
const SzIPCalculator = require('sz-iptools').ipCalculator
```
