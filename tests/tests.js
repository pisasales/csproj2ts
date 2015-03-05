var csproj2ts = require('../csproj2ts');
var programFiles = csproj2ts.programFiles();
exports.testGroup = {
    setUp: function (callback) {
        callback();
    },
    tearDown: function (callback) {
        callback();
    },
    tests_run_at_all: function (test) {
        test.expect(1);
        test.ok(true, "Expected tests to run at all.");
        test.done();
    },
    non_existent_file_returns_null_and_error_message: function (test) {
        test.expect(1);
        var vsProjInfo = {
            ProjectFileName: "tests/artifacts/this_does_not_exist.csproj"
        };
        csproj2ts.getTypeScriptSettings(vsProjInfo).then(function (settings) {
            test.done();
        }).catch(function (error) {
            test.equal(error.errno, 34, "Expected file not found error.");
            test.done();
        });
    },
    find_default_settings: function (test) {
        test.expect(4);
        var vsProjInfo = {
            ProjectFileName: "tests/artifacts/example1.csproj",
        };
        csproj2ts.getTypeScriptSettings(vsProjInfo).then(function (settings) {
            test.ok(!!settings, "Expected settings to have a value.");
            test.equal(settings.VSProjectDetails.DefaultProjectConfiguration, "Debug", "Expected 'Debug' to be the default config.");
            test.equal(settings.VSProjectDetails.DefaultVisualStudioVersion, "12.0", "Expected '12.0' to be the default VS version.");
            test.equal(settings.VSProjectDetails.MSBuildExtensionsPath32, programFiles + "\\MSBuild\\", "Expected correct value to be automatically set for MSBuildExtensionsPath32.");
            test.done();
        }).catch(function (error) {
            test.ok(false, "Should not be any errors.");
            test.done();
        });
    },
    find_import_items: function (test) {
        test.expect(1);
        var vsProjInfo = {
            ProjectFileName: "tests/artifacts/example1.csproj"
        };
        csproj2ts.getTypeScriptSettings(vsProjInfo).then(function (settings) {
            test.equal(settings.VSProjectDetails.imports.length, 4, "Expected 4 imports items.");
            test.done();
        }).catch(function (error) {
            test.ok(false, "Should not be any errors.");
            test.done();
        });
    },
    find_TypeScript_default_props_file: function (test) {
        test.expect(1);
        var vsProjInfo = {
            ProjectFileName: "tests/artifacts/example1.csproj"
        };
        csproj2ts.getTypeScriptSettings(vsProjInfo).then(function (settings) {
            test.equal(settings.VSProjectDetails.NormalizedTypeScriptDefaultPropsFilePath, programFiles + "\\MSBuild\\\\Microsoft\\VisualStudio\\v12.0\\TypeScript\\Microsoft.TypeScript.Default.props", "Expected to see appropriate .props file name.");
            test.done();
        }).catch(function (error) {
            test.ok(false, "Should not be any errors.");
            test.done();
        });
    },
    identify_all_typeScript_files_properly: function (test) {
        test.expect(2);
        var vsProjInfo = {
            ProjectFileName: "tests/artifacts/example1.csproj"
        };
        csproj2ts.getTypeScriptSettings(vsProjInfo).then(function (settings) {
            test.equal(settings.files.length, 16, "Expected to see the correct number of TypeScript files.");
            test.ok(settings.files.indexOf("tasks\ts.ts") !== 0, "Expected to see tasks\ts.ts in the files list.");
            test.done();
        }).catch(function (error) {
            test.ok(false, "Should not be any errors.");
            test.done();
        });
    }
};
