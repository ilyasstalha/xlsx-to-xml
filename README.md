# xlsx-to-xml

This tool is a NodeJS app that converts spreadsheets (currently XLSX files are the only file type supported) into simple XML output. 

Here's an example of what it can do. This table

<table>
<tbody>
<tr>
<td>&nbsp;cat</td>
<td>&nbsp;feline</td>
<td>&nbsp;fish</td>
<td>&nbsp;spot</td>
</tr>
<tr>
<td>&nbsp;dog</td>
<td>&nbsp;canine</td>
<td>&nbsp;bone</td>
<td>&nbsp;fido</td>
</tr>
<tr>
<td>&nbsp;monkey</td>
<td>&nbsp;simian</td>
<td>&nbsp;banana</td>
<td>&nbsp;bubbles</td>
</tr>
</tbody>
</table>

can be converted into this XML:

<pre>
&lt;row&gt;
    &lt;cell&gt;cat&lt;/cell&gt;
    &lt;cell&gt;feline&lt;/cell&gt;
    &lt;cell&gt;fish&lt;/cell&gt;
    &lt;cell&gt;spot&lt;/cell&gt;
&lt;/row&gt;
&lt;row&gt;
    &lt;cell&gt;dog&lt;/cell&gt;
    &lt;cell&gt;canine&lt;/cell&gt;
    &lt;cell&gt;bone&lt;/cell&gt;
    &lt;cell&gt;fido&lt;/cell&gt;
&lt;/row&gt;
&lt;row&gt;
    &lt;cell&gt;monkey&lt;/cell&gt;
    &lt;cell&gt;simian&lt;/cell&gt;
    &lt;cell&gt;banana&lt;/cell&gt;
    &lt;cell&gt;bubbles&lt;/cell&gt;
&lt;/row&gt;
</pre>

Row and cell tag names can be customised to whatever you want.

The backend is a NodeJS server that serves the static index.html and its resources. The conversion operations are performed entirely on the front-end, utlising several libraries - namely js-xlsx (<a href="/SheetJS/js-xlsx">https://github.com/SheetJS/js-xlsx</a>) to read the spreadsheet and RactiveJS (<a href="/ractivejs/ractive">https://github.com/ractivejs/ractive</a>) to render the UI.

To install:
<ol>
  <li>Download or clone the latest version.
  <li>Install NodeJS (which should include NPM) if you don't have it installed already (https://nodejs.org).
  <li>Browse to the folder on the command line and enter "npm install" to download Node dependencies.
</ol>

To use:

<ol>
  <li>You need to run in a modern browser. So far I've tested in Chrome and Firefox (versions 50 and 43, respectively, at time of writing).</li>
  <li>Browse to the folder on the command line and enter "node server.js" to run the app on the default port (8888). To run on a different port include the port number as the second argument to the node command when starting the app (e.g. "node server.js 8889").</li>
  <li>A browser should open automatically or open one yourself and browse to the app's URL, which should be shown in the console (http://localhost:8888 if on the default port).</li>
  <li>Choose the file you want to convert and the app will process it immediately, outputting each worksheet in its own tab. </li>
  <li>Use the conversion settings and other controls to customise the tags and tabs and remove rows from the output.</li>
</ol>

<strong>NOTE: </strong>The version of js-xlsx included in this package is a slightly modded version of the latest version from May 2016. The pull request is in the queue (https://github.com/SheetJS/js-xlsx/pull/420).