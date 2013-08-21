(function() {
var templates = {};
templates["details.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<div id=\"definition\">\n\t<p id=\"definition-text\"></p>\n\t<ul id=\"definition-links\"></ul>\n\t<ul id=\"definition-videos\"></ul>\n\t<ul id=\"definition-photos\"></ul>\n</div>\n<ul id=\"details-list\">\n</ul>\n";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
templates["result.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<li data-engine=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "engineId"), env.autoesc);
output += "\">\n  <div class=\"content\"></div>\n</li>\n";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
templates["results.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
if(runtime.contextOrFrameLookup(context, frame, "found") > 0) {
output += "\n  ";
frame = frame.push();
var t_3 = runtime.contextOrFrameLookup(context, frame, "engineSet");
if(t_3) {var t_1;
if(runtime.isArray(t_3)) {
for(t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1][0]
frame.set("k", t_3[t_1][0]);
var t_5 = t_3[t_1][1]
frame.set("v", t_3[t_1][1]);
output += "\n    ";
frame = frame.push();
var t_8 = runtime.memberLookup((t_5),"conceptsPrimary", env.autoesc);
if(t_8) {for(var t_6=0; t_6 < t_8.length; t_6++) {
var t_9 = t_8[t_6];
frame.set("c", t_9);
output += "\n      ";
if(runtime.memberLookup((t_9),"concept", env.autoesc)) {
output += "\n        <li class=\"primary\" data-term=\"";
output += runtime.suppressValue(runtime.memberLookup((t_9),"concept", env.autoesc), env.autoesc);
output += "\" data-action=\"concept\" data-engine=\"";
output += runtime.suppressValue(t_4, env.autoesc);
output += "\">\n          <span>";
output += runtime.suppressValue(runtime.memberLookup((t_9),"concept", env.autoesc), env.autoesc);
output += "</span>\n        </li>\n      ";
;
}
output += "\n    ";
;
}
}
frame = frame.pop();
output += "\n  ";
}
} else {
t_1 = -1;
for(var t_10 in t_3) {
t_1++;
var t_11 = t_3[t_10];
frame.set("k", t_10);
frame.set("v", t_11);
output += "\n    ";
frame = frame.push();
var t_14 = runtime.memberLookup((t_11),"conceptsPrimary", env.autoesc);
if(t_14) {for(var t_12=0; t_12 < t_14.length; t_12++) {
var t_15 = t_14[t_12];
frame.set("c", t_15);
output += "\n      ";
if(runtime.memberLookup((t_15),"concept", env.autoesc)) {
output += "\n        <li class=\"primary\" data-term=\"";
output += runtime.suppressValue(runtime.memberLookup((t_15),"concept", env.autoesc), env.autoesc);
output += "\" data-action=\"concept\" data-engine=\"";
output += runtime.suppressValue(t_10, env.autoesc);
output += "\">\n          <span>";
output += runtime.suppressValue(runtime.memberLookup((t_15),"concept", env.autoesc), env.autoesc);
output += "</span>\n        </li>\n      ";
;
}
output += "\n    ";
;
}
}
frame = frame.pop();
output += "\n  ";
}
}
}
frame = frame.pop();
output += "\n";
;
}
else {
output += "\n  <h1>Search whatever.</h1>\n";
;
}
output += "\n";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
templates["results_secondary.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
if(runtime.contextOrFrameLookup(context, frame, "found") > 0) {
output += "\n  ";
frame = frame.push();
var t_3 = runtime.contextOrFrameLookup(context, frame, "engineSet");
if(t_3) {var t_1;
if(runtime.isArray(t_3)) {
for(t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1][0]
frame.set("k", t_3[t_1][0]);
var t_5 = t_3[t_1][1]
frame.set("v", t_3[t_1][1]);
output += "\n    ";
if(t_4 != "google.com") {
output += "\n      ";
frame = frame.push();
var t_8 = runtime.memberLookup((t_5),"conceptsSecondary", env.autoesc);
if(t_8) {for(var t_6=0; t_6 < t_8.length; t_6++) {
var t_9 = t_8[t_6];
frame.set("c", t_9);
output += "\n        ";
if(runtime.memberLookup((t_9),"concept", env.autoesc)) {
output += "\n          <li class=\"secondary\" data-term=\"";
output += runtime.suppressValue(runtime.memberLookup((t_9),"concept", env.autoesc), env.autoesc);
output += "\" data-action=\"concept\" data-engine=\"";
output += runtime.suppressValue(t_4, env.autoesc);
output += "\">\n            <span>";
output += runtime.suppressValue(runtime.memberLookup((t_9),"concept", env.autoesc), env.autoesc);
output += "</span>\n          </li>\n        ";
;
}
output += "\n      ";
;
}
}
frame = frame.pop();
output += "\n    ";
;
}
output += "\n  ";
}
} else {
t_1 = -1;
for(var t_10 in t_3) {
t_1++;
var t_11 = t_3[t_10];
frame.set("k", t_10);
frame.set("v", t_11);
output += "\n    ";
if(t_10 != "google.com") {
output += "\n      ";
frame = frame.push();
var t_14 = runtime.memberLookup((t_11),"conceptsSecondary", env.autoesc);
if(t_14) {for(var t_12=0; t_12 < t_14.length; t_12++) {
var t_15 = t_14[t_12];
frame.set("c", t_15);
output += "\n        ";
if(runtime.memberLookup((t_15),"concept", env.autoesc)) {
output += "\n          <li class=\"secondary\" data-term=\"";
output += runtime.suppressValue(runtime.memberLookup((t_15),"concept", env.autoesc), env.autoesc);
output += "\" data-action=\"concept\" data-engine=\"";
output += runtime.suppressValue(t_10, env.autoesc);
output += "\">\n            <span>";
output += runtime.suppressValue(runtime.memberLookup((t_15),"concept", env.autoesc), env.autoesc);
output += "</span>\n          </li>\n        ";
;
}
output += "\n      ";
;
}
}
frame = frame.pop();
output += "\n    ";
;
}
output += "\n  ";
}
}
}
frame = frame.pop();
output += "\n";
;
}
output += "\n";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
templates["suggest.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<div class=\"fifi-suggest\">\n  <ul class=\"suggestions\"></ul>\n  <ul class=\"suggestions-secondary\"></ul>\n</div>\n";
cb(null, output);
;
} catch (e) {
  cb(runtime.handleError(e, lineno, colno));
}
}
return {
root: root
};

})();
window.nunjucksPrecompiled = templates;
})();
