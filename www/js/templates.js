(function() {
var templates = {};
templates["details.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<header>\n  <button data-action=\"back\">Go back</button>\n</header>\n\n<h1>";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "term"), env.autoesc);
output += "</h1>\n\n";
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
var t_3 = runtime.contextOrFrameLookup(context, frame, "results");
if(t_3) {var t_1;
if(runtime.isArray(t_3)) {
for(t_1=0; t_1 < t_3.length; t_1++) {
var t_4 = t_3[t_1][0]
frame.set("k", t_3[t_1][0]);
var t_5 = t_3[t_1][1]
frame.set("v", t_3[t_1][1]);
output += "\n    <li data-term=\"";
output += runtime.suppressValue(t_4, env.autoesc);
output += "\" data-action=\"concept\" data-engine=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "engineId"), env.autoesc);
output += "\">\n      <span>";
output += runtime.suppressValue(t_4, env.autoesc);
output += "</span>\n    </li>\n  ";
}
} else {
t_1 = -1;
for(var t_6 in t_3) {
t_1++;
var t_7 = t_3[t_6];
frame.set("k", t_6);
frame.set("v", t_7);
output += "\n    <li data-term=\"";
output += runtime.suppressValue(t_6, env.autoesc);
output += "\" data-action=\"concept\" data-engine=\"";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "engineId"), env.autoesc);
output += "\">\n      <span>";
output += runtime.suppressValue(t_6, env.autoesc);
output += "</span>\n    </li>\n  ";
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
templates["suggest.html"] = (function() {
function root(env, context, frame, runtime, cb) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<input type=\"search\" value=\"\" placeholder=\"find\" id=\"fifi-find\">\n<div class=\"fifi-suggest\">\n  <ul class=\"suggestions\"></ul>\n</div>\n";
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
