ficlet
======
Ficlet is a bookmarklet to download stories from fanfiction.net and fictionpress.com, and compile and save them into an .epub file. Currently, the mobile versions of these sites are not supported.

To use ficlet, save this code as the URL of a bookmark:

    javascript:(function(){var%20e="https://raw.github.com/fb39ca4/ficlet/master/";var%20t=document.createElement("script");t.src=e+"zip.js";t.type="text/javascript";document.body.appendChild(t);var%20n=document.createElement("script");n.src=e+"deflate.js";n.type="text/javascript";document.body.appendChild(n);var%20r=document.createElement("script");r.src=e+"async.js";r.type="text/javascript";document.body.appendChild(r);var%20i=document.createElement("script");i.src=e+"filesaver.js";i.type="text/javascript";document.body.appendChild(i);var%20s=document.createElement("script");s.type="text/javascript";s.src=e+"ficlet.js";document.body.appendChild(s)})()

Then, open the bookmark while veiwing a fanfiction.net or fictionpress.com story.

Tested on Firefox 23, Chrome 30, and Internet Explorer 10.

Todo: Cover images, more metadata.
