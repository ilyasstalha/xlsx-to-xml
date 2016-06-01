# xlsx-to-xml

This tool is a NodeJS app that converts spreadsheets (currently XLSX files are the only file type to be tested) into simple XML output.

Example:

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

can be converted into:

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

To install:
<ol>
  <li>Download and unzip the attached or the latest version from Github (https://github.com/ljelewis/xlsx-to-xml).
  <li>Install NodeJS (which should include NPM) if you don't have it installed already (https://nodejs.org).
  <li>Browse to the folder on the command line and enter "npm install".
</ol>

To use:

<ol>
  <li>You need to run in a modern browser. So far I've tested in Chrome.
  <li>Browse to the folder on the command line and enter "node server.js" to run the app on the default port (8888). To run on a different port include the port number in the command, after server.js.
  <li>A browser should open automatically or open one yourself and browse to the app's URL, which should be shown in the console (usually http://localhost:8888).
  <li>Choose the file you want to convert and the app will process it immediately, outputting each worksheet in its own tab. 
  <li>Use the conversion settings and other controls to customise the tags and tabs and remove rows from the output.
</ol>
