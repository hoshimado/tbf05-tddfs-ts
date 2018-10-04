/**
 * [listup_csv_test.js]
 *   encoding=UTF8
 */


var assert = require("chai").assert;
var expect = require("chai").expect;
var sinon = require("sinon");
var shouldFulfilled = require("promise-test-helper").shouldFulfilled;
var hookProperty = require("hook-test-helper").hookProperty; // for test code.


var target = require("../src/listup_csv.js");

describe("TEST for listup_csv_csv.js", function(){
    describe("::diffCsvInDir()", function () {
        var diffCsvInDir = target.diffCsvInDir;

        var stubbedManager = {};
        var stubs;
        beforeEach(()=>{
            stubs = {
                "fs" : {
                    "readFile" : sinon.stub()
                },
                "listupSubDirectoryPath" : sinon.stub(),
                "diffMapFrom2Csv" : target.hook.diffMapFrom2Csv
            };
            stubbedManager["hook"] = hookProperty(target.hook, stubs);
        });
        afterEach(()=>{
            stubbedManager.hook.restore();
        });

        it("フォルダから取得したcsvの差分を取得", function () {
            var TARGET_PATH = "./data/in-stub";
            var PATH1 = "./data/in-stub/sub1/v2017.01.csv";
            var PATH2 = "./data/in-stub/sub1/v2017.02.csv"
            var PATH3 = "./data/in-stub/sub1/v2017.03.csv"

            var TEXT1 =  "Tool1,v1.00.00,tool1.exe\r\n";
                TEXT1 += "Tool2,v1.00.00,tool2_final.exe\r\n";

            var TEXT2 = "Tool3,v0.02,tool3_beta.exe\r\n";
                TEXT2 += "Tool2,v1.00.00,tool2_final.exe\r\n";
                TEXT2 += "Tool1,v1.01.00,tool1.exe\r\n";
                
            var TEXT3  = "Tool1,v2.00.00,tool1.exe\r\n";
                TEXT3 += "Tool2,v3.14.15,tool2_fix.exe\r\n";
                TEXT3 += "Tool3,v0.02,tool3_beta.exe\r\n";

            stubs.fs.readFile.withArgs(PATH1)
            .callsArgWith(
                2, 
                /* err= */ null, 
                /* files= */ TEXT1 
            );
            stubs.fs.readFile.withArgs(PATH2)
            .callsArgWith(
                2, 
                /* err= */ null, 
                /* files= */ TEXT2 
            );
            stubs.fs.readFile.withArgs(PATH3)
            .callsArgWith(
                2, 
                /* err= */ null, 
                /* files= */ TEXT3 
            );
            stubs.listupSubDirectoryPath.returns(
                Promise.resolve([
                    PATH1, PATH2, PATH3
                ])
            );
            
            return shouldFulfilled( diffCsvInDir(TARGET_PATH) )
            .then(function (result) {
                expect( result ).to.deep
                .equal([
                    [ 
                        { name: 'Tool1', before: 'v1.01.00', after: 'v2.00.00' },
                        { name: 'Tool2', before: 'v1.00.00', after: 'v3.14.15' }
                    ],[ 
                        { name: 'Tool1', before: 'v1.00.00', after: 'v1.01.00' },
                        { name: 'Tool3', before: undefined, after: 'v0.02' }
                    ] 
                ]);
            });
        });
    });
    describe("::diffMapFrom2Csv()", function () {
        var diffMapFrom2Csv = target.hook.diffMapFrom2Csv;

        it("CSVの２ファイルを比較して差分テキストを出力する", function () {
            var CSV_ARRAY1 = [
                ["Tool1","v1.00.00","tool1.exe"],
                ["Tool2","v1.00.00","tool2_final.exe"]
            ];
            var CSV_ARRAY2 = [
                // 順序はランダム。
                ["Tool2","v1.00.00","tool2_final.exe"],
                ["Tool1","v1.01.00","tool1.exe"],
                ["Tool3","v0.02","tool3_beta.exe"]
            ];

            var result = diffMapFrom2Csv( CSV_ARRAY2, CSV_ARRAY1 );

            var EXPECTED_ARRAY = [{
                "name" : "Tool1",
                "before" : "v1.00.00",
                "after"  : "v1.01.00"
            },{
                "name" : "Tool3",
                "before" : undefined,
                "after"  : "v0.02"
            }]; // 順序はnameプロパティで昇順
            expect( result ).to.be.deep.equal( EXPECTED_ARRAY );
        });
    });
    describe("::listupSubDirectryPath()",function () {
        var listupSubDirectoryPath = target.hook.listupSubDirectoryPath;

        var stubbedManager = {};
        var stubs;
        beforeEach(()=>{
            stubs = {
                "fs" : {
                    "readdir" : sinon.stub(), // https://nodejs.org/api/fs.html#fs_fs_readdir_path_options_callback
                    "stat" : sinon.stub()     // https://nodejs.org/api/fs.html#fs_fs_stat_path_options_callback
                }
            };
            stubbedManager["hook"] = hookProperty(target.hook, stubs);
        });
        afterEach(()=>{
            stubbedManager.hook.restore();
        });

        var setupFsStubs = function(targetStubs){
            targetStubs.fs.readdir.withArgs("./data/in-stub")
            .callsArgWith(2, /* err= */ null, /* files= */ ["sub1","sub2","moreDeep"] );
            targetStubs.fs.stat.withArgs("./data/in-stub/sub1")
            .callsArgWith(1, /* err= */ null, /* stats= */ {"isDirectory" : function (){return true;}} );
            targetStubs.fs.stat.withArgs("./data/in-stub/sub2")
            .callsArgWith(1, /* err= */ null, /* stats= */ {"isDirectory" : function (){return true;}} );
            targetStubs.fs.stat.withArgs("./data/in-stub/moreDeep")
            .callsArgWith(1, /* err= */ null, /* stats= */ {"isDirectory" : function (){return true;}} );

            targetStubs.fs.readdir.withArgs("./data/in-stub/sub1")
            .callsArgWith(2, /* err= */ null, /* files= */ ["v2017.01.csv","v2017.02.csv","v2017.03.csv"] );
            targetStubs.fs.stat.withArgs("./data/in-stub/sub1/v2017.01.csv")
            .callsArgWith(1, /* err= */ null, /* stats= */ {"isDirectory" : function (){return false;}} );
            targetStubs.fs.stat.withArgs("./data/in-stub/sub1/v2017.02.csv")
            .callsArgWith(1, /* err= */ null, /* stats= */ {"isDirectory" : function (){return false;}} );
            targetStubs.fs.stat.withArgs("./data/in-stub/sub1/v2017.03.csv")
            .callsArgWith(1, /* err= */ null, /* stats= */ {"isDirectory" : function (){return false;}} );

            targetStubs.fs.readdir.withArgs("./data/in-stub/sub2")
            .callsArgWith(2, /* err= */ null, /* files= */ ["v2018.01.csv","v2018.02.csv"] );
            targetStubs.fs.stat.withArgs("./data/in-stub/sub2/v2018.01.csv")
            .callsArgWith(1, /* err= */ null, /* stats= */ {"isDirectory" : function (){return false;}} );
            targetStubs.fs.stat.withArgs("./data/in-stub/sub2/v2018.02.csv")
            .callsArgWith(1, /* err= */ null, /* stats= */ {"isDirectory" : function (){return false;}} );

            targetStubs.fs.readdir.withArgs("./data/in-stub/moreDeep")
            .callsArgWith(2, /* err= */ null, /* files= */ ["hoge.txt","piyo"] );
            targetStubs.fs.stat.withArgs("./data/in-stub/moreDeep/hoge.txt")
            .callsArgWith(1, /* err= */ null, /* stats= */ {"isDirectory" : function (){return false;}} );
            targetStubs.fs.stat.withArgs("./data/in-stub/moreDeep/piyo")
            .callsArgWith(1, /* err= */ null, /* stats= */ {"isDirectory" : function (){return true;}} );

            targetStubs.fs.readdir.withArgs("./data/in-stub/moreDeep/piyo")
            .callsArgWith(2, /* err= */ null, /* files= */ ["limit.txt"] );
            targetStubs.fs.stat.withArgs("./data/in-stub/moreDeep/piyo/limit.txt")
            .callsArgWith(1, /* err= */ null, /* stats= */ {"isDirectory" : function (){return false;}} );
        };

        it("csvファイルが格納されたディレクトリ（1つ下のサブを含む）から、csvファイルのパスを全て取得する",function () {
            var TARGET_DIR = "./data/in-stub"; 
            var EXPECTED_LIST = [
                './data/in-stub/sub2/v2018.01.csv',
                './data/in-stub/sub2/v2018.02.csv',
                './data/in-stub/sub1/v2017.01.csv',
                './data/in-stub/sub1/v2017.02.csv',
                './data/in-stub/sub1/v2017.03.csv',
                './data/in-stub/moreDeep/hoge.txt',
                './data/in-stub/moreDeep/piyo/' // 個の下は2階層下なので「limit.txt」は拾わないこと。
            ];
            setupFsStubs(stubs);

            return shouldFulfilled(
                listupSubDirectoryPath( TARGET_DIR )
            ).then(function (result) {
                assert( result );
                assert( Array.isArray(result) );

                result.sort(function(a,b){
                    if( a < b ) return -1;
                    if( a > b ) return 1;
                    return 0;
                });
                EXPECTED_LIST.sort(function(a,b){
                    if( a < b ) return -1;
                    if( a > b ) return 1;
                    return 0;
                });
                expect( result ).to.deep.equal( EXPECTED_LIST );
            });
        });
        it("ファイルもサブフォルダも無いケース",function () {
            var TARGET_DIR = "./data/in-stub"; 
            stubs.fs.readdir.callsArgWith(2, /* err= */ null, /* files= */ [] );

            return shouldFulfilled(
                listupSubDirectoryPath( TARGET_DIR )
            ).then(function (result) {
                expect( stubs.fs.readdir.getCall(0).args[0] ).to.be.equal( TARGET_DIR );

                assert( result );
                assert( Array.isArray(result) );

                expect( result ).to.deep.equal( [] );

                expect( stubs.fs.readdir.callCount ).to.be.equal( 1 );
                assert( stubs.fs.stat.notCalled, "fs.stat()は呼ばない" );
            });
        });
        it("指定のフォルダがそもそも無いケース");
    });
});
