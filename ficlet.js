console.log("starting ficlet");

var urlSplit = document.URL.split('/');
urlSplit.length = 5;
if (urlSplit[2] != "www.fanfiction.net" && urlSplit[2] != "www.fictionpress.com" || urlSplit[3] != "s") {
    alert("Please run this ficlet on a story on www.fanfiction.net or www.fictionpress.com");
    throw("Incompatible webpage.");
}
var baseUrl = urlSplit.join('/') + '/';

var documentTitle = document.title;

var chapStrRaw = document.getElementById('content_wrapper_inner').getElementsByClassName('xgray xcontrast_txt')[0].innerHTML;
var chapStrClean = chapStrRaw.substring(chapStrRaw.indexOf("Chapters"));
chapStrClean = chapStrClean.substring(10, chapStrClean.indexOf(" -"));
var numChapters = parseInt(chapStrClean);

var titleStr = document.getElementsByClassName("xcontrast_txt")[4].innerHTML;
var authorStr = document.getElementsByClassName("xcontrast_txt")[6].innerHTML;

var chapterIdx = 1;
var chapterText = new Array();
var chapterHTML = new Array();
var chapterTitle = new Array();

var downloadFrame = document.createElement('iframe');
downloadFrame.width = screen.availWidth;
downloadFrame.height = 480;
document.body.appendChild(downloadFrame);
downloadFrame.onload = function() {
    chapterText[chapterIdx] = downloadFrame.contentDocument.getElementById("storytext").innerHTML;
    chapterTitle[chapterIdx] = document.getElementById("chap_select").options.item(chapterIdx - 1).innerHTML;
    chapterHTML[chapterIdx] = '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:ops="http://www.idpf.org/2007/ops" encoding="UTF-8"><head><meta http-equiv="Content-Type" content="application/xhtml+xml; charset=utf-8"/><link rel="stylesheet" type="text/css" href="../style.css"/><title>' + chapterTitle[chapterIdx] + '</title></head><body>\n  <h1>' + chapterTitle[chapterIdx] + '</h1><div id="chapterText" class="chapterText">' + chapterText[chapterIdx] + '</div></body></html>';
    console.log("Downloaded chapter " + String(chapterIdx) + "/" + String(numChapters) + ".");
    document.title = '[Downloading][' + String(chapterIdx) + "/" + String(numChapters) + ']' + documentTitle;
    //console.log(chapterHTML[chapterIdx]);
    if (chapterIdx < numChapters) {
        chapterIdx++;
        downloadFrame.src = baseUrl + String(chapterIdx);
    }
    else {
        document.title = "[Compressing]" + documentTitle;
        makeEpub();
    }
    
}
downloadFrame.src = baseUrl + '1';

function makeEpub() {
console.log("making epub");
var zipWriter;
var zippedBlob;

async.series([
    function(callback) {
        zip.createWriter(new zip.BlobWriter("application/zip"), function(writer) {
            zipWriter = writer;
            callback();
        });
    },
    function(callback) {
        zipWriter.add("mimetype", new zip.TextReader("application/epub+zip"), function(writer) {
            callback();
        });
    },
    function(callback) {
        zipWriter.add("META-INF", null, function(writer) {
            callback();
        }, null, {directory:true});
    },
    function(callback) {
        zipWriter.add("META-INF/container.xml", new zip.TextReader('<?xml version="1.0" encoding="UTF-8" ?>\n<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n  <rootfiles>\n    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml" />\n  </rootfiles>\n</container>'), 
        function(writer) {
            callback();
        });
    },
    function(callback) {
        zipWriter.add("OEBPS", null, function(writer) {
            callback();
        }, null, {directory:true});
    },
    function(callback) {
        zipWriter.add("OEBPS/style.css", new zip.TextReader('.copyrightpage {\n  margin: 12%;\n}\n.copyrightpage, .copyrightpage p {\n  font-size: 8pt;\n  text-align: center;\n  text-indent: 0;\n}\nh1 {\n  font-family: sans serif;\n  font-size: 1.25em;\n  line-height: 18pt;\n  margin: 5% 7% 5% 7%;\n  text-align: center;\n}\n.chapterText p {\n  clear: both;\n  margin: 0;\n  margin-bottom: 0.65em;\n  text-align: justify;\n  text-indent: 1.2em;\n}\n.chapterText p.firstParagraph {\n  clear: none;\n  text-indent: -1.0em;\n}\n.chapterText p.dropcap {\n  border-bottom: 1px solid #000;\n  display: block;\n  float: left;\n  font-size: 3.6em;\n  font-weight: bold;\n  line-height: 0.80em;\n  height: 0.8em;\n  margin: 0;\n  margin-right: 0.3em;\n  margin-top: 0.09em;\n  text-indent: 0;\n}\nul.toc, ul.toc li {\n  list-style: none;\n  margin: 0;\n}\nhr {\n  background-color: #000;\n  border: none;\n  height: 1px;\n  margin-left: auto;\n  margin-right: auto;\n  width: 50%;\n}'), 
        function(writer) {
            callback();
        });
    },
    function(callback) {
        var contentStr = '<?xml version="1.0" encoding="UTF-8"?>\n<package xmlns="http://www.idpf.org/2007/opf" version="2.0" unique-identifier="storySourceURI">\n  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">\n    <dc:contributor opf:role="bkp">Ficlet</dc:contributor>\n    <meta name="cover" content="cover"/>\n    <dc:identifier opf:scheme="URI" id="storySourceURI">' + document.URL + '</dc:identifier>\n    <dc:creator>' + authorStr + '</dc:creator>\n    <dc:title>' + titleStr + '</dc:title>\n  </metadata>\n  <manifest>\n    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>\n    <item id="style_main" href="style.css" media-type="text/css"/>\n    <item id="cover_p" href="content/cover.html" media-type="application/xhtml+xml"/>\n    <item id="cover" href="images/cover.jpg" media-type="image/jpeg"/>';
        for (var i = 1; i <= numChapters; i++) {
            contentStr += '\n    <item id="chapter' + String(i) + '" href="content/chapter' + String(i) + '.html" media-type="application/xhtml+xml"/>';
        }
        contentStr += '  </manifest>\n  <spine toc="ncx">\n    <itemref idref="cover_p"/>';
        for (var i = 1; i <= numChapters; i++) {
            contentStr += '\n    <itemref idref="chapter' + String(i) + '"/>';
        }
        contentStr += '  </spine>\n  <guide>\n    <reference href="content/cover.html" type="cover" title="Cover"/>\n  </guide>\n</package>';
        zipWriter.add("OEBPS/content.opf", new zip.TextReader(contentStr), 
        function(writer) {
            callback();
        });
    },
    function(callback) {
        var tocStr = '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">\n<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="en-US">\n  <head\n    <meta name="dtb:PrimaryID" content=""/>\n  </head>\n  <docTitle>\n    <text>' + titleStr + '</text>\n  </docTitle>\n  <docAuthor>\n    <text>' + authorStr + '</text>\n  </docAuthor>\n  <navMap><navPoint id="cover" playOrder="1"><navLabel><text>Title Page</text></navLabel><content src="content/cover.html"/></navPoint>';
        for (var i = 1; i <= numChapters; i++) {
            tocStr += '\n  <navPoint id="chapter' + String(i) + '" playOrder="' + String(i + 1) + '">\n	  <navLabel>\n	    <text>' + chapterTitle[i] + '</text>\n	  </navLabel>\n	  <content src="content/part_' + String(i) + '.html"/>\n	</navPoint>';
        }
        tocStr += '      </navMap>\n</ncx>';
        zipWriter.add("OEBPS/toc.ncx", new zip.TextReader(tocStr), 
        function(writer) {
            callback();
        });
    },
    function(callback) {
        zipWriter.add("OEBPS/images", null, function(writer) {
            callback();
        }, null, {directory:true});
    },
    /*function(callback) {
        zipWriter.add("OEBPS/images/cover.jpg", new zip.HttpReader('http://localhost/js/trollface.jpg'), 
        function(writer) {
            callback();
        });
    },*/
    function(callback) {
        zipWriter.add("OEBPS/content", null, function(writer) {
            callback();
        }, null, {directory:true});
    },
    function(callback) {
        zipWriter.add("OEBPS/content/cover.html", new zip.TextReader('<html xmlns="http://www.w3.org/1999/xhtml" xmlns:ops="http://www.idpf.org/2007/ops" encoding="UTF-8">\n  <head>\n    <style type="text/css">\n      html, body, img {margin: 0; padding: 0;}\n      #titleImage {\n	height: 100%;\n        margin: 0 auto;\n	width: 100%;\n      }\n    </style>\n  </head>\n  <body>\n    <img id="titleImage" src="../images/cover.jpg" type="image/jpeg" />\n </body>\n</html>'), 
        function(writer) {
            callback();
        });
    },
    function(callback) {
        chapterIdx = 1;
        async.whilst(
            function() { return chapterIdx <= numChapters; },
            function (callback) {
                zipWriter.add("OEBPS/content/chapter" + String(chapterIdx) + ".html", new zip.TextReader(chapterHTML[chapterIdx]), 
                function(writer) {
                    console.log("Added chapter " + String(chapterIdx) + "/" + String(numChapters) + " to archive.");
                    document.title = '[Compressing][' + String(chapterIdx) + "/" + String(numChapters) + ']' + documentTitle;
                    chapterIdx++;
                    callback();
                });
            },
            function() {callback();}
        );
    },
    function(callback) {
        zipWriter.close(function(blob) {
            zippedBlob = blob;
            callback();
        });
    },
    function(callback) {
        saveAs(zippedBlob, authorStr + ' - ' + titleStr + '.epub');
        document.title = "[Finished]" + documentTitle;
        callback();
    },
]);
};
