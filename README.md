# Qlik Sense App-on-Demand

Generates an application on demand within Qlik Sense

Use case and description
------------------------

![app-on-demand-overview](https://cloud.githubusercontent.com/assets/3495140/13952787/c9fb2e9e-f00e-11e5-977a-81081708d141.png)

To see this extension in use please check out the [demo on our website](http://www.bardess.com/library/demos/app-on-demand/).  Due to the "creation" nature of this extension, an account is required on our server, and we can provide as needed.

Create a parent QVF application.  This application should contain a broader dataset to drive the creation of a new application.  While a frequent use case is to use an aggregated dataset to drive detailed analysis, this is not always the case.  In practical application, this extension can be utilized to drive any scenario where the application author wishes to create a new application, perhaps enhanced with advanced analytics, that is specified by selections in the parent application.

Once the parent application has been created, add the App-on-Demand Extension and configure it.  Three areas require configuration for use of the extension: 1) Replacement Settings - controlling what values in the target application's load script are replaced by values contained in the User's selections, 2) On Demand Settings - specifies publishing information, the target application to use as a template for the newly created application, and 3) Appearance Settings - button labels, etc.

A template application is utilized as the target for the App-on-Demand functionality.  For optimal performance, this QVF will be saved with no data loaded in it, but with a full load script and any other visual elements already created.  For prototyping and development we frequently create a full fledged application with data, and once we are satisfied with the application, save and publish it to a location that is readable by users of the App-on-Demand functionality.

Replacement Settings
--------------------
![Replacement Settings](https://cloud.githubusercontent.com/assets/3495140/13952275/e7e2f340-f00b-11e5-910c-57aa0e97c059.png "Replacement Settings")


The replacement settings specify string values to be replaced when encountered in the load script of the template app.  If a single value is selected, there will be a one to one replacement, and if multiple selections are allowed, a CSV suitable for use with Match() will be inserted in the load script.  This approach enables use of load script variables as well as replacements in where clauses within the template app load script.
We typically surround string values to be replaced with a %% to ensure that they stand out when editing load scripts in the template application.

On-demand Settings
------------------
![App on Demand Settings](https://cloud.githubusercontent.com/assets/3495140/13952274/e7e0fb1c-f00b-11e5-9e96-fcd89ad0da67.png "App on Demand Settings")


In the OnDemand settings, the template app ID must be specified, as well as a base name for the created application, the stream ID to publish the created app to, and optionally, a sheet id to link the user to once the app is created.

"Max number of items to send" enables the author to control how many values may be selected by the user before the App-on-Demand functionality is enabled.  This is useful in many cases, as sometimes a singular selection is required, and other times multiple selections are allowed.  This also enables the author to prevent creation of detailed analysis which would exceed reasonable performance requirements.

Appearance
----------
![Appearance Settings](https://cloud.githubusercontent.com/assets/3495140/13952276/e7e51a58-f00b-11e5-90d7-bd1d24525c37.png "Appearance Settings")


Labels for buttons (which may include HTML) are specified on the appearance panel.  We recommend also displaying some text which indicates to the user what type or number of selections should be made, prior to the App-on-Demand functionality being enabled.


Installation
------------
On Sense Desktop, clone or copy this extension into the Extensions folder located in your Qlik Sense install. On Server, follow the [latest help docs](http://help.qlik.com/en-US/sense/2.2/Subsystems/ManagementConsole/Content/import-extensions.htm) from Qlik.

Advanced Settings
-----------------
The advanced settings panel enables more interesting use cases.  We have enabled the ability to execute JS prior to triggering the reload of the newly created application.  This can be highly useful if the author desires to run external analysis using the selected values, and enhance the created application with that data.  Certain use cases, e.g. prediction, GIS analysis, etc. lend themselves well as possible value-adds to the generated application.  This capability also enables Qlik Sense to address certain use cases that would not otherwise be possible with purely native functionality.  To ensure easier integration with external systems, we have included oauth.js by default in the extension.
