var fs = require('fs');
var xml2js = require('xml2js');
var _ = require('lodash');
var path = require('path');
var es6_promise_1 = require('es6-promise');
var semver = require('semver');
var csproj2ts;
(function (csproj2ts) {
    csproj2ts.DEFAULT_TYPESCRIPT_VERSION = "1.6.2";
    var cboolean = function (value) {
        return (typeof value === 'string') ? (value.toLowerCase() === 'true') : value;
    };
    var getSettingOrDefault = function (item, abbreviatedSettingName, defaultValue) {
        if (item["TypeScript" + abbreviatedSettingName]) {
            return item["TypeScript" + abbreviatedSettingName][0];
        }
        return defaultValue;
    };
    csproj2ts.fixVersion = function (version) {
        var testVersion = version + "";
        if (!testVersion) {
            return csproj2ts.DEFAULT_TYPESCRIPT_VERSION;
        }
        if (testVersion.indexOf("-") > -1) {
            var versionInfo = testVersion.split("-");
            testVersion = versionInfo[0];
        }
        if (semver.valid(testVersion)) {
            return testVersion;
        }
        testVersion += ".0";
        if (semver.valid(testVersion)) {
            return testVersion;
        }
        testVersion += ".0";
        if (semver.valid(testVersion)) {
            return testVersion;
        }
        return csproj2ts.DEFAULT_TYPESCRIPT_VERSION;
    };
    var getTSSetting = function (project, abbreviatedSettingName, projectConfiguration, projectPlatform, defaultValue) {
        var typeOfGrouping = "PropertyGroup";
        var result = defaultValue;
        if (project[typeOfGrouping]) {
            var items = toArray(project[typeOfGrouping]);
            _.map(items, function (item) {
                if (item["$"] && item["$"]["Condition"]) {
                    var condition = item["$"]["Condition"];
                    condition = condition.replace(/ /g, "");
                    if (condition === "'$(Configuration)'=='" + projectConfiguration + "'" ||
                        condition === "'$(Configuration)|$(Platform)'=='" + projectConfiguration + "|" + projectPlatform + "'") {
                        result = getSettingOrDefault(item, abbreviatedSettingName, result);
                    }
                }
                else {
                    result = getSettingOrDefault(item, abbreviatedSettingName, result);
                }
            });
        }
        return result;
    };
    csproj2ts.xml2jsReadXMLFile = function (fileName) {
        return new es6_promise_1.Promise(function (resolve, reject) {
            var parser = new xml2js.Parser();
            parser.addListener('end', function (parsedXMLFileResult) {
                resolve(parsedXMLFileResult);
            });
            fs.readFile(fileName, function (err, data) {
                if (err && err.errno !== 0) {
                    reject(err);
                }
                else {
                    parser.parseString(data);
                }
            });
        });
    };
    csproj2ts.getTypeScriptSettings = function (projectInfo) {
        if (!projectInfo.MSBuildExtensionsPath32) {
            projectInfo.MSBuildExtensionsPath32 = path.join(csproj2ts.programFiles(), "/MSBuild/");
        }
        return new es6_promise_1.Promise(function (resolve, reject) {
            csproj2ts.xml2jsReadXMLFile(projectInfo.ProjectFileName).then(function (parsedVSProject) {
                if (!parsedVSProject || !parsedVSProject.Project) {
                    reject(new Error("No result from parsing the project."));
                }
                else {
                    var project = parsedVSProject.Project;
                    var projectDefaultConfig = getDefaultConfiguration(project);
                    var projectDefaultPlatform = getDefaultPlatform(project);
                    var projectActiveConfig = projectInfo.ActiveConfiguration || projectDefaultConfig;
                    var projectActivePlat = projectInfo.ActivePlatform || projectDefaultPlatform;
                    var result = {
                        VSProjectDetails: {
                            DefaultProjectConfiguration: projectDefaultConfig,
                            DefaultProjectPlatform: projectDefaultPlatform,
                            DefaultVisualStudioVersion: getDefaultVisualStudioVersion(project),
                            TypeScriptDefaultPropsFilePath: getTypeScriptDefaultPropsFilePath(project),
                            ActiveConfiguration: projectInfo.ActiveConfiguration,
                            ActivePlatform: projectInfo.ActivePlatform,
                            MSBuildExtensionsPath32: projectInfo.MSBuildExtensionsPath32,
                            ProjectFileName: projectInfo.ProjectFileName,
                            VisualStudioVersion: projectInfo.VisualStudioVersion,
                            TypeScriptVersion: csproj2ts.fixVersion(projectInfo.TypeScriptVersion)
                        },
                        files: getTypeScriptFilesToCompile(project),
                        AdditionalFlags: getTSSetting(project, "AdditionalFlags", projectActiveConfig, projectActivePlat, undefined),
                        AllowSyntheticDefaultImports: cboolean(getTSSetting(project, "AllowSyntheticDefaultImports", projectActiveConfig, projectActivePlat, undefined)),
                        AllowUnusedLabels: cboolean(getTSSetting(project, "AllowUnusedLabels", projectActiveConfig, projectActivePlat, undefined)),
                        AllowUnreachableCode: cboolean(getTSSetting(project, "AllowUnreachableCode", projectActiveConfig, projectActivePlat, undefined)),
                        Charset: getTSSetting(project, "Charset", projectActiveConfig, projectActivePlat, undefined),
                        CodePage: getTSSetting(project, "CodePage", projectActiveConfig, projectActivePlat, undefined),
                        CompileBlocked: getTSSetting(project, "CompileBlocked", projectActiveConfig, projectActivePlat, false),
                        CompileOnSaveEnabled: cboolean(getTSSetting(project, "CompileOnSaveEnabled", projectActiveConfig, projectActivePlat, undefined)),
                        EmitBOM: cboolean(getTSSetting(project, "EmitBOM", projectActiveConfig, projectActivePlat, undefined)),
                        EmitDecoratorMetadata: cboolean(getTSSetting(project, "EmitDecoratorMetadata", projectActiveConfig, projectActivePlat, undefined)),
                        ExperimentalAsyncFunctions: cboolean(getTSSetting(project, "ExperimentalAsyncFunctions", projectActiveConfig, projectActivePlat, undefined)),
                        ExperimentalDecorators: cboolean(getTSSetting(project, "ExperimentalDecorators", projectActiveConfig, projectActivePlat, undefined)),
                        ForceConsistentCasingInFileNames: cboolean(getTSSetting(project, "ForceConsistentCasingInFileNames", projectActiveConfig, projectActivePlat, undefined)),
                        GeneratesDeclarations: cboolean(getTSSetting(project, "GeneratesDeclarations", projectActiveConfig, projectActivePlat, undefined)),
                        InlineSourceMap: cboolean(getTSSetting(project, "InlineSourceMap", projectActiveConfig, projectActivePlat, undefined)),
                        InlineSources: cboolean(getTSSetting(project, "InlineSources", projectActiveConfig, projectActivePlat, undefined)),
                        IsolatedModules: cboolean(getTSSetting(project, "IsolatedModules", projectActiveConfig, projectActivePlat, undefined)),
                        JSXEmit: getTSSetting(project, "JSXEmit", projectActiveConfig, projectActivePlat, undefined),
                        MapRoot: getTSSetting(project, "MapRoot", projectActiveConfig, projectActivePlat, undefined),
                        ModuleKind: getTSSetting(project, "ModuleKind", projectActiveConfig, projectActivePlat, undefined),
                        ModuleResolution: getTSSetting(project, "ModuleResolution", projectActiveConfig, projectActivePlat, undefined),
                        NewLine: getTSSetting(project, "NewLine", projectActiveConfig, projectActivePlat, undefined),
                        NoEmitOnError: cboolean(getTSSetting(project, "NoEmitOnError", projectActiveConfig, projectActivePlat, undefined)),
                        NoEmitHelpers: cboolean(getTSSetting(project, "NoEmitHelpers", projectActiveConfig, projectActivePlat, undefined)),
                        NoFallthroughCasesInSwitch: cboolean(getTSSetting(project, "NoFallthroughCasesInSwitch", projectActiveConfig, projectActivePlat, undefined)),
                        NoImplicitAny: cboolean(getTSSetting(project, "NoImplicitAny", projectActiveConfig, projectActivePlat, undefined)),
                        NoImplicitReturns: cboolean(getTSSetting(project, "NoImplicitReturns", projectActiveConfig, projectActivePlat, undefined)),
                        NoImplicitUseStrict: cboolean(getTSSetting(project, "NoImplicitUseStrict", projectActiveConfig, projectActivePlat, undefined)),
                        NoLib: cboolean(getTSSetting(project, "NoLib", projectActiveConfig, projectActivePlat, undefined)),
                        NoResolve: cboolean(getTSSetting(project, "NoResolve", projectActiveConfig, projectActivePlat, undefined)),
                        OutDir: getTSSetting(project, "OutDir", projectActiveConfig, projectActivePlat, undefined),
                        OutFile: getTSSetting(project, "OutFile", projectActiveConfig, projectActivePlat, undefined),
                        PreferredUILang: getTSSetting(project, "PreferredUILang", projectActiveConfig, projectActivePlat, undefined),
                        PreserveConstEnums: cboolean(getTSSetting(project, "PreserveConstEnums", projectActivePlat, projectActiveConfig, undefined)),
                        ReactNamespace: getTSSetting(project, "ReactNamespace", projectActiveConfig, projectActivePlat, undefined),
                        RemoveComments: cboolean(getTSSetting(project, "RemoveComments", projectActiveConfig, projectActivePlat, undefined)),
                        RootDir: getTSSetting(project, "RootDir", projectActiveConfig, projectActivePlat, undefined),
                        SkipDefaultLibCheck: getTSSetting(project, "SkipDefaultLibCheck", projectActiveConfig, projectActivePlat, undefined),
                        SourceMap: cboolean(getTSSetting(project, "SourceMap", projectActiveConfig, projectActivePlat, undefined)),
                        SourceRoot: getTSSetting(project, "SourceRoot", projectActiveConfig, projectActivePlat, undefined),
                        SuppressImplicitAnyIndexErrors: cboolean(getTSSetting(project, "SuppressImplicitAnyIndexErrors", projectActiveConfig, projectActivePlat, undefined)),
                        SuppressExcessPropertyErrors: cboolean(getTSSetting(project, "SuppressExcessPropertyErrors", projectActiveConfig, projectActivePlat, undefined)),
                        Target: getTSSetting(project, "Target", projectActiveConfig, projectActivePlat, undefined)
                    };
                    ["OutDir", "OutFile", "SourceRoot", "RootDir", "MapRoot"].forEach(function (item) {
                        if (result[item]) {
                            result[item] = result[item].replace(/\\/g, "/");
                        }
                    });
                    csproj2ts.getTypeScriptDefaultsFromPropsFileOrDefaults(result)
                        .then(function (typeScriptDefaults) {
                        result.VSProjectDetails.TypeScriptDefaultConfiguration = typeScriptDefaults;
                        finishUp(typeScriptDefaults);
                    }).catch(function (error) {
                        var fallbackDefaults = VSTypeScriptDefaults(result.VSProjectDetails.TypeScriptVersion);
                        result.VSProjectDetails.TypeScriptDefaultConfiguration = fallbackDefaults;
                        finishUp(fallbackDefaults);
                    });
                    var finishUp = function (defaults) {
                        _.forOwn(result, function (value, key) {
                            if (_.isNull(value) || _.isUndefined(value)) {
                                result[key] = defaults[key];
                            }
                        });
                        resolve(result);
                    };
                }
            }, function (error) {
                reject(error);
            });
        });
    };
    csproj2ts.normalizePath = function (path, settings) {
        if (path.indexOf("$(VisualStudioVersion)") > -1) {
            path = path.replace(/\$\(VisualStudioVersion\)/g, settings.VSProjectDetails.VisualStudioVersion || settings.VSProjectDetails.DefaultVisualStudioVersion);
        }
        if (path.indexOf("$(MSBuildExtensionsPath32)") > -1) {
            path = path.replace(/\$\(MSBuildExtensionsPath32\)/g, settings.VSProjectDetails.MSBuildExtensionsPath32);
        }
        return path;
    };
    var toArray = function (itemOrArray) {
        if (_.isArray(itemOrArray)) {
            return itemOrArray;
        }
        else {
            return [itemOrArray];
        }
    };
    var getImports = function (project) {
        var result = [];
        if (project.Import) {
            var importItems = toArray(project.Import);
            _.map(importItems, function (item) {
                if (item["$"]) {
                    result.push(item["$"]);
                }
            });
        }
        return result;
    };
    var getVSConfigDefault = function (project, typeOfGrouping, nodeName, defaultCondition) {
        var result = "";
        if (project[typeOfGrouping]) {
            var items = toArray(project[typeOfGrouping]);
            _.map(items, function (item) {
                if (item[nodeName] && _.isArray(item[nodeName]) && item[nodeName].length > 0) {
                    var subitem = item[nodeName][0]["$"];
                    if (subitem.Condition) {
                        var condition = subitem.Condition.replace(/ /g, '');
                        if (defaultCondition.indexOf(condition) > -1 || !defaultCondition) {
                            result = item[nodeName][0]["_"] + "";
                        }
                    }
                }
            });
        }
        return result;
    };
    var getDefaultVisualStudioVersion = function (project) {
        return getVSConfigDefault(project, "PropertyGroup", "VisualStudioVersion", "'$(VisualStudioVersion)'==''");
    };
    var getDefaultConfiguration = function (project) {
        return getVSConfigDefault(project, "PropertyGroup", "Configuration", "'$(Configuration)'==''");
    };
    var getDefaultPlatform = function (project) {
        return getVSConfigDefault(project, "PropertyGroup", "Platform", "'$(Platform)'==''");
    };
    var getTypeScriptFilesToCompile = function (project) {
        var typeOfGrouping = "ItemGroup";
        var result = [];
        var osPath;
        if (project[typeOfGrouping]) {
            var items = toArray(project[typeOfGrouping]);
            _.map(items, function (item) {
                if (item["TypeScriptCompile"]) {
                    _.map(toArray(item["TypeScriptCompile"]), function (compileItem) {
                        if (compileItem["$"] && compileItem["$"]["Include"]) {
                            osPath = compileItem["$"]["Include"].replace(/\\/g, "/");
                            result.push(osPath);
                        }
                    });
                }
            });
        }
        return result;
    };
    var getTypeScriptDefaultPropsFilePath = function (project) {
        var typeOfGrouping = "Import";
        var result = "";
        if (project[typeOfGrouping]) {
            var items = toArray(project[typeOfGrouping]);
            _.map(items, function (item) {
                if (item["$"] && item["$"]["Project"]) {
                    var projectValue = item["$"]["Project"];
                    if (projectValue.indexOf("Microsoft.TypeScript.Default.props") > -1) {
                        result = projectValue;
                    }
                }
            });
        }
        return result;
    };
    function getFirstValueOrDefault(item, defaultValue) {
        if (item && _.isArray(item) && item.length > 0 && !_.isNull(item[0]) && !_.isUndefined(item[0])) {
            if (typeof defaultValue === "boolean") {
                return cboolean(item[0]);
            }
            return item[0];
        }
        return defaultValue;
    }
    var highestVisualStudioVersionToTestFor = function () {
        var currentYear = new Date().getFullYear();
        return currentYear - 1995;
    };
    var minimumVisualStudioVersion = 10;
    var findPropsFileName = function (settings) {
        return new es6_promise_1.Promise(function (resolve, reject) {
            var propsFileName = csproj2ts.normalizePath(settings.VSProjectDetails.TypeScriptDefaultPropsFilePath, settings);
            if (fs.existsSync(propsFileName)) {
                resolve(propsFileName);
                return;
            }
            var alternateSettings = _.cloneDeep(settings);
            for (var i = highestVisualStudioVersionToTestFor(); i >= minimumVisualStudioVersion; i -= 1) {
                alternateSettings.VSProjectDetails.VisualStudioVersion = i.toString() + ".0";
                propsFileName = csproj2ts.normalizePath(settings.VSProjectDetails.TypeScriptDefaultPropsFilePath, alternateSettings);
                if (fs.existsSync(propsFileName)) {
                    resolve(propsFileName);
                    return;
                }
            }
            reject(new Error("Could not find a valid props file."));
        });
    };
    csproj2ts.getTypeScriptDefaultsFromPropsFileOrDefaults = function (settings) {
        return new es6_promise_1.Promise(function (resolve, reject) {
            findPropsFileName(settings).then(function (propsFileName) {
                csproj2ts.xml2jsReadXMLFile(propsFileName).then(function (parsedPropertiesFile) {
                    if (!parsedPropertiesFile || !parsedPropertiesFile.Project || !parsedPropertiesFile.Project.PropertyGroup) {
                        reject(new Error("No result from parsing the project."));
                    }
                    else {
                        var pg = toArray(parsedPropertiesFile.Project.PropertyGroup)[0];
                        var result = {};
                        var def = VSTypeScriptDefaults(settings.VSProjectDetails.TypeScriptVersion);
                        result.Target = getFirstValueOrDefault(pg.TypeScriptTarget, def.Target);
                        result.CompileOnSaveEnabled = getFirstValueOrDefault(pg.TypeScriptCompileOnSaveEnabled, def.CompileOnSaveEnabled);
                        result.NoImplicitAny = getFirstValueOrDefault(pg.TypeScriptNoImplicitAny, def.NoImplicitAny);
                        result.ModuleKind = getFirstValueOrDefault(pg.TypeScriptModuleKind, def.ModuleKind);
                        result.RemoveComments = getFirstValueOrDefault(pg.TypeScriptRemoveComments, def.RemoveComments);
                        result.OutFile = getFirstValueOrDefault(pg.TypeScriptOutFile, def.OutFile);
                        result.OutDir = getFirstValueOrDefault(pg.TypeScriptOutDir, def.OutDir);
                        result.GeneratesDeclarations = getFirstValueOrDefault(pg.TypeScriptGeneratesDeclarations, def.GeneratesDeclarations);
                        result.SourceMap = getFirstValueOrDefault(pg.TypeScriptSourceMap, def.SourceMap);
                        result.MapRoot = getFirstValueOrDefault(pg.TypeScript, def.MapRoot);
                        result.SourceRoot = getFirstValueOrDefault(pg.TypeScriptSourceRoot, def.SourceRoot);
                        result.NoEmitOnError = getFirstValueOrDefault(pg.TypeScript, def.NoEmitOnError);
                        resolve(result);
                    }
                }, function (error) { reject(error); });
            }, function (error) {
                reject(error);
            });
        });
    };
    var VSTypeScriptDefaults = function (version) {
        if (!version) {
            version = csproj2ts.DEFAULT_TYPESCRIPT_VERSION;
        }
        var target = semver.lt(version, "1.5.0") ? "ES3" : "ES5";
        var noEmitOnError = semver.gte(version, "1.4.0");
        var dev = {
            Target: target,
            CompileOnSaveEnabled: false,
            NoImplicitAny: false,
            ModuleKind: "",
            RemoveComments: false,
            OutFile: "",
            OutDir: "",
            GeneratesDeclarations: false,
            SourceMap: false,
            MapRoot: "",
            SourceRoot: "",
            NoEmitOnError: noEmitOnError
        };
        return dev;
    };
    csproj2ts.programFiles = function () {
        return process.env["ProgramFiles(x86)"] || process.env["ProgramFiles"] || "";
    };
})(csproj2ts || (csproj2ts = {}));
module.exports = csproj2ts;
