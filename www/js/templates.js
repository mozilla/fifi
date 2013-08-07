(function() {
var templates = {};
templates["details.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<header>\n  <button data-action=\"back\">Go back</button>\n</header>\n\n<h1>";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "term"), env.autoesc);
output += "</h1>\n\n";
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};

})();
templates["results.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
frame = frame.push();
var t_2 = runtime.contextOrFrameLookup(context, frame, "results");
if(t_2) {for(var t_1=0; t_1 < t_2.length; t_1++) {
var t_3 = t_2[t_1];
frame.set("result", t_3);
output += "\n  <li data-term=\"";
output += runtime.suppressValue(t_3, env.autoesc);
output += "\" data-action=\"concept\">\n    ";
output += runtime.suppressValue(t_3, env.autoesc);
output += "\n  </li>\n";
}
}frame = frame.pop();
output += "\n";
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};

})();
templates["suggest.html"] = (function() {
function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<input type=\"search\" value=\"\" placeholder=\"find\" id=\"fifi-find\">\n<div class=\"fifi-suggest\">\n  <ul class=\"suggestions\"></ul>\n</div>\n";
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};

})();
if(typeof define === "function" && define.amd) {
    define(["nunjucks"], function(nunjucks) {
        nunjucks.env = new nunjucks.Environment([], null);
        nunjucks.env.registerPrecompiled(templates);
        return nunjucks;
    });
}
else if(typeof nunjucks === "object") {
    nunjucks.env = new nunjucks.Environment([], null);
    nunjucks.env.registerPrecompiled(templates);
}
else {
    console.error("ERROR: You must load nunjucks before the precompiled templates");
}
})();
