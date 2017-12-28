# v1.6.0
- Added method getDnsServers to *IFaceConfigurator*
# v1.5.0
- Added methods getIpForward and setIpForward to *IPRouter*.
- Some bug fixes in IPRouter module.
- IPRouter exposed in main module.
# v1.4.0
- Added option to choose table in getRoutes, in options object.
# v1.4.0
- Exposed method convertNetmaskToCidr from *IPCalculator*.
- Exposed method convertCidrToNetmask from *IPCalculator*.
- Method addAddress implemented for IFaceConfigurator. Now the module can add IP address to an interface..
- Method delAddress implemented for IFaceConfigurator. Now the module can remove IP address from an interface.
- Method getDefaultGateway implemented for IPRouter. Gets the default gateway as a string.
- Method getRoutes implemented for IPRouter. Gets array of routes in main table.