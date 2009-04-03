/*global importClass, project, Packages */
/*global java, File, BufferedReader, FileReader, LogLevel */
/*global src, include, exclude, newBuildConcat*/

/* 
 * This is a minified version of Douglas Crockford's JSON2.js parser, release in the public domain.
 * http://www.json.org/json2.js
 */
if(!this.JSON){JSON=function(){function f(n){return n<10?"0"+n:n}Date.prototype.toJSON=function(){return this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z"};var m={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"};function stringify(value,whitelist){var a,i,k,l,r=/["\\\x00-\x1f\x7f-\x9f]/g,v;switch(typeof value){case"string":return r.test(value)?'"'+value.replace(r,function(a){var c=m[a];if(c){return c}c=a.charCodeAt();return"\\u00"+Math.floor(c/16).toString(16)+(c%16).toString(16)})+'"':'"'+value+'"';case"number":return isFinite(value)?String(value):"null";case"boolean":case"null":return String(value);case"object":if(!value){return"null"}if(typeof value.toJSON==="function"){return stringify(value.toJSON())}a=[];if(typeof value.length==="number"&&!(value.propertyIsEnumerable("length"))){l=value.length;for(i=0;i<l;i+=1){a.push(stringify(value[i],whitelist)||"null")}return"["+a.join(",")+"]"}if(whitelist){l=whitelist.length;for(i=0;i<l;i+=1){k=whitelist[i];if(typeof k==="string"){v=stringify(value[k],whitelist);if(v){a.push(stringify(k)+":"+v)}}}}else{for(k in value){if(typeof k==="string"){v=stringify(value[k],whitelist);if(v){a.push(stringify(k)+":"+v)}}}}return"{"+a.join(",")+"}"}}return{stringify:stringify,parse:function(text,filter){var j;function walk(k,v){var i,n;if(v&&typeof v==="object"){for(i in v){if(Object.prototype.hasOwnProperty.apply(v,[i])){n=walk(i,v[i]);if(n!==undefined){v[i]=n}}}}return filter(k,v)}if(/^[\],:{}\s]*$/.test(text.replace(/\\./g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(:?[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof filter==="function"?walk("",j):j}throw new SyntaxError("parseJSON")}}}()};


/*
 * This is the Fluid Infusion dependency manager.
 */

// TODO
/*
The order in the all file is wrong!

Do we need the environment property? try without

Is the all file in the right place?  move it to dist/MyInfusion.js Is it named ok? Yes, but call the entire file InfusionAll.js

File this:
                There is an issue with excluding things in a certain directory and including others
                    - the my infusion javascript file is fine, the issue is with copying the files over.

Rename dependency declaration files? {moduleName}-dependencies.json 
 */

importClass(java.io.BufferedReader);
importClass(java.io.FileReader);
importClass(java.io.File);
importClass(Packages.org.apache.tools.ant.types.LogLevel);

var fluid = fluid || {};
var globalObj = this;

(function () {
    var modulePrefix = "module_";
    
    var modulePath = function (moduleName) {
        return project.getProperty(modulePrefix + moduleName);
    };

    var parseArgument = function (arg) {
        var retArray = [];
        
        var parsedArg = arg.split(",");
        for (var i = 0; i < parsedArg.length; i++) {
            var str = parsedArg[i].replace(/(^\s+)|(\s+$)/g, "");
            if (str) {
                retArray.push(str);
            }            
        }
        return retArray;
    };
    
    var parseModulesToInclude = function (includeArg) {
        if (typeof(includeArg) === "undefined") {
            includeArg = allModules();
        }
        
        project.log("Including modules: " + includeArg, LogLevel.INFO.getLevel());
        
        return parseArgument(includeArg);
    };
    
    var isDependencyIncluded = function (name, array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] === name) {
                return true;
            }
        }
        
    	return false;
    };
    
    var asArray = function (value) {
        if (value === undefined) {
            return [];
        } else if (typeof(value) === "string") {
            return [value];
        }
        
        return value;
    };
    
    var normalizeDeclaration = function (declaration) {
        declaration.files = asArray(declaration.files);
        declaration.dependencies = asArray(declaration.dependencies);
    };
    
    var logDependencies = function (moduleName, moduleDependencies) {      
        project.log("Dependencies for " + moduleName + ": ", LogLevel.VERBOSE.getLevel());
        for (var i = 0; i < moduleDependencies.length; i++) {
            project.log("  * " + moduleDependencies[i], LogLevel.VERBOSE.getLevel());
        }
    };
    
    var assembleDependencyList = function (that, moduleName, prefixStr) {        
        project.log(prefixStr + " Processing module: " + moduleName + " ---", LogLevel.INFO.getLevel());
        project.log("Dependency order so far: " + that.requiredModules, LogLevel.DEBUG.getLevel());
        
        if (isDependencyIncluded(moduleName, that.requiredModules)) {
            return;
        }
        
        var moduleInfo = that.loadDeclarationForModule(moduleName);
        normalizeDeclaration(moduleInfo[moduleName]);
        that.moduleFileTable[moduleName] = moduleInfo[moduleName].files;        
        var moduleDependencies = moduleInfo[moduleName].dependencies;
        logDependencies(moduleName, moduleDependencies);

        for (var i = 0; i < moduleDependencies.length; i++) {
            assembleDependencyList(that, moduleDependencies[i], prefixStr + "---");
        }
        
        if (!isDependencyIncluded(moduleName, that.excludedModules)) {
            that.requiredModules.push(moduleName);
        }
    };
    
    var allModules = function () {
        var str = "";
        for (var name in globalObj) {
            if (name.search(modulePrefix) === 0) {
                str += name.slice(modulePrefix.length) + ",";
            }
        }
        return str;
    };
    
    var pathsForModuleFiles = function (moduleName, moduleFileTable) {
        var pathsStr = "";
        var filesForModule = moduleFileTable[moduleName];
        for (var i = 0; i < filesForModule.length; i++) {
            var path = modulePath(moduleName) + File.separator + "js" + File.separator;
            pathsStr += path + filesForModule[i] + ",";
        }
        
        return pathsStr;
    };
        
    fluid.dependencyResolver = function (modulesToInclude, modulesToExclude) {
        var that = {
            requiredModules: [], // A list of modules to be included in dependency order
            moduleFileTable: {}, // A map of the files related to modules
            excludedModules: modulesToExclude  
        };    
        
        that.resolve = function () {
            for (var i = 0; i < modulesToInclude.length; i++) {
                assembleDependencyList(that, modulesToInclude[i], " ---");
            }    
        };
        
        /**
         * Returns the list of all required module directory as a comma-delimited string of file selectors.
         */
        that.getRequiredDirectories = function () {
            var dirs = "";
            for (var i = 0; i < that.requiredModules.length; i++) {
                dirs += modulePath(that.requiredModules[i]) + 
                    File.separator + "**" + File.separator + "*,";
            }
            
            project.log("*** All required directories: " + dirs, LogLevel.VERBOSE.getLevel());
            return dirs;
        };
        
        that.getAllRequiredFiles = function () {
            var fileStr = "";
            for (var i = 0; i < that.requiredModules.length; i++) {
                var currentModule = that.requiredModules[i];
                fileStr += pathsForModuleFiles(currentModule, that.moduleFileTable);
            }

            project.log("*** All required files: " + fileStr, LogLevel.VERBOSE.getLevel());
            return fileStr;
        };
    
        /**
         * Fetches the dependency declaration for the given module name from the file system,
         * parsing it into an object from JSON data.
         * 
         * @param {String} the name of the module
         * @return {Object} a dependency declaration object
         */
        that.loadDeclarationForModule = function (moduleName) {
            var fullModulePath = src + File.separator + modulePath(moduleName) + 
                File.separator + moduleName + ".json";
            project.log("Declaration file full path: " + fullModulePath, LogLevel.VERBOSE.getLevel());
        
            var moduleInfo = "";
            var rdr = new BufferedReader(new FileReader(new File(fullModulePath)));
            var line = rdr.readLine(); 
            while (line !== null) {
                moduleInfo += line;
                line = rdr.readLine();
            }
            
            project.log("Unparsed JSON: " + moduleInfo, LogLevel.DEBUG.getLevel());
            return JSON.parse(moduleInfo);
        };

        return that;
    };
    
    var resolveDependenciesFromArguments = function () {
        var excludedFiles = (typeof(globalObj.exclude) === "undefined") ? [] : parseArgument(globalObj.exclude);
        project.log("Excluding modules: " + excludedFiles, LogLevel.INFO.getLevel());

        var resolver = fluid.dependencyResolver(parseModulesToInclude(globalObj.include), excludedFiles);
        resolver.resolve(); // Do this automatically upon instantation
        
        project.setProperty("allRequiredFiles", resolver.getAllRequiredFiles());
        project.setProperty("requiredDirectoriesSelector", resolver.getRequiredDirectories());
    };
    
    // Run this immediately.
    resolveDependenciesFromArguments();
})();